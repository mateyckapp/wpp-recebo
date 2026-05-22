import { PrismaClient, Plan, TenantStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('A iniciar seed...');

  // ─── Tenant de teste ────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { whatsappPhoneNumberId: '1109080812294064' },
    create: {
      slug: 'demo',
      name: 'Negócio Demo',
      plan: Plan.PRO,
      status: TenantStatus.ACTIVE,
      whatsappPhoneNumberId: '1109080812294064',
    },
  });

  console.log(`Tenant criado: ${tenant.name} (${tenant.slug})`);

  // ─── Utilizador owner ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 12);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@demo.wpprecebo.pt' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.wpprecebo.pt',
      password: passwordHash,
      name: 'Administrador Demo',
      role: UserRole.OWNER,
      isActive: true,
    },
  });

  console.log(`Owner criado: ${owner.name} (${owner.email})`);

  // ─── Agente de teste ────────────────────────────────────────────────────────
  const agentHash = await bcrypt.hash('password123', 12);

  const agent = await prisma.user.upsert({
    where: { email: 'agente@demo.wpprecebo.pt' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'agente@demo.wpprecebo.pt',
      password: agentHash,
      name: 'Agente Demo',
      role: UserRole.AGENT,
      isActive: true,
    },
  });

  console.log(`Agente criado: ${agent.name} (${agent.email})`);

  // ─── Colunas Kanban padrão ──────────────────────────────────────────────────
  const defaultColumns = [
    { name: 'Novos Contactos', color: '#6B7280', position: 0, isDefault: true },
    { name: 'Em Negociação', color: '#3B82F6', position: 1, isDefault: false },
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

  // ─── Tags de exemplo ────────────────────────────────────────────────────────
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

  // ─── Templates de mensagem ──────────────────────────────────────────────────
  const defaultTemplates = [
    {
      shortcut: '/ola',
      name: 'Saudação inicial',
      content: 'Olá {{nome}}! Bem-vindo ao nosso serviço. Como posso ajudar?',
    },
    {
      shortcut: '/preco',
      name: 'Informação de preço',
      content: 'Bom dia {{nome}}! O preço do serviço que mencionou é {{preco}}€. Posso ajudar com mais alguma informação?',
    },
    {
      shortcut: '/horario',
      name: 'Horário de funcionamento',
      content: 'O nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Ao sábado das 9h às 13h.',
    },
    {
      shortcut: '/obrigado',
      name: 'Agradecimento',
      content: 'Obrigado pelo contacto, {{nome}}! Foi um prazer ajudar. Qualquer dúvida, estamos sempre disponíveis.',
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

  // ─── Configuração de IA (desativada por defeito) ────────────────────────────
  await prisma.aIConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      isEnabled: false,
      businessContext: 'Negócio de demonstração do Wpp-Recebo.',
      fallbackToHuman: true,
      notifyOwnerOnFail: true,
    },
  });

  console.log('Configuração de IA criada (desativada)');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\nCredenciais de acesso:');
  console.log('  URL:      http://demo.localhost:3000  (ou demo.wpprecebo.pt em produção)');
  console.log('  Owner:    admin@demo.wpprecebo.pt  /  password123');
  console.log('  Agente:   agente@demo.wpprecebo.pt  /  password123');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
