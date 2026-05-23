import { PrismaClient, Plan, TenantStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('A iniciar seed...');

  // â”€â”€â”€ Tenant de teste â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { whatsappPhoneNumberId: '1109080812294064' },
    create: {
      slug: 'demo',
      name: 'NegÃ³cio Demo',
      plan: Plan.PRO,
      status: TenantStatus.ACTIVE,
      whatsappPhoneNumberId: '1109080812294064',
    },
  });

  console.log(`Tenant criado: ${tenant.name} (${tenant.slug})`);

  // â”€â”€â”€ Utilizador owner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const passwordHash = await bcrypt.hash('password123', 12);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@demo.wpprecebo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.wpprecebo.com',
      password: passwordHash,
      name: 'Administrador Demo',
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  console.log(`Owner criado: ${owner.name} (${owner.email})`);

  // â”€â”€â”€ Agente de teste â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const agentHash = await bcrypt.hash('password123', 12);

  const agent = await prisma.user.upsert({
    where: { email: 'agente@demo.wpprecebo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'agente@demo.wpprecebo.com',
      password: agentHash,
      name: 'Agente Demo',
      role: UserRole.AGENT,
      isActive: true,
    },
  });

  console.log(`Agente criado: ${agent.name} (${agent.email})`);

  // â”€â”€â”€ Colunas Kanban padrÃ£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const defaultColumns = [
    { name: 'Novos Contactos', color: '#6B7280', position: 0, isDefault: true },
    { name: 'Em NegociaÃ§Ã£o', color: '#3B82F6', position: 1, isDefault: false },
    { name: 'Aguarda Resposta', color: '#F59E0B', position: 2, isDefault: false },
    { name: 'Ganhos', color: '#10B981', position: 3, isDefault: false },
    { name: 'Perdidos', color: '#EF4444', position: 4, isDefault: false },
  ];

  for (const col of defaultColumns) {
    await prisma.kanbanColumn.upsert({
      where: {
        id: `${tenant.id}-col-${col.position}`,
      },
      update: {},
      create: {
        id: `${tenant.id}-col-${col.position}`,
        tenantId: tenant.id,
        ...col,
      },
    });
  }

  console.log(`${defaultColumns.length} colunas Kanban criadas`);

  // â”€â”€â”€ Tags de exemplo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const defaultTags = [
    { name: 'Urgente', color: '#EF4444' },
    { name: 'VIP', color: '#8B5CF6' },
    { name: 'Follow-up', color: '#F59E0B' },
    { name: 'Novo cliente', color: '#10B981' },
  ];

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: tag.name } },
      update: {},
      create: { tenantId: tenant.id, ...tag },
    });
  }

  console.log(`${defaultTags.length} tags criadas`);

  // â”€â”€â”€ Templates de mensagem â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const defaultTemplates = [
    {
      shortcut: '/ola',
      name: 'SaudaÃ§Ã£o inicial',
      content: 'OlÃ¡ {{nome}}! Bem-vindo ao nosso serviÃ§o. Como posso ajudar?',
    },
    {
      shortcut: '/preco',
      name: 'InformaÃ§Ã£o de preÃ§o',
      content: 'Bom dia {{nome}}! O preÃ§o do serviÃ§o que mencionou Ã© {{preco}}â‚¬. Posso ajudar com mais alguma informaÃ§Ã£o?',
    },
    {
      shortcut: '/horario',
      name: 'HorÃ¡rio de funcionamento',
      content: 'O nosso horÃ¡rio de atendimento Ã© de segunda a sexta, das 9h Ã s 18h. Ao sÃ¡bado das 9h Ã s 13h.',
    },
    {
      shortcut: '/obrigado',
      name: 'Agradecimento',
      content: 'Obrigado pelo contacto, {{nome}}! Foi um prazer ajudar. Qualquer dÃºvida, estamos sempre disponÃ­veis.',
    },
  ];

  for (const template of defaultTemplates) {
    await prisma.messageTemplate.upsert({
      where: { tenantId_shortcut: { tenantId: tenant.id, shortcut: template.shortcut } },
      update: {},
      create: { tenantId: tenant.id, ...template },
    });
  }

  console.log(`${defaultTemplates.length} templates criados`);

  // â”€â”€â”€ ConfiguraÃ§Ã£o de IA (desativada por defeito) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await prisma.aIConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      isEnabled: false,
      businessContext: 'NegÃ³cio de demonstraÃ§Ã£o do Wpp-Recebo.',
      fallbackToHuman: true,
      notifyOwnerOnFail: true,
    },
  });

  console.log('ConfiguraÃ§Ã£o de IA criada (desativada)');

  console.log('\nâœ… Seed concluÃ­do com sucesso!');
  console.log('\nCredenciais de acesso:');
  console.log('  URL:      http://demo.localhost:3000  (ou demo.wpprecebo.com em produÃ§Ã£o)');
  console.log('  Owner:    admin@demo.wpprecebo.com  /  password123');
  console.log('  Agente:   agente@demo.wpprecebo.com  /  password123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
