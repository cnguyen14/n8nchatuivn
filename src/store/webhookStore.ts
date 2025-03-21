import { create } from 'zustand';
import { supabase, WebhookSettings, User } from '../lib/supabase';

interface WebhookState {
  webhookUrl: string;
  webhookVariables: Record<string, string>;
  loading: boolean;
  error: string | null;
  loadWebhookSettings: (userId: string) => Promise<void>;
  saveWebhookSettings: (userId: string) => Promise<void>;
  updateWebhookUrl: (url: string) => void;
  addVariable: (key: string, value: string) => void;
  updateVariable: (key: string, value: string) => void;
  removeVariable: (key: string) => void;
  testWebhook: (message: string, sessionId: string, user: User) => Promise<any>;
}

export const useWebhookStore = create<WebhookState>((set, get) => ({
  webhookUrl: '',
  webhookVariables: {},
  loading: false,
  error: null,

  loadWebhookSettings: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        set({ 
          webhookUrl: data.webhook_url || '',
          webhookVariables: data.webhook_variables || {}
        });
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error loading webhook settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  saveWebhookSettings: async (userId) => {
    try {
      set({ loading: true, error: null });
      const { webhookUrl, webhookVariables } = get();
      
      // Check if settings already exist for this user
      const { data: existingData, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingData) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update({
            webhook_url: webhookUrl,
            webhook_variables: webhookVariables,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('settings')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            webhook_url: webhookUrl,
            webhook_variables: webhookVariables
          });
        
        if (error) throw error;
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error saving webhook settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateWebhookUrl: (url) => {
    set({ webhookUrl: url });
  },

  addVariable: (key, value) => {
    if (!key.trim()) return;
    
    set(state => ({
      webhookVariables: {
        ...state.webhookVariables,
        [key]: value
      }
    }));
  },

  updateVariable: (key, value) => {
    set(state => ({
      webhookVariables: {
        ...state.webhookVariables,
        [key]: value
      }
    }));
  },

  removeVariable: (key) => {
    set(state => {
      const newVariables = { ...state.webhookVariables };
      delete newVariables[key];
      return { webhookVariables: newVariables };
    });
  },

  testWebhook: async (message, sessionId, user) => {
    try {
      const { webhookUrl, webhookVariables } = get();
      
      if (!webhookUrl) {
        console.log("No webhook URL configured, skipping webhook");
        return null;
      }
      
      console.log("Sending to webhook:", webhookUrl);
      set({ loading: true, error: null });
      
      // Prepare payload with all required information
      const payload = {
        // User information
        user: {
          id: user.id,
          email: user.email,
        },
        // Session information
        session: {
          id: sessionId
        },
        // Message content - just PING
        message: {
          content: message,
          timestamp: new Date().toISOString()
        },
        // Custom variables
        variables: webhookVariables
      };
      
      console.log("Webhook payload:", JSON.stringify(payload, null, 2));
      
      // Send the webhook request
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Webhook request failed with status ${response.status}:`, errorText);
        throw new Error(`Webhook request failed with status ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json().catch(() => {
        console.log("Webhook response is not JSON, but request succeeded");
        return { success: true };
      });
      
      console.log("Webhook response:", responseData);
      return responseData;
    } catch (error: any) {
      console.error("Webhook error:", error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
