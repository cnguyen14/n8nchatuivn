import { create } from 'zustand';
import { supabase, User } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signUp: async (email, password, username) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user record in our users table
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          username: username || null,
          created_at: new Date().toISOString()
        });
        
        set({ user: {
          id: data.user.id,
          email: data.user.email!,
          username: username,
          created_at: new Date().toISOString()
        }});
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }
        
        // If user doesn't exist in our table yet, create it
        if (!userData) {
          const newUser = {
            id: data.user.id,
            email: data.user.email!,
            created_at: new Date().toISOString()
          };
          
          await supabase.from('users').insert(newUser);
          set({ user: newUser as User });
        } else {
          set({ user: userData as User });
        }
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  checkSession: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        // Get user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }
        
        // If user doesn't exist in our table yet, create it
        if (!userData) {
          const newUser = {
            id: data.session.user.id,
            email: data.session.user.email!,
            created_at: new Date().toISOString()
          };
          
          await supabase.from('users').insert(newUser);
          set({ user: newUser as User });
        } else {
          set({ user: userData as User });
        }
      } else {
        set({ user: null });
      }
    } catch (error: any) {
      set({ error: error.message, user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
