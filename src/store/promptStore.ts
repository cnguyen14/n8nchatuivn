import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ExamplePrompt {
  id: string;
  prompt_text: string;
  display_order: number;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface PromptState {
  prompts: ExamplePrompt[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPrompts: (userId: string) => Promise<void>;
  addPrompt: (userId: string, promptText: string) => Promise<void>;
  updatePrompt: (promptId: string, promptText: string) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  reorderPrompts: (promptIds: string[]) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  loading: false,
  error: null,
  
  loadPrompts: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('example_prompts')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      set({ prompts: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error loading prompts:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  addPrompt: async (userId: string, promptText: string) => {
    try {
      set({ loading: true, error: null });
      
      // Get the highest display order
      const { prompts } = get();
      const maxOrder = prompts.length > 0 
        ? Math.max(...prompts.map(p => p.display_order)) 
        : -1;
      
      const newPrompt: Partial<ExamplePrompt> = {
        id: crypto.randomUUID(),
        user_id: userId,
        prompt_text: promptText,
        display_order: maxOrder + 1
      };
      
      const { error } = await supabase
        .from('example_prompts')
        .insert(newPrompt);
      
      if (error) throw error;
      
      // Reload prompts to get the updated list
      await get().loadPrompts(userId);
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error adding prompt:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  updatePrompt: async (promptId: string, promptText: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('example_prompts')
        .update({ 
          prompt_text: promptText,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        prompts: state.prompts.map(prompt => 
          prompt.id === promptId 
            ? { ...prompt, prompt_text: promptText } 
            : prompt
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error updating prompt:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  deletePrompt: async (promptId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('example_prompts')
        .delete()
        .eq('id', promptId);
      
      if (error) throw error;
      
      // Update local state
      set(state => ({
        prompts: state.prompts.filter(prompt => prompt.id !== promptId)
      }));
      
      // Get the user ID from the first prompt (if any)
      const { prompts } = get();
      if (prompts.length > 0) {
        // Reorder the remaining prompts
        const updatedPrompts = prompts
          .filter(p => p.id !== promptId)
          .map((p, index) => ({ ...p, display_order: index }));
        
        // Update display orders in the database
        for (const prompt of updatedPrompts) {
          await supabase
            .from('example_prompts')
            .update({ display_order: prompt.display_order })
            .eq('id', prompt.id);
        }
        
        // Update local state with new orders
        set({ prompts: updatedPrompts });
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error deleting prompt:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  reorderPrompts: async (promptIds: string[]) => {
    try {
      set({ loading: true, error: null });
      
      const { prompts } = get();
      const updatedPrompts = [...prompts];
      
      // Update the display_order based on the new order of IDs
      for (let i = 0; i < promptIds.length; i++) {
        const promptId = promptIds[i];
        const promptIndex = updatedPrompts.findIndex(p => p.id === promptId);
        
        if (promptIndex !== -1) {
          updatedPrompts[promptIndex].display_order = i;
          
          // Update in the database
          await supabase
            .from('example_prompts')
            .update({ 
              display_order: i,
              updated_at: new Date().toISOString()
            })
            .eq('id', promptId);
        }
      }
      
      // Sort the prompts by display_order
      updatedPrompts.sort((a, b) => a.display_order - b.display_order);
      
      // Update local state
      set({ prompts: updatedPrompts });
    } catch (error: any) {
      set({ error: error.message });
      console.error("Error reordering prompts:", error);
    } finally {
      set({ loading: false });
    }
  }
}));
