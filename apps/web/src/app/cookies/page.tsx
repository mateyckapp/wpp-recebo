import Link from 'next/link';

export const metadata = { title: 'PolÃ­tica de Cookies â€” Wpp Recebo' };

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
          <span className="text-xs text-gray-500">Ãšltima atualizaÃ§Ã£o: 23 de maio de 2026</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">PolÃ­tica de Cookies</h1>
        <p className="text-gray-400 mb-10">
          Esta PolÃ­tica explica o que sÃ£o cookies, como os utilizamos e quais sÃ£o as tuas opÃ§Ãµes.
          Ã‰ aplicÃ¡vel ao website <strong>wpprecebo.com</strong> e Ã  plataforma em subdomÃ­nios
          (ex.: <code className="text-brand-400">nome.wpprecebo.com</code>).
        </p>

        <Section title="1. O que sÃ£o Cookies?">
          <p>
            Cookies sÃ£o pequenos ficheiros de texto que os websites guardam no teu dispositivo quando os visitas.
            SÃ£o amplamente utilizados para fazer os websites funcionar, melhorar a experiÃªncia de utilizaÃ§Ã£o
            e fornecer informaÃ§Ãµes ao proprietÃ¡rio do site.
          </p>
        </Section>

        <Section title="2. Cookies que Utilizamos">
          <p>Utilizamos trÃªs categorias de cookies:</p>

          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/20">
                  Essenciais
                </span>
                <span className="text-xs text-gray-500">Sempre ativos Â· NÃ£o requerem consentimento</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                NecessÃ¡rios para o funcionamento bÃ¡sico da plataforma. Sem eles, nÃ£o seria possÃ­vel autenticar
                a sessÃ£o nem manter a seguranÃ§a da conta.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Finalidade</th>
                    <th>DuraÃ§Ã£o</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>refresh_token</code></td>
                    <td>AutenticaÃ§Ã£o â€” mantÃ©m a sessÃ£o ativa</td>
                    <td>7 dias</td>
                  </tr>
                  <tr>
                    <td><code>admin_token</code></td>
                    <td>AutenticaÃ§Ã£o do painel administrativo interno</td>
                    <td>SessÃ£o</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  Funcionais
                </span>
                <span className="text-xs text-gray-500">Ativos por padrÃ£o Â· Melhoram a experiÃªncia</span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Guardam as tuas preferÃªncias dentro da plataforma para que nÃ£o tenhas de as configurar de cada vez.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Finalidade</th>
                    <th>DuraÃ§Ã£o</th>
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
                  AnalÃ­ticos
                </span>
                <span className="text-xs text-gray-500">Requerem consentimento</span>
              </div>
              <p className="text-sm text-gray-400">
                De momento, <strong className="text-gray-300">nÃ£o utilizamos cookies analÃ­ticos de terceiros</strong> (ex.: Google Analytics).
                Utilizamos apenas mÃ©tricas de servidor agregadas e anÃ³nimas para perceber a utilizaÃ§Ã£o do produto.
                Se introduzirmos analytics no futuro, atualizaremos esta polÃ­tica e pediremos o teu consentimento.
              </p>
            </div>
          </div>
        </Section>

        <Section title="3. Cookies de Terceiros">
          <p>
            A plataforma integra serviÃ§os de terceiros que podem definir os seus prÃ³prios cookies:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> â€” quando acedes ao portal de faturaÃ§Ã£o, a Stripe pode definir cookies
              para gestÃ£o de sessÃ£o de pagamento e prevenÃ§Ã£o de fraude.
              Ver:{' '}
              <a href="https://stripe.com/privacy" className="text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">
                stripe.com/privacy
              </a>
            </li>
          </ul>
          <p>
            NÃ£o temos controlo sobre os cookies de terceiros. Consulta as respetivas polÃ­ticas de privacidade para mais informaÃ§Ãµes.
          </p>
        </Section>

        <Section title="4. Como Gerir os Cookies">
          <p>Tens vÃ¡rias formas de controlar os cookies:</p>
          <ul>
            <li>
              <strong>DefiniÃ§Ãµes do browser:</strong> A maioria dos browsers permite ver, bloquear e eliminar cookies
              atravÃ©s das definiÃ§Ãµes. Nota que bloquear cookies essenciais pode impedir o funcionamento da plataforma.
            </li>
            <li>
              <strong>Modo privado/incÃ³gnito:</strong> Os cookies nÃ£o sÃ£o guardados apÃ³s o fecho da janela.
            </li>
            <li>
              <strong>Eliminar dados do site:</strong> Podes eliminar todos os cookies do Wpp Recebo
              atravÃ©s das definiÃ§Ãµes do browser (DefiniÃ§Ãµes â†’ Privacidade â†’ Limpar dados de navegaÃ§Ã£o).
            </li>
          </ul>
          <p>
            Para mais informaÃ§Ãµes sobre como gerir cookies em browsers especÃ­ficos:
          </p>
          <ul>
            <li>Chrome: chrome://settings/cookies</li>
            <li>Firefox: about:preferences#privacy</li>
            <li>Safari: PreferÃªncias â†’ Privacidade</li>
            <li>Edge: edge://settings/privacy</li>
          </ul>
        </Section>

        <Section title="5. Base Legal">
          <p>
            Os cookies essenciais sÃ£o tratados com base na execuÃ§Ã£o do contrato (art. 6.Âº, n.Âº 1, al. b) do RGPD)
            e no interesse legÃ­timo de seguranÃ§a. Os cookies analÃ­ticos, quando utilizados, serÃ£o sempre baseados
            no teu consentimento explÃ­cito (art. 6.Âº, n.Âº 1, al. a) do RGPD), em conformidade com a
            Diretiva e-Privacy transposta para o direito portuguÃªs pela Lei n.Âº 41/2004.
          </p>
        </Section>

        <Section title="6. Contacto">
          <p>
            Para questÃµes sobre o uso de cookies, contacta-nos em:{' '}
            <a href="mailto:privacidade@wpprecebo.com" className="text-brand-400 hover:underline">
              privacidade@wpprecebo.com
            </a>
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Termos de ServiÃ§o</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">PolÃ­tica de Privacidade</Link>
          <Link href="/" className="hover:text-white transition-colors">Voltar ao inÃ­cio</Link>
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
