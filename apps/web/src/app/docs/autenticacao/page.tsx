import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Autenticação — Wpp Recebo Docs' };

export default function AutenticacaoPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Início</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Autenticação</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        A API do Wpp Recebo utiliza API Keys para autenticar todos os pedidos. As tuas chaves têm permissões totais
        sobre a tua conta — guarda-as em segurança e nunca as expõas no frontend ou repositórios públicos.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Gerar uma API Key</h2>
      <ol className="space-y-2 text-sm text-gray-400 mb-6 list-decimal list-inside">
        <li>Acede ao painel em <span className="text-brand-400">tenant.wpprecebo.com</span></li>
        <li>Vai a <span className="text-white font-medium">Definições → API Keys</span></li>
        <li>Clica em <span className="text-white font-medium">Gerar nova chave</span></li>
        <li>Copia e guarda a chave — só será mostrada uma vez</li>
      </ol>

      <Alert type="danger">
        As API Keys dão acesso total à tua conta. Nunca as incluas em código cliente (frontend), repositórios Git
        públicos ou variáveis de ambiente não encriptadas.
      </Alert>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Formato da chave</h2>
      <p className="text-gray-400 text-sm mb-3">As chaves têm o seguinte formato:</p>
      <CodeBlock
        language="text"
        code={`wpr_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx   (produção)
wpr_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx   (sandbox)`}
      />
      <p className="text-gray-400 text-sm">
        As chaves de teste começam com <InlineCode>wpr_test_</InlineCode> e apenas simulam operações —
        nenhuma mensagem é enviada e nenhum dado é persistido.
      </p>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Como autenticar</h2>
      <p className="text-gray-400 text-sm mb-3">
        Envia a chave no header <InlineCode>X-API-Key</InlineCode> de cada pedido:
      </p>
      <CodeBlock
        language="bash"
        title="cURL"
        code={`curl https://api.wpprecebo.com/v1/conversations \\
  -H "X-API-Key: wpr_live_xxxxxxxxxxxxxxxxxxxxxxxx"`}
      />
      <CodeBlock
        language="javascript"
        title="JavaScript / Node.js"
        code={`const response = await fetch('https://api.wpprecebo.com/v1/conversations', {
  headers: {
    'X-API-Key': process.env.WPP_API_KEY,
    'Content-Type': 'application/json',
  },
});

const { data } = await response.json();`}
      />
      <CodeBlock
        language="python"
        title="Python"
        code={`import requests

headers = {
    'X-API-Key': os.environ['WPP_API_KEY'],
    'Content-Type': 'application/json',
}

response = requests.get(
    'https://api.wpprecebo.com/v1/conversations',
    headers=headers,
)
data = response.json()['data']`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Ambientes</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ambiente</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Base URL</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prefixo da chave</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/[0.04]">
              <td className="px-4 py-3 text-xs text-gray-300 font-medium">Produção</td>
              <td className="px-4 py-3 font-mono text-xs text-brand-400">https://api.wpprecebo.com/v1</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">wpr_live_</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-xs text-gray-300 font-medium">Sandbox</td>
              <td className="px-4 py-3 font-mono text-xs text-brand-400">https://api.wpprecebo.com/v1</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">wpr_test_</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Erros de autenticação</h2>
      <CodeBlock
        language="json"
        title="Resposta quando a chave é inválida (401)"
        code={`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API Key inválida ou inexistente."
  }
}`}
      />
      <CodeBlock
        language="json"
        title="Resposta quando a chave não tem permissão (403)"
        code={`{
  "error": {
    "code": "FORBIDDEN",
    "message": "A tua API Key não tem permissão para este recurso."
  }
}`}
      />

      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Revogar uma chave</h2>
      <p className="text-gray-400 text-sm">
        Podes revogar uma chave a qualquer momento em <span className="text-white font-medium">Definições → API Keys</span>.
        Após revogação, todos os pedidos que usem essa chave receberão um erro <InlineCode>401</InlineCode> imediatamente.
      </p>
    </div>
  );
}
