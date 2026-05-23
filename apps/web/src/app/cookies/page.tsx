import Link from 'next/link';

export const metadata = { title: 'Política de Cookies — Wpp Recebo' };

export default function CookiesPage() {
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
        <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
        <p className="text-gray-400 mb-10">
          Esta Política explica o que são cookies, como os utilizamos e quais são as tuas opções.
          É aplicável ao website <strong>wpprecebo.com</strong> e à plataforma em subdomínios
          (ex.: <code className="text-brand-400">nome.wpprecebo.com</code>).
        </p>

        <Section title="1. O que são Cookies?">
          <p>
            Cookies são pequenos ficheiros de texto que os websites guardam no teu dispositivo quando os visitas.
            São amplamente utilizados para fazer os websites funcionar, melhorar a experiência de utilização
            e fornecer informações ao proprietário do site.
          </p>
        </Section>

        <Section title="2. Cookies que Utilizamos">
          <p>Utilizamos três categorias de cookies:</p>

          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                  Essenciais
                </span>
                <span className="text-xs text-gray-500">Sempre ativos · Não requerem consentimento</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Necessários para o funcionamento básico da plataforma. Sem eles, não seria possível autenticar
                a sessão nem manter a segurança da conta.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Finalidade</th>
                    <th>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>refresh_token</code></td>
                    <td>Autenticação — mantém a sessão ativa</td>
                    <td>7 dias</td>
                  </tr>
                  <tr>
                    <td><code>admin_token</code></td>
                    <td>Autenticação do painel administrativo interno</td>
                    <td>Sessão</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  Funcionais
                </span>
                <span className="text-xs text-gray-500">Ativos por padrão · Melhoram a experiência</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Guardam as tuas preferências dentro da plataforma para que não tenhas de as configurar de cada vez.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Finalidade</th>
                    <th>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>onboarding_dismissed</code></td>
                    <td>Lembra se descartaste o checklist de primeiros passos (localStorage)</td>
                    <td>Persistente</td>
                  </tr>
                  <tr>
                    <td><code>sidebar_collapsed</code></td>
                    <td>Estado da barra lateral (localStorage)</td>
                    <td>Persistente</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Analíticos
                </span>
                <span className="text-xs text-gray-500">Requerem consentimento</span>
              </div>
              <p className="text-sm text-gray-400">
                De momento, <strong className="text-gray-300">não utilizamos cookies analíticos de terceiros</strong> (ex.: Google Analytics).
                Utilizamos apenas métricas de servidor agregadas e anónimas para perceber a utilização do produto.
                Se introduzirmos analytics no futuro, atualizaremos esta política e pediremos o teu consentimento.
              </p>
            </div>
          </div>
        </Section>

        <Section title="3. Cookies de Terceiros">
          <p>
            A plataforma integra serviços de terceiros que podem definir os seus próprios cookies:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — quando acedes ao portal de faturação, a Stripe pode definir cookies
              para gestão de sessão de pagamento e prevenção de fraude.
              Ver:{' '}
              <a href="https://stripe.com/privacy" className="text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">
                stripe.com/privacy
              </a>
            </li>
          </ul>
          <p>
            Não temos controlo sobre os cookies de terceiros. Consulta as respetivas políticas de privacidade para mais informações.
          </p>
        </Section>

        <Section title="4. Como Gerir os Cookies">
          <p>Tens várias formas de controlar os cookies:</p>
          <ul>
            <li>
              <strong>Definições do browser:</strong> A maioria dos browsers permite ver, bloquear e eliminar cookies
              através das definições. Nota que bloquear cookies essenciais pode impedir o funcionamento da plataforma.
            </li>
            <li>
              <strong>Modo privado/incógnito:</strong> Os cookies não são guardados após o fecho da janela.
            </li>
            <li>
              <strong>Eliminar dados do site:</strong> Podes eliminar todos os cookies do Wpp Recebo
              através das definições do browser (Definições → Privacidade → Limpar dados de navegação).
            </li>
          </ul>
          <p>
            Para mais informações sobre como gerir cookies em browsers específicos:
          </p>
          <ul>
            <li>Chrome: chrome://settings/cookies</li>
            <li>Firefox: about:preferences#privacy</li>
            <li>Safari: Preferências → Privacidade</li>
            <li>Edge: edge://settings/privacy</li>
          </ul>
        </Section>

        <Section title="5. Base Legal">
          <p>
            Os cookies essenciais são tratados com base na execução do contrato (art. 6.º, n.º 1, al. b) do RGPD)
            e no interesse legítimo de segurança. Os cookies analíticos, quando utilizados, serão sempre baseados
            no teu consentimento explícito (art. 6.º, n.º 1, al. a) do RGPD), em conformidade com a
            Diretiva e-Privacy transposta para o direito português pela Lei n.º 41/2004.
          </p>
        </Section>

        <Section title="6. Contacto">
          <p>
            Para questões sobre o uso de cookies, contacta-nos em:{' '}
            <a href="mailto:privacidade@wpprecebo.com" className="text-brand-400 hover:underline">
              privacidade@wpprecebo.com
            </a>
          </p>
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
      <div className="text-gray-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_code]:text-brand-400 [&_code]:font-mono [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:text-gray-300 [&_th]:font-medium [&_th]:border-b [&_th]:border-white/[0.08] [&_th]:pb-2 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/[0.04] [&_td]:pr-4 [&_td]:font-mono [&_td:not(:first-child)]:font-sans">
        {children}
      </div>
    </section>
  );
}
