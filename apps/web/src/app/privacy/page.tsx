import Link from 'next/link';

export const metadata = { title: 'Política de Privacidade — Wpp Recebo' };

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-gray-400 mb-10">
          A Wpp Recebo Lda. respeita a tua privacidade e está comprometida com a proteção dos teus dados pessoais,
          em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento UE 2016/679).
        </p>

        <Section title="1. Responsável pelo Tratamento">
          <p>
            <strong>Wpp Recebo Lda.</strong>, com sede em Portugal.<br />
            Contacto DPO:{' '}
            <a href="mailto:privacidade@wpprecebo.com" className="text-brand-400 hover:underline">
              privacidade@wpprecebo.com
            </a>
          </p>
        </Section>

        <Section title="2. Dados que Recolhemos">
          <p>Recolhemos os seguintes dados pessoais:</p>
          <ul>
            <li><strong>Dados de conta:</strong> nome, endereço de email, nome da empresa, NIF (opcional).</li>
            <li><strong>Dados de faturação:</strong> processados pela Stripe — não armazenamos dados de cartão de crédito.</li>
            <li><strong>Dados de utilização:</strong> logs de acesso, endereço IP, agente do utilizador, funcionalidades usadas.</li>
            <li><strong>Dados de clientes (dos nossos clientes):</strong> contactos, conversas WhatsApp e marcações introduzidos na plataforma. Estes dados são tratados em nome do cliente (subprocessamento).</li>
            <li><strong>Cookies:</strong> conforme descrito na nossa <Link href="/cookies" className="text-brand-400 hover:underline">Política de Cookies</Link>.</li>
          </ul>
        </Section>

        <Section title="3. Finalidades e Base Legal">
          <table>
            <thead>
              <tr>
                <th>Finalidade</th>
                <th>Base Legal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prestação do serviço contratado</td>
                <td>Execução do contrato (art. 6.º, n.º 1, al. b) RGPD)</td>
              </tr>
              <tr>
                <td>Faturação e cumprimento fiscal</td>
                <td>Obrigação legal (art. 6.º, n.º 1, al. c) RGPD)</td>
              </tr>
              <tr>
                <td>Comunicações de serviço (transacionais)</td>
                <td>Execução do contrato</td>
              </tr>
              <tr>
                <td>Melhorias e análise agregada do produto</td>
                <td>Interesse legítimo (art. 6.º, n.º 1, al. f) RGPD)</td>
              </tr>
              <tr>
                <td>Marketing (newsletter, novidades)</td>
                <td>Consentimento (art. 6.º, n.º 1, al. a) RGPD)</td>
              </tr>
              <tr>
                <td>Segurança e prevenção de fraude</td>
                <td>Interesse legítimo</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="4. Subprocessadores">
          <p>Utilizamos os seguintes subprocessadores para prestar o serviço:</p>
          <ul>
            <li><strong>Stripe, Inc.</strong> — processamento de pagamentos (EUA, cláusulas contratuais-tipo)</li>
            <li><strong>Resend Inc.</strong> — envio de emails transacionais (EUA, cláusulas contratuais-tipo)</li>
            <li><strong>Anthropic, PBC</strong> — processamento de IA (EUA, cláusulas contratuais-tipo)</li>
            <li><strong>Cloudflare, Inc.</strong> — CDN e proteção DDoS (EUA, cláusulas contratuais-tipo)</li>
            <li><strong>Hetzner Online GmbH</strong> — infraestrutura de servidores (Alemanha, UE)</li>
            <li><strong>Meta Platforms, Inc.</strong> — API do WhatsApp Business (EUA, cláusulas contratuais-tipo)</li>
          </ul>
          <p>
            Para transferências para fora da UE, aplicamos as Cláusulas Contratuais-Tipo aprovadas pela Comissão Europeia,
            nos termos do art. 46.º do RGPD.
          </p>
        </Section>

        <Section title="5. Prazos de Conservação">
          <ul>
            <li><strong>Dados de conta ativa:</strong> enquanto a conta estiver ativa.</li>
            <li><strong>Após cancelamento:</strong> 30 dias para exportação; depois eliminados dos sistemas principais.</li>
            <li><strong>Dados de faturação:</strong> 10 anos (obrigação legal fiscal).</li>
            <li><strong>Logs de acesso e segurança:</strong> 90 dias.</li>
            <li><strong>Backups encriptados:</strong> até 180 dias após eliminação da conta.</li>
          </ul>
        </Section>

        <Section title="6. Os Teus Direitos (RGPD)">
          <p>Tens os seguintes direitos, que podes exercer através de <a href="mailto:privacidade@wpprecebo.com" className="text-brand-400 hover:underline">privacidade@wpprecebo.com</a>:</p>
          <ul>
            <li><strong>Acesso</strong> — saber que dados temos sobre ti (art. 15.º).</li>
            <li><strong>Retificação</strong> — corrigir dados inexatos (art. 16.º).</li>
            <li><strong>Eliminação</strong> — apagar os teus dados ("direito ao esquecimento", art. 17.º).</li>
            <li><strong>Portabilidade</strong> — receber os teus dados em formato legível por máquina (art. 20.º).</li>
            <li><strong>Oposição</strong> — opor-te ao tratamento baseado em interesse legítimo (art. 21.º).</li>
            <li><strong>Limitação</strong> — restringir o tratamento em determinadas circunstâncias (art. 18.º).</li>
            <li><strong>Retirar o consentimento</strong> — a qualquer momento, sem efeito retroativo.</li>
          </ul>
          <p>
            Tens ainda o direito de apresentar reclamação à autoridade de controlo competente:{' '}
            <strong>CNPD</strong> — Comissão Nacional de Proteção de Dados (
            <a href="https://www.cnpd.pt" className="text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>).
          </p>
          <p>Respondemos a todos os pedidos no prazo de 30 dias (prorrogável em casos complexos).</p>
        </Section>

        <Section title="7. Segurança">
          <p>Aplicamos medidas técnicas e organizacionais adequadas para proteger os teus dados:</p>
          <ul>
            <li>Encriptação em trânsito (TLS 1.3) e em repouso (AES-256).</li>
            <li>Acesso restrito aos dados — apenas colaboradores com necessidade operacional.</li>
            <li>Autenticação de dois fatores obrigatória para o acesso administrativo.</li>
            <li>Backups diários encriptados, armazenados em localização diferente.</li>
            <li>Monitorização contínua e alertas de segurança.</li>
          </ul>
          <p>
            Em caso de violação de dados que afete os teus dados, notificamos a CNPD no prazo de 72 horas
            e os utilizadores afetados sem demora injustificada, nos termos do art. 33.º e 34.º do RGPD.
          </p>
        </Section>

        <Section title="8. Dados de Clientes dos Nossos Clientes">
          <p>
            Quando os nossos clientes introduzem contactos, conversas e marcações na plataforma, atuamos
            como <strong>subprocessador</strong> em nome do cliente (que é o responsável pelo tratamento
            perante os seus próprios clientes finais). O cliente é responsável por:
          </p>
          <ul>
            <li>Obter o consentimento necessário dos seus contactos para comunicações via WhatsApp.</li>
            <li>Respeitar as obrigações de informação (art. 13.º e 14.º do RGPD) perante os seus clientes.</li>
            <li>Assegurar a licitude do tratamento dos dados dos seus clientes finais.</li>
          </ul>
        </Section>

        <Section title="9. Cookies">
          <p>
            Utilizamos cookies essenciais e analíticos. Para mais detalhes, consulta a nossa{' '}
            <Link href="/cookies" className="text-brand-400 hover:underline">Política de Cookies</Link>.
          </p>
        </Section>

        <Section title="10. Alterações a esta Política">
          <p>
            Podemos atualizar esta Política de Privacidade. Notificamos alterações materiais por email
            com pelo menos 30 dias de antecedência. A versão mais recente está sempre disponível nesta página.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Termos de Serviço</Link>
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
      <div className="text-gray-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:text-gray-300 [&_th]:font-medium [&_th]:border-b [&_th]:border-white/[0.08] [&_th]:pb-2 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/[0.04] [&_td]:pr-4">
        {children}
      </div>
    </section>
  );
}
