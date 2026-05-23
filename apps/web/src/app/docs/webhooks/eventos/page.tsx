import { CodeBlock, InlineCode } from '@/components/docs/code-block';

export const metadata = { title: 'Eventos de Webhook — Wpp Recebo Docs' };

export default function WebhookEventosPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">Webhooks</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Referência de Eventos</h1>
      <p className="text-gray-400 text-base leading-relaxed mb-8">
        Cada evento enviado pelo Wpp Recebo tem a mesma estrutura base mas um campo <InlineCode>data</InlineCode> diferente
        consoante o tipo. Aqui encontras o payload completo de cada evento disponível.
      </p>

      {/* message.received */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">message.received</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando um cliente envia uma mensagem via WhatsApp.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HXYZ...",
  "event": "message.received",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:30:00.000Z",
  "data": {
    "message": {
      "id": "msg_01HXYZ...",
      "content": "Bom dia! Queria marcar uma consulta.",
      "type": "text",
      "direction": "inbound",
      "sentAt": "2026-05-23T10:30:00.000Z"
    },
    "conversation": {
      "id": "conv_01HXYZ...",
      "status": "open"
    },
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678"
    }
  }
}`}
      />

      {/* message.sent */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">message.sent</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma mensagem é enviada pela equipa ou pela IA.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HABC...",
  "event": "message.sent",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:31:00.000Z",
  "data": {
    "message": {
      "id": "msg_01HABC...",
      "content": "Olá João! Temos disponibilidade amanhã às 10h. Confirmas?",
      "type": "text",
      "direction": "outbound",
      "status": "sent",
      "sentAt": "2026-05-23T10:31:00.000Z"
    },
    "conversation": {
      "id": "conv_01HXYZ..."
    },
    "sender": {
      "type": "agent",
      "id": "usr_01HABC...",
      "name": "Ana Silva"
    }
  }
}`}
      />

      {/* conversation.created */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">conversation.created</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma nova conversa é criada (primeira mensagem de um contacto).</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HDEF...",
  "event": "conversation.created",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:30:00.000Z",
  "data": {
    "conversation": {
      "id": "conv_01HXYZ...",
      "status": "open",
      "createdAt": "2026-05-23T10:30:00.000Z"
    },
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678",
      "isNew": true
    }
  }
}`}
      />

      {/* conversation.assigned */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">conversation.assigned</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma conversa é atribuída ou reatribuída a um agente.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HGHI...",
  "event": "conversation.assigned",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:35:00.000Z",
  "data": {
    "conversation": {
      "id": "conv_01HXYZ..."
    },
    "assignee": {
      "id": "usr_01HABC...",
      "name": "Ana Silva"
    },
    "previousAssignee": null
  }
}`}
      />

      {/* conversation.resolved */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">conversation.resolved</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma conversa é marcada como resolvida.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HJKL...",
  "event": "conversation.resolved",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T11:00:00.000Z",
  "data": {
    "conversation": {
      "id": "conv_01HXYZ...",
      "resolvedAt": "2026-05-23T11:00:00.000Z",
      "resolutionTimeMinutes": 30
    },
    "resolvedBy": {
      "type": "agent",
      "id": "usr_01HABC...",
      "name": "Ana Silva"
    }
  }
}`}
      />

      {/* contact.created */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">contact.created</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando um novo contacto é criado, seja via API ou pela primeira mensagem recebida.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HMNO...",
  "event": "contact.created",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:30:00.000Z",
  "data": {
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678",
      "email": null,
      "tags": [],
      "source": "whatsapp",
      "createdAt": "2026-05-23T10:30:00.000Z"
    }
  }
}`}
      />

      {/* contact.updated */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">contact.updated</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando os dados de um contacto são alterados.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HPQR...",
  "event": "contact.updated",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T12:00:00.000Z",
  "data": {
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678",
      "email": "joao@exemplo.pt",
      "tags": ["vip"]
    },
    "changes": {
      "email": { "from": null, "to": "joao@exemplo.pt" },
      "tags": { "from": [], "to": ["vip"] }
    }
  }
}`}
      />

      {/* appointment.created */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">appointment.created</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma marcação é criada (requer Agenda Pro ou Enterprise).</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HSTU...",
  "event": "appointment.created",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T10:00:00.000Z",
  "data": {
    "appointment": {
      "id": "apt_01HXYZ...",
      "service": {
        "id": "svc_01HXYZ...",
        "name": "Consulta de Medicina Geral",
        "duration": 30
      },
      "professional": {
        "id": "prf_01HXYZ...",
        "name": "Dr. Carlos Matos"
      },
      "contact": {
        "id": "ctc_01HXYZ...",
        "name": "João Pereira",
        "phone": "+351912345678"
      },
      "scheduledFor": "2026-05-24T10:00:00.000Z",
      "status": "confirmed",
      "createdAt": "2026-05-23T10:00:00.000Z"
    }
  }
}`}
      />

      {/* appointment.cancelled */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">appointment.cancelled</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando uma marcação é cancelada.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HVWX...",
  "event": "appointment.cancelled",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T15:00:00.000Z",
  "data": {
    "appointment": {
      "id": "apt_01HXYZ...",
      "scheduledFor": "2026-05-24T10:00:00.000Z",
      "cancelledAt": "2026-05-23T15:00:00.000Z",
      "cancelledBy": "contact",
      "reason": "Imprevisto pessoal"
    },
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678"
    }
  }
}`}
      />

      {/* appointment.reminded */}
      <h2 className="text-xl font-semibold text-white mt-10 mb-3">appointment.reminded</h2>
      <p className="text-gray-400 text-sm mb-3">Disparado quando o sistema envia um lembrete automático de marcação via WhatsApp.</p>
      <CodeBlock
        language="json"
        title="Payload"
        code={`{
  "id": "evt_01HYZA...",
  "event": "appointment.reminded",
  "tenantId": "ten_01HXYZ...",
  "timestamp": "2026-05-23T09:00:00.000Z",
  "data": {
    "appointment": {
      "id": "apt_01HXYZ...",
      "scheduledFor": "2026-05-24T10:00:00.000Z",
      "service": "Consulta de Medicina Geral"
    },
    "contact": {
      "id": "ctc_01HXYZ...",
      "name": "João Pereira",
      "phone": "+351912345678"
    },
    "reminderSentAt": "2026-05-23T09:00:00.000Z",
    "reminderType": "24h"
  }
}`}
      />
    </div>
  );
}
