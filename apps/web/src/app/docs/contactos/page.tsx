import { CodeBlock } from '@/components/docs/code-block';
import { ApiMethod, ParamTable } from '@/components/docs/api-method';

export const metadata = { title: 'Contactos — Wpp Recebo Docs' };

export default function ContactosPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">API Reference</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Contactos</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Os contactos representam os clientes do teu negócio. Cada contacto está ligado a um número WhatsApp
        e pode ter múltiplas conversas ao longo do tempo. Integra o teu CRM sincronizando contactos via API.
      </p>

      {/* LIST */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Listar contactos</h2>
      <ApiMethod method="GET" path="/contacts" description="Devolve uma lista paginada de contactos" />
      <ParamTable params={[
        { name: 'search', type: 'string', required: false, description: 'Pesquisa por nome, telefone ou email' },
        { name: 'tag', type: 'string', required: false, description: 'Filtrar por tag' },
        { name: 'page', type: 'number', required: false, description: 'Página (default: 1)' },
        { name: 'limit', type: 'number', required: false, description: 'Resultados por página, máx. 100 (default: 20)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl "https://api.wpprecebo.com/v1/contacts?search=joao&limit=10" \\
  -H "X-API-Key: wpr_live_xxx"`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": [
    {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678",
      "email": "joao@exemplo.pt",
      "tags": ["cliente", "vip"],
      "customFields": {
        "nif": "123456789",
        "cidade": "Lisboa"
      },
      "conversationCount": 5,
      "lastContactAt": "2026-05-23T09:30:00.000Z",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 142, "totalPages": 15 }
}`}
      />

      {/* GET ONE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Obter contacto</h2>
      <ApiMethod method="GET" path="/contacts/:id" description="Devolve os detalhes de um contacto específico" />

      {/* CREATE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Criar contacto</h2>
      <ApiMethod method="POST" path="/contacts" description="Cria um novo contacto. Se o número de telefone já existir, devolve o contacto existente." />
      <ParamTable params={[
        { name: 'phone', type: 'string', required: true, description: 'Número de telefone em formato E.164 (ex: +351912345678)' },
        { name: 'name', type: 'string', required: false, description: 'Nome do contacto' },
        { name: 'email', type: 'string', required: false, description: 'Email do contacto' },
        { name: 'tags', type: 'string[]', required: false, description: 'Array de tags para segmentação' },
        { name: 'customFields', type: 'object', required: false, description: 'Campos personalizados em formato chave-valor' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/contacts \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+351912345678",
    "name": "Maria Santos",
    "email": "maria@exemplo.pt",
    "tags": ["cliente", "newsletter"],
    "customFields": {
      "cidade": "Porto",
      "nif": "987654321"
    }
  }'`}
      />

      {/* UPDATE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Atualizar contacto</h2>
      <ApiMethod method="PATCH" path="/contacts/:id" description="Atualiza os dados de um contacto. Apenas os campos enviados são alterados." />
      <ParamTable params={[
        { name: 'name', type: 'string', required: false, description: 'Nome do contacto' },
        { name: 'email', type: 'string', required: false, description: 'Email do contacto' },
        { name: 'tags', type: 'string[]', required: false, description: 'Substitui todas as tags existentes' },
        { name: 'customFields', type: 'object', required: false, description: 'Merge com campos personalizados existentes' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X PATCH https://api.wpprecebo.com/v1/contacts/ctc_01HXYZ \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"tags": ["cliente", "vip", "premium"]}'`}
      />

      {/* DELETE */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Eliminar contacto</h2>
      <ApiMethod method="DELETE" path="/contacts/:id" description="Elimina o contacto e todas as suas conversas permanentemente" />

      {/* OBJECT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Objeto Contact</h2>
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
              { field: 'id', type: 'string', desc: 'Identificador único (prefixo ctc_)' },
              { field: 'name', type: 'string | null', desc: 'Nome do contacto' },
              { field: 'phone', type: 'string', desc: 'Número de telefone E.164' },
              { field: 'email', type: 'string | null', desc: 'Email do contacto' },
              { field: 'tags', type: 'string[]', desc: 'Tags de segmentação' },
              { field: 'customFields', type: 'object', desc: 'Campos personalizados chave-valor' },
              { field: 'conversationCount', type: 'number', desc: 'Total de conversas com este contacto' },
              { field: 'lastContactAt', type: 'ISO 8601 | null', desc: 'Data do último contacto' },
              { field: 'createdAt', type: 'ISO 8601', desc: 'Data de criação' },
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
