import React, { useState, useEffect } from 'react';
import { useWebhookStore } from '../../store/webhookStore';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useLanguageStore } from '../../store/languageStore';
import Button from '../ui/Button';
import { Plus, Trash2, Send } from 'lucide-react';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';

const WebhookSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { currentSession } = useChatStore();
  const { translate } = useLanguageStore();
  const { 
    webhookUrl, 
    webhookVariables, 
    loading, 
    error, 
    saveWebhookSettings, 
    loadWebhookSettings,
    updateWebhookUrl,
    updateVariable,
    removeVariable,
    testWebhook
  } = useWebhookStore();
  
  const [customVariables, setCustomVariables] = useState<{ key: string; value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { animationClass, handleClick } = useButtonAnimation();
  
  useEffect(() => {
    if (user) {
      loadWebhookSettings(user.id);
    }
  }, [user, loadWebhookSettings]);
  
  useEffect(() => {
    // Convert object to array of key-value pairs
    const variablesArray = Object.entries(webhookVariables || {}).map(
      ([key, value]) => ({ key, value: value as string })
    );
    
    setCustomVariables(variablesArray.length > 0 ? variablesArray : [{ key: '', value: '' }]);
  }, [webhookVariables]);
  
  // Countdown effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const id = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(id);
    } else if (countdown === 0) {
      // Timeout reached
      setIsTesting(false);
      setCountdown(null);
      setTestResult({
        success: false,
        message: translate('error.timeout')
      });
    }
  }, [countdown, translate]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  const handleAddVariable = () => {
    setCustomVariables([...customVariables, { key: '', value: '' }]);
  };
  
  const handleRemoveVariable = (index: number) => {
    const newVariables = [...customVariables];
    newVariables.splice(index, 1);
    setCustomVariables(newVariables.length > 0 ? newVariables : [{ key: '', value: '' }]);
  };
  
  const handleVariableChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...customVariables];
    newVariables[index][field] = value;
    setCustomVariables(newVariables);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    // Update webhook URL in store
    updateWebhookUrl(webhookUrl);
    
    // Update variables in store
    const updatedVariables: Record<string, string> = {};
    customVariables.forEach(variable => {
      if (variable.key.trim()) {
        updatedVariables[variable.key.trim()] = variable.value;
      }
    });
    
    // Clear existing variables
    Object.keys(webhookVariables).forEach(key => {
      removeVariable(key);
    });
    
    // Add new variables
    Object.entries(updatedVariables).forEach(([key, value]) => {
      updateVariable(key, value);
    });
    
    // Save to database
    await saveWebhookSettings(user.id);
    setIsSaving(false);
    setTestResult({success: true, message: translate('success.saved')});
    
    // Clear test result after 3 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  };
  
  const handleTestWebhook = async () => {
    if (!user || !webhookUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    setCountdown(10); // Start 10 second countdown
    
    try {
      // First save the current settings
      updateWebhookUrl(webhookUrl);
      
      const updatedVariables: Record<string, string> = {};
      customVariables.forEach(variable => {
        if (variable.key.trim()) {
          updatedVariables[variable.key.trim()] = variable.value;
        }
      });
      
      // Clear existing variables
      Object.keys(webhookVariables).forEach(key => {
        removeVariable(key);
      });
      
      // Add new variables
      Object.entries(updatedVariables).forEach(([key, value]) => {
        updateVariable(key, value);
      });
      
      // Save to database
      await saveWebhookSettings(user.id);
      
      // Create a promise that will reject after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error(translate('error.timeout')));
        }, 10000);
        setTimeoutId(id);
      });
      
      // Test the webhook with just a PING message
      const sessionId = currentSession?.id || 'test-session';
      const webhookPromise = testWebhook('PING', sessionId, user);
      
      // Race the webhook call against the timeout
      await Promise.race([webhookPromise, timeoutPromise]);
      
      // Clear the timeout if webhook responded
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      setTestResult({
        success: true,
        message: translate('success.webhookTest')
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `${translate('error.webhookTest')} ${error.message}`
      });
    } finally {
      setIsTesting(false);
      setCountdown(null);
      
      // Clear the timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };
  
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">{translate('settings.webhook')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-medium">
          {error}
        </div>
      )}
      
      {testResult && (
        <div className={`mb-4 p-3 ${testResult.success ? 'bg-green-500/20 border border-green-500/50 text-green-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'} rounded-lg font-medium`}>
          {testResult.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-white mb-2">
            {translate('settings.webhookUrl')} <span className="text-red-400">*</span>
          </label>
          <input
            id="webhookUrl"
            type="url"
            placeholder="https://your-n8n-webhook-url.com"
            value={webhookUrl}
            onChange={(e) => updateWebhookUrl(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-700/80 text-white border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            {translate('settings.customVariables')}
          </label>
          
          <div className="space-y-3">
            {customVariables.map((variable, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={translate('settings.variableName')}
                    value={variable.key}
                    onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/80 text-white border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={translate('settings.value')}
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/80 text-white border border-slate-500/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    handleClick(e);
                    handleRemoveVariable(index);
                  }}
                  className={`p-3 text-white hover:text-red-400 bg-slate-700/50 rounded-lg ${animationClass}`}
                  disabled={customVariables.length === 1}
                  aria-label={translate('settings.removeVariable')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              handleClick(e);
              handleAddVariable();
            }}
            className={`mt-3 flex items-center text-sm text-indigo-300 hover:text-indigo-100 font-medium ${animationClass}`}
          >
            <Plus size={16} className="mr-1" /> {translate('settings.addVariable')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <h3 className="text-sm font-medium text-white mb-3">{translate('settings.saveSettings')}</h3>
            <Button
              type="submit"
              variant="gradient"
              isLoading={isSaving || loading}
              className="w-full py-3 font-medium"
            >
              {translate('settings.saveSettings')}
            </Button>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
            <h3 className="text-sm font-medium text-white mb-3">{translate('settings.testWebhook')}</h3>
            <Button
              type="button"
              onClick={handleTestWebhook}
              variant="secondary"
              isLoading={isTesting}
              disabled={!webhookUrl || isTesting}
              leftIcon={<Send size={16} />}
              className="w-full py-3"
            >
              {isTesting ? `${translate('settings.testing')} (${countdown}s)` : translate('settings.sendTestPing')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WebhookSettings;
