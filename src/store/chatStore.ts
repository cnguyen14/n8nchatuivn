import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase, Message, Session } from '../lib/supabase';

interface ChatState {
  messages: Message[];
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, userId: string) => Promise<void>;
  receiveSystemMessage: (content: string) => Promise<void>;
  loadChatHistory: (sessionId: string) => Promise<void>;
  loadUserSessions: (userId: string) => Promise<void>;
  createNewSession: (userId: string, title?: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  batchDeleteSessions: (sessionIds: string[]) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,

  sendMessage: async (content, userId) => {
    try {
      set({ loading: true, error: null });
      const { currentSession } = get();
      
      if (!currentSession) {
        throw new Error("No active session");
      }
      
      const timestamp = Date.now();
      const messageId = crypto.randomUUID();
      
      const newMessage: Omit<Message, 'created_at'> = {
        id: messageId,
        content,
        sender: 'user',
        timestamp,
        session_id: currentSession.id,
      };
      
      // Optimistically update UI
      set(state => ({
        messages: [...state.messages, { ...newMessage, created_at: new Date().toISOString() }]
      }));
      
      // Save to Supabase
      const { error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          content,
          sender: 'user',
          timestamp,
          session_id: currentSession.id
        });
      
      if (error) throw error;
      
      // Update session's updated_at timestamp
      await supabase
        .from('sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.id);
      
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error sending message:", error);
    } finally {
      set({ loading: false });
    }
  },

  receiveSystemMessage: async (content) => {
    try {
      const { currentSession } = get();
      
      if (!currentSession) {
        throw new Error("No active session");
      }
      
      const timestamp = Date.now();
      const messageId = crypto.randomUUID();
      
      const newMessage: Omit<Message, 'created_at'> = {
        id: messageId,
        content,
        sender: 'system',
        timestamp,
        session_id: currentSession.id,
      };
      
      // Optimistically update UI
      set(state => ({
        messages: [...state.messages, { ...newMessage, created_at: new Date().toISOString() }]
      }));
      
      // Save to Supabase
      const { error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          content,
          sender: 'system',
          timestamp,
          session_id: currentSession.id
        });
      
      if (error) {
        console.error("Error saving system message to Supabase:", error);
        throw error;
      }
      
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error receiving system message:", error);
    }
  },

  loadChatHistory: async (sessionId) => {
    try {
      set({ loading: true, error: null });
      
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      // Get messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      set({ 
        messages: messagesData || [], 
        currentSession: sessionData as Session 
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error loading chat history:", error);
    } finally {
      set({ loading: false });
    }
  },

  loadUserSessions: async (userId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      set({ sessions: data || [] });
      
      // If there are sessions and no current session is selected, select the most recent one
      if (data && data.length > 0 && !get().currentSession) {
        await get().loadChatHistory(data[0].id);
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error loading user sessions:", error);
    } finally {
      set({ loading: false });
    }
  },

  createNewSession: async (userId, title) => {
    try {
      set({ loading: true, error: null });
      
      const sessionId = crypto.randomUUID();
      const now = new Date();
      const formattedDate = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const newSession = {
        id: sessionId,
        title: title || `Chat ${formattedDate}`,
        user_id: userId,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };
      
      const { error } = await supabase
        .from('sessions')
        .insert(newSession);
      
      if (error) throw error;
      
      set(state => ({ 
        sessions: [newSession as Session, ...state.sessions],
        currentSession: newSession as Session,
        messages: []
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error creating new session:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateSessionTitle: async (sessionId, title) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      set(state => ({
        sessions: state.sessions.map(session => 
          session.id === sessionId ? { ...session, title } : session
        ),
        currentSession: state.currentSession?.id === sessionId 
          ? { ...state.currentSession, title } 
          : state.currentSession
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error updating session title:", error);
    } finally {
      set({ loading: false });
    }
  },

  deleteSession: async (sessionId) => {
    try {
      set({ loading: true, error: null });
      
      // Delete all messages in the session first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId);
      
      if (messagesError) throw messagesError;
      
      // Then delete the session
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
      
      if (sessionError) throw sessionError;
      
      const { sessions, currentSession } = get();
      
      // Update state
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      
      // If we're deleting the current session, select another one if available
      let newCurrentSession = currentSession;
      if (currentSession?.id === sessionId) {
        newCurrentSession = updatedSessions.length > 0 ? updatedSessions[0] : null;
        
        // If we have a new session to select, load its messages
        if (newCurrentSession) {
          // We need to load messages outside of this function to avoid state update conflicts
          setTimeout(() => {
            get().loadChatHistory(newCurrentSession.id);
          }, 0);
        } else {
          // No sessions left, clear messages
          set({ messages: [] });
        }
      }
      
      set({
        sessions: updatedSessions,
        currentSession: newCurrentSession,
        loading: false
      });
      
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error deleting session:", error);
    }
  },

  batchDeleteSessions: async (sessionIds) => {
    try {
      set({ loading: true, error: null });
      
      // Delete all messages in the selected sessions first
      for (const sessionId of sessionIds) {
        const { error: messagesError } = await supabase
          .from('messages')
          .delete()
          .eq('session_id', sessionId);
        
        if (messagesError) throw messagesError;
      }
      
      // Then delete the sessions
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .in('id', sessionIds);
      
      if (sessionsError) throw sessionsError;
      
      const { sessions, currentSession } = get();
      
      // Update state
      const updatedSessions = sessions.filter(session => !sessionIds.includes(session.id));
      
      // Check if current session was deleted
      let newCurrentSession = currentSession;
      if (currentSession && sessionIds.includes(currentSession.id)) {
        newCurrentSession = updatedSessions.length > 0 ? updatedSessions[0] : null;
        
        // If we have a new session to select, load its messages
        if (newCurrentSession) {
          // We need to load messages outside of this function to avoid state update conflicts
          setTimeout(() => {
            get().loadChatHistory(newCurrentSession.id);
          }, 0);
        } else {
          // No sessions left, clear messages
          set({ messages: [] });
        }
      }
      
      set({
        sessions: updatedSessions,
        currentSession: newCurrentSession,
        loading: false
      });
      
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error batch deleting sessions:", error);
    }
  }
}));
