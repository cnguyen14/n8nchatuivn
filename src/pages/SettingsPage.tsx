import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { LogOut, ArrowLeft, Webhook, MessageSquare, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import WebhookSettings from '../components/settings/WebhookSettings';
import ExamplePromptSettings from '../components/settings/ExamplePromptSettings';
import LanguageSettings from '../components/settings/LanguageSettings';
import Footer from '../components/ui/Footer';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuthStore();
  const { translate } = useLanguageStore();
  const [activeSection, setActiveSection] = useState<'webhook' | 'prompts' | 'language'>('webhook');
  
  // Get section from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const section = queryParams.get('section');
    if (section === 'prompts' || section === 'webhook' || section === 'language') {
      setActiveSection(section as 'webhook' | 'prompts' | 'language');
    }
  }, []);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-500">
      <div className="flex-1 flex justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-6xl h-[85vh] flex overflow-hidden rounded-2xl shadow-2xl">
          {/* Sidebar */}
          <div className="w-64 bg-slate-800/90 backdrop-blur-md flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Button 
                  onClick={handleBack} 
                  variant="secondary" 
                  size="sm" 
                  className="mr-2"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  {translate('app.back')}
                </Button>
                <span className="ml-2">{translate('settings.title')}</span>
              </h2>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveSection('webhook')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg ${
                    activeSection === 'webhook' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                  } transition-colors`}
                >
                  <Webhook className="h-4 w-4 mr-2" />
                  {translate('settings.webhook')}
                </button>
                <button 
                  onClick={() => setActiveSection('prompts')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg ${
                    activeSection === 'prompts' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                  } transition-colors`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {translate('settings.prompts')}
                </button>
                <button 
                  onClick={() => setActiveSection('language')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg ${
                    activeSection === 'language' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                  } transition-colors`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {translate('settings.language')}
                </button>
              </nav>
            </div>
            
            {/* Logout button at the bottom of sidebar */}
            <div className="mt-auto border-t border-white/10 p-4">
              <Button
                onClick={handleSignOut}
                variant="danger"
                className="w-full flex items-center justify-center"
                leftIcon={<LogOut className="h-4 w-4 mr-2" />}
              >
                {translate('app.signOut')}
              </Button>
            </div>
          </div>
          
          {/* Main settings area */}
          <div className="flex-1 flex flex-col bg-slate-700/80 backdrop-blur-md">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {activeSection === 'webhook' 
                  ? translate('settings.webhook') 
                  : activeSection === 'prompts'
                    ? translate('settings.prompts')
                    : translate('settings.language')}
              </h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {activeSection === 'webhook' ? (
                <WebhookSettings />
              ) : activeSection === 'prompts' ? (
                <ExamplePromptSettings />
              ) : (
                <LanguageSettings />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer className="bg-slate-800/30 backdrop-blur-sm" />
    </div>
  );
};

export default SettingsPage;
