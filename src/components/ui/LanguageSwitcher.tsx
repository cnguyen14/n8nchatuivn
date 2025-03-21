import React from 'react';
import { useLanguageStore, Language } from '../../store/languageStore';
import { ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'full';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'full' }) => {
  const { language, setLanguage, translate } = useLanguageStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Language options with their display names and flags
  const languages = [
    { code: 'en', name: 'English', flag: '/flags/en.svg' },
    { code: 'vi', name: 'Tiếng Việt', flag: '/flags/vi.svg' }
  ];

  // Find current language
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <img 
          src={currentLanguage.flag} 
          alt={currentLanguage.name} 
          className="w-5 h-5 rounded-sm object-cover"
        />
        {variant === 'full' && (
          <>
            <span className="text-sm font-medium">{currentLanguage.name}</span>
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <ul role="listbox" aria-label={translate('settings.selectLanguage')}>
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => toggleLanguage(lang.code as Language)}
                  className={`w-full text-left px-4 py-2 flex items-center space-x-2 hover:bg-slate-700 transition-colors ${
                    language === lang.code ? 'bg-slate-700/50 font-medium' : ''
                  }`}
                  aria-selected={language === lang.code}
                >
                  <img 
                    src={lang.flag} 
                    alt={lang.name} 
                    className="w-5 h-5 rounded-sm object-cover"
                  />
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
