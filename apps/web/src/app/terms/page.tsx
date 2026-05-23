import Link from 'next/link';

export const metadata = { title: 'Termos de Serviço — Wpp Recebo' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white">
      <header className="border-b border-white/[0.06] py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Wpp Recebo</span>
          </Link>
          <span className="text-xs text-gray-500">Última atualização: 23 de maio de 2026</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Termos de Serviço</h1>
        <p className="text-gray-400 mb-10">
          Ao utilizar o Wpp Recebo, aceitas os presentes Termos de Serviço. Lê-os com atenção.
        </p>

        <Section title="1. Identificação">
          <p>
            O Wpp Recebo é uma plataforma de gestão de atendimento via WhatsApp, operada por <strong>Wpp Recebo Lda.</strong>,
            com sede em Portugal. Para contacto: <a href="mailto:suporte@wpprecebo.com" className="text-brand-400 hover:underline">suporte@wpprecebo.com</a>.
          </p>
        </Section>

        <Section title="2. O Serviço">
          <p>
            O Wpp Recebo disponibiliza uma plataforma SaaS (Software as a Service) que permite às empresas gerir
            conversas WhatsApp, automatizar respostas com inteligência artificial, gerir marcações e enviar
            campanhas aos seus clientes. O acesso é feito mediante subscrição de um plano pago.
          </p>
        </Section>

        <Section title="3. Registo e Conta">
          <ul>
            <li>Deves ter pelo menos 18 anos para criar uma conta.</li>
            <li>É da tua responsabilidade manter as credenciais de acesso em segurança.</li>
            <li>Uma conta corresponde a um negócio (tenant). Cada tenant tem o seu subdomínio isolado.</li>
            <li>Não podes transferir a tua conta a terceiros sem autorização escrita.</li>
            <li>Reservamo-nos o direito de suspender contas que violem estes termos.</li>
          </ul>
        </Section>

        <Section title="4. Planos e Pagamentos">
          <ul>
            <li>Os planos são cobrados mensalmente ou anualmente, conforme a subscrição escolhida.</li>
            <li>Os pagamentos são processados pela Stripe, Inc. Não armazenamos dados de cartão.</li>
            <li>O período de trial gratuito é de 14 dias. Findo o trial, é necessário subscrever um plano pago para continuar.</li>
            <li>As faturas são emitidas automaticamente e enviadas por email.</li>
            <li>O cancelamento pode ser feito a qualquer momento. O acesso mantém-se até ao fim do período já pago.</li>
            <li>Não fazemos reembolsos parciais de períodos já faturados, exceto em casos de falha do serviço.</li>
          </ul>
        </Section>

        <Section title="5. Uso Aceitável">
          <p>Ao utilizar o Wpp Recebo, comprometes-te a:</p>
          <ul>
            <li>Utilizar o serviço apenas para fins legais e legítimos de atendimento ao cliente.</li>
            <li>Respeitar as políticas da API do WhatsApp Business (Meta Platforms, Inc.).</li>
            <li>Não enviar spam, conteúdo enganoso, discriminatório ou ilegal.</li>
            <li>Não tentar aceder a dados de outros tenants ou contornar os mecanismos de segurança.</li>
            <li>Não usar o serviço para atividades que violem a lei portuguesa ou europeia.</li>
            <li>Obter o consentimento dos teus contactos para comunicações via WhatsApp, nos termos do RGPD.</li>
          </ul>
        </Section>

        <Section title="6. Propriedade Intelectual">
          <p>
            Todo o software, design, documentação e materiais do Wpp Recebo são propriedade exclusiva da Wpp Recebo Lda.
            e protegidos por direitos de autor e outras leis de propriedade intelectual.
          </p>
          <p>
            Os dados introduzidos na plataforma (contactos, conversas, conteúdo) são propriedade tua. Concedes-nos
            uma licença limitada para processar esses dados exclusivamente para fins de prestação do serviço.
          </p>
        </Section>

        <Section title="7. Disponibilidade e SLA">
          <p>
            Empenhámo-nos em manter o serviço disponível 99,5% do tempo (excluindo manutenções programadas).
            Não garantimos disponibilidade ininterrupta e não somos responsáveis por falhas decorrentes de
            serviços de terceiros (Meta/WhatsApp, Stripe, Cloudflare).
          </p>
        </Section>

        <Section title="8. Limitação de Responsabilidade">
          <p>
            O Wpp Recebo é fornecido "tal como está". Não somos responsáveis por danos indiretos, lucros cessantes
            ou perda de dados resultantes da utilização ou impossibilidade de utilização do serviço, até ao limite
            do valor pago pelo utilizador nos 3 meses anteriores ao evento.
          </p>
        </Section>

        <Section title="9. Privacidade e Dados">
          <p>
            O tratamento de dados pessoais é regido pela nossa{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Política de Privacidade</Link>,
            em conformidade com o RGPD (Regulamento Geral sobre a Proteção de Dados).
          </p>
        </Section>

        <Section title="10. Alterações aos Termos">
          <p>
            Podemos alterar estes Termos com aviso prévio de 30 dias por email. A continuação da utilização
            do serviço após esse prazo constitui aceitação dos novos termos.
          </p>
        </Section>

        <Section title="11. Rescisão">
          <p>
            Qualquer das partes pode rescindir o contrato. Em caso de violação dos presentes termos,
            podemos suspender ou encerrar a tua conta imediatamente e sem aviso prévio.
          </p>
        </Section>

        <Section title="12. Lei Aplicável e Foro">
          <p>
            Estes Termos são regidos pela lei portuguesa. Qualquer litígio será submetido aos tribunais
            competentes da comarca de Lisboa, com renúncia expressa a qualquer outro foro.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Política de Cookies</Link>
          <Link href="/" className="hover:text-white transition-colors">Voltar ao início</Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
