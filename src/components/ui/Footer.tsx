import React from 'react';
import { useLanguageStore } from '../../store/languageStore';
import { Mail, Youtube } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { translate } = useLanguageStore();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`text-center text-sm text-gray-400 py-4 ${className}`}>
      <div className="container mx-auto px-4">
        <p>
          &copy; {currentYear} Chien Nguyen | {translate('footer.allRightsReserved')}
        </p>
        <div className="mt-2 flex items-center justify-center space-x-4">
          <a 
            href="mailto:cnguyen1411@gmail.com" 
            className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
            aria-label="Email"
          >
            <Mail size={16} className="mr-1" />
            cnguyen1411@gmail.com
          </a>
          <a 
            href="https://www.youtube.com/@wheretheideaisunlimited" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-red-400 hover:text-red-300 transition-colors"
            aria-label="YouTube Channel"
          >
            <Youtube size={16} className="mr-1" />
            @wheretheideaisunlimited
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
