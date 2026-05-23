import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CloudflareService } from '../cloudflare/cloudflare.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/auth-response.dto';
import type { JwtPayload, UserRole } from '@wpp-recebo/shared';

const RESERVED_SLUGS = new Set(['app', 'api', 'docs', 'www', 'staging', 'admin', 'mail', 'suporte', 'ajuda']);

function suggestSlugs(slug: string): string[] {
  return [`${slug}2`, `${slug}-empresa`, `${slug}-pt`];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly email: EmailService,
    private readonly cloudflare: CloudflareService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto & { refreshToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Conta desativada. Contacte o suporte.');
    }

    await this.usersService.updateLastSeen(user.id);

    const [tenant, accessToken, refreshToken] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { slug: true } }),
      this.signAccessToken({ sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role as UserRole }),
      this.signRefreshToken({ sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role as UserRole }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        tenantId: user.tenantId,
        tenantSlug: tenant?.slug ?? '',
      },
    };
  }

  async refresh(payload: JwtPayload): Promise<{ accessToken: string }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sessão inválida');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role as UserRole,
    };

    return { accessToken: await this.signAccessToken(newPayload) };
  }

  async getMe(payload: JwtPayload): Promise<{ id: string; email: string; name: string; role: UserRole; tenantId: string; tenantSlug: string }> {
    const [user, tenant] = await Promise.all([
      this.usersService.findById(payload.sub),
      this.prisma.tenant.findUnique({ where: { id: payload.tenantId }, select: { slug: true } }),
    ]);
    if (!user || !tenant) throw new UnauthorizedException('Utilizador não encontrado');
    return { id: user.id, email: user.email, name: user.name, role: user.role as UserRole, tenantId: user.tenantId, tenantSlug: tenant.slug };
  }

  async issueRefreshToken(user: JwtPayload): Promise<string> {
    // Remove iat/exp do payload descodificado antes de assinar um novo token
    const { sub, email, tenantId, role } = user;
    return this.signRefreshToken({ sub, email, tenantId, role });
  }

  async checkSubdomain(slug: string): Promise<{ available: boolean; suggestions: string[] }> {
    if (RESERVED_SLUGS.has(slug)) {
      return { available: false, suggestions: suggestSlugs(slug) };
    }
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return { available: false, suggestions: suggestSlugs(slug) };
    }
    return { available: true, suggestions: [] };
  }

  async register(dto: RegisterDto): Promise<LoginResponseDto & { refreshToken: string }> {
    const [existingTenant, existingUser] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { slug: dto.slug } }),
      this.usersService.findByEmail(dto.email),
    ]);

    if (RESERVED_SLUGS.has(dto.slug) || existingTenant) {
      throw new ConflictException('Subdomínio já em uso');
    }
    if (existingUser) {
      throw new ConflictException('Email já registado');
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const tenant = await this.prisma.tenant.create({
      data: { slug: dto.slug, name: dto.companyName, status: 'TRIAL', plan: 'START', trialEndsAt },
    });

    await this.prisma.kanbanColumn.createMany({
      data: [
        { tenantId: tenant.id, name: 'Novo', color: '#6B7280', position: 0, isDefault: true },
        { tenantId: tenant.id, name: 'Em Progresso', color: '#3B82F6', position: 1 },
        { tenantId: tenant.id, name: 'Fechado', color: '#22C55E', position: 2 },
      ],
    });

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        role: 'OWNER',
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role as UserRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    void this.email.sendWelcome(user.email, user.name, tenant.slug);
    void this.cloudflare.createSubdomain(tenant.slug);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role as UserRole, tenantId: user.tenantId, tenantSlug: tenant.slug },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetUrl?: string }> {
    const user = await this.usersService.findByEmail(email);
    const genericMessage = 'Se o email existir, receberás um link de recuperação em breve.';

    if (!user || !user.isActive) return { message: genericMessage };

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'password-reset' },
      { secret: this.configService.get<string>('app.jwt.secret'), expiresIn: '1h' },
    );

    void this.email.sendPasswordReset(user.email, user.name, resetToken);

    const isDev = process.env['NODE_ENV'] === 'development';
    return {
      message: genericMessage,
      ...(isDev && { resetUrl: `http://localhost:3000/reset-password?token=${resetToken}` }),
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; currentPassword?: string; newPassword?: string },
  ): Promise<{ id: string; name: string; email: string }> {
    const user = await this.usersService.findByIdOrThrow(userId);

    if (data.currentPassword && data.newPassword) {
      const match = await bcrypt.compare(data.currentPassword, user.password);
      if (!match) throw new UnauthorizedException('Password actual incorrecta');
      const hashed = await bcrypt.hash(data.newPassword, 12);
      await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    }

    if (data.name) {
      await this.prisma.user.update({ where: { id: userId }, data: { name: data.name } });
    }

    const updated = await this.usersService.findByIdOrThrow(userId);
    return { id: updated.id, name: updated.name, email: updated.email };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: { sub: string; purpose: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('app.jwt.secret'),
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Token inválido');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: payload.sub }, data: { password: hashedPassword } });
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwt.secret'),
      expiresIn: this.configService.get<string>('app.jwt.expiresIn'),
    });
  }

  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('app.jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('app.jwt.refreshExpiresIn'),
    });
  }
}
