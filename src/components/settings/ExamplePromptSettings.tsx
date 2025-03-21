import React, { useState, useEffect } from 'react';
import { usePromptStore, ExamplePrompt } from '../../store/promptStore';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import Button from '../ui/Button';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Save, X } from 'lucide-react';

const ExamplePromptSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { translate } = useLanguageStore();
  const { 
    prompts, 
    loading, 
    error, 
    loadPrompts, 
    addPrompt, 
    updatePrompt, 
    deletePrompt,
    reorderPrompts
  } = usePromptStore();
  
  const [newPrompt, setNewPrompt] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionResult, setActionResult] = useState<{success: boolean; message: string} | null>(null);
  
  useEffect(() => {
    if (user) {
      loadPrompts(user.id);
    }
  }, [user, loadPrompts]);
  
  const handleAddPrompt = async () => {
    if (!user || !newPrompt.trim()) return;
    
    setIsSaving(true);
    try {
      await addPrompt(user.id, newPrompt.trim());
      setNewPrompt('');
      setActionResult({
        success: true,
        message: translate('success.promptAdded')
      });
    } catch (error: any) {
      setActionResult({
        success: false,
        message: `${translate('error.addPrompt')} ${error.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    }
  };
  
  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;
    
    setIsSaving(true);
    try {
      await updatePrompt(editingPrompt.id, editingPrompt.text.trim());
      setEditingPrompt(null);
      setActionResult({
        success: true,
        message: translate('success.promptUpdated')
      });
    } catch (error: any) {
      setActionResult({
        success: false,
        message: `${translate('error.updatePrompt')} ${error.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    }
  };
  
  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm(translate('confirm.deletePrompt'))) return;
    
    setIsSaving(true);
    try {
      await deletePrompt(promptId);
      setActionResult({
        success: true,
        message: translate('success.promptDeleted')
      });
    } catch (error: any) {
      setActionResult({
        success: false,
        message: `${translate('error.deletePrompt')} ${error.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    }
  };
  
  const handleMovePrompt = async (promptId: string, direction: 'up' | 'down') => {
    const currentIndex = prompts.findIndex(p => p.id === promptId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(prompts.length - 1, currentIndex + 1);
    
    if (newIndex === currentIndex) return;
    
    // Create a new array with the reordered prompts
    const newOrder = [...prompts];
    const [movedPrompt] = newOrder.splice(currentIndex, 1);
    newOrder.splice(newIndex, 0, movedPrompt);
    
    // Get the IDs in the new order
    const promptIds = newOrder.map(p => p.id);
    
    setIsSaving(true);
    try {
      await reorderPrompts(promptIds);
      setActionResult({
        success: true,
        message: translate('success.promptsReordered')
      });
    } catch (error: any) {
      setActionResult({
        success: false,
        message: `${translate('error.reorderPrompts')} ${error.message}`
      });
    } finally {
      setIsSaving(false);
      
      // Clear result message after 3 seconds
      setTimeout(() => {
        setActionResult(null);
      }, 3000);
    }
  };
  
  return (
    <div className="bg-slate-600/50 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">{translate('settings.prompts')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-medium">
          {error}
        </div>
      )}
      
      {actionResult && (
        <div className={`mb-4 p-3 ${actionResult.success ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'} rounded-lg font-medium`}>
          {actionResult.message}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">
          {translate('settings.addPrompt')}
        </label>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder={translate('settings.addPrompt')}
            className="flex-1 px-3 py-2 bg-slate-700/80 text-white border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button
            onClick={handleAddPrompt}
            variant="gradient"
            isLoading={isSaving}
            disabled={!newPrompt.trim() || isSaving}
            leftIcon={<Plus size={16} />}
          >
            {translate('app.add')}
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">{translate('settings.currentPrompts')}</h3>
        
        {loading && prompts.length === 0 ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="p-4 bg-slate-700/50 rounded-lg text-white/70 text-center">
            {translate('settings.noPrompts')}
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div 
                key={prompt.id} 
                className="bg-slate-700/50 rounded-lg border border-slate-600/50 overflow-hidden"
              >
                {editingPrompt && editingPrompt.id === prompt.id ? (
                  <div className="p-3">
                    <textarea
                      value={editingPrompt.text}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 text-white border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => setEditingPrompt(null)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<X size={14} />}
                      >
                        {translate('app.cancel')}
                      </Button>
                      <Button
                        onClick={handleUpdatePrompt}
                        variant="gradient"
                        size="sm"
                        isLoading={isSaving}
                        disabled={!editingPrompt.text.trim() || isSaving}
                        leftIcon={<Save size={14} />}
                      >
                        {translate('app.save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start p-3">
                    <div className="flex-1 text-white">
                      {prompt.prompt_text}
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleMovePrompt(prompt.id, 'up')}
                        disabled={index === 0 || isSaving}
                        className={`p-1.5 rounded-md ${index === 0 ? 'text-slate-500 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-slate-600/50'}`}
                        title="Move up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMovePrompt(prompt.id, 'down')}
                        disabled={index === prompts.length - 1 || isSaving}
                        className={`p-1.5 rounded-md ${index === prompts.length - 1 ? 'text-slate-500 cursor-not-allowed' : 'text-white/70 hover:text-white hover:bg-slate-600/50'}`}
                        title="Move down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => setEditingPrompt({ id: prompt.id, text: prompt.prompt_text })}
                        disabled={isSaving}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-slate-600/50 rounded-md"
                        title={translate('app.edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        disabled={isSaving}
                        className="p-1.5 text-white/70 hover:text-red-400 hover:bg-slate-600/50 rounded-md"
                        title={translate('app.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-slate-700/30 rounded-lg p-4 text-white/80 text-sm">
        <h4 className="font-medium mb-2">{translate('settings.aboutPrompts')}</h4>
        <p>
          {translate('settings.promptsDescription')}
        </p>
        <p className="mt-2">
          {translate('settings.promptsOrder')}
        </p>
      </div>
    </div>
  );
};

export default ExamplePromptSettings;
