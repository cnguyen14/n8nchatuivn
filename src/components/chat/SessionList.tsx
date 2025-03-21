import React, { useState } from 'react';
import { useLanguageStore } from '../../store/languageStore';
import { Session } from '../../lib/supabase';
import { Plus, Trash2, Edit, Check, X, MoreVertical, Trash, Settings } from 'lucide-react';
import Button from '../ui/Button';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';

interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onBatchDeleteSessions: (sessionIds: string[]) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onBatchDeleteSessions
}) => {
  const navigate = useNavigate();
  const { translate } = useLanguageStore();
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const { animationClass, handleClick } = useButtonAnimation();

  const handleStartEditing = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingSessionId && editingTitle.trim()) {
      onRenameSession(editingSessionId, editingTitle);
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      setSessionToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setSessionToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedSessions([]);
    setIsMenuOpen(false);
  };

  const toggleSessionSelection = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedSessions.length > 0) {
      setIsBatchDeleteModalOpen(true);
    }
  };

  const handleConfirmBatchDelete = () => {
    onBatchDeleteSessions(selectedSessions);
    setSelectedSessions([]);
    setIsSelectionMode(false);
    setIsBatchDeleteModalOpen(false);
  };

  const handleCancelBatchDelete = () => {
    setIsBatchDeleteModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Button
          onClick={onNewSession}
          variant="primary"
          className="w-full"
          leftIcon={<Plus size={16} />}
        >
          {translate('chat.newChat')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {sessions.length === 0 ? (
          <div className="text-center text-white/70 py-4">
            {translate('chat.noSessions')}
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group rounded-lg transition-colors ${
                  isSelectionMode
                    ? 'hover:bg-slate-700/70'
                    : session.id === currentSessionId
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-slate-700/70 text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center p-2">
                  {isSelectionMode ? (
                    <div
                      className={`flex-shrink-0 w-5 h-5 mr-2 border border-white/30 rounded flex items-center justify-center cursor-pointer ${animationClass}`}
                      onClick={(e) => {
                        handleClick(e);
                        toggleSessionSelection(session.id);
                      }}
                    >
                      {selectedSessions.includes(session.id) && (
                        <Check size={14} className="text-green-400" />
                      )}
                    </div>
                  ) : null}

                  {editingSessionId === session.id ? (
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="flex-1 bg-slate-600 text-white border border-slate-500 rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={(e) => {
                          handleClick(e);
                          handleSaveEdit();
                        }}
                        className={`ml-1 p-1 text-green-400 hover:text-green-300 ${animationClass}`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          handleClick(e);
                          handleCancelEdit();
                        }}
                        className={`p-1 text-red-400 hover:text-red-300 ${animationClass}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`flex-1 truncate cursor-pointer ${
                          !isSelectionMode ? 'py-1 px-2' : ''
                        } ${animationClass}`}
                        onClick={(e) => {
                          handleClick(e);
                          if (isSelectionMode) {
                            toggleSessionSelection(session.id);
                          } else {
                            onSelectSession(session.id);
                          }
                        }}
                      >
                        {session.title}
                      </div>

                      {!isSelectionMode && (
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              handleClick(e);
                              handleStartEditing(session.id, session.title);
                            }}
                            className={`p-1 text-white/70 hover:text-white ${animationClass}`}
                            title="Rename"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              handleClick(e);
                              handleDeleteClick(session.id);
                            }}
                            className={`p-1 text-white/70 hover:text-red-400 ${animationClass}`}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Settings and Delete buttons */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex justify-between items-center">
          {isSelectionMode ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleSelectionMode}
              >
                {translate('app.cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBatchDelete}
                disabled={selectedSessions.length === 0}
                leftIcon={<Trash size={14} />}
              >
                {translate('app.delete')} ({selectedSessions.length})
              </Button>
            </>
          ) : (
            <div className="flex justify-between w-full">
              {/* Settings button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={goToSettings}
                leftIcon={<Settings size={14} />}
              >
                {translate('settings.title')}
              </Button>
              
              {/* Delete sessions menu */}
              {sessions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      handleClick(e);
                      toggleMenu();
                    }}
                    className={`p-2 text-white/70 hover:text-white hover:bg-slate-700/50 rounded-md ${animationClass}`}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 w-48">
                      <button
                        onClick={(e) => {
                          handleClick(e);
                          toggleSelectionMode();
                        }}
                        className={`w-full text-left px-4 py-2 text-white/80 hover:bg-slate-700 hover:text-white ${animationClass}`}
                      >
                        {translate('app.delete')} {translate('chat.sessions')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        title={translate('app.delete')}
        message={translate('confirm.deleteSession')}
        confirmLabel={translate('app.delete')}
        cancelLabel={translate('app.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={isBatchDeleteModalOpen}
        title={translate('app.delete')}
        message={`Are you sure you want to delete ${selectedSessions.length} selected sessions?`}
        confirmLabel={translate('app.delete')}
        cancelLabel={translate('app.cancel')}
        onConfirm={handleConfirmBatchDelete}
        onCancel={handleCancelBatchDelete}
        variant="danger"
      />
    </div>
  );
};

export default SessionList;
