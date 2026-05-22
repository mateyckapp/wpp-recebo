import { PrismaClient } from '@prisma/client';
import { tenantStorage } from '../context/tenant.context';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Testes de isolamento multi-tenant.
 *
 * Verificam que o Prisma middleware garante que queries feitas
 * no contexto do tenant A nunca retornam dados do tenant B.
 *
 * Nota: os callbacks dentro de tenantStorage.run() devem ser `async`
 * porque o Prisma usa "lazy promises" — o middleware $use só é executado
 * quando a promise é resolvida. Com async, a resolução acontece dentro
 * do contexto AsyncLocalStorage correto.
 */

const prismaRaw = new PrismaClient();

describe('Isolamento multi-tenant (integração)', () => {
  let prisma: PrismaService;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();

    const tenantA = await prismaRaw.tenant.create({
      data: { slug: `test-a-${Date.now()}`, name: 'Tenant A (teste)' },
    });
    const tenantB = await prismaRaw.tenant.create({
      data: { slug: `test-b-${Date.now()}`, name: 'Tenant B (teste)' },
    });

    tenantAId = tenantA.id;
    tenantBId = tenantB.id;

    await prismaRaw.contact.createMany({
      data: [
        { tenantId: tenantAId, phoneNumber: '+351910000001', name: 'Contacto do Tenant A' },
        { tenantId: tenantBId, phoneNumber: '+351920000002', name: 'Contacto do Tenant B' },
      ],
    });
  });

  afterAll(async () => {
    await prismaRaw.contact.deleteMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } },
    });
    await prismaRaw.tenant.deleteMany({
      where: { id: { in: [tenantAId, tenantBId] } },
    });
    await prisma.$disconnect();
    await prismaRaw.$disconnect();
  });

  it('tenant A só vê os seus próprios contactos', async () => {
    const contacts = await tenantStorage.run(
      { tenantId: tenantAId, tenantSlug: 'test-a' },
      async () => prisma.contact.findMany(),
    );

    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.name).toBe('Contacto do Tenant A');
    expect(contacts[0]?.tenantId).toBe(tenantAId);
  });

  it('tenant B só vê os seus próprios contactos', async () => {
    const contacts = await tenantStorage.run(
      { tenantId: tenantBId, tenantSlug: 'test-b' },
      async () => prisma.contact.findMany(),
    );

    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.name).toBe('Contacto do Tenant B');
    expect(contacts[0]?.tenantId).toBe(tenantBId);
  });

  it('tenant A não consegue ver contactos do tenant B por telefone', async () => {
    const contact = await tenantStorage.run(
      { tenantId: tenantAId, tenantSlug: 'test-a' },
      async () =>
        prisma.contact.findFirst({
          where: { phoneNumber: '+351920000002' }, // telefone do tenant B
        }),
    );

    expect(contact).toBeNull();
  });

  it('count retorna apenas registos do tenant correto', async () => {
    const [countA, countB] = await Promise.all([
      tenantStorage.run({ tenantId: tenantAId, tenantSlug: 'test-a' }, async () =>
        prisma.contact.count(),
      ),
      tenantStorage.run({ tenantId: tenantBId, tenantSlug: 'test-b' }, async () =>
        prisma.contact.count(),
      ),
    ]);

    expect(countA).toBe(1);
    expect(countB).toBe(1);
  });

  it('sem contexto de tenant retorna todos os registos (uso interno/seed)', async () => {
    const allContacts = await prismaRaw.contact.findMany({
      where: { tenantId: { in: [tenantAId, tenantBId] } },
    });

    expect(allContacts).toHaveLength(2);
  });

  it('create no contexto do tenant A injeta tenantId correto automaticamente', async () => {
    const created = await tenantStorage.run(
      { tenantId: tenantAId, tenantSlug: 'test-a' },
      async () => {
        await prisma.contact.create({
          data: {
            tenantId: tenantAId,
            phoneNumber: '+351930000003',
            name: 'Contacto extra A',
          },
        });
        return prisma.contact.findMany();
      },
    );

    expect(created).toHaveLength(2);
    expect(created.every((c) => c.tenantId === tenantAId)).toBe(true);

    await prismaRaw.contact.deleteMany({ where: { phoneNumber: '+351930000003' } });
  });
});
