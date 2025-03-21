import React from 'react';
import { usePromptStore } from '../../store/promptStore';
import { useLanguageStore } from '../../store/languageStore';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WelcomeScreenProps {
  username?: string | null;
  onPromptClick: (promptText: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username, onPromptClick }) => {
  const { prompts } = usePromptStore();
  const { translate } = useLanguageStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 h-full">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4 animate-fade-in">
          {translate('chat.welcome')}{username ? `, ${username}` : ''}!
        </h1>
        <p className="text-xl text-white/80 mb-8 animate-fade-in animation-delay-100">
          {translate('chat.welcomeMessage')}
        </p>
        <div className="w-full max-w-md mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/10 animate-fade-in animation-delay-200">
            <p className="text-white/70 text-sm mb-2">{translate('chat.examplePrompts')}</p>
            <div className="space-y-2">
              {prompts.length > 0 ? (
                prompts.map((prompt, index) => (
                  <div 
                    key={prompt.id}
                    className={`bg-slate-700/50 hover:bg-slate-600/50 transition-colors cursor-pointer rounded-md p-3 text-white/90 text-left animate-slide-up`}
                    style={{ animationDelay: `${200 + index * 100}ms` }}
                    onClick={() => onPromptClick(prompt.prompt_text)}
                  >
                    {prompt.prompt_text}
                  </div>
                ))
              ) : (
                <Link 
                  to="/settings?section=prompts" 
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 transition-colors rounded-md p-4 text-white text-center font-medium shadow-lg animate-slide-up backdrop-blur-sm"
                >
                  <Settings size={18} />
                  <span>{translate('chat.setupExamplePrompts')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
