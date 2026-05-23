import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable, Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Mensagens — Wpp Recebo Docs' };

export default function MensagensPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">API Reference</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Mensagens</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Envia mensagens WhatsApp para contactos existentes ou por número de telefone, lista o histórico
        de uma conversa e agenda mensagens para envio futuro.
      </p>

      <Alert type="warning">
        O envio de mensagens está sujeito às políticas da API oficial do WhatsApp Business (Meta).
        Só podes iniciar conversas usando templates aprovados. Respostas a mensagens recebidas nas últimas 24h
        não necessitam de template.
      </Alert>

      {/* LIST MESSAGES */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Listar mensagens de uma conversa</h2>
      <ApiMethod method="GET" path="/conversations/:id/messages" description="Devolve o histórico de mensagens de uma conversa (mais recente primeiro)" />
      <ParamTable params={[
        { name: 'page', type: 'number', required: false, description: 'Página (default: 1)' },
        { name: 'limit', type: 'number', required: false, description: 'Mensagens por página, máx. 100 (default: 50)' },
      ]} />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "id": "msg_01HXYZ...",
      "content": "Bom dia! Queria saber o horário de funcionamento.",
      "direction": "inbound",
      "type": "text",
      "status": "read",
      "sentAt": "2026-05-23T09:30:00.000Z",
      "sender": {
        "type": "contact",
        "name": "João Pereira"
      }
    },
    {
      "id": "msg_01HABC...",
      "content": "Olá João! Estamos abertos das 9h às 18h, de segunda a sexta.",
      "direction": "outbound",
      "type": "text",
      "status": "delivered",
      "sentAt": "2026-05-23T09:32:00.000Z",
      "sender": {
        "type": "agent",
        "name": "Ana Silva"
      }
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 24, "totalPages": 1 }
}`}
      />

      {/* SEND MESSAGE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Enviar mensagem</h2>
      <ApiMethod method="POST" path="/conversations/:id/messages" description="Envia uma mensagem de texto numa conversa existente" />
      <ParamTable params={[
        { name: 'content', type: 'string', required: true, description: 'Texto da mensagem (máx. 4096 caracteres)' },
        { name: 'type', type: 'string', required: false, description: 'Tipo de mensagem. Atualmente suporta: text (default)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/conversations/conv_01HXYZ/messages \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Olá! A tua encomenda foi enviada hoje."}'`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "id": "msg_01HNEW...",
    "content": "Olá! A tua encomenda foi enviada hoje.",
    "direction": "outbound",
    "type": "text",
    "status": "sent",
    "sentAt": "2026-05-23T10:00:00.000Z"
  }
}`}
      />

      {/* SEND TO PHONE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Enviar mensagem por número</h2>
      <ApiMethod method="POST" path="/messages/send" description="Envia uma mensagem para um número de telefone. Cria uma nova conversa se não existir." />
      <ParamTable params={[
        { name: 'phone', type: 'string', required: true, description: 'Número de telefone em formato E.164 (ex: +351912345678)' },
        { name: 'content', type: 'string', required: true, description: 'Texto da mensagem' },
        { name: 'templateId', type: 'string', required: false, description: 'ID de um template aprovado (obrigatório se não houver conversa ativa nas últimas 24h)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo — conversa ativa (sem template)"
        code={`curl -X POST https://api.wpprecebo.com/v1/messages/send \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+351912345678",
    "content": "A tua encomenda #1234 foi despachada!"
  }'`}
      />

      {/* SCHEDULE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Agendar mensagem</h2>
      <ApiMethod method="POST" path="/messages/schedule" description="Agenda uma mensagem para envio numa data/hora futura" />
      <ParamTable params={[
        { name: 'conversationId', type: 'string', required: true, description: 'ID da conversa onde a mensagem será enviada' },
        { name: 'content', type: 'string', required: true, description: 'Texto da mensagem' },
        { name: 'scheduledFor', type: 'ISO 8601', required: true, description: 'Data e hora de envio (ex: 2026-06-01T09:00:00Z)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/messages/schedule \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "conversationId": "conv_01HXYZ",
    "content": "Lembrete: tens uma consulta amanhã às 10h!",
    "scheduledFor": "2026-05-30T08:00:00Z"
  }'`}
      />

      {/* STATUS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Estados de uma mensagem</h2>
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
              { status: 'sent', desc: 'Enviada para a API do WhatsApp' },
              { status: 'delivered', desc: 'Entregue no dispositivo do destinatário' },
              { status: 'read', desc: 'Lida pelo destinatário' },
              { status: 'failed', desc: 'Falha no envio (número inválido, bloqueio, etc.)' },
              { status: 'scheduled', desc: 'Agendada para envio futuro' },
            ].map((row, i) => (
              <tr key={row.status} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.status}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
