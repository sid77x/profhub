import { api } from './axios';

export interface Notification {
  id: string;
  user_id: string;
  user_type: 'professor' | 'student';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  link?: string;
  metadata?: {
    gig_id?: string;
    notification_type?: string;
    count?: number;
  };
  created_at: string;
}

export const notificationAPI = {
  // Get all notifications for a user
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (userId: string): Promise<number> => {
    const response = await api.get(`/notifications/${userId}/unread`);
    return response.data.unread_count;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<void> => {
    await api.put(`/notifications/${userId}/mark-all-read`);
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
