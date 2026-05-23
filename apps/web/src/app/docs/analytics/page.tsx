import { CodeBlock } from '@/components/docs/code-block';
import { ApiMethod, ParamTable } from '@/components/docs/api-method';

export const metadata = { title: 'Analytics — Wpp Recebo Docs' };

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">API Reference</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Analytics</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Acede às métricas e relatórios do teu negócio via API. Ideal para integrar dados do Wpp Recebo
        em dashboards internos, relatórios de gestão ou ferramentas de BI.
      </p>

      {/* SUMMARY */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Resumo geral</h2>
      <ApiMethod method="GET" path="/analytics/summary" description="Devolve as métricas principais do período selecionado" />
      <ParamTable params={[
        { name: 'period', type: 'string', required: false, description: 'Período: today, week, month, custom (default: month)' },
        { name: 'startDate', type: 'ISO 8601', required: false, description: 'Data de início (obrigatório se period=custom)' },
        { name: 'endDate', type: 'ISO 8601', required: false, description: 'Data de fim (obrigatório se period=custom)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl "https://api.wpprecebo.com/v1/analytics/summary?period=month" \\
  -H "X-API-Key: wpr_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "period": {
      "start": "2026-05-01T00:00:00.000Z",
      "end": "2026-05-31T23:59:59.000Z"
    },
    "conversations": {
      "total": 248,
      "open": 12,
      "resolved": 231,
      "pending": 5,
      "avgResolutionTimeMinutes": 47
    },
    "messages": {
      "sent": 1840,
      "received": 2103,
      "aiGenerated": 412
    },
    "contacts": {
      "total": 1205,
      "new": 87
    },
    "response": {
      "avgFirstResponseMinutes": 8,
      "outsideHoursHandledByAi": 156
    }
  }
}`}
      />

      {/* AGENTS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Desempenho por agente</h2>
      <ApiMethod method="GET" path="/analytics/agents" description="Métricas individuais de cada membro da equipa" />
      <ParamTable params={[
        { name: 'period', type: 'string', required: false, description: 'Período: today, week, month (default: month)' },
      ]} />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "agentId": "usr_01HABC...",
      "name": "Ana Silva",
      "conversations": {
        "assigned": 78,
        "resolved": 74
      },
      "messages": {
        "sent": 412
      },
      "avgFirstResponseMinutes": 5,
      "avgResolutionTimeMinutes": 38
    }
  ]
}`}
      />

      {/* VOLUME */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Volume por dia</h2>
      <ApiMethod method="GET" path="/analytics/volume" description="Volume diário de mensagens e conversas no período" />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "date": "2026-05-01",
      "conversationsOpened": 12,
      "conversationsResolved": 10,
      "messagesSent": 87,
      "messagesReceived": 93
    },
    {
      "date": "2026-05-02",
      "conversationsOpened": 8,
      "conversationsResolved": 14,
      "messagesSent": 65,
      "messagesReceived": 71
    }
  ]
}`}
      />

      {/* EXPORT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Exportar relatório</h2>
      <ApiMethod method="GET" path="/analytics/export" description="Exporta dados em formato CSV para um período específico" />
      <ParamTable params={[
        { name: 'type', type: 'string', required: true, description: 'Tipo de relatório: conversations, messages, agents' },
        { name: 'startDate', type: 'ISO 8601', required: true, description: 'Data de início' },
        { name: 'endDate', type: 'ISO 8601', required: true, description: 'Data de fim (máx. 90 dias)' },
        { name: 'format', type: 'string', required: false, description: 'Formato: csv (default) ou json' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo — exportar conversas de maio"
        code={`curl "https://api.wpprecebo.com/v1/analytics/export?type=conversations&startDate=2026-05-01&endDate=2026-05-31&format=csv" \\
  -H "X-API-Key: wpr_live_xxx" \\
  -o relatorio_maio.csv`}
      />
    </div>
  );
}
