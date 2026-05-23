import Link from 'next/link';
import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Documentação — Wpp Recebo' };

const quickLinks = [
  { href: '/docs/autenticacao', icon: '🔑', title: 'Autenticação', desc: 'API Keys e Bearer tokens' },
  { href: '/docs/webhooks', icon: '🔗', title: 'Webhooks', desc: 'Eventos em tempo real' },
  { href: '/docs/conversas', icon: '💬', title: 'Conversas', desc: 'Listar e gerir conversas' },
  { href: '/docs/mensagens', icon: '📨', title: 'Mensagens', desc: 'Enviar mensagens via API' },
  { href: '/docs/contactos', icon: '👥', title: 'Contactos', desc: 'Criar e atualizar contactos' },
  { href: '/docs/ia', icon: '🤖', title: 'IA Personalizada', desc: 'Configurar o assistente' },
];

export default function DocsPage() {
  return (
    <div className="prose-custom">
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Documentação</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Introdução</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Bem-vindo à documentação da API do Wpp Recebo. Esta API permite integrar a plataforma com os teus sistemas internos —
        CRM, ERP, plataformas de e-commerce, ou qualquer serviço que precise de comunicar via WhatsApp de forma programática.
      </p>

      <Alert type="warning">
        O acesso à API pública, webhooks e IA personalizada está disponível exclusivamente no{' '}
        <Link href="/produtos/enterprise" className="font-semibold text-amber-400 hover:text-amber-300">plano Enterprise</Link>.
        Os planos Start, Pro e Agenda Pro têm acesso ao dashboard, mas não à API pública.
      </Alert>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">URL base</h2>
      <p className="text-gray-400 text-sm mb-2">Todos os endpoints da API têm como base o seguinte URL:</p>
      <CodeBlock code="https://api.wpprecebo.com/v1" language="url" title="Base URL" />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Autenticação rápida</h2>
      <p className="text-gray-400 text-sm mb-2">
        Todas as chamadas à API requerem um API Key no header <InlineCode>X-API-Key</InlineCode>:
      </p>
      <CodeBlock
        language="bash"
        title="Exemplo de chamada autenticada"
        code={`curl https://api.wpprecebo.com/v1/conversations \\
  -H "X-API-Key: wpr_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}
      />
      <p className="text-gray-400 text-sm">
        Aprende a gerar e gerir os teus API Keys em{' '}
        <Link href="/docs/autenticacao" className="text-brand-400 hover:text-brand-300">Autenticação</Link>.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Respostas</h2>
      <p className="text-gray-400 text-sm mb-3">
        Todas as respostas são em JSON. As respostas de sucesso têm sempre o campo <InlineCode>data</InlineCode>.
        Em caso de erro, o campo <InlineCode>error</InlineCode> contém a descrição.
      </p>
      <CodeBlock
        language="json"
        title="Resposta de sucesso"
        code={`{
  "data": {
    "id": "conv_01HXYZ...",
    "status": "open",
    "contact": { ... }
  }
}`}
      />
      <CodeBlock
        language="json"
        title="Resposta de erro"
        code={`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API Key inválida ou inexistente."
  }
}`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Códigos HTTP</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Significado</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: '200 OK', desc: 'Pedido processado com sucesso' },
              { code: '201 Created', desc: 'Recurso criado com sucesso' },
              { code: '204 No Content', desc: 'Operação bem-sucedida sem corpo de resposta' },
              { code: '400 Bad Request', desc: 'Parâmetros inválidos ou em falta' },
              { code: '401 Unauthorized', desc: 'API Key inválida ou em falta' },
              { code: '403 Forbidden', desc: 'Sem permissão para este recurso' },
              { code: '404 Not Found', desc: 'Recurso não encontrado' },
              { code: '429 Too Many Requests', desc: 'Limite de chamadas excedido' },
              { code: '500 Internal Server Error', desc: 'Erro interno — contacta o suporte' },
            ].map((row, i) => (
              <tr key={row.code} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.code}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-6">Referência rápida</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-brand-500/30 hover:bg-white/[0.04] transition-colors group"
          >
            <span className="text-xl flex-shrink-0">{link.icon}</span>
            <div>
              <p className="font-semibold text-white text-sm group-hover:text-brand-400 transition-colors">{link.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
