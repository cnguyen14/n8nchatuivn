import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../../store/languageStore';
import { Send } from 'lucide-react';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  centered?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  centered = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { translate } = useLanguageStore();
  const { animationClass, handleClick } = useButtonAnimation();

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    // Always prevent default to avoid any page refresh
    e.preventDefault();
    e.stopPropagation();
    
    if (message.trim() && !disabled) {
      // Call the onSendMessage callback with the trimmed message
      onSendMessage(message.trim());
      
      // Clear the input field
      setMessage('');
      
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    
    // Return false to ensure no form submission
    return false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${centered ? 'max-w-xl mx-auto w-full' : 'w-full'}`}
    >
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={translate('chat.typeMessage')}
          disabled={disabled}
          className={`w-full bg-slate-700/70 text-white rounded-lg pl-4 pr-12 py-3 resize-none min-h-[50px] max-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-white/50 ${
            disabled ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          rows={1}
        />
        <button
          type="button" // Changed from submit to button to have more control
          disabled={!message.trim() || disabled}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full ${
            message.trim() && !disabled
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-slate-600 cursor-not-allowed opacity-50'
          } transition-colors ${animationClass}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (message.trim() && !disabled) {
              handleClick(e);
              handleSubmit(e);
            }
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
