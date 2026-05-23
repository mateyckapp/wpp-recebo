import { CodeBlock, InlineCode } from '@/components/docs/code-block';
import { Alert } from '@/components/docs/api-method';

export const metadata = { title: 'Verificação de Assinatura — Wpp Recebo Docs' };

export default function WebhookVerificacaoPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Webhooks</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Verificação de Assinatura</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Quando configuras um <InlineCode>secret</InlineCode> no teu webhook, o Wpp Recebo assina cada pedido
        com HMAC-SHA256. Verifica sempre a assinatura no teu servidor para garantir que o evento vem
        do Wpp Recebo e não de uma fonte maliciosa.
      </p>

      <Alert type="danger">
        Nunca processes eventos de webhook sem verificar a assinatura em ambiente de produção.
        Um endpoint não protegido pode ser explorado para injectar eventos falsos no teu sistema.
      </Alert>

      {/* HOW IT WORKS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Como funciona</h2>
      <div className="space-y-3 mb-6">
        {[
          { step: '1', title: 'Defines um secret', desc: 'Ao registar o webhook, forneces um secret (string aleatória e segura). Guarda-o em variável de ambiente no teu servidor.' },
          { step: '2', title: 'Wpp Recebo assina o payload', desc: 'Para cada evento, calculamos HMAC-SHA256(corpo do pedido, secret) e enviamos o resultado no header X-WPP-Signature.' },
          { step: '3', title: 'Verificas a assinatura', desc: 'No teu servidor, calculas o mesmo HMAC com o teu secret e comparas com o header recebido usando comparação segura (timing-safe).' },
          { step: '4', title: 'Rejeitas pedidos inválidos', desc: 'Se as assinaturas não coincidirem, rejeitas o pedido com HTTP 401. Se coincidirem, processa o evento normalmente.' },
        ].map((s) => (
          <div key={s.step} className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-bold flex items-center justify-center">
              {s.step}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* NODE.JS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Verificação em Node.js / Express</h2>
      <Alert type="warning">
        Usa <InlineCode>express.raw()</InlineCode> (não <InlineCode>express.json()</InlineCode>) para receber
        o corpo em formato Buffer. Se o corpo for parseado antes da verificação, o HMAC será diferente.
      </Alert>
      <CodeBlock
        language="javascript"
        title="Express.js"
        code={`const crypto = require('crypto');
const express = require('express');

const app = express();

function verifySignature(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // comparação timing-safe para prevenir timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex'),
  );
}

app.post(
  '/webhooks/wpprecebo',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-wpp-signature'];

    if (!signature) {
      return res.status(401).json({ error: 'Assinatura em falta' });
    }

    const isValid = verifySignature(
      req.body,
      signature,
      process.env.WPP_WEBHOOK_SECRET,
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    const event = JSON.parse(req.body.toString());
    console.log('Evento recebido:', event.event, event.id);

    // processa o evento...
    handleEvent(event);

    res.status(200).json({ received: true });
  },
);`}
      />

      {/* NEXT.JS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Verificação em Next.js (App Router)</h2>
      <CodeBlock
        language="typescript"
        title="app/api/webhooks/wpprecebo/route.ts"
        code={`import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get('x-wpp-signature') ?? '';

  if (!verifySignature(rawBody, signature, process.env.WPP_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  const event = JSON.parse(rawBody.toString());

  switch (event.event) {
    case 'message.received':
      await handleMessageReceived(event.data);
      break;
    case 'appointment.created':
      await handleAppointmentCreated(event.data);
      break;
    // ...
  }

  return NextResponse.json({ received: true });
}`}
      />

      {/* PYTHON */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Verificação em Python / Flask</h2>
      <CodeBlock
        language="python"
        title="Flask"
        code={`import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

def verify_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode('utf-8'),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhooks/wpprecebo', methods=['POST'])
def webhook():
    signature = request.headers.get('X-WPP-Signature', '')
    secret = os.environ['WPP_WEBHOOK_SECRET']

    if not verify_signature(request.data, signature, secret):
        return jsonify({'error': 'Assinatura inválida'}), 401

    event = request.get_json(force=True)
    print(f"Evento: {event['event']} ({event['id']})")

    # processa o evento...

    return jsonify({'received': True}), 200`}
      />

      {/* PHP */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">Verificação em PHP</h2>
      <CodeBlock
        language="php"
        title="PHP"
        code={`<?php

function verifySignature(string $rawBody, string $signature, string $secret): bool {
    $expected = hash_hmac('sha256', $rawBody, $secret);
    return hash_equals($expected, $signature);
}

$rawBody = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WPP_SIGNATURE'] ?? '';
$secret = getenv('WPP_WEBHOOK_SECRET');

if (!verifySignature($rawBody, $signature, $secret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Assinatura inválida']);
    exit;
}

$event = json_decode($rawBody, true);
// processa o evento...

http_response_code(200);
echo json_encode(['received' => true]);`}
      />

      {/* TIPS */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-4">Dicas de segurança</h2>
      <div className="space-y-3">
        {[
          { title: 'Gera um secret forte', desc: 'Usa pelo menos 32 caracteres aleatórios. Podes gerar com: openssl rand -hex 32' },
          { title: 'Guarda em variável de ambiente', desc: 'Nunca escreves o secret no código. Usa .env, AWS Secrets Manager, Vercel Environment Variables, etc.' },
          { title: 'Usa timingSafeEqual / compare_digest / hash_equals', desc: 'Comparações normais (===, ==) são vulneráveis a timing attacks. Usa sempre a função específica da tua linguagem.' },
          { title: 'Responde rápido com 200', desc: 'Processa o evento de forma assíncrona se necessário. O Wpp Recebo espera 10 segundos pela resposta — após isso assume falha e faz retry.' },
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
