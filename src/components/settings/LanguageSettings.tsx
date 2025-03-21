import React, { useState, useEffect } from 'react';
import { useLanguageStore, Language } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { Globe } from 'lucide-react';

const LanguageSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    language, 
    setLanguage, 
    translate, 
    loading, 
    error, 
    loadLanguageSettings, 
    saveLanguageSettings 
  } = useLanguageStore();
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [isSaving, setIsSaving] = useState(false);
  const [actionResult, setActionResult] = useState<{success: boolean; message: string} | null>(null);
  
  useEffect(() => {
    if (user) {
      loadLanguageSettings(user.id);
    }
  }, [user, loadLanguageSettings]);
  
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(e.target.value as Language);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update language in store
      setLanguage(selectedLanguage);
      
      // Save to database
      await saveLanguageSettings(user.id);
      
      setActionResult({
        success: true,
        message: translate('settings.languageSaved')
      });
    } catch (error: any) {
      setActionResult({
        success: false,
        message: error.message
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
      <h2 className="text-xl font-bold text-white mb-6">{translate('settings.language')}</h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            {translate('settings.selectLanguage')}
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="language-en"
                type="radio"
                name="language"
                value="en"
                checked={selectedLanguage === 'en'}
                onChange={handleLanguageChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="language-en" className="ml-3 block text-white">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🇺🇸</span>
                  {translate('settings.english')}
                </div>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="language-vi"
                type="radio"
                name="language"
                value="vi"
                checked={selectedLanguage === 'vi'}
                onChange={handleLanguageChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="language-vi" className="ml-3 block text-white">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🇻🇳</span>
                  {translate('settings.vietnamese')}
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="gradient"
          isLoading={isSaving || loading}
          className="font-medium"
          leftIcon={<Globe size={16} />}
        >
          {translate('app.save')}
        </Button>
      </form>
      
      <div className="mt-6 bg-slate-700/30 rounded-lg p-4 text-white/80 text-sm">
        <h4 className="font-medium mb-2">{translate('settings.language')}</h4>
        <p>
          {translate('settings.languageDescription')}
        </p>
      </div>
    </div>
  );
};

export default LanguageSettings;
