import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SAFE_SELECT = {
  id: true,
  tenantId: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastSeen: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Utilizador não encontrado');
    return user;
  }

  async updateLastSeen(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastSeen: new Date() },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: SAFE_SELECT,
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async createAgent(
    tenantId: string,
    data: { name: string; email: string; role: UserRole; password: string },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Este email já está registado');

    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        role: data.role,
        password: hash,
        isActive: true,
      },
      select: SAFE_SELECT,
    });
  }

  async updateAgent(
    id: string,
    tenantId: string,
    requesterId: string,
    requesterRole: UserRole,
    data: { name?: string; role?: UserRole; isActive?: boolean },
  ) {
    const target = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('Utilizador não encontrado');

    if (target.id === requesterId) throw new ForbiddenException('Não podes editar a tua própria conta aqui');
    if (target.role === UserRole.OWNER) throw new ForbiddenException('Não é possível editar o dono da conta');
    if (requesterRole === UserRole.ADMIN && data.role === UserRole.OWNER) {
      throw new ForbiddenException('Admins não podem atribuir o papel de dono');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: SAFE_SELECT,
    });
  }

  async removeAgent(id: string, tenantId: string, requesterId: string) {
    const target = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('Utilizador não encontrado');
    if (target.id === requesterId) throw new ForbiddenException('Não podes remover a tua própria conta');
    if (target.role === UserRole.OWNER) throw new ForbiddenException('Não é possível remover o dono da conta');

    await this.prisma.user.delete({ where: { id } });
  }
}
