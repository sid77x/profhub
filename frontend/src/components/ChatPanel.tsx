import React, { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { chatApi, ChatConversation } from '../api/chat';
import { useAuthStore } from '../store/authStore';

const ChatPanel: React.FC = () => {
  const navigate = useNavigate();
  const { userId, userType } = useAuthStore();
  const [showChats, setShowChats] = useState(false);
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = async () => {
    if (!userId || !userType) return;
    try {
      setLoading(true);
      const data = await chatApi.getUserChats(userType, userId);
      setChats(data);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && userType) {
      fetchChats();
      const interval = setInterval(fetchChats, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [userId, userType]);

  useEffect(() => {
    if (showChats && userId) fetchChats();
  }, [showChats]);

  if (!userId || !userType) {
    return null;
  }

  if (!loading && chats.length === 0) {
    return null;
  }

  const openChat = (chatId: string) => {
    if (!userType) return;
    setShowChats(false);
    navigate(`/${userType}/chats/${chatId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowChats(!showChats)}
        className="relative p-2 text-muted-foreground hover:text-foreground focus-ring rounded-xl transition-colors"
        aria-label="Open chats"
      >
        <MessageSquare className="w-5 h-5" />
        {chats.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 text-xs font-bold text-primary-foreground bg-primary rounded-full flex items-center justify-center">
            {chats.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showChats && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowChats(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-xl border border-border z-20 max-h-[500px] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">Chats</h3>
                <button onClick={() => setShowChats(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" />
                  </div>
                ) : chats.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No unlocked chats yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => openChat(chat.id)}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                            {chat.other_participant_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-card-foreground truncate">{chat.gig_title}</p>
                              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-success/15 text-success flex-shrink-0">
                                Unlocked
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{chat.other_participant_name}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                              {chat.last_message || 'Chat unlocked. Say hello.'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {chats.length > 0 && (
                <div className="px-4 py-2 border-t border-border">
                  <button
                    onClick={() => {
                      if (!userType) {
                        toast.error('Unable to open chats');
                        return;
                      }
                      setShowChats(false);
                      navigate(`/${userType}/chats`);
                    }}
                    className="w-full text-center text-sm text-primary hover:text-primary-glow font-semibold py-1"
                  >
                    Open chat inbox
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPanel;
