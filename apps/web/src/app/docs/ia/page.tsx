import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable, Alert } from '@/components/docs/api-method';

export const metadata = { title: 'IA Personalizada — Wpp Recebo Docs' };

export default function IaPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">IA Personalizada</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">IA Personalizada</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        O plano Enterprise permite configurar uma IA totalmente personalizada para o teu negócio.
        Define a base de conhecimento, o tom de voz, as regras de escalada e o comportamento em cada cenário —
        a IA responde como se fosse um membro treinado da tua equipa.
      </p>

      <Alert type="info">
        A IA Personalizada está disponível exclusivamente no plano <strong>Enterprise</strong>.
        Em planos inferiores, a IA usa um assistente genérico sem personalização de contexto ou comportamento.
      </Alert>

      {/* OVERVIEW */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Como funciona</h2>
      <div className="space-y-3 mb-6">
        {[
          { step: '1', title: 'Configuras o contexto', desc: 'Forneces informação sobre o teu negócio — serviços, preços, horários, FAQs — através da API ou painel.' },
          { step: '2', title: 'Defines o comportamento', desc: 'Escolhes o tom, as regras de escalada para humano e o que a IA deve ou não deve responder.' },
          { step: '3', title: 'A IA é treinada', desc: 'O modelo é fine-tuned com o teu contexto. O processo demora até 30 minutos após cada atualização de contexto.' },
          { step: '4', title: 'Entra em produção', desc: 'A partir do momento que está ativa, a IA responde automaticamente às mensagens recebidas fora do horário de atendimento ou quando nenhum agente está disponível.' },
        ].map((s) => (
          <div key={s.step} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center">
              {s.step}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GET CONFIG */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Obter configuração da IA</h2>
      <ApiMethod method="GET" path="/ai/config" description="Devolve a configuração atual da IA personalizada do tenant" />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl https://api.wpprecebo.com/v1/ai/config \\
  -H "X-API-Key: wpr_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "enabled": true,
    "model": "gpt-4o",
    "language": "pt",
    "respondOutsideHours": true,
    "respondWhenAgentsBusy": true,
    "maxResponseTokens": 300,
    "escalationEnabled": true,
    "escalationKeywords": ["humano", "falar com alguém", "atendente"],
    "contextLastUpdatedAt": "2026-05-20T14:00:00.000Z",
    "behaviorLastUpdatedAt": "2026-05-18T10:00:00.000Z",
    "status": "active"
  }
}`}
      />

      {/* UPDATE CONFIG */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Atualizar configuração</h2>
      <ApiMethod method="PATCH" path="/ai/config" description="Atualiza as definições globais da IA. Apenas os campos enviados são alterados." />
      <ParamTable params={[
        { name: 'enabled', type: 'boolean', required: false, description: 'Ativa ou desativa a IA completamente' },
        { name: 'respondOutsideHours', type: 'boolean', required: false, description: 'IA responde fora do horário de atendimento definido' },
        { name: 'respondWhenAgentsBusy', type: 'boolean', required: false, description: 'IA responde quando todos os agentes estão em atendimento' },
        { name: 'escalationEnabled', type: 'boolean', required: false, description: 'Permite que a IA escale para um humano quando detecta palavras-chave' },
        { name: 'escalationKeywords', type: 'string[]', required: false, description: 'Palavras ou frases que ativam a escalada para humano' },
        { name: 'maxResponseTokens', type: 'number', required: false, description: 'Limite de tokens por resposta (default: 300, máx: 800)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo — ativar IA fora de horas"
        code={`curl -X PATCH https://api.wpprecebo.com/v1/ai/config \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "enabled": true,
    "respondOutsideHours": true,
    "respondWhenAgentsBusy": false,
    "escalationKeywords": ["humano", "falar com alguém", "urgente"]
  }'`}
      />

      {/* STATUS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Estados da IA</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Estado</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { status: 'active', desc: 'IA ativa e a responder' },
              { status: 'training', desc: 'A processar atualizações de contexto ou comportamento (pode demorar até 30 min)' },
              { status: 'disabled', desc: 'IA desativada manualmente' },
              { status: 'error', desc: 'Erro na configuração — contacta o suporte' },
            ].map((row, i) => (
              <tr key={row.status} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.status}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NAV CARDS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Próximos passos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'Base de Conhecimento', desc: 'Configura o contexto do teu negócio — serviços, preços, FAQs', href: '/docs/ia/contexto' },
          { title: 'Tom e Comportamento', desc: 'Define a personalidade, tom de voz e regras de escalada da IA', href: '/docs/ia/comportamento' },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-brand-500/40 transition-all group"
          >
            <p className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">{card.title} →</p>
            <p className="text-xs text-gray-500">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
