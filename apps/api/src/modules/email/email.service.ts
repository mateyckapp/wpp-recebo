import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const FROM = 'WppRecebo <noreply@wpprecebo.com>';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    const key = this.config.get<string>('RESEND_API_KEY') ?? '';
    const isPlaceholder = !key || key === 're_...' || key.length < 10;
    this.resend = isPlaceholder ? null : new Resend(key);
    this.appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';

    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY não configurado — emails simulados no log');
    }
  }

  // ── Send helpers ──────────────────────────────────────────────────────────

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[EMAIL SIMULADO] Para: ${to} | Assunto: ${subject}`);
      return;
    }
    try {
      const { error } = await this.resend.emails.send({ from: FROM, to, subject, html });
      if (error) {
        this.logger.error(`Erro Resend ao enviar para ${to}: ${JSON.stringify(error)}`);
      } else {
        this.logger.log(`Email enviado para ${to} | ${subject}`);
      }
    } catch (err) {
      this.logger.error(`Erro ao enviar email para ${to}: ${String(err)}`);
    }
  }

  // ── Password reset ────────────────────────────────────────────────────────

  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const url = `${this.appUrl}/reset-password?token=${resetToken}`;
    await this.send(to, 'Recuperação de password — WppRecebo', this.templatePasswordReset(name, url));
  }

  // ── Email verification ────────────────────────────────────────────────────

  async sendEmailVerification(to: string, name: string, token: string, tenantSlug: string): Promise<void> {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.com';
    const url = this.appUrl.includes('localhost')
      ? `http://${tenantSlug}.localhost:3000/verify-email?token=${token}`
      : `https://${tenantSlug}.${domain}/verify-email?token=${token}`;
    await this.send(to, 'Verifica o teu email — WppRecebo', this.templateEmailVerification(name, url));
  }

  // ── Welcome ───────────────────────────────────────────────────────────────

  async sendWelcome(to: string, name: string, tenantSlug: string, verificationToken?: string): Promise<void> {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.com';
    const dashboardUrl = this.appUrl.includes('localhost')
      ? `http://${tenantSlug}.localhost:3000/kanban`
      : `https://${tenantSlug}.${domain}/kanban`;
    const verifyUrl = verificationToken
      ? (this.appUrl.includes('localhost')
          ? `http://${tenantSlug}.localhost:3000/verify-email?token=${verificationToken}`
          : `https://${tenantSlug}.${domain}/verify-email?token=${verificationToken}`)
      : undefined;
    await this.send(to, 'Bem-vindo ao WppRecebo! 🎉', this.templateWelcome(name, dashboardUrl, verifyUrl));
  }

  // ── Agent invitation ──────────────────────────────────────────────────────

  async sendAgentInvitation(
    to: string,
    name: string,
    workspaceName: string,
    tempPassword: string,
    tenantSlug: string,
  ): Promise<void> {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.com';
    const loginUrl = this.appUrl.includes('localhost')
      ? `http://${tenantSlug}.localhost:3000/login`
      : `https://${tenantSlug}.${domain}/login`;
    await this.send(
      to,
      `Foste adicionado ao workspace ${workspaceName} — WppRecebo`,
      this.templateAgentInvitation(name, workspaceName, to, tempPassword, loginUrl),
    );
  }

  // ── HTML templates ────────────────────────────────────────────────────────

  private wrap(content: string): string {
    return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13131f;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px;">Wpp<span style="color:#16a34a;">Recebo</span></span>
          </td>
        </tr>
        <tr><td style="padding:32px 40px;">${content}</td></tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);">© 2026 WppRecebo · Este email foi enviado automaticamente, por favor não respondas.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private btn(url: string, label: string): string {
    return `<a href="${url}" style="display:inline-block;margin:24px 0 8px;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">${label}</a>`;
  }

  private h1(text: string): string {
    return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px;">${text}</h1>`;
  }

  private p(text: string): string {
    return `<p style="margin:0 0 12px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">${text}</p>`;
  }

  private templateEmailVerification(name: string, url: string): string {
    return this.wrap(`
      ${this.h1('Verifica o teu email')}
      ${this.p(`Olá ${name},`)}
      ${this.p('Clica no botão abaixo para confirmar o teu endereço de email e ativar a tua conta WppRecebo.')}
      ${this.btn(url, 'Verificar email')}
      ${this.p('<span style="font-size:13px;color:rgba(255,255,255,0.35);">Este link expira em <strong style="color:rgba(255,255,255,0.5);">24 horas</strong>. Se não criaste esta conta, podes ignorar este email.</span>')}
    `);
  }

  private templatePasswordReset(name: string, url: string): string {
    return this.wrap(`
      ${this.h1('Recuperação de password')}
      ${this.p(`Olá ${name},`)}
      ${this.p('Recebemos um pedido para redefinir a password da tua conta WppRecebo.')}
      ${this.btn(url, 'Redefinir password')}
      ${this.p('<span style="font-size:13px;color:rgba(255,255,255,0.35);">Este link expira em <strong style="color:rgba(255,255,255,0.5);">1 hora</strong>. Se não pediste esta alteração, podes ignorar este email com segurança.</span>')}
    `);
  }

  private templateWelcome(name: string, dashboardUrl: string, verifyUrl?: string): string {
    const firstName = name.split(' ')[0] ?? name;
    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bem-vindo ao WppRecebo</title>
</head>
<body style="margin:0;padding:0;background:#060609;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060609;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo header -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#16a34a;border-radius:12px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                  <span style="font-size:22px;line-height:44px;">💬</span>
                </td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Wpp<span style="color:#16a34a;">Recebo</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card principal -->
        <tr>
          <td style="background:#0d0d18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

            <!-- Hero com gradiente -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#1a0a2e 0%,#0d0d18 60%);padding:40px 40px 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">Conta criada com sucesso</p>
                  <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">Olá, ${firstName}! 👋</h1>
                  <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.6);line-height:1.6;">O teu workspace no <strong style="color:#ffffff;">WppRecebo</strong> está pronto. Centraliza o teu WhatsApp, as tuas marcações e os teus clientes num só lugar.</p>
                </td>
              </tr>
            </table>

            <!-- Próximos passos -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:32px 40px 8px;">
                  <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.8px;">Por onde começar</p>

                  <!-- Passo 1 -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                    <tr>
                      <td style="width:36px;vertical-align:top;">
                        <div style="width:32px;height:32px;background:rgba(22,163,74,0.15);border:1px solid rgba(22,163,74,0.3);border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#16a34a;">1</div>
                      </td>
                      <td style="padding-left:14px;vertical-align:top;padding-top:6px;">
                        <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#ffffff;">Conecta o teu WhatsApp Business</p>
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.5;">Liga o teu número e começa a receber mensagens no painel.</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Passo 2 -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                    <tr>
                      <td style="width:36px;vertical-align:top;">
                        <div style="width:32px;height:32px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#10b981;">2</div>
                      </td>
                      <td style="padding-left:14px;vertical-align:top;padding-top:6px;">
                        <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#ffffff;">Configura a tua Agenda</p>
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.5;">Adiciona serviços e profissionais para aceitar marcações automáticas.</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Passo 3 -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
                    <tr>
                      <td style="width:36px;vertical-align:top;">
                        <div style="width:32px;height:32px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);border-radius:50%;text-align:center;line-height:32px;font-size:14px;font-weight:700;color:#f59e0b;">3</div>
                      </td>
                      <td style="padding-left:14px;vertical-align:top;padding-top:6px;">
                        <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#ffffff;">Partilha com os teus clientes</p>
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.5;">O teu link de agendamento público está pronto para partilhar.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:28px 40px ${verifyUrl ? '20px' : '40px'};">
                  <a href="${dashboardUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">Ir para o dashboard →</a>
                </td>
              </tr>
            </table>

            ${verifyUrl ? `<!-- Verify email CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 40px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);border-radius:12px;padding:16px 20px;">
                        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#4ade80;">Confirma o teu email</p>
                        <p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;">Para garantires o acesso completo à tua conta, confirma o teu endereço de email.</p>
                        <a href="${verifyUrl}" style="display:inline-block;background:rgba(22,163,74,0.25);color:#4ade80;text-decoration:none;font-size:13px;font-weight:600;padding:8px 18px;border-radius:8px;border:1px solid rgba(22,163,74,0.3);">Verificar email →</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>` : ''}

            <!-- Separador stats -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:rgba(22,163,74,0.06);border-top:1px solid rgba(22,163,74,0.15);padding:20px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align:center;padding:0 8px;border-right:1px solid rgba(255,255,255,0.06);">
                        <p style="margin:0 0 2px;font-size:20px;font-weight:700;color:#16a34a;">∞</p>
                        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Conversas</p>
                      </td>
                      <td style="text-align:center;padding:0 8px;border-right:1px solid rgba(255,255,255,0.06);">
                        <p style="margin:0 0 2px;font-size:20px;font-weight:700;color:#10b981;">24/7</p>
                        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Disponível</p>
                      </td>
                      <td style="text-align:center;padding:0 8px;">
                        <p style="margin:0 0 2px;font-size:20px;font-weight:700;color:#f59e0b;">Auto</p>
                        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;">Marcações</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.2);">© 2026 WppRecebo · Todos os direitos reservados</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.15);">Este email foi enviado automaticamente. Por favor não respondas.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private templateAgentInvitation(
    name: string,
    workspaceName: string,
    email: string,
    tempPassword: string,
    loginUrl: string,
  ): string {
    return this.wrap(`
      ${this.h1(`Foste adicionado ao workspace ${workspaceName}`)}
      ${this.p(`Olá ${name},`)}
      ${this.p(`O administrador do workspace <strong style="color:rgba(255,255,255,0.8);">${workspaceName}</strong> adicionou-te como membro da equipa no WppRecebo.`)}
      <div style="margin:20px 0;padding:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;">As tuas credenciais</p>
        <p style="margin:4px 0;font-size:14px;color:rgba(255,255,255,0.7);">Email: <strong style="color:#fff;">${email}</strong></p>
        <p style="margin:4px 0;font-size:14px;color:rgba(255,255,255,0.7);">Password temporária: <strong style="color:#fff;font-family:monospace;">${tempPassword}</strong></p>
      </div>
      ${this.btn(loginUrl, 'Entrar no workspace')}
      ${this.p('<span style="font-size:13px;color:rgba(255,255,255,0.35);">Recomendamos que alteres a tua password após o primeiro login.</span>')}
    `);
  }
}
