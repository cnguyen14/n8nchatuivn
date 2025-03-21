import React, { useEffect, useRef, useState } from 'react';
import { usePromptStore } from '../../store/promptStore';
import { useLanguageStore } from '../../store/languageStore';
import ChatMessage from './ChatMessage';
import WelcomeScreen from './WelcomeScreen';
import { ChatMessage as ChatMessageType } from '../../lib/supabase';

type ChatHistoryProps = {
  messages: ChatMessageType[];
  loading?: boolean;
  username?: string | null;
  onPromptClick?: (promptText: string) => void;
};

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  loading = false, 
  username, 
  onPromptClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { translate } = useLanguageStore();
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const prevMessagesLengthRef = useRef<number>(messages.length);
  const prevSessionIdRef = useRef<string | null>(null);
  const prevLoadingRef = useRef<boolean>(loading);
  const scrollPositionRef = useRef<number>(0);
  const shouldScrollToBottomRef = useRef<boolean>(false);

  // Manually scroll to bottom - using a more direct approach
  const scrollToBottom = () => {
    if (containerRef.current) {
      // Force immediate scroll to bottom
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      
      // Double-check with a slight delay to ensure scroll happens after any rendering
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  // Save current scroll position
  const saveScrollPosition = () => {
    if (containerRef.current) {
      scrollPositionRef.current = containerRef.current.scrollTop;
    }
  };

  // Restore saved scroll position
  const restoreScrollPosition = () => {
    if (containerRef.current && !shouldScrollToBottomRef.current) {
      containerRef.current.scrollTop = scrollPositionRef.current;
    }
  };

  // Handle new messages or loading state changes
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessagesLengthRef.current;
    const loadingFinished = prevLoadingRef.current && !loading;
    const loadingStarted = !prevLoadingRef.current && loading;
    
    // Determine if we should scroll to bottom
    if (hasNewMessages || loadingFinished || loadingStarted) {
      shouldScrollToBottomRef.current = true;
    } else {
      // Otherwise, maintain scroll position
      shouldScrollToBottomRef.current = false;
      saveScrollPosition();
    }

    // Update refs for next comparison
    prevMessagesLengthRef.current = messages.length;
    prevLoadingRef.current = loading;
    
    // Handle scrolling after render
    if (shouldScrollToBottomRef.current) {
      // Use both immediate and delayed scroll to ensure it works
      scrollToBottom();
      
      // Reset the flag
      shouldScrollToBottomRef.current = false;
    } else {
      restoreScrollPosition();
    }
  }, [messages, loading]);

  // Reset tracking when session changes
  useEffect(() => {
    if (messages.length > 0) {
      const currentSessionId = messages[0].session_id;
      
      // If session changed, reset our tracking and scroll to bottom
      if (prevSessionIdRef.current !== currentSessionId) {
        prevMessagesLengthRef.current = 0;
        setNewMessageIds(new Set());
        prevSessionIdRef.current = currentSessionId;
        shouldScrollToBottomRef.current = true;
        
        // Scroll to bottom after render
        scrollToBottom();
      }
    } else if (messages.length === 0) {
      // Reset when there are no messages (new session created)
      prevMessagesLengthRef.current = 0;
      setNewMessageIds(new Set());
      prevSessionIdRef.current = null;
    }
  }, [messages]);

  // Track new messages for animation
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // Get the new message IDs
      const newIds = messages
        .slice(prevMessagesLengthRef.current)
        .map(msg => msg.id);
      
      // Add them to our Set of new message IDs
      setNewMessageIds(prev => {
        const updated = new Set(prev);
        newIds.forEach(id => updated.add(id));
        return updated;
      });
      
      // Clear the "new" status after animation completes
      const timer = setTimeout(() => {
        setNewMessageIds(prev => {
          const updated = new Set(prev);
          newIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 500); // Match this with the CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Add a dedicated effect to handle auto-scrolling when messages change
  useEffect(() => {
    // If we have messages and they've changed, check if we should scroll
    if (messages.length > 0) {
      // Check if we're already near the bottom
      const isNearBottom = () => {
        if (!containerRef.current) return false;
        
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // Consider "near bottom" if within 100px of the bottom
        return scrollHeight - scrollTop - clientHeight < 100;
      };
      
      // If we're already near the bottom or have new messages, scroll to bottom
      if (isNearBottom() || messages.length > prevMessagesLengthRef.current) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Add dedicated effect for loading indicator
  useEffect(() => {
    // Scroll to bottom when loading state changes (especially when it becomes true)
    if (loading !== prevLoadingRef.current) {
      // Small delay to ensure the loading indicator is rendered
      setTimeout(() => {
        scrollToBottom();
      }, 10);
    }
  }, [loading]);

  // Show the welcome screen when there are no messages (regardless of whether it's a new session)
  if (messages.length === 0 && !loading) {
    return (
      <WelcomeScreen 
        username={username} 
        onPromptClick={(promptText) => onPromptClick && onPromptClick(promptText)} 
      />
    );
  }

  // If there are messages
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 h-full"
      style={{ 
        overflowY: 'auto', 
        height: '100%',
        scrollBehavior: 'smooth',
        maxWidth: '100%'
      }}
      onScroll={() => saveScrollPosition()}
    >
      <div className="space-y-4 max-w-full w-full">
        {messages.map((message) => (
          <div key={message.id} className="w-full max-w-full overflow-hidden">
            <ChatMessage 
              message={message} 
              isNew={newMessageIds.has(message.id)}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start my-4">
            <div className="ai-thinking-indicator text-white rounded-full px-5 py-3 shadow-lg">
              <div className="flex items-center">
                <div className="mr-3 text-sm font-medium text-slate-200">{translate('chat.thinking')}</div>
                <div className="flex space-x-2">
                  <div className="dot dot-1"></div>
                  <div className="dot dot-2"></div>
                  <div className="dot dot-3"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatHistory;
