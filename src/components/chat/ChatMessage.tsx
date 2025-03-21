import React, { useState, useEffect } from 'react';
import { Message } from '../../lib/supabase';
import { UserIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
  isNew?: boolean;
}

// Define types for markdown components
type ComponentPropsWithChildren = {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isNew = false }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Apply animation class when the message first appears
    if (isNew) {
      const initialClass = isUser 
        ? 'animate-slide-in-right' 
        : 'animate-slide-in-left';
      
      setAnimationClass(initialClass);
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500); // Match this with the CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isNew, isUser]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${animationClass} max-w-full overflow-hidden`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`} style={{ minWidth: 0, maxWidth: '100%' }}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-md
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ml-3' 
            : isSystem
              ? 'bg-gradient-to-br from-gray-600 to-gray-800 mr-3 border border-gray-500/30'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600 mr-3'
          }`}>
          {isUser ? (
            <UserIcon className="h-6 w-6 text-white" />
          ) : isSystem ? (
            <UserCircleIcon className="h-6 w-6 text-white" />
          ) : (
            <div className="text-white font-bold text-lg">AI</div>
          )}
        </div>
        
        {/* Message content */}
        <div 
          className={`rounded-2xl px-4 py-3 shadow-lg message-bubble
            ${isUser 
              ? 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 text-white' 
              : isSystem
                ? 'bg-gradient-to-br from-gray-700/90 to-gray-800/90 text-white/90 border border-gray-600/30'
                : 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 text-white'
            }`}
          style={{ 
            maxWidth: '100%', 
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          <div className="prose prose-invert markdown-content" style={{ maxWidth: '100%', overflow: 'hidden' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2 pb-1 border-b border-white/20">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 pb-1 border-b border-white/10">{children}</h2>,
                h3: ({ children }) => <h3 className="text-md font-bold mb-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-white/30 pl-3 italic my-2">{children}</blockquote>
                ),
                code: ({ className, children, inline, ...props }: ComponentPropsWithChildren) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-block-wrapper my-2 w-full max-w-full overflow-hidden">
                      <div className="code-block-header">
                        <span className="code-language">{match[1]}</span>
                      </div>
                      <SyntaxHighlighter 
                        language={match[1]} 
                        style={vscDarkPlus} 
                        customStyle={{ maxWidth: '100%' }}
                        className="overflow-x-auto whitespace-pre text-sm font-mono"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={`${className} bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
                      {children}
                    </code>
                  );
                },
                table: ({ children, ...props }: ComponentPropsWithChildren) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="border-collapse border border-white/20 w-full" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }: ComponentPropsWithChildren) => (
                  <thead className="bg-white/10" {...props}>
                    {children}
                  </thead>
                ),
                th: ({ children, ...props }: ComponentPropsWithChildren) => (
                  <th className="border border-white/20 px-2 py-1 text-left" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }: ComponentPropsWithChildren) => (
                  <td className="border border-white/20 px-2 py-1" {...props}>
                    {children}
                  </td>
                ),
                hr: ({ ...props }: ComponentPropsWithChildren) => (
                  <hr className="border-white/20 my-3" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
