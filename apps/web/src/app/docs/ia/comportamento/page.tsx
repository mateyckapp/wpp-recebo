import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable, Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Tom e Comportamento — Wpp Recebo Docs' };

export default function IaComportamentoPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">IA Personalizada</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Tom e Comportamento</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Define como a IA comunica — o tom de voz, os limites do que responde, as situações em que escala
        para um agente humano e a mensagem de apresentação inicial. Um comportamento bem configurado
        torna a IA indistinguível de um colaborador treinado.
      </p>

      {/* GET BEHAVIOR */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Obter configuração de comportamento</h2>
      <ApiMethod method="GET" path="/ai/behavior" description="Devolve as definições de tom e comportamento atuais" />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "persona": {
      "name": "Sofia",
      "tone": "friendly",
      "language": "pt",
      "useEmojis": true,
      "maxMessageLength": 300
    },
    "greeting": "Olá! Sou a Sofia, a assistente virtual da Clínica Saúde Total. Como posso ajudar? 😊",
    "fallbackMessage": "Não tenho a certeza como responder a isso. Vou chamar um colega para te ajudar!",
    "outOfScopeMessage": "Essa pergunta está fora da minha área. Podes contactar-nos pelo 210 000 000 para mais ajuda.",
    "escalation": {
      "enabled": true,
      "keywords": ["humano", "atendente", "urgente", "falar com alguém"],
      "escalationMessage": "Vou chamar um colega agora mesmo. Um momento!",
      "assignToQueue": true
    },
    "restrictions": {
      "noMedicalDiagnosis": true,
      "noPriceNegotiation": true,
      "noPersonalDataCollection": false
    },
    "updatedAt": "2026-05-18T10:00:00.000Z"
  }
}`}
      />

      {/* UPDATE BEHAVIOR */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Atualizar comportamento</h2>
      <ApiMethod method="PATCH" path="/ai/behavior" description="Atualiza as definições de tom e comportamento. Apenas os campos enviados são alterados." />
      <ParamTable params={[
        { name: 'persona.name', type: 'string', required: false, description: 'Nome da assistente virtual (ex: Sofia, João, Assistente)' },
        { name: 'persona.tone', type: 'string', required: false, description: 'Tom de voz: friendly (amigável), formal, casual, professional' },
        { name: 'persona.useEmojis', type: 'boolean', required: false, description: 'Permite uso de emojis nas respostas' },
        { name: 'persona.maxMessageLength', type: 'number', required: false, description: 'Comprimento máximo de cada resposta em caracteres (default: 300)' },
        { name: 'greeting', type: 'string', required: false, description: 'Mensagem de apresentação enviada no primeiro contacto' },
        { name: 'fallbackMessage', type: 'string', required: false, description: 'Mensagem quando a IA não sabe responder' },
        { name: 'escalation.keywords', type: 'string[]', required: false, description: 'Palavras que ativam a escalada para um agente humano' },
        { name: 'escalation.escalationMessage', type: 'string', required: false, description: 'Mensagem enviada ao cliente quando é escalado' },
        { name: 'restrictions', type: 'object', required: false, description: 'Restrições de comportamento (ver tabela abaixo)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo — configurar tom formal"
        code={`curl -X PATCH https://api.wpprecebo.com/v1/ai/behavior \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "persona": {
      "name": "Assistente Saúde Total",
      "tone": "professional",
      "useEmojis": false,
      "maxMessageLength": 400
    },
    "greeting": "Bom dia! Sou o assistente virtual da Clínica Saúde Total. Em que posso ser útil?",
    "escalation": {
      "keywords": ["urgente", "emergência", "falar com médico"],
      "escalationMessage": "Vou encaminhar o seu contacto para um colega imediatamente."
    }
  }'`}
      />

      {/* TONES */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Tons disponíveis</h2>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Tom</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Ideal para</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Exemplo de resposta</th>
            </tr>
          </thead>
          <tbody>
            {[
              { tone: 'friendly', ideal: 'Comércio local, restaurantes, salões', example: '"Olá! Claro, temos mesa disponível às 20h! 😊"' },
              { tone: 'professional', ideal: 'Clínicas, escritórios, consultórios', example: '"Confirmamos disponibilidade para as 20h00. Aguardamos a sua presença."' },
              { tone: 'formal', ideal: 'Serviços financeiros, jurídicos', example: '"A marcação foi confirmada para as 20h00 de hoje."' },
              { tone: 'casual', ideal: 'Ginásios, lojas de desporto, startups', example: '"Fixe! Tens mesa livre às 20h, tá ótimo!"' },
            ].map((row, i) => (
              <tr key={row.tone} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.tone}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.ideal}</td>
                <td className="px-4 py-3 text-xs text-gray-500 italic">{row.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RESTRICTIONS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Restrições de comportamento</h2>
      <p className="text-gray-400 text-sm mb-3">
        As restrições definem o que a IA <strong className="text-white">não</strong> deve fazer,
        protegendo o teu negócio de respostas inadequadas.
      </p>
      <div className="rounded-xl border border-white/[0.08] overflow-hidden my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Restrição</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {[
              { field: 'noMedicalDiagnosis', desc: 'Impede a IA de dar diagnósticos ou conselhos médicos. Recomendado para clínicas.' },
              { field: 'noPriceNegotiation', desc: 'A IA não negocia preços — redireciona para um agente.' },
              { field: 'noPersonalDataCollection', desc: 'A IA não solicita dados pessoais (NIF, número de cartão, etc.).' },
              { field: 'noCompetitorMentions', desc: 'A IA evita mencionar ou comparar com concorrentes.' },
              { field: 'noRefunds', desc: 'A IA não processa pedidos de reembolso — escala sempre para um agente.' },
            ].map((row, i) => (
              <tr key={row.field} className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-400">{row.field}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TEST */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Testar a IA</h2>
      <ApiMethod method="POST" path="/ai/test" description="Envia uma mensagem de teste à IA sem afectar conversas reais" />
      <ParamTable params={[
        { name: 'message', type: 'string', required: true, description: 'Mensagem a enviar à IA (simula uma pergunta de cliente)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/ai/test \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Qual é o preço de uma consulta de nutrição?"}'`}
      />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "response": "A consulta de Nutrição tem um custo de 55€ e dura 45 minutos. Queres agendar? 😊",
    "escalated": false,
    "tokensUsed": 42,
    "processingMs": 380
  }
}`}
      />

      <Alert type="info">
        O endpoint <InlineCode>/ai/test</InlineCode> não envia mensagens reais nem regista a interação.
        Usa-o sempre que fizeres alterações de contexto ou comportamento para validar as respostas antes de ativar em produção.
      </Alert>
    </div>
  );
}
