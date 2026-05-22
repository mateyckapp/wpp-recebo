import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly apiToken: string;
  private readonly zoneId: string;
  private readonly appDomain: string;

  constructor(private readonly config: ConfigService) {
    this.apiToken = this.config.get<string>('CLOUDFLARE_API_TOKEN') ?? '';
    this.zoneId = this.config.get<string>('CLOUDFLARE_ZONE_ID') ?? '';
    this.appDomain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.pt';
  }

  get isConfigured(): boolean {
    return !!(this.apiToken && this.zoneId);
  }

  async createSubdomain(slug: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(`Cloudflare não configurado — subdomínio ${slug}.${this.appDomain} não criado`);
      return;
    }

    try {
      await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`,
        {
          type: 'CNAME',
          name: `${slug}.${this.appDomain}`,
          content: this.appDomain,
          proxied: true,
          ttl: 1, // Auto quando proxied=true
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Subdomínio criado: ${slug}.${this.appDomain}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errors = (err.response?.data as { errors?: { message: string }[] })?.errors;
        const msg = errors?.[0]?.message ?? err.message;
        // Registo já existe — não é um erro fatal
        if (msg.includes('already exists') || err.response?.status === 409) {
          this.logger.warn(`Subdomínio ${slug}.${this.appDomain} já existe no Cloudflare`);
          return;
        }
        this.logger.error(`Erro ao criar subdomínio ${slug}: ${msg}`);
      } else {
        this.logger.error(`Erro inesperado ao criar subdomínio ${slug}: ${String(err)}`);
      }
    }
  }

  async deleteSubdomain(slug: string): Promise<void> {
    if (!this.isConfigured) return;

    try {
      const { data } = await axios.get<{ result: { id: string; name: string }[] }>(
        `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`,
        {
          headers: { Authorization: `Bearer ${this.apiToken}` },
          params: { name: `${slug}.${this.appDomain}`, type: 'CNAME' },
        },
      );

      const record = data.result[0];
      if (!record) {
        this.logger.warn(`Registo DNS para ${slug}.${this.appDomain} não encontrado`);
        return;
      }

      await axios.delete(
        `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records/${record.id}`,
        { headers: { Authorization: `Bearer ${this.apiToken}` } },
      );

      this.logger.log(`Subdomínio removido: ${slug}.${this.appDomain}`);
    } catch (err: unknown) {
      this.logger.error(`Erro ao remover subdomínio ${slug}: ${String(err)}`);
    }
  }
}
