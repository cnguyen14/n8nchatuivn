import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Session = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type ChatSession = Session;

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'system' | 'assistant';
  session_id: string;
  created_at: string;
  timestamp: number;
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'system' | 'assistant';
  session_id: string;
  created_at: string;
  timestamp: number;
};

export type WebhookConfig = {
  id: string;
  user_id: string;
  url: string;
  headers: Record<string, string>;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
};

export type WebhookSettings = {
  id: string;
  user_id: string;
  webhook_url: string;
  webhook_variables: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type ExamplePrompt = {
  id: string;
  user_id: string;
  prompt_text: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type LanguageSettings = {
  id: string;
  user_id: string;
  language: string;
  created_at: string;
  updated_at: string;
};
