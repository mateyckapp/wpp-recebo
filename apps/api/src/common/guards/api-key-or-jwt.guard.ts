import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';
import { UserRole } from '@wpp-recebo/shared';

@Injectable()
class JwtOnlyGuard extends AuthGuard('jwt') {}

@Injectable()
export class ApiKeyOrJwtGuard implements CanActivate {
  private readonly jwtGuard: JwtOnlyGuard;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    this.jwtGuard = new JwtOnlyGuard();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Record<string, unknown>>();
    const apiKey = (request['headers'] as Record<string, string>)['x-api-key'];

    if (apiKey) {
      return this.validateApiKey(request, apiKey);
    }

    return this.jwtGuard.canActivate(context) as Promise<boolean>;
  }

  private async validateApiKey(
    request: Record<string, unknown>,
    rawKey: string,
  ): Promise<boolean> {
    const hash = createHash('sha256').update(rawKey).digest('hex');

    const key = await this.prisma.apiKey.findUnique({
      where: { keyHash: hash },
      include: {
        tenant: { select: { id: true, plan: true, status: true, slug: true } },
      },
    });

    if (!key || key.revokedAt) {
      throw new UnauthorizedException('API key inválida ou revogada');
    }

    if (key.tenant.plan !== 'ENTERPRISE') {
      throw new ForbiddenException(
        'O acesso à API pública requer o plano Enterprise',
      );
    }

    if (key.tenant.status === 'SUSPENDED' || key.tenant.status === 'CANCELLED') {
      throw new ForbiddenException('Conta suspensa ou cancelada');
    }

    request['user'] = {
      sub: `apikey:${key.id}`,
      email: `api@${key.tenant.slug}`,
      tenantId: key.tenantId,
      role: UserRole.ADMIN,
    };

    void this.prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
