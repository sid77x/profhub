import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi, ChatConversation, ChatMessage, getChatWebSocketUrl } from '../../api/chat';
import { useAuthStore } from '../../store/authStore';

const ChatRoom: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { userId, userType } = useAuthStore();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsReadyRef = useRef(false);

  const routePrefix = useMemo(() => (userType === 'professor' ? '/professor' : '/student'), [userType]);

  const loadConversations = async () => {
    if (!userId || !userType) return;
    try {
      setLoadingConversations(true);
      const data = await chatApi.getUserChats(userType, userId);
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!userId) return;
    try {
      setLoadingMessages(true);
      const data = await chatApi.getMessages(chatId, userId);
      setMessages(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!userId || !userType) {
      navigate('/login');
      return;
    }

    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [userId, userType]);

  useEffect(() => {
    if (conversationId) {
      const match = conversations.find((chat) => chat.id === conversationId);
      setActiveConversation(match || null);
      return;
    }

    setActiveConversation(conversations[0] || null);
    setMessages([]);
  }, [conversationId, conversations]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      return;
    }

    setMessages([]);
  }, [activeConversation?.id, userId]);

  useEffect(() => {
    if (!activeConversation?.id || !userId) {
      wsReadyRef.current = false;
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    wsReadyRef.current = false;
    const ws = new WebSocket(getChatWebSocketUrl(activeConversation.id, userId));
    wsRef.current = ws;

    ws.onopen = () => {
      wsReadyRef.current = true;
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'message' && payload.data) {
          const message = payload.data as ChatMessage;
          setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
          loadConversations();
        } else if (payload.type === 'error') {
          toast.error(payload.detail || 'Failed to send message');
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    ws.onerror = () => {
      wsReadyRef.current = false;
    };

    ws.onclose = () => {
      wsReadyRef.current = false;
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return () => {
      wsReadyRef.current = false;
      ws.close();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [activeConversation?.id, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !userId || !userType || !draft.trim()) return;

    const payload = {
      sender_id: userId,
      sender_type: userType,
      message: draft.trim(),
    };

    const ws = wsRef.current;
    if (ws && wsReadyRef.current && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      setDraft('');
      return;
    }

    try {
      const message = await chatApi.sendMessage(activeConversation.id, payload);
      setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
      setDraft('');
      loadConversations();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    }
  };

  const openConversation = (chatId: string) => {
    navigate(`${routePrefix}/chats/${chatId}`);
  };

  if (!userId || !userType) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Chats</h1>
        <p className="text-muted-foreground">Unlocked chats appear here after a professor accepts an application.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-card-foreground">Unlocked Chats</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{conversations.length}</span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loadingConversations ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-card-foreground mb-1">No chats unlocked yet</p>
                <p className="text-xs text-muted-foreground">Accepted gigs will show up here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((chat) => {
                  const active = activeConversation?.id === chat.id;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => openConversation(chat.id)}
                      className={`w-full text-left px-4 py-4 transition-colors ${active ? 'bg-primary/5' : 'hover:bg-muted'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                          {chat.other_participant_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-card-foreground truncate">{chat.other_participant_name}</p>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-success/15 text-success flex-shrink-0">
                              Unlocked
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">{chat.gig_title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {chat.last_message || 'Chat unlocked. Say hello.'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-lg flex flex-col min-h-[70vh] overflow-hidden">
          {activeConversation ? (
            <>
              <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Gig chat</p>
                  <h2 className="text-2xl font-extrabold text-card-foreground">{activeConversation.gig_title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeConversation.other_participant_type === 'professor' ? activeConversation.professor_name : activeConversation.student_name}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-background to-muted/20">
                {loadingMessages ? (
                  <div className="h-full min-h-[360px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full min-h-[360px] flex items-center justify-center text-center">
                    <div>
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-lg font-semibold text-foreground">Chat unlocked</p>
                      <p className="text-sm text-muted-foreground mt-1">Send the first message to start the conversation.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender_id === userId;
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-card-foreground'}`}>
                          <p className="text-xs font-semibold mb-1 opacity-80">{mine ? 'You' : message.sender_name}</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-border p-4 bg-card">
                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-input bg-muted px-4 py-3 text-foreground placeholder-muted-foreground focus-ring transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-glow transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <MessageSquare className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-2xl font-extrabold text-foreground mb-2">Select a chat</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Choose an unlocked chat from the list to see the conversation and continue talking with the professor or student.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
