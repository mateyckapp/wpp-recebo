import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class UpdateContactDto {
  name?: string;
  email?: string;
  notes?: string;
}

export class CreateContactDto {
  phoneNumber!: string;
  name?: string;
  email?: string;
  notes?: string;
}

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    options: { search?: string; groupId?: string; page: number; limit: number },
  ) {
    const { search, groupId, page, limit } = options;

    const where = {
      tenantId,
      ...(groupId ? { groups: { some: { groupId } } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { phoneNumber: { contains: search } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.contact.count({ where }),
      this.prisma.contact.findMany({
        where,
        orderBy: [{ lastInteraction: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { conversations: true } },
          groups: { select: { group: { select: { id: true, name: true, color: true } } } },
        },
      }),
    ]);

    return {
      items: items.map((c) => ({ ...c, groups: c.groups.map((g) => g.group) })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createContact(tenantId: string, dto: CreateContactDto) {
    const existing = await this.prisma.contact.findUnique({
      where: { tenantId_phoneNumber: { tenantId, phoneNumber: dto.phoneNumber } },
    });
    if (existing) throw new ConflictException('Já existe um contacto com este número.');

    return this.prisma.contact.create({
      data: {
        tenantId,
        phoneNumber: dto.phoneNumber,
        name: dto.name ?? null,
        email: dto.email ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  // ─── Grupos ────────────────────────────────────────────────────────────────

  async findAllGroups(tenantId: string) {
    const groups = await this.prisma.contactGroup.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { contacts: true } } },
    });
    return groups.map((g) => ({ ...g, contactCount: g._count.contacts, _count: undefined }));
  }

  async createGroup(tenantId: string, data: { name: string; color?: string }) {
    const existing = await this.prisma.contactGroup.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } },
    });
    if (existing) throw new ConflictException('Já existe um grupo com esse nome');

    return this.prisma.contactGroup.create({
      data: { tenantId, name: data.name, color: data.color ?? '#6B7280' },
    });
  }

  async updateGroup(id: string, tenantId: string, data: { name?: string; color?: string }) {
    const group = await this.prisma.contactGroup.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return this.prisma.contactGroup.update({ where: { id }, data });
  }

  async deleteGroup(id: string, tenantId: string) {
    const group = await this.prisma.contactGroup.findFirst({ where: { id, tenantId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    await this.prisma.contactGroup.delete({ where: { id } });
  }

  async addContactToGroup(groupId: string, contactId: string, tenantId: string) {
    const [group, contact] = await Promise.all([
      this.prisma.contactGroup.findFirst({ where: { id: groupId, tenantId } }),
      this.prisma.contact.findFirst({ where: { id: contactId, tenantId } }),
    ]);
    if (!group) throw new NotFoundException('Grupo não encontrado');
    if (!contact) throw new NotFoundException('Contacto não encontrado');

    await this.prisma.contactGroupMember.upsert({
      where: { groupId_contactId: { groupId, contactId } },
      create: { groupId, contactId },
      update: {},
    });
  }

  async removeContactFromGroup(groupId: string, contactId: string, tenantId: string) {
    const group = await this.prisma.contactGroup.findFirst({ where: { id: groupId, tenantId } });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    await this.prisma.contactGroupMember.deleteMany({ where: { groupId, contactId } });
  }

  async findById(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { conversations: true } },
        groups: { select: { group: { select: { id: true, name: true, color: true } } } },
        conversations: {
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            unreadCount: true,
            lastMessageAt: true,
            kanbanColumn: { select: { name: true, color: true } },
          },
        },
      },
    });

    if (!contact) throw new NotFoundException('Contacto não encontrado');
    return { ...contact, groups: contact.groups.map((g) => g.group) };
  }

  async update(id: string, tenantId: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findFirst({ where: { id, tenantId } });
    if (!contact) throw new NotFoundException('Contacto não encontrado');

    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }
}
