import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationAPI, Notification } from '../api/notifications';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    if (!userId) return;
    try { setLoading(true); const data = await notificationAPI.getUserNotifications(userId); setNotifications(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (userId) { fetchNotifications(); const interval = setInterval(fetchNotifications, 30000); return () => clearInterval(interval); }
  }, [userId]);

  useEffect(() => { if (showNotifications && userId) fetchNotifications(); }, [showNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) { await notificationAPI.markAsRead(notification.id); setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n)); }
      if (notification.link) { setShowNotifications(false); navigate(notification.link); }
    } catch { toast.error('Failed to open notification'); }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try { await notificationAPI.markAllAsRead(userId); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); toast.success('All marked as read'); }
    catch { toast.error('Failed'); }
  };

  const typeColors: Record<string, string> = {
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-info/15 text-info',
  };

  const getTimeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-muted-foreground hover:text-foreground focus-ring rounded-xl transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs font-bold text-destructive-foreground bg-destructive rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-xl border border-border z-20 max-h-[500px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-card-foreground">Notifications</h3>
                {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary-glow font-semibold">Mark all read</button>}
              </div>

              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="px-4 py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto" /></div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center"><Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-sm text-muted-foreground">No notifications yet</p></div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((n) => (
                      <div key={n.id} onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-3 hover:bg-muted cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-semibold text-card-foreground truncate">{n.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${typeColors[n.type] || typeColors.info}`}>{n.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{n.message}</p>
                            <p className="text-xs text-muted-foreground/70">{getTimeAgo(n.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-border">
                  <button onClick={() => setShowNotifications(false)} className="w-full text-center text-sm text-primary hover:text-primary-glow font-semibold py-1">Close</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
