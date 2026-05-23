import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(tenantId: string, name: string, environment: 'live' | 'test' = 'live') {
    const randomPart = randomBytes(24).toString('base64url');
    const prefix = environment === 'live' ? 'wpr_live_' : 'wpr_test_';
    const rawKey = `${prefix}${randomPart}`;

    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const preview = `${prefix}...${randomPart.slice(-4)}`;

    const apiKey = await this.prisma.apiKey.create({
      data: { tenantId, name, keyHash, prefix, preview, environment },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // shown only once
      preview: apiKey.preview,
      environment: apiKey.environment,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(tenantId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { tenantId, revokedAt: null },
      select: {
        id: true,
        name: true,
        preview: true,
        environment: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: keys };
  }

  async revoke(tenantId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, tenantId, revokedAt: null },
    });
    if (!key) throw new NotFoundException('API key não encontrada');

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });
    return { message: 'API key revogada com sucesso' };
  }
}
