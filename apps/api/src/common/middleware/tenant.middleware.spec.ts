import { NotFoundException } from '@nestjs/common';
import { TenantMiddleware, TenantRequest } from './tenant.middleware';
import { Response, NextFunction } from 'express';

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
  },
};

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let mockNext: NextFunction;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    middleware = new TenantMiddleware(mockPrisma as never);
    mockNext = jest.fn();
    mockRes = {};
    jest.clearAllMocks();
  });

  // ─── extractSlug ────────────────────────────────────────────────────────────

  describe('extractSlug()', () => {
    it('extrai slug de subdomínio em produção', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.pt';
      expect(middleware.extractSlug('mineyra.wpprecebo.pt')).toBe('mineyra');
    });

    it('extrai slug de subdomínio em localhost (dev)', () => {
      expect(middleware.extractSlug('demo.localhost')).toBe('demo');
    });

    it('retorna null para subdomínios reservados', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.pt';
      expect(middleware.extractSlug('api.wpprecebo.pt')).toBeNull();
      expect(middleware.extractSlug('app.wpprecebo.pt')).toBeNull();
      expect(middleware.extractSlug('www.wpprecebo.pt')).toBeNull();
    });

    it('retorna null para o domínio raiz sem subdomínio', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.pt';
      expect(middleware.extractSlug('wpprecebo.pt')).toBeNull();
    });

    it('retorna null para localhost simples (sem subdomínio)', () => {
      expect(middleware.extractSlug('localhost')).toBeNull();
    });

    it('retorna null para domínio diferente', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.pt';
      expect(middleware.extractSlug('outrosite.pt')).toBeNull();
    });
  });

  // ─── use() ──────────────────────────────────────────────────────────────────

  describe('use()', () => {
    it('passa sem contexto quando não há subdomínio de tenant', async () => {
      const req = { headers: { host: 'api.wpprecebo.pt' } } as TenantRequest;

      await middleware.use(req, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockPrisma.tenant.findUnique).not.toHaveBeenCalled();
    });

    it('injeta tenantId e tenantSlug na request quando tenant existe', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-123',
        slug: 'mineyra',
        status: 'ACTIVE',
      });

      const req = {
        headers: { host: 'mineyra.localhost' },
      } as TenantRequest;

      await middleware.use(req, mockRes as Response, mockNext);

      expect(req.tenantId).toBe('tenant-123');
      expect(req.tenantSlug).toBe('mineyra');
      expect(mockNext).toHaveBeenCalled();
    });

    it('lança NotFoundException quando tenant não existe', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      const req = {
        headers: { host: 'inexistente.localhost' },
      } as TenantRequest;

      await expect(
        middleware.use(req, mockRes as Response, mockNext),
      ).rejects.toThrow(NotFoundException);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando tenant está SUSPENDED', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-123',
        slug: 'suspenso',
        status: 'SUSPENDED',
      });

      const req = {
        headers: { host: 'suspenso.localhost' },
      } as TenantRequest;

      await expect(
        middleware.use(req, mockRes as Response, mockNext),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException quando tenant está CANCELLED', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-123',
        slug: 'cancelado',
        status: 'CANCELLED',
      });

      const req = {
        headers: { host: 'cancelado.localhost' },
      } as TenantRequest;

      await expect(
        middleware.use(req, mockRes as Response, mockNext),
      ).rejects.toThrow(NotFoundException);
    });

    it('permite tenant com status TRIAL', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-trial',
        slug: 'trial',
        status: 'TRIAL',
      });

      const req = {
        headers: { host: 'trial.localhost' },
      } as TenantRequest;

      await middleware.use(req, mockRes as Response, mockNext);

      expect(req.tenantId).toBe('tenant-trial');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
