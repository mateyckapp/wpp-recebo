import Link from 'next/link';

export const metadata = { title: 'Política de Reembolso — WppRecebo' };

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#060609] text-white">
      <header className="border-b border-white/[0.06] py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="h-7 w-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">WppRecebo</span>
          </Link>
          <span className="text-xs text-gray-500">Última atualização: 27 de maio de 2026</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Política de Reembolso</h1>
        <p className="text-gray-400 mb-10">
          A nossa política de reembolso define claramente as condições em que são processadas devoluções de
          pagamentos. Leia com atenção antes de contratar o serviço.
        </p>

        <Section title="1. Taxa de Configuração Inicial">
          <p>
            A taxa de configuração inicial, cobrada no ato de contratação, cobre o trabalho de instalação,
            configuração do sistema, criação do site profissional e integração com o WhatsApp Business. Esta
            taxa <strong>não é reembolsável</strong> após o início dos trabalhos de configuração.
          </p>
          <p>
            Caso o cliente cancele o contrato <strong>antes</strong> do início dos trabalhos de configuração
            (no mesmo dia da contratação), será emitido um reembolso integral da taxa de configuração no prazo
            de 5 a 10 dias úteis.
          </p>
        </Section>

        <Section title="2. Subscrição Mensal — Período de Trial">
          <p>
            Todos os planos incluem <strong>30 dias de trial gratuito</strong>. Durante este período, o cliente
            pode cancelar o serviço sem qualquer custo ou penalização, não sendo cobrada qualquer quantia relativa
            à subscrição mensal.
          </p>
        </Section>

        <Section title="3. Subscrição Mensal — Após Início de Faturação">
          <p>
            Após o início do período de faturação pago, a subscrição mensal <strong>não é reembolsável</strong> de
            forma parcial. O cliente mantém acesso ao serviço até ao final do período já pago.
          </p>
          <p>
            Exceções em que se aplicam reembolsos totais ou parciais da subscrição mensal:
          </p>
          <ul>
            <li>
              <strong>Falha prolongada do serviço:</strong> indisponibilidade superior a 72 horas consecutivas
              por causa imputável ao WppRecebo (excluindo falhas da Meta/WhatsApp, Cloudflare ou outros terceiros).
              Neste caso, será concedido crédito proporcional ao período de inatividade.
            </li>
            <li>
              <strong>Cobrança duplicada ou incorreta:</strong> em caso de erro de faturação, o valor cobrado
              indevidamente é reembolsado integralmente no prazo de 5 dias úteis.
            </li>
          </ul>
        </Section>

        <Section title="4. Cancelamento">
          <p>
            O cliente pode cancelar a subscrição a qualquer momento:
          </p>
          <ul>
            <li>Através do painel de gestão, na secção <strong>Definições → Faturação</strong>.</li>
            <li>
              Por email para{' '}
              <a href="mailto:contacto@wpprecebo.pt" className="text-brand-400 hover:underline">
                contacto@wpprecebo.pt
              </a>{' '}
              com o assunto "Cancelamento de subscrição".
            </li>
          </ul>
          <p>
            O cancelamento é eficaz no final do período de faturação em curso. O acesso ao serviço e aos dados
            mantém-se até essa data. Após o cancelamento, os dados ficam disponíveis para exportação durante
            30 dias, sendo depois eliminados dos nossos sistemas.
          </p>
        </Section>

        <Section title="5. Como Solicitar um Reembolso">
          <p>Para solicitar um reembolso nos casos elegíveis:</p>
          <ul>
            <li>
              Envie um email para{' '}
              <a href="mailto:contacto@wpprecebo.pt" className="text-brand-400 hover:underline">
                contacto@wpprecebo.pt
              </a>{' '}
              com o assunto <strong>"Pedido de Reembolso"</strong>.
            </li>
            <li>Inclua o nome da empresa, email da conta e o motivo do pedido.</li>
            <li>Analisamos todos os pedidos no prazo de <strong>3 dias úteis</strong>.</li>
            <li>
              Os reembolsos aprovados são processados no prazo de <strong>5 a 10 dias úteis</strong>, para o
              mesmo meio de pagamento utilizado na compra.
            </li>
          </ul>
        </Section>

        <Section title="6. Direitos do Consumidor">
          <p>
            Sem prejuízo do disposto nesta política, são sempre garantidos os direitos legais do consumidor
            previstos na legislação portuguesa e europeia, incluindo o direito de resolução do contrato nos
            14 dias seguintes à sua celebração (direito de arrependimento), nos termos do Decreto-Lei n.º
            24/2014, de 14 de fevereiro.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p>
            Para qualquer questão relacionada com faturação ou reembolsos, contacte-nos:
          </p>
          <div className="mt-2 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1">
            <p><strong className="text-white">WppRecebo</strong> — Tondela, Portugal</p>
            <p>
              Email:{' '}
              <a href="mailto:contacto@wpprecebo.pt" className="text-brand-400 hover:underline">
                contacto@wpprecebo.pt
              </a>
            </p>
            <p>Resposta em menos de 2 horas nos dias úteis.</p>
          </div>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Termos de Serviço</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link>
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
