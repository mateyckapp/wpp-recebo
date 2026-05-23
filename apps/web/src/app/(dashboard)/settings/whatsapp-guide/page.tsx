'use client';

import Link from 'next/link';

function StepNumber({ n }: { n: number }) {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-brand-600/30">
      {n}
    </div>
  );
}

function CodeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-black/40 border border-white/[0.08] px-4 py-3 font-mono text-xs text-gray-300 leading-relaxed">
      {children}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-brand-600/10 border border-brand-500/20 px-4 py-3 text-xs text-brand-300 leading-relaxed">
      {children}
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300 leading-relaxed">
      {children}
    </div>
  );
}

function ScreenLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/[0.1] text-gray-300 text-xs px-2 py-0.5 rounded font-medium">
      {children}
    </span>
  );
}

export default function WhatsappGuidePage() {
  return (
    <div className="overflow-y-auto flex-1">
      <div className="max-w-2xl mx-auto pb-16">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Voltar Ã s DefiniÃ§Ãµes
          </Link>
          <h1 className="text-2xl font-bold text-white">Como configurar o WhatsApp Business API</h1>
          <p className="text-gray-400 mt-2 leading-relaxed">
            Guia passo a passo para obteres as credenciais da API oficial da Meta e ligares o teu nÃºmero ao Wpp-Recebo.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tempo estimado: 10â€“15 minutos
          </div>
        </div>

        {/* Intro */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
          <h2 className="font-semibold text-gray-100 mb-2">O que vais precisar</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            {[
              'Uma conta no Facebook/Meta',
              'Acesso ao Meta Business Suite (gratuito)',
              'Um nÃºmero de telefone para o WhatsApp Business (pode ser novo ou existente)',
              'Cerca de 10â€“15 minutos de disponibilidade',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <svg className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">

          {/* Passo 1 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={1} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Acede ao Meta Developer Portal</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Abre o browser e vai a <span className="font-mono text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded">developers.facebook.com</span>. Inicia sessÃ£o com a tua conta do Facebook.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  No menu superior, clica em <ScreenLabel>Os meus apps</ScreenLabel> e depois em <ScreenLabel>Criar app</ScreenLabel>. Se jÃ¡ tens uma app criada, seleciona-a na lista.
                </p>
                <InfoBox>
                  Se ainda nÃ£o tens nenhuma app, escolhe o tipo <strong>"Business"</strong> quando te for perguntado. Liga a app ao teu Meta Business Suite quando pedido.
                </InfoBox>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={2} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Adiciona o produto WhatsApp Ã  app</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Dentro da tua app, no painel lateral esquerdo, procura a secÃ§Ã£o <ScreenLabel>Adicionar produto</ScreenLabel> ou <ScreenLabel>Products</ScreenLabel>.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Encontra o produto <strong className="text-gray-200">WhatsApp</strong> na lista e clica em <ScreenLabel>Configurar</ScreenLabel>. O WhatsApp vai aparecer no menu lateral.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Clica em <ScreenLabel>WhatsApp</ScreenLabel> â†’ <ScreenLabel>ConfiguraÃ§Ã£o da API</ScreenLabel> no menu lateral. Esta Ã© a pÃ¡gina onde vais encontrar todas as credenciais.
                </p>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={3} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Encontra o WhatsApp Business Account ID</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Na pÃ¡gina <ScreenLabel>ConfiguraÃ§Ã£o da API</ScreenLabel>, olha para o <strong className="text-gray-200">topo da pÃ¡gina</strong>. VÃªs uma caixa com o tÃ­tulo <strong className="text-gray-200">"WhatsApp Business Account"</strong> ou <strong className="text-gray-200">"Conta do WhatsApp Business"</strong>.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  O ID Ã© o nÃºmero longo que aparece logo abaixo do nome da conta. Copia esse nÃºmero.
                </p>
                <CodeBox>
                  <span className="text-gray-500">WhatsApp Business Account</span>{'\n'}
                  <span className="text-gray-500">Nome da conta: </span><span className="text-gray-200">O Meu NegÃ³cio</span>{'\n'}
                  <span className="text-gray-500">ID: </span><span className="text-brand-400">1685824006177308</span>  <span className="text-gray-600">â† copia este nÃºmero</span>
                </CodeBox>
                <InfoBox>
                  Este ID comeÃ§a normalmente com um nÃºmero de 16 dÃ­gitos. Cola-o no campo <strong>Business Account ID</strong> nas DefiniÃ§Ãµes.
                </InfoBox>
              </div>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={4} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Encontra o Phone Number ID</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Na mesma pÃ¡gina <ScreenLabel>ConfiguraÃ§Ã£o da API</ScreenLabel>, desce um pouco. VÃªs uma secÃ§Ã£o chamada <strong className="text-gray-200">"Enviar e receber mensagens"</strong> ou <strong className="text-gray-200">"Send and receive messages"</strong>.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  HÃ¡ uma caixa de seleÃ§Ã£o com o nÃºmero de telefone. Por baixo do nÃºmero, aparece o texto <strong className="text-gray-200">"Phone number ID"</strong> seguido de um nÃºmero longo. Copia esse nÃºmero.
                </p>
                <CodeBox>
                  <span className="text-gray-500">De:</span>{'\n'}
                  <span className="text-gray-200">+351 912 345 678</span>{'\n'}
                  <span className="text-gray-500">Phone number ID: </span><span className="text-brand-400">1109080812294064</span>  <span className="text-gray-600">â† copia este nÃºmero</span>
                </CodeBox>
                <InfoBox>
                  Se tens vÃ¡rios nÃºmeros registados, seleciona o correto no menu de seleÃ§Ã£o antes de copiar o ID.
                </InfoBox>
              </div>
            </div>
          </div>

          {/* Passo 5 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={5} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Cria o Access Token permanente</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  O token permanente Ã© criado atravÃ©s de um <strong className="text-gray-200">Utilizador do Sistema</strong> no Meta Business Suite â€” nÃ£o expira e nÃ£o precisas de o renovar.
                </p>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      step: '1',
                      text: <>Vai a <span className="font-mono text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded text-xs">business.facebook.com</span> e inicia sessÃ£o.</>,
                    },
                    {
                      step: '2',
                      text: <>No menu lateral, clica em <ScreenLabel>DefiniÃ§Ãµes</ScreenLabel> â†’ <ScreenLabel>Utilizadores do sistema</ScreenLabel>.</>,
                    },
                    {
                      step: '3',
                      text: <>Clica em <ScreenLabel>Adicionar</ScreenLabel>. DÃ¡ um nome (ex: <em className="text-gray-300">"Wpp-Recebo Bot"</em>) e define a funÃ§Ã£o como <strong className="text-gray-200">Administrador</strong>.</>,
                    },
                    {
                      step: '4',
                      text: <>Com o utilizador criado, clica em <ScreenLabel>Gerar novo token</ScreenLabel>. Seleciona a tua app no menu pendente.</>,
                    },
                    {
                      step: '5',
                      text: <>Na lista de permissÃµes, ativa <span className="font-mono text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded text-xs">whatsapp_business_messaging</span> e <span className="font-mono text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded text-xs">whatsapp_business_management</span>. Clica em <ScreenLabel>Gerar token</ScreenLabel>.</>,
                    },
                    {
                      step: '6',
                      text: <>Copia o token gerado â€” comeÃ§a por <span className="font-mono text-brand-400 text-xs">EAAck...</span>. Guarda-o num local seguro, pois nÃ£o serÃ¡ mostrado novamente.</>,
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.12] text-gray-400 text-xs flex items-center justify-center font-semibold mt-0.5">
                        {s.step}
                      </span>
                      <p className="text-sm text-gray-400 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>

                <CodeBox>
                  <span className="text-gray-500">Access Token permanente:</span>{'\n'}
                  <span className="text-brand-400">EAAckgxCvWSwBRjx...</span><span className="text-gray-600">AgTo</span>{'  '}<span className="text-gray-600">â† token longo, comeÃ§a por EAAck</span>
                </CodeBox>

                <InfoBox>
                  ðŸ’¡ Este token <strong>nÃ£o expira</strong> enquanto nÃ£o o revogares manualmente. Ã‰ o mÃ©todo recomendado para usar em produÃ§Ã£o.
                </InfoBox>
              </div>
            </div>
          </div>

          {/* Passo 6 */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <StepNumber n={6} />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-100 text-lg">Preenche as credenciais no Wpp-Recebo</h2>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Volta Ã s <Link href="/settings" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">DefiniÃ§Ãµes</Link> e clica em <strong className="text-gray-200">"Configurar"</strong> na secÃ§Ã£o WhatsApp Business.
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  Cola os trÃªs valores que copiaste:
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { label: 'Phone Number ID', hint: 'O nÃºmero de 16 dÃ­gitos do passo 4' },
                    { label: 'Business Account ID', hint: 'O nÃºmero de 16 dÃ­gitos do passo 3' },
                    { label: 'Access Token', hint: 'O token longo que comeÃ§a por EAAck...' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                      <span className="text-gray-200 font-medium w-40">{f.label}</span>
                      <span className="text-gray-500">{f.hint}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                  Clica em <strong className="text-gray-200">"Guardar"</strong> e depois em <strong className="text-gray-200">"Testar ligaÃ§Ã£o"</strong> para confirmar que tudo estÃ¡ correto.
                </p>
                <InfoBox>
                  Se o teste devolver âœ“ com o nÃºmero de telefone, estÃ¡ tudo configurado e o Wpp-Recebo jÃ¡ consegue enviar e receber mensagens!
                </InfoBox>
              </div>
            </div>
          </div>

          {/* Custos da API */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="font-semibold text-gray-100 mb-1">Quanto custa a API do WhatsApp?</h2>
            <p className="text-sm text-gray-500 mb-4">Valores aproximados para referÃªncia â€” consulta sempre o site oficial para tarifas atualizadas.</p>

            <WarningBox>
              âš ï¸ A Meta altera periodicamente os preÃ§os da API. Os valores abaixo sÃ£o <strong>aproximados e baseados nas tarifas europeias</strong>. Antes de tomar decisÃµes, confirma os preÃ§os atuais em{' '}
              <span className="font-mono">developers.facebook.com/docs/whatsapp/pricing</span>
            </WarningBox>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Como funciona a faturaÃ§Ã£o</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                A Meta cobra por <strong className="text-gray-200">conversa</strong>, nÃ£o por mensagem individual. Uma conversa comeÃ§a quando envias ou recebes a primeira mensagem e dura <strong className="text-gray-200">24 horas</strong>. Todas as mensagens trocadas nesse perÃ­odo contam como uma sÃ³ conversa.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="grid grid-cols-3 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/[0.06]">
                <span>Tipo de conversa</span>
                <span>DescriÃ§Ã£o</span>
                <span className="text-right">Custo aprox. (Europa)</span>
              </div>
              {[
                {
                  type: 'ServiÃ§o',
                  desc: 'Cliente envia mensagem primeiro â€” tu respondes',
                  cost: 'Gratuito',
                  highlight: true,
                },
                {
                  type: 'Utilidade',
                  desc: 'ConfirmaÃ§Ãµes, atualizaÃ§Ãµes de encomenda, etc.',
                  cost: '~â‚¬0,016',
                  highlight: false,
                },
                {
                  type: 'Marketing',
                  desc: 'PromoÃ§Ãµes, ofertas, campanhas',
                  cost: '~â‚¬0,084',
                  highlight: false,
                },
                {
                  type: 'AutenticaÃ§Ã£o',
                  desc: 'CÃ³digos OTP e verificaÃ§Ãµes',
                  cost: '~â‚¬0,018',
                  highlight: false,
                },
              ].map((row) => (
                <div key={row.type} className="grid grid-cols-3 px-4 py-3 text-xs border-b border-white/[0.04] last:border-0">
                  <span className="font-medium text-gray-200">{row.type}</span>
                  <span className="text-gray-500 pr-4">{row.desc}</span>
                  <span className={`text-right font-semibold ${row.highlight ? 'text-green-400' : 'text-gray-300'}`}>
                    {row.cost}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimativa para uma PME portuguesa</p>
              <div className="space-y-2">
                {[
                  { label: 'NegÃ³cio pequeno (atÃ© 200 conversas/mÃªs)', estimate: '~â‚¬0â€“â‚¬5/mÃªs', color: 'text-green-400' },
                  { label: 'NegÃ³cio mÃ©dio (atÃ© 1 000 conversas/mÃªs)', estimate: '~â‚¬5â€“â‚¬25/mÃªs', color: 'text-green-400' },
                  { label: 'NegÃ³cio ativo (atÃ© 5 000 conversas/mÃªs)', estimate: '~â‚¬25â€“â‚¬130/mÃªs', color: 'text-amber-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-gray-400">{row.label}</span>
                    <span className={`font-semibold ${row.color}`}>{row.estimate}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                * Estimativas baseadas principalmente em conversas de serviÃ§o (gratuitas). Se fizeres campanhas de marketing, o custo aumenta conforme o volume.
              </p>
            </div>

            <InfoBox>
              ðŸ’¡ A maioria das PMEs fica dentro do tier gratuito ou paga poucos euros por mÃªs Ã  Meta â€” o custo real da plataforma Ã© a subscriÃ§Ã£o do Wpp-Recebo.
            </InfoBox>
          </div>

          {/* Ajuda */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="font-semibold text-gray-100 mb-3">Algo nÃ£o funcionou?</h2>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0">â†’</span>
                <p><strong className="text-gray-300">Erro de autenticaÃ§Ã£o:</strong> O Access Token expirou. Gera um novo token no Meta Developer Portal e atualiza nas DefiniÃ§Ãµes.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0">â†’</span>
                <p><strong className="text-gray-300">NÃºmero nÃ£o verificado:</strong> O nÃºmero de telefone ainda nÃ£o foi verificado pela Meta. Completa o processo de verificaÃ§Ã£o no Developer Portal.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0">â†’</span>
                <p><strong className="text-gray-300">IDs incorretos:</strong> Confirma que copiaste o Phone Number ID e o Business Account ID da secÃ§Ã£o correta (ConfiguraÃ§Ã£o da API â†’ WhatsApp).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 flex-shrink-0">â†’</span>
                <p><strong className="text-gray-300">Ainda com problemas?</strong> Contacta o suporte em <a href="mailto:suporte@wpprecebo.com" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">suporte@wpprecebo.com</a>.</p>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="flex justify-center pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/25"
            >
              Ir configurar agora
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
