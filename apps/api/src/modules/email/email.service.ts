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
      await this.resend.emails.send({ from: FROM, to, subject, html });
    } catch (err) {
      this.logger.error(`Erro ao enviar email para ${to}: ${String(err)}`);
    }
  }

  // ── Password reset ────────────────────────────────────────────────────────

  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const url = `${this.appUrl}/reset-password?token=${resetToken}`;
    await this.send(to, 'Recuperação de password — WppRecebo', this.templatePasswordReset(name, url));
  }

  // ── Welcome ───────────────────────────────────────────────────────────────

  async sendWelcome(to: string, name: string, tenantSlug: string): Promise<void> {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.pt';
    const dashboardUrl = this.appUrl.includes('localhost')
      ? `http://${tenantSlug}.localhost:3000/kanban`
      : `https://${tenantSlug}.${domain}/kanban`;
    await this.send(to, 'Bem-vindo ao WppRecebo! 🎉', this.templateWelcome(name, dashboardUrl));
  }

  // ── Agent invitation ──────────────────────────────────────────────────────

  async sendAgentInvitation(
    to: string,
    name: string,
    workspaceName: string,
    tempPassword: string,
    tenantSlug: string,
  ): Promise<void> {
    const domain = this.config.get<string>('APP_DOMAIN') ?? 'wpprecebo.pt';
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
            <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px;">Wpp<span style="color:#7c3aed;">Recebo</span></span>
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
    return `<a href="${url}" style="display:inline-block;margin:24px 0 8px;padding:12px 28px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.2px;">${label}</a>`;
  }

  private h1(text: string): string {
    return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px;">${text}</h1>`;
  }

  private p(text: string): string {
    return `<p style="margin:0 0 12px;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6;">${text}</p>`;
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

  private templateWelcome(name: string, dashboardUrl: string): string {
    return this.wrap(`
      ${this.h1('Bem-vindo ao WppRecebo! 🎉')}
      ${this.p(`Olá ${name}, o teu workspace foi criado com sucesso.`)}
      ${this.p('Estás a um passo de centralizar o teu WhatsApp e a tua agenda num só lugar.')}
      <div style="margin:20px 0;padding:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.5px;">Próximos passos</p>
        <p style="margin:4px 0;font-size:14px;color:rgba(255,255,255,0.7);">1. Conecta o teu número WhatsApp Business</p>
        <p style="margin:4px 0;font-size:14px;color:rgba(255,255,255,0.7);">2. Cria os teus serviços e profissionais na Agenda</p>
        <p style="margin:4px 0;font-size:14px;color:rgba(255,255,255,0.7);">3. Partilha o teu link de agendamento com os clientes</p>
      </div>
      ${this.btn(dashboardUrl, 'Ir para o dashboard')}
    `);
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
