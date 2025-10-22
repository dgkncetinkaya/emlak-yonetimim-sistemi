import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationUI, NotificationSettingsUI, CreateNotificationData } from '../types/notificationTypes';
import NotificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NotificationContextType {
  notifications: NotificationUI[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSettingsUI | null;
  addNotification: (notification: CreateNotificationData) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updateSettings: (settings: NotificationSettingsUI) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettingsUI | null>(null);
  const { user } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications and settings when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadSettings();
    } else {
      setNotifications([]);
      setSettings(null);
      setLoading(false);
    }
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    let notificationSubscription: RealtimeChannel;
    let updateSubscription: RealtimeChannel;

    const setupSubscriptions = () => {
      // Subscribe to new notifications
      notificationSubscription = NotificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
        }
      );

      // Subscribe to notification updates (read status changes)
      updateSubscription = NotificationService.subscribeToNotificationUpdates(
        user.id,
        (updatedNotification) => {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      );
    };

    setupSubscriptions();

    return () => {
      if (notificationSubscription) {
        notificationSubscription.unsubscribe();
      }
      if (updateSubscription) {
        updateSubscription.unsubscribe();
      }
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      const data = await NotificationService.getNotificationSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      // Set default settings on error
      setSettings(NotificationService.getDefaultSettings());
    }
  };

  const addNotification = async (notification: CreateNotificationData) => {
    try {
      const newNotification = await NotificationService.createNotification(notification);
      // Real-time subscription will handle adding to state
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      // Real-time subscription will handle state update
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await NotificationService.markAllAsRead(user.id);
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await NotificationService.deleteNotification(id);
      // Update local state immediately
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const updateSettings = async (newSettings: NotificationSettingsUI) => {
    if (!user?.id) return;
    
    try {
      await NotificationService.saveNotificationSettings(user.id, newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    updateSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};