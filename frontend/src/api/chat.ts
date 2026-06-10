import { api } from './axios';

const WS_BASE_URL = 'http://localhost:8000'.replace(/^http/, 'ws');

export interface ChatConversation {
  id: string;
  conversation_key: string;
  gig_id: string;
  gig_title: string;
  professor_id: string;
  professor_name: string;
  student_id: string;
  student_name: string;
  application_id: string;
  unlocked: boolean;
  last_message?: string | null;
  last_message_at?: string | null;
  created_at: string;
  other_participant_id: string;
  other_participant_name: string;
  other_participant_type: 'professor' | 'student';
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'professor' | 'student';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface ChatMessageCreate {
  sender_id: string;
  sender_type: 'professor' | 'student';
  message: string;
}

export const getChatWebSocketUrl = (conversationId: string, userId: string): string => {
  const params = new URLSearchParams({ user_id: userId });
  return `${WS_BASE_URL}/ws/chat/${conversationId}?${params.toString()}`;
};

export const chatApi = {
  getUserChats: async (userType: 'professor' | 'student', userId: string): Promise<ChatConversation[]> => {
    const response = await api.get(`/chats/${userType}/${userId}`);
    return response.data;
  },

  getConversation: async (conversationId: string, userId: string): Promise<ChatConversation> => {
    const response = await api.get(`/chat-conversations/${conversationId}`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  getMessages: async (conversationId: string, userId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/chat-conversations/${conversationId}/messages`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  sendMessage: async (conversationId: string, payload: ChatMessageCreate): Promise<ChatMessage> => {
    const response = await api.post(`/chat-conversations/${conversationId}/messages`, payload);
    return response.data;
  },
};
