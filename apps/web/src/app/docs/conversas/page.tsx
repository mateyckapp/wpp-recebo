import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable } from '@/components/docs/api-method';

export const metadata = { title: 'Conversas — Wpp Recebo Docs' };

export default function ConversasPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">API Reference</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Conversas</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Uma conversa representa o fio de mensagens entre o teu negócio e um contacto via WhatsApp.
        Cada conversa tem um estado (<InlineCode>open</InlineCode>, <InlineCode>resolved</InlineCode>, <InlineCode>pending</InlineCode>)
        e pode estar atribuída a um agente específico.
      </p>

      {/* LIST */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Listar conversas</h2>
      <ApiMethod method="GET" path="/conversations" description="Devolve uma lista paginada de conversas" />
      <ParamTable params={[
        { name: 'status', type: 'string', required: false, description: 'Filtrar por estado: open, resolved, pending' },
        { name: 'assigneeId', type: 'string', required: false, description: 'Filtrar por ID do agente atribuído' },
        { name: 'contactId', type: 'string', required: false, description: 'Filtrar por ID do contacto' },
        { name: 'page', type: 'number', required: false, description: 'Página (default: 1)' },
        { name: 'limit', type: 'number', required: false, description: 'Resultados por página, máx. 100 (default: 20)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl "https://api.wpprecebo.com/v1/conversations?status=open&limit=10" \\
  -H "X-API-Key: wpr_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "id": "conv_01HXYZ...",
      "status": "open",
      "unreadCount": 3,
      "assignee": {
        "id": "usr_01HABC...",
        "name": "Ana Silva"
      },
      "contact": {
        "id": "ctc_01HDEF...",
        "name": "João Pereira",
        "phone": "+351912345678"
      },
      "lastMessage": {
        "content": "Bom dia, queria saber...",
        "sentAt": "2026-05-23T09:30:00.000Z",
        "direction": "inbound"
      },
      "createdAt": "2026-05-20T14:00:00.000Z",
      "updatedAt": "2026-05-23T09:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}`}
      />

      {/* GET ONE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Obter conversa</h2>
      <ApiMethod method="GET" path="/conversations/:id" description="Devolve os detalhes de uma conversa específica" />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl https://api.wpprecebo.com/v1/conversations/conv_01HXYZ \\
  -H "X-API-Key: wpr_live_xxx"`}
      />

      {/* ASSIGN */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Atribuir conversa</h2>
      <ApiMethod method="PATCH" path="/conversations/:id/assign" description="Atribui ou reatribui uma conversa a um agente" />
      <ParamTable params={[
        { name: 'assigneeId', type: 'string', required: true, description: 'ID do utilizador a quem será atribuída a conversa. null para desatribuir.' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X PATCH https://api.wpprecebo.com/v1/conversations/conv_01HXYZ/assign \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"assigneeId": "usr_01HABC"}'`}
      />

      {/* RESOLVE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Resolver / reabrir conversa</h2>
      <ApiMethod method="PATCH" path="/conversations/:id/status" description="Altera o estado de uma conversa" />
      <ParamTable params={[
        { name: 'status', type: 'string', required: true, description: 'Novo estado: open, resolved ou pending' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo — resolver"
        code={`curl -X PATCH https://api.wpprecebo.com/v1/conversations/conv_01HXYZ/status \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "resolved"}'`}
      />

      {/* NOTES */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Adicionar nota interna</h2>
      <ApiMethod method="POST" path="/conversations/:id/notes" description="Adiciona uma nota interna à conversa (não enviada ao cliente)" />
      <ParamTable params={[
        { name: 'content', type: 'string', required: true, description: 'Texto da nota interna (máx. 2000 caracteres)' },
      ]} />

      {/* OBJECT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Objeto Conversation</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Campo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Tipo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { field: 'id', type: 'string', desc: 'Identificador único (prefixo conv_)' },
              { field: 'status', type: 'enum', desc: 'open | resolved | pending' },
              { field: 'unreadCount', type: 'number', desc: 'Mensagens não lidas pela equipa' },
              { field: 'assignee', type: 'User | null', desc: 'Agente atribuído à conversa' },
              { field: 'contact', type: 'Contact', desc: 'Contacto associado à conversa' },
              { field: 'lastMessage', type: 'Message | null', desc: 'Última mensagem da conversa' },
              { field: 'createdAt', type: 'ISO 8601', desc: 'Data de criação' },
              { field: 'updatedAt', type: 'ISO 8601', desc: 'Data da última atualização' },
            ].map((row, i) => (
              <tr key={row.field} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.field}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.type}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
