// WhatsApp Message Types
export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'template'
  | 'reaction';

export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export type ConversationStatus = 
  | 'active'
  | 'archived'
  | 'closed';

// Text Message
export interface TextMessage {
  body: string;
  preview_url?: boolean;
}

// Media Message Base
export interface MediaMessage {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
}

// Location Message
export interface LocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

// Contact Message
export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactPhone {
  phone: string;
  type?: 'CELL' | 'MAIN' | 'HOME' | 'WORK' | 'IPHONE';
  wa_id?: string;
}

export interface ContactEmail {
  email: string;
  type?: 'HOME' | 'WORK';
}

export interface Contact {
  name: ContactName;
  phones?: ContactPhone[];
  emails?: ContactEmail[];
  addresses?: Array<{
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: 'HOME' | 'WORK';
  }>;
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
  urls?: Array<{
    url: string;
    type?: 'HOME' | 'WORK';
  }>;
  birthday?: string;
}

// Interactive Message Types
export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveListSection {
  title?: string;
  rows: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export interface InteractiveMessage {
  type: 'button' | 'list' | 'product' | 'product_list';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: MediaMessage;
    video?: MediaMessage;
    document?: MediaMessage;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    button?: string;
    buttons?: InteractiveButton[];
    sections?: InteractiveListSection[];
    catalog_id?: string;
    product_retailer_id?: string;
  };
}

// Template Message
export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: MediaMessage;
  document?: MediaMessage;
  video?: MediaMessage;
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: string;
  parameters?: TemplateParameter[];
}

export interface TemplateMessage {
  name: string;
  language: {
    code: string;
  };
  components?: TemplateComponent[];
}

// Reaction Message
export interface ReactionMessage {
  message_id: string;
  emoji: string;
}

// Combined Message Content Type
export interface MessageContent {
  text?: TextMessage;
  image?: MediaMessage;
  video?: MediaMessage;
  audio?: MediaMessage;
  document?: MediaMessage;
  sticker?: MediaMessage;
  location?: LocationMessage;
  contacts?: Contact[];
  interactive?: InteractiveMessage;
  template?: TemplateMessage;
  reaction?: ReactionMessage;
}

// API Request/Response Types
export interface SendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: MessageType;
  text?: TextMessage;
  image?: MediaMessage;
  video?: MediaMessage;
  audio?: MediaMessage;
  document?: MediaMessage;
  sticker?: MediaMessage;
  location?: LocationMessage;
  contacts?: Contact[];
  interactive?: InteractiveMessage;
  template?: TemplateMessage;
  reaction?: ReactionMessage;
  context?: {
    message_id: string;
  };
}

export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

// Webhook Types
export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: WebhookValue;
  field: string;
}

export interface WebhookValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WebhookContact[];
  messages?: WebhookMessage[];
  statuses?: WebhookStatus[];
  errors?: WebhookError[];
}

export interface WebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: TextMessage;
  image?: MediaMessage & { sha256: string; mime_type: string };
  video?: MediaMessage & { sha256: string; mime_type: string };
  audio?: MediaMessage & { sha256: string; mime_type: string };
  document?: MediaMessage & { sha256: string; mime_type: string };
  sticker?: MediaMessage & { sha256: string; mime_type: string };
  location?: LocationMessage;
  contacts?: Contact[];
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  reaction?: ReactionMessage;
  context?: {
    from: string;
    id: string;
  };
  errors?: WebhookError[];
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WebhookError[];
}

export interface WebhookError {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details: string;
  };
}

export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}
