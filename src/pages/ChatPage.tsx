import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useWebhookStore } from '../store/webhookStore';
import { usePromptStore } from '../store/promptStore';
import { useLanguageStore } from '../store/languageStore';
import SessionList from '../components/chat/SessionList';
import ChatHistory from '../components/chat/ChatHistory';
import ChatInput from '../components/chat/ChatInput';
import Footer from '../components/ui/Footer';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { translate } = useLanguageStore();
  const { 
    messages, 
    sessions, 
    currentSession, 
    sendMessage, 
    loadUserSessions, 
    loadChatHistory, 
    createNewSession,
    updateSessionTitle,
    deleteSession,
    batchDeleteSessions,
    receiveSystemMessage
  } = useChatStore();
  
  const { testWebhook, loadWebhookSettings } = useWebhookStore();
  const { loadPrompts } = usePromptStore();
  const [isThinking, setIsThinking] = useState(false);
  const [isNewSession, setIsNewSession] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserSessions(user.id);
    loadWebhookSettings(user.id);
    loadPrompts(user.id);
  }, [user, navigate, loadUserSessions, loadWebhookSettings, loadPrompts]);

  useEffect(() => {
    if (currentSession) {
      setIsNewSession(messages.length === 0);
    }
  }, [currentSession?.id, messages.length]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user) return;
    
    let sessionToUse = currentSession;
    if (!sessionToUse) {
      await createNewSession(user.id);
      sessionToUse = useChatStore.getState().currentSession;
      
      if (!sessionToUse) {
        console.error("Failed to create a new session");
        return;
      }
      
      setIsNewSession(true);
    } else {
      setIsNewSession(false);
    }
    
    await sendMessage(content, user.id);
    
    try {
      setIsThinking(true);
      
      const webhookResponse = await testWebhook(content, sessionToUse.id, user);
      
      setIsThinking(false);
      
      if (webhookResponse) {
        let responseContent = '';
        
        if (typeof webhookResponse === 'string') {
          responseContent = webhookResponse;
        } else if (webhookResponse.output) {
          responseContent = webhookResponse.output;
        } else if (webhookResponse.message) {
          responseContent = webhookResponse.message;
        } else if (webhookResponse.response) {
          responseContent = webhookResponse.response;
        } else if (webhookResponse.text) {
          responseContent = webhookResponse.text;
        } else if (webhookResponse.content) {
          responseContent = webhookResponse.content;
        } else {
          responseContent = JSON.stringify(webhookResponse, null, 2);
        }
        
        await receiveSystemMessage(responseContent);
      }
    } catch (error) {
      setIsThinking(false);
      console.error("Failed to send to webhook:", error);
    }
  }, [user, currentSession, createNewSession, sendMessage, testWebhook, receiveSystemMessage]);

  const handleSelectSession = useCallback((sessionId: string) => {
    loadChatHistory(sessionId);
  }, [loadChatHistory]);

  const handleNewSession = useCallback(async () => {
    if (user) {
      await createNewSession(user.id);
      setIsNewSession(true);
    }
  }, [user, createNewSession]);

  const handleRenameSession = useCallback((sessionId: string, newTitle: string) => {
    updateSessionTitle(sessionId, newTitle);
  }, [updateSessionTitle]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    deleteSession(sessionId);
  }, [deleteSession]);

  const handleBatchDeleteSessions = useCallback((sessionIds: string[]) => {
    batchDeleteSessions(sessionIds);
  }, [batchDeleteSessions]);

  const handlePromptClick = useCallback((promptText: string) => {
    handleSendMessage(promptText);
  }, [handleSendMessage]);

  const getUserDisplayName = useCallback(() => {
    if (!user) return null;
    return (user as any).username || (user.email ? user.email.split('@')[0] : null);
  }, [user]);

  const chatHistoryProps = useMemo(() => ({
    messages,
    loading: isThinking,
    username: getUserDisplayName(),
    onPromptClick: handlePromptClick
  }), [messages, isThinking, getUserDisplayName, handlePromptClick]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-500">
      <div className="flex-1 flex justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-6xl h-[85vh] flex overflow-hidden rounded-2xl shadow-2xl">
          {/* Sidebar */}
          <div className="w-64 bg-slate-800/90 backdrop-blur-md flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="mr-2">{translate('chat.sessions')}</span>
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <SessionList 
                sessions={sessions} 
                currentSessionId={currentSession?.id || null} 
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onRenameSession={handleRenameSession}
                onDeleteSession={handleDeleteSession}
                onBatchDeleteSessions={handleBatchDeleteSessions}
              />
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="flex-1 flex flex-col bg-slate-700/80 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {currentSession?.title || translate('chat.newChat')}
              </h2>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatHistory {...chatHistoryProps} />
            </div>
            
            <div className="p-4 border-t border-white/10">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isThinking}
                centered={isNewSession && messages.length === 0}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer className="bg-slate-800/30 backdrop-blur-sm" />
    </div>
  );
};

export default ChatPage;
