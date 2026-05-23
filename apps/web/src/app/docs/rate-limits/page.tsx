import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Rate Limits — Wpp Recebo Docs' };

export default function RateLimitsPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">API Reference</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Rate Limits</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        A API do Wpp Recebo aplica limites de taxa por chave de API para garantir estabilidade e equidade entre todos os tenants.
        Os limites variam consoante o plano e o endpoint.
      </p>

      {/* HEADERS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Headers de rate limit</h2>
      <p className="text-gray-400 text-sm mb-3">
        Cada resposta da API inclui os seguintes headers para que possas gerir o consumo:
      </p>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Header</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { header: 'X-RateLimit-Limit', desc: 'Número máximo de pedidos permitidos na janela atual' },
              { header: 'X-RateLimit-Remaining', desc: 'Pedidos restantes na janela atual' },
              { header: 'X-RateLimit-Reset', desc: 'Timestamp Unix (segundos) de quando a janela reinicia' },
              { header: 'Retry-After', desc: 'Apenas presente em respostas 429 — segundos a aguardar antes de tentar novamente' },
            ].map((row, i) => (
              <tr key={row.header} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.header}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="bash"
        title="Exemplo de headers numa resposta"
        code={`HTTP/2 200
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1748000460`}
      />

      {/* LIMITS BY PLAN */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Limites por plano</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Plano</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Pedidos / minuto</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Pedidos / dia</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Mensagens enviadas / dia</th>
            </tr>
          </thead>
          <tbody>
            {[
              { plan: 'Start', rpm: '—', rpd: '—', msg: '—', note: 'Sem acesso à API' },
              { plan: 'Pro', rpm: '60', rpd: '10 000', msg: '1 000' },
              { plan: 'Agenda Pro', rpm: '60', rpd: '10 000', msg: '1 000' },
              { plan: 'Enterprise', rpm: '300', rpd: 'Ilimitado*', msg: 'Ilimitado*' },
            ].map((row, i) => (
              <tr key={row.plan} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 text-xs text-white font-semibold">{row.plan}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300">{row.rpm}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300">{row.rpd}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300">{row.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        * Enterprise tem limites alargados definidos por contrato. Sujeito a fair use e limites da API do WhatsApp Business (Meta).
      </p>

      {/* LIMITS BY ENDPOINT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Limites por endpoint</h2>
      <p className="text-gray-400 text-sm mb-3">
        Alguns endpoints têm limites mais restritos independentemente do plano:
      </p>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Endpoint</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Limite específico</th>
            </tr>
          </thead>
          <tbody>
            {[
              { endpoint: 'POST /messages/send', limit: '10 pedidos/min (proteção anti-spam)' },
              { endpoint: 'POST /messages/schedule', limit: '30 pedidos/min' },
              { endpoint: 'PUT /ai/context', limit: '5 pedidos/hora (limite de treino)' },
              { endpoint: 'PATCH /ai/behavior', limit: '10 pedidos/hora' },
              { endpoint: 'POST /ai/test', limit: '60 pedidos/hora' },
              { endpoint: 'GET /analytics/export', limit: '10 pedidos/hora (geração de relatórios)' },
            ].map((row, i) => (
              <tr key={row.endpoint} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.endpoint}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 429 ERROR */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Resposta 429 Too Many Requests</h2>
      <p className="text-gray-400 text-sm mb-3">
        Quando ultrapassas o limite, a API devolve <InlineCode>HTTP 429</InlineCode> com o seguinte corpo:
      </p>
      <CodeBlock
        language="json"
        title="Resposta 429"
        code={`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before retrying.",
    "retryAfter": 23
  }
}`}
      />

      {/* BEST PRACTICES */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Boas práticas</h2>
      <div className="space-y-3">
        {[
          {
            title: 'Implementa exponential backoff',
            desc: 'Quando receberes um 429, não retentes imediatamente. Aguarda o valor em Retry-After e aumenta o intervalo progressivamente em caso de falhas consecutivas.',
          },
          {
            title: 'Monitoriza os headers',
            desc: 'Lê X-RateLimit-Remaining em cada resposta para adaptar o ritmo dos pedidos antes de atingir o limite.',
          },
          {
            title: 'Usa webhooks em vez de polling',
            desc: 'Em vez de fazer GET /conversations a cada 5 segundos, subscreve ao evento conversation.created via webhook. Poupa pedidos e é mais eficiente.',
          },
          {
            title: 'Agrupa pedidos quando possível',
            desc: 'Se precisas de actualizar múltiplos contactos, faz um pedido PATCH por contacto em vez de operações desnecessariamente fragmentadas.',
          },
        ].map((tip) => (
          <div key={tip.title} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-semibold text-white mb-1">{tip.title}</p>
            <p className="text-xs text-gray-400">{tip.desc}</p>
          </div>
        ))}
      </div>

      <Alert type="info">
        Se o teu caso de uso legítimo exige limites superiores aos do plano Enterprise, contacta-nos em{' '}
        <strong>enterprise@wpprecebo.com</strong> para discutir um acordo personalizado.
      </Alert>
    </div>
  );
}
