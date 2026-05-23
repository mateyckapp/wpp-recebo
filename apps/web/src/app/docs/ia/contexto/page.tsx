import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { ApiMethod, ParamTable, Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Base de Conhecimento — Wpp Recebo Docs' };

export default function IaContextoPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">IA Personalizada</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Base de Conhecimento</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        A base de conhecimento é o conjunto de informação que a IA usa para responder às perguntas dos clientes.
        Quanto mais completa e organizada for, mais precisas serão as respostas. Podes fornecer contexto
        via API ou gerir diretamente no painel Enterprise.
      </p>

      <Alert type="warning">
        Após cada atualização de contexto, a IA entra no estado <InlineCode>training</InlineCode> por até 30 minutos
        antes de aplicar as mudanças em produção. Evita múltiplas atualizações em sequência rápida.
      </Alert>

      {/* GET CONTEXT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Obter contexto atual</h2>
      <ApiMethod method="GET" path="/ai/context" description="Devolve toda a base de conhecimento configurada" />
      <CodeBlock
        language="json"
        title="Resposta"
        code={`{
  "data": {
    "businessName": "Clínica Saúde Total",
    "description": "Clínica médica em Lisboa especializada em medicina geral, nutrição e fisioterapia.",
    "services": [
      {
        "name": "Consulta de Medicina Geral",
        "price": "45€",
        "duration": "30 min",
        "description": "Consulta presencial com médico de clínica geral"
      },
      {
        "name": "Consulta de Nutrição",
        "price": "55€",
        "duration": "45 min",
        "description": "Avaliação nutricional e plano alimentar personalizado"
      }
    ],
    "workingHours": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-17:00",
      "saturday": "Fechado",
      "sunday": "Fechado"
    },
    "address": "Rua da Saúde, 123, Lisboa",
    "faqs": [
      {
        "question": "Como posso marcar uma consulta?",
        "answer": "Podes marcar pelo WhatsApp, pelo nosso site ou ligando para 210 000 000."
      }
    ],
    "updatedAt": "2026-05-20T14:00:00.000Z"
  }
}`}
      />

      {/* UPDATE CONTEXT */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Atualizar contexto</h2>
      <ApiMethod method="PUT" path="/ai/context" description="Substitui toda a base de conhecimento. Usa PATCH para atualizações parciais." />
      <ParamTable params={[
        { name: 'businessName', type: 'string', required: true, description: 'Nome do negócio' },
        { name: 'description', type: 'string', required: true, description: 'Descrição geral do negócio (máx. 1000 caracteres)' },
        { name: 'services', type: 'Service[]', required: false, description: 'Lista de serviços com nome, preço, duração e descrição' },
        { name: 'workingHours', type: 'object', required: false, description: 'Horário de funcionamento por dia da semana' },
        { name: 'address', type: 'string', required: false, description: 'Morada física do negócio' },
        { name: 'faqs', type: 'FAQ[]', required: false, description: 'Perguntas frequentes com pergunta e resposta' },
        { name: 'additionalInfo', type: 'string', required: false, description: 'Informação adicional em texto livre (máx. 3000 caracteres)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X PUT https://api.wpprecebo.com/v1/ai/context \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "businessName": "Clínica Saúde Total",
    "description": "Clínica médica em Lisboa especializada em medicina geral, nutrição e fisioterapia.",
    "services": [
      {
        "name": "Consulta de Medicina Geral",
        "price": "45€",
        "duration": "30 min",
        "description": "Consulta presencial com médico de clínica geral"
      }
    ],
    "workingHours": {
      "monday": "09:00-18:00",
      "tuesday": "09:00-18:00",
      "wednesday": "09:00-18:00",
      "thursday": "09:00-18:00",
      "friday": "09:00-17:00",
      "saturday": "Fechado",
      "sunday": "Fechado"
    },
    "address": "Rua da Saúde, 123, Lisboa",
    "faqs": [
      {
        "question": "Como posso marcar uma consulta?",
        "answer": "Podes marcar pelo WhatsApp, pelo nosso site ou ligando para 210 000 000."
      }
    ]
  }'`}
      />

      {/* ADD FAQ */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Adicionar FAQ</h2>
      <ApiMethod method="POST" path="/ai/context/faqs" description="Adiciona uma nova pergunta frequente à base de conhecimento" />
      <ParamTable params={[
        { name: 'question', type: 'string', required: true, description: 'A pergunta (ex: Qual é o preço da consulta?)' },
        { name: 'answer', type: 'string', required: true, description: 'A resposta que a IA deve dar (máx. 500 caracteres)' },
      ]} />
      <CodeBlock
        language="bash"
        title="Exemplo"
        code={`curl -X POST https://api.wpprecebo.com/v1/ai/context/faqs \\
  -H "X-API-Key: wpr_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Aceitam convenções?",
    "answer": "Sim, trabalhamos com a maioria das seguradoras. Confirma a tua no nosso site ou pelo WhatsApp."
  }'`}
      />

      {/* DELETE FAQ */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Remover FAQ</h2>
      <ApiMethod method="DELETE" path="/ai/context/faqs/:id" description="Remove uma FAQ da base de conhecimento pelo seu ID" />

      {/* BEST PRACTICES */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Boas práticas</h2>
      <div className="space-y-3">
        {[
          { title: 'Sê específico nos preços', desc: 'Em vez de "preços a partir de 40€", usa "Consulta de Medicina Geral: 45€ | Nutrição: 55€". A IA será mais precisa.' },
          { title: 'Atualiza os horários sazonais', desc: 'Se fechas em agosto ou mudas horários nas férias, atualiza o contexto com antecedência.' },
          { title: 'Usa FAQs para casos edge', desc: 'Adiciona FAQs para perguntas que os clientes fazem frequentemente mas que não estão cobertas pela descrição geral.' },
          { title: 'Evita informação contraditória', desc: 'Se a descrição diz "aberto aos sábados" mas os horários dizem "Fechado", a IA ficará confusa. Mantém consistência.' },
        ].map((tip) => (
          <div key={tip.title} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-sm font-semibold text-white mb-1">{tip.title}</p>
            <p className="text-xs text-gray-400">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
