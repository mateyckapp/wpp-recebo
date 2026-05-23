import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable, Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Webhooks — Wpp Recebo Docs' };

export default function WebhooksPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Webhooks</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Webhooks</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Os webhooks permitem que o teu sistema receba notificações em tempo real quando eventos acontecem no Wpp Recebo —
        nova mensagem recebida, conversa atribuída, marcação criada, etc. Em vez de fazer polling constante à API,
        o Wpp Recebo envia um POST para o teu endpoint quando algo acontece.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Como funciona</h2>
      <div className="space-y-3 mb-6">
        {[
          { step: '1', title: 'Registas um endpoint', desc: 'Forneces um URL HTTPS do teu servidor e escolhes os eventos que queres receber.' },
          { step: '2', title: 'Evento acontece', desc: 'Alguém envia uma mensagem, é criada uma marcação, etc.' },
          { step: '3', title: 'Wpp Recebo envia um POST', desc: 'O servidor envia um pedido POST com o payload do evento para o teu URL.' },
          { step: '4', title: 'Respondes com 200', desc: 'O teu servidor processa o evento e responde com HTTP 200. Se falhar, tentamos novamente (retry).' },
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

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Registar um webhook</h2>
      <ApiMethod method="POST" path="/webhooks" description="Cria um novo endpoint de webhook" />
      <ParamTable params={[
        { name: 'url', type: 'string', required: true, description: 'URL HTTPS do teu servidor que receberá os eventos' },
        { name: 'events', type: 'string[]', required: true, description: 'Array de eventos a subscrever. Usa ["*"] para todos os eventos.' },
        { name: 'secret', type: 'string', required: false, description: 'Chave secreta para verificação da assinatura HMAC-SHA256' },
        { name: 'description', type: 'string', required: false, description: 'Descrição para identificar o webhook' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/webhooks \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://meusite.pt/webhooks/wpprecebo",
    "events": ["message.received", "conversation.assigned"],
    "secret": "meu_segredo_seguro_123",
    "description": "Webhook CRM principal"
  }'`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "id": "wh_01HXYZ...",
    "url": "https://meusite.pt/webhooks/wpprecebo",
    "events": ["message.received", "conversation.assigned"],
    "description": "Webhook CRM principal",
    "active": true,
    "createdAt": "2026-05-23T10:00:00.000Z"
  }
}`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Listar webhooks</h2>
      <ApiMethod method="GET" path="/webhooks" description="Devolve todos os webhooks registados" />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "id": "wh_01HXYZ...",
      "url": "https://meusite.pt/webhooks/wpprecebo",
      "events": ["message.received", "conversation.assigned"],
      "active": true,
      "lastDeliveredAt": "2026-05-23T09:45:00.000Z",
      "createdAt": "2026-05-23T10:00:00.000Z"
    }
  ]
}`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Remover um webhook</h2>
      <ApiMethod method="DELETE" path="/webhooks/:id" description="Remove o webhook com o ID especificado" />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Estrutura do payload</h2>
      <p className="text-gray-400 text-sm mb-3">Todos os eventos têm a mesma estrutura base:</p>
      <CodeBlock
        language="json"
        title="Payload de um evento"
        code={`{
  "id": "evt_01HXYZ...",
  "event": "message.received",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:30:00.000Z",
  "data": {
    // conteúdo específico do evento
  }
}`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Eventos disponíveis</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { event: 'message.received', desc: 'Nova mensagem recebida de um cliente' },
              { event: 'message.sent', desc: 'Mensagem enviada pela equipa ou IA' },
              { event: 'conversation.created', desc: 'Nova conversa iniciada' },
              { event: 'conversation.assigned', desc: 'Conversa atribuída a um agente' },
              { event: 'conversation.resolved', desc: 'Conversa marcada como resolvida' },
              { event: 'contact.created', desc: 'Novo contacto criado' },
              { event: 'contact.updated', desc: 'Dados de um contacto atualizados' },
              { event: 'appointment.created', desc: 'Nova marcação criada (Agenda Pro)' },
              { event: 'appointment.cancelled', desc: 'Marcação cancelada (Agenda Pro)' },
              { event: 'appointment.reminded', desc: 'Lembrete de marcação enviado (Agenda Pro)' },
            ].map((row, i) => (
              <tr key={row.event} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.event}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Verificação de assinatura</h2>
      <p className="text-gray-400 text-sm mb-3">
        Se configuraste um <InlineCode>secret</InlineCode>, cada pedido incluirá o header{' '}
        <InlineCode>X-WPP-Signature</InlineCode> com o HMAC-SHA256 do corpo do pedido.
        Verifica sempre a assinatura para garantir que o pedido vem do Wpp Recebo.
      </p>
      <CodeBlock
        language="javascript"
        title="Verificação em Node.js"
        code={`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

// Express.js example
app.post('/webhooks/wpprecebo', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-wpp-signature'];
  const isValid = verifySignature(req.body, signature, process.env.WPP_WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: 'Assinatura inválida' });
  }

  const event = JSON.parse(req.body);
  // processa o evento...

  res.status(200).json({ received: true });
});`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Retry automático</h2>
      <p className="text-gray-400 text-sm mb-3">
        Se o teu servidor não responder com <InlineCode>2xx</InlineCode> em 10 segundos,
        o Wpp Recebo tentará novamente com backoff exponencial:
      </p>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Tentativa</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Após</th>
            </tr>
          </thead>
          <tbody>
            {[
              { attempt: '1ª (imediata)', delay: '0 segundos' },
              { attempt: '2ª retry', delay: '5 segundos' },
              { attempt: '3ª retry', delay: '30 segundos' },
              { attempt: '4ª retry', delay: '2 minutos' },
              { attempt: '5ª retry', delay: '10 minutos' },
            ].map((row) => (
              <tr key={row.attempt} className="border-b border-white/[0.04] last:border-0">
                <td className="px-4 py-3 text-xs text-gray-300">{row.attempt}</td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{row.delay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Alert type="info">
        Após 5 tentativas falhadas, o evento é descartado e o webhook é marcado como problemático.
        O teu gestor de conta será notificado.
      </Alert>
    </div>
  );
}
