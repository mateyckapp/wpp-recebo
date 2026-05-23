import { Injectable, NestMiddleware, NotFoundException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { tenantStorage } from '../context/tenant.context';

export interface TenantRequest extends Request {
  tenantId: string;
  tenantSlug: string;
}

const RESERVED_SLUGS = new Set(['app', 'api', 'docs', 'www', 'staging', 'admin', 'mail']);

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction): Promise<void> {
    const host = (req.headers['host'] as string | undefined) ?? '';
    const slug = this.extractSlug(host);

    if (!slug) {
      // Rotas sem subdomÃ­nio de tenant (ex: api.wpprecebo.com) passam sem contexto
      next();
      return;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true, status: true, trialEndsAt: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${slug}" nÃ£o encontrado`);
    }

    if (tenant.status === 'TRIAL' && tenant.trialEndsAt && tenant.trialEndsAt < new Date()) {
      throw new HttpException(
        { message: 'O teu perÃ­odo de trial terminou. Subscreve um plano para continuar.', code: 'TRIAL_EXPIRED' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
      throw new HttpException(
        { message: 'Esta conta estÃ¡ suspensa. Contacta o suporte ou subscreve um plano.', code: 'ACCOUNT_SUSPENDED' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    // Propaga o tenantId por toda a cadeia assÃ­ncrona desta request
    tenantStorage.run({ tenantId: tenant.id, tenantSlug: tenant.slug }, () => {
      next();
    });
  }

  extractSlug(host: string): string | null {
    const appDomain = process.env['APP_DOMAIN'] ?? 'wpprecebo.com';

    // Suporte a localhost em dev: demo.localhost
    if (host.includes('localhost')) {
      const parts = host.split('.');
      if (parts.length >= 2 && parts[0] && !RESERVED_SLUGS.has(parts[0])) {
        return parts[0] ?? null;
      }
      return null;
    }

    // ProduÃ§Ã£o: {slug}.wpprecebo.com (requer ponto antes do domÃ­nio)
    if (!host.endsWith('.' + appDomain)) return null;

    const subdomain = host.slice(0, host.length - appDomain.length - 1);
    if (!subdomain || RESERVED_SLUGS.has(subdomain)) return null;

    return subdomain;
  }
}
