import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { getCurrentTenantId } from '../common/context/tenant.context';

// Modelos que têm coluna tenantId e devem ser isolados automaticamente
const TENANT_SCOPED_MODELS = new Set([
  'User',
  'Contact',
  'Conversation',
  'Message',
  'KanbanColumn',
  'Tag',
  'MessageTemplate',
  'ScheduledMessage',
  'AIConfig',
  'AIInteraction',
  'AuditLog',
]);

// Operações de leitura onde injetamos tenantId no where
const READ_ACTIONS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

// Operações de escrita em massa onde injetamos tenantId no where
const BULK_WRITE_ACTIONS = new Set(['updateMany', 'deleteMany']);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env['NODE_ENV'] === 'development'
          ? ['warn', 'error']
          : ['warn', 'error'],
    });

    this.registerTenantMiddleware();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Base de dados ligada');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Base de dados desligada');
  }

  private registerTenantMiddleware(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
      if (!params.model || !TENANT_SCOPED_MODELS.has(params.model)) {
        return next(params);
      }

      const tenantId = getCurrentTenantId();
      if (!tenantId) {
        // Sem contexto de tenant (ex: seed, scripts internos) — passa sem restrição
        return next(params);
      }

      // Leituras: injeta tenantId no where
      if (READ_ACTIONS.has(params.action)) {
        params.args = params.args ?? {};
        params.args.where = { ...params.args.where, tenantId };
      }

      // Escritas em massa: injeta tenantId no where
      if (BULK_WRITE_ACTIONS.has(params.action)) {
        params.args = params.args ?? {};
        params.args.where = { ...params.args.where, tenantId };
      }

      // Criação: garante que tenantId está correto
      if (params.action === 'create') {
        params.args = params.args ?? {};
        params.args.data = { ...params.args.data, tenantId };
      }

      // findUnique: redireciona para findFirst com tenantId para garantir isolamento
      if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
        params.args = params.args ?? {};
        params.args.where = { ...params.args.where, tenantId };
        // Prisma permite where composto em findUnique quando um dos campos é o PK
      }

      return next(params);
    });
  }
}
