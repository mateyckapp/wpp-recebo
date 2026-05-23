import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { AgendaService } from '../agenda/agenda.service';

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1024;
const INPUT_COST_PER_M = 0.08;
const OUTPUT_COST_PER_M = 0.4;

export interface AiReplyResult {
  reply: string;
  tokensInput: number;
  tokensOutput: number;
  costCents: number;
}

// ── Tool definitions ───────────────────────────────────────────────────────────

const AGENDA_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_services',
    description: 'Lista os serviços disponíveis para marcação (nome, duração em minutos, preço).',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_available_slots',
    description: 'Devolve os horários disponíveis para uma data e serviço. Usa sempre antes de confirmar uma marcação.',
    input_schema: {
      type: 'object' as const,
      properties: {
        date: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD, ex: "2025-06-10"',
        },
        serviceId: {
          type: 'string',
          description: 'ID do serviço obtido em get_services',
        },
        professionalId: {
          type: 'string',
          description: 'ID do profissional (opcional). Se omitido, mostra todos os disponíveis.',
        },
      },
      required: ['date', 'serviceId'],
    },
  },
  {
    name: 'create_appointment',
    description: 'Cria a marcação após o cliente confirmar. Só chamar depois de confirmar todos os dados com o cliente.',
    input_schema: {
      type: 'object' as const,
      properties: {
        serviceId: { type: 'string', description: 'ID do serviço' },
        professionalId: { type: 'string', description: 'ID do profissional' },
        dateTime: { type: 'string', description: 'Data e hora no formato YYYY-MM-DDTHH:mm:00' },
        notes: { type: 'string', description: 'Observações adicionais (opcional)' },
      },
      required: ['serviceId', 'professionalId', 'dateTime'],
    },
  },
  {
    name: 'get_client_appointments',
    description: 'Lista as marcações recentes do cliente actual.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly agendaService: AgendaService,
  ) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
  }

  async getConfig(tenantId: string) {
    const config = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    return config ?? { isEnabled: false, businessContext: null, fallbackToHuman: true };
  }

  async upsertConfig(
    tenantId: string,
    data: Record<string, unknown>,
  ) {
    const existing = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    if (existing) {
      return this.prisma.aIConfig.update({ where: { id: existing.id }, data });
    }
    return this.prisma.aIConfig.create({ data: { tenantId, ...data } });
  }

  async getContext(tenantId: string) {
    const config = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    return {
      data: {
        businessName: config?.businessName ?? null,
        description: config?.businessDescription ?? null,
        address: config?.businessAddress ?? null,
        services: (config?.servicesContext as unknown[] | null) ?? [],
        workingHours: (config?.workingHours as Record<string, string> | null) ?? {},
        faqs: (config?.faqsContext as Array<Record<string, string>> | null) ?? [],
        updatedAt: config?.updatedAt ?? null,
      },
    };
  }

  async updateContext(tenantId: string, dto: {
    businessName?: string;
    businessDescription?: string;
    businessAddress?: string;
    servicesContext?: unknown[];
    workingHours?: Record<string, string>;
  }) {
    return this.upsertConfig(tenantId, {
      businessName: dto.businessName,
      businessDescription: dto.businessDescription,
      businessAddress: dto.businessAddress,
      servicesContext: dto.servicesContext,
      workingHours: dto.workingHours,
      aiStatus: 'training',
    });
  }

  async addFaq(tenantId: string, faq: { question: string; answer: string }) {
    const config = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    const existing = (config?.faqsContext as Array<Record<string, string>> | null) ?? [];
    const newFaq = { id: `faq_${Date.now()}`, ...faq };
    const updated = [...existing, newFaq];

    await this.upsertConfig(tenantId, { faqsContext: updated, aiStatus: 'training' });
    return { data: newFaq };
  }

  async removeFaq(tenantId: string, faqId: string) {
    const config = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    const existing = (config?.faqsContext as Array<Record<string, string>> | null) ?? [];
    const updated = existing.filter((f) => f['id'] !== faqId);

    await this.upsertConfig(tenantId, { faqsContext: updated, aiStatus: 'training' });
    return { message: 'FAQ removida com sucesso' };
  }

  async getBehavior(tenantId: string) {
    const config = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    return {
      data: {
        persona: {
          name: config?.personaName ?? null,
          tone: config?.personaTone ?? 'friendly',
          useEmojis: config?.personaUseEmojis ?? true,
          maxMessageLength: config?.maxResponseTokens ?? 300,
        },
        greeting: config?.greeting ?? null,
        fallbackMessage: config?.fallbackMessage ?? null,
        outOfScopeMessage: config?.outOfScopeMessage ?? null,
        escalation: {
          enabled: config?.escalationEnabled ?? true,
          keywords: config?.escalationKeywords ?? [],
          escalationMessage: config?.escalationMessage ?? null,
          assignToQueue: true,
        },
        restrictions: (config?.restrictions as Record<string, boolean> | null) ?? {},
        updatedAt: config?.updatedAt ?? null,
      },
    };
  }

  async updateBehavior(tenantId: string, dto: Record<string, unknown>) {
    return this.upsertConfig(tenantId, dto);
  }

  async testReply(tenantId: string, message: string) {
    const aiConfig = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    const hasAgenda = await this.agendaService.hasAgenda(tenantId);
    const systemPrompt = this.buildSystemPrompt(aiConfig?.businessContext, hasAgenda);

    const start = Date.now();

    try {
      const response = await this.client.messages.create({
        model: HAIKU_MODEL,
        max_tokens: aiConfig?.maxResponseTokens ?? 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      });

      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('');

      return {
        data: {
          response: text,
          escalated: false,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          processingMs: Date.now() - start,
        },
      };
    } catch (err) {
      this.logger.error(`Erro no teste da IA: ${String(err)}`);
      throw err;
    }
  }

  async generateReply(
    tenantId: string,
    conversationId: string,
    incomingText: string,
    recentMessages: Array<{ direction: string; content: string | null }>,
    context?: { contactId?: string },
  ): Promise<AiReplyResult | null> {
    const aiConfig = await this.prisma.aIConfig.findUnique({ where: { tenantId } });
    if (!aiConfig?.isEnabled) return null;

    const hasAgenda = await this.agendaService.hasAgenda(tenantId);
    const systemPrompt = this.buildSystemPrompt(aiConfig.businessContext, hasAgenda);
    const tools = hasAgenda ? AGENDA_TOOLS : undefined;

    const history: Anthropic.MessageParam[] = recentMessages
      .slice(-10)
      .filter((m) => m.content)
      .map((m) => ({
        role: m.direction === 'INBOUND' ? ('user' as const) : ('assistant' as const),
        content: m.content!,
      }));

    const normalized = this.normalizeHistory(history);
    normalized.push({ role: 'user', content: incomingText });

    try {
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let finalReply = '';

      // Agentic loop: Claude pode chamar várias tools antes de responder
      const messages: Anthropic.MessageParam[] = [...normalized];

      for (let i = 0; i < 5; i++) {
        const response = await this.client.messages.create({
          model: HAIKU_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages,
          ...(tools ? { tools } : {}),
        });

        totalInputTokens += response.usage.input_tokens;
        totalOutputTokens += response.usage.output_tokens;

        if (response.stop_reason === 'tool_use') {
          // Claude quer chamar uma ferramenta
          const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock[];

          // Adiciona a resposta do Claude (com tool_use) ao histórico
          messages.push({ role: 'assistant', content: response.content });

          // Executa cada tool e colecta resultados
          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const toolBlock of toolUseBlocks) {
            const result = await this.executeTool(
              toolBlock.name,
              toolBlock.input as Record<string, string>,
              tenantId,
              context?.contactId,
              conversationId,
            );
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolBlock.id,
              content: JSON.stringify(result),
            });
          }

          // Devolve os resultados ao Claude
          messages.push({ role: 'user', content: toolResults });
          continue;
        }

        // Claude terminou — extrai texto final
        finalReply = response.content
          .filter((b) => b.type === 'text')
          .map((b) => (b as Anthropic.TextBlock).text)
          .join('');
        break;
      }

      if (!finalReply) return null;

      const costCents = Math.ceil(
        (totalInputTokens / 1_000_000) * INPUT_COST_PER_M * 100 +
          (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_M * 100,
      );

      await this.prisma.aIInteraction.create({
        data: {
          tenantId,
          conversationId,
          messageId: '',
          prompt: incomingText,
          response: finalReply,
          model: HAIKU_MODEL,
          tokensInput: totalInputTokens,
          tokensOutput: totalOutputTokens,
          costCents,
        },
      });

      return { reply: finalReply, tokensInput: totalInputTokens, tokensOutput: totalOutputTokens, costCents };
    } catch (err) {
      this.logger.error(`Erro ao gerar resposta IA: ${String(err)}`);
      return null;
    }
  }

  private async executeTool(
    toolName: string,
    input: Record<string, string>,
    tenantId: string,
    contactId: string | undefined,
    conversationId: string,
  ): Promise<unknown> {
    switch (toolName) {
      case 'get_services':
        return this.agendaService.getServices(tenantId);

      case 'get_available_slots': {
        const { date, serviceId, professionalId } = input;
        if (!date || !serviceId) return { error: 'Data e serviço são obrigatórios.' };
        return this.agendaService.getAvailableSlots(tenantId, date, serviceId, professionalId);
      }

      case 'create_appointment': {
        if (!contactId) return { error: 'Não foi possível identificar o cliente.' };
        const { serviceId, professionalId, dateTime, notes } = input;
        if (!serviceId || !professionalId || !dateTime) return { error: 'Dados incompletos para criar marcação.' };
        const appt = await this.agendaService.createAppointment({
          tenantId,
          contactId,
          conversationId,
          serviceId,
          professionalId,
          scheduledAt: dateTime,
          notes,
        });
        return {
          success: true,
          id: appt.id,
          service: appt.service.name,
          professional: appt.professional.name,
          scheduledAt: appt.scheduledAt,
        };
      }

      case 'get_client_appointments': {
        if (!contactId) return [];
        return this.agendaService.getContactAppointments(tenantId, contactId);
      }

      default:
        return { error: `Ferramenta desconhecida: ${toolName}` };
    }
  }

  private buildSystemPrompt(businessContext: string | null | undefined, hasAgenda: boolean): string {
    const base = `És um assistente de apoio ao cliente profissional e prestável.
Respondes sempre em português de Portugal (nunca PT-BR).
Sê conciso, simpático e direto. Nunca inventes informações que não tens.
Se não souberes responder, diz que irás encaminhar para um agente humano.`;

    const agendaInstructions = hasAgenda
      ? `

Tens acesso a um sistema de agendamento. Quando um cliente quiser marcar um serviço/consulta:
1. Usa get_services para listar os serviços disponíveis e apresenta-os ao cliente.
2. Quando o cliente escolher o serviço e uma data, usa get_available_slots para verificar horários livres.
3. Apresenta os horários disponíveis de forma clara (ex: "Segunda, 10h com João").
4. Quando o cliente confirmar o horário, usa create_appointment para criar a marcação.
5. Confirma sempre a marcação ao cliente com todos os detalhes.
Sê proactivo: se o cliente mencionar "marcar", "consulta", "horário" ou "agendamento", inicia o processo.`
      : '';

    const contextPart = businessContext?.trim() ? `\n\nContexto do negócio:\n${businessContext.trim()}` : '';

    return `${base}${agendaInstructions}${contextPart}`;
  }

  private normalizeHistory(messages: Anthropic.MessageParam[]): Anthropic.MessageParam[] {
    const result: Anthropic.MessageParam[] = [];
    for (const msg of messages) {
      const last = result[result.length - 1];
      if (last && last.role === msg.role) continue;
      result.push(msg);
    }
    while (result.length > 0 && result[0]!.role !== 'user') {
      result.shift();
    }
    return result;
  }
}
