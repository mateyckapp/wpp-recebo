import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateTemplateDto {
  name: string;
  shortcut: string;
  content: string;
}

export interface UpdateTemplateDto {
  name?: string;
  shortcut?: string;
  content?: string;
}

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateTemplateDto) {
    const existing = await this.prisma.messageTemplate.findFirst({
      where: { tenantId, shortcut: dto.shortcut },
    });
    if (existing) throw new ConflictException(`Atalho "/${dto.shortcut}" já existe`);

    return this.prisma.messageTemplate.create({
      data: { tenantId, ...dto },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Template não encontrado');

    if (dto.shortcut && dto.shortcut !== template.shortcut) {
      const conflict = await this.prisma.messageTemplate.findFirst({
        where: { tenantId, shortcut: dto.shortcut },
      });
      if (conflict) throw new ConflictException(`Atalho "/${dto.shortcut}" já existe`);
    }

    return this.prisma.messageTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Template não encontrado');

    await this.prisma.messageTemplate.delete({ where: { id } });
    return { deleted: true };
  }
}
