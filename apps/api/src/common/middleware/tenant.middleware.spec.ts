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

  // â”€â”€â”€ extractSlug â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('extractSlug()', () => {
    it('extrai slug de subdomÃ­nio em produÃ§Ã£o', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.com';
      expect(middleware.extractSlug('mineyra.wpprecebo.com')).toBe('mineyra');
    });

    it('extrai slug de subdomÃ­nio em localhost (dev)', () => {
      expect(middleware.extractSlug('demo.localhost')).toBe('demo');
    });

    it('retorna null para subdomÃ­nios reservados', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.com';
      expect(middleware.extractSlug('api.wpprecebo.com')).toBeNull();
      expect(middleware.extractSlug('app.wpprecebo.com')).toBeNull();
      expect(middleware.extractSlug('www.wpprecebo.com')).toBeNull();
    });

    it('retorna null para o domÃ­nio raiz sem subdomÃ­nio', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.com';
      expect(middleware.extractSlug('wpprecebo.com')).toBeNull();
    });

    it('retorna null para localhost simples (sem subdomÃ­nio)', () => {
      expect(middleware.extractSlug('localhost')).toBeNull();
    });

    it('retorna null para domÃ­nio diferente', () => {
      process.env['APP_DOMAIN'] = 'wpprecebo.com';
      expect(middleware.extractSlug('outrosite.pt')).toBeNull();
    });
  });

  // â”€â”€â”€ use() â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('use()', () => {
    it('passa sem contexto quando nÃ£o hÃ¡ subdomÃ­nio de tenant', async () => {
      const req = { headers: { host: 'api.wpprecebo.com' } } as TenantRequest;

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

    it('lanÃ§a NotFoundException quando tenant nÃ£o existe', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      const req = {
        headers: { host: 'inexistente.localhost' },
      } as TenantRequest;

      await expect(
        middleware.use(req, mockRes as Response, mockNext),
      ).rejects.toThrow(NotFoundException);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('lanÃ§a NotFoundException quando tenant estÃ¡ SUSPENDED', async () => {
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

    it('lanÃ§a NotFoundException quando tenant estÃ¡ CANCELLED', async () => {
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
