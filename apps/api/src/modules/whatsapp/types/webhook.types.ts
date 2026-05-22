export interface WhatsappWebhookPayload {
  object: string;
  entry: WhatsappEntry[];
}

export interface WhatsappEntry {
  id: string; // WhatsApp Business Account ID
  changes: WhatsappChange[];
}

export interface WhatsappChange {
  field: string; // "messages"
  value: WhatsappValue;
}

export interface WhatsappValue {
  messaging_product: string; // "whatsapp"
  metadata: WhatsappMetadata;
  contacts?: WhatsappContact[];
  messages?: WhatsappMessage[];
  statuses?: WhatsappStatus[];
  errors?: WhatsappError[];
}

export interface WhatsappMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsappContact {
  profile: { name: string };
  wa_id: string; // número sem +
}

export type WhatsappMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'sticker'
  | 'reaction'
  | 'unsupported';

export interface WhatsappMessage {
  from: string; // número sem +
  id: string; // ID único da mensagem no WhatsApp
  timestamp: string;
  type: WhatsappMessageType;
  text?: { body: string };
  image?: WhatsappMedia & { caption?: string };
  audio?: WhatsappMedia;
  video?: WhatsappMedia & { caption?: string };
  document?: WhatsappMedia & { filename?: string; caption?: string };
  sticker?: WhatsappMedia;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: {
    from: string;
    id: string; // ID da mensagem citada
  };
}

export interface WhatsappMedia {
  id: string;
  mime_type: string;
  sha256?: string;
}

export type WhatsappStatusType = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsappStatus {
  id: string; // WhatsApp message ID
  recipient_id: string;
  status: WhatsappStatusType;
  timestamp: string;
  errors?: WhatsappError[];
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: { type: string };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export interface WhatsappError {
  code: number;
  title: string;
  message?: string;
  error_data?: { details: string };
}
