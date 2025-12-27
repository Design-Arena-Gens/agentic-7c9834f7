export type Channel = 'whatsapp' | 'facebook' | 'instagram';

export interface Participant {
  id: string;
  name: string;
  role: 'customer' | 'agent';
}

export interface Message {
  id: string;
  author: Participant;
  timestamp: string;
  text: string;
  channel: Channel;
  type: 'customer' | 'agent';
  cta?: CallToAction;
}

export interface CallToAction {
  label: string;
  url: string;
  urgency: 'low' | 'medium' | 'high';
  summary: string;
}

export interface AgentResponse {
  reply: string;
  cta: CallToAction;
  strategyNotes: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface ConversationContext {
  customerName: string;
  businessName: string;
  productCatalog: Product[];
  brandTone: 'friendly' | 'professional' | 'casual';
  campaignFocus?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  benefits: string[];
  tags: string[];
}

export interface IncomingMessagePayload {
  channel: Channel;
  message: string;
  customerName?: string;
  context?: Partial<ConversationContext>;
  history?: Message[];
  preferredLanguage?: 'en' | 'bn';
}
