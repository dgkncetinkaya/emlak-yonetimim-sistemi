import { supabase } from '../lib/supabase';
import { 
  Notification, 
  NotificationUI,
  NotificationSettings, 
  NotificationSettingsUI,
  NotificationTemplate,
  CreateNotificationData,
  NotificationType,
  NotificationPriority 
} from '../types/notificationTypes';

export class NotificationService {
  // Convert database notification to UI format
  private static toUIFormat(notification: Notification): NotificationUI {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at),
      userId: notification.user_id,
      relatedDocumentId: notification.related_document_id,
      actionUrl: notification.action_url,
      metadata: notification.metadata
    };
  }

  // Convert UI settings to database format
  private static toDBSettingsFormat(settings: NotificationSettingsUI, userId: string): Omit<NotificationSettings, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      email_notifications: settings.emailNotifications,
      sms_notifications: settings.smsNotifications,
      push_notifications: settings.pushNotifications,
      notification_types: settings.notificationTypes,
      quiet_hours: {
        enabled: settings.quietHours.enabled,
        start: settings.quietHours.start,
        end: settings.quietHours.end
      }
    };
  }

  // Convert database settings to UI format
  private static toUISettingsFormat(settings: NotificationSettings): NotificationSettingsUI {
    return {
      emailNotifications: settings.email_notifications,
      smsNotifications: settings.sms_notifications,
      pushNotifications: settings.push_notifications,
      notificationTypes: settings.notification_types,
      quietHours: {
        enabled: settings.quiet_hours.enabled,
        start: settings.quiet_hours.start,
        end: settings.quiet_hours.end
      }
    };
  }

  // Get notifications for a user
  static async getNotifications(userId: string, limit = 50, offset = 0): Promise<NotificationUI[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data?.map(this.toUIFormat) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Create a new notification
  static async createNotification(data: CreateNotificationData): Promise<NotificationUI> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || 'medium',
          related_document_id: data.related_document_id,
          action_url: data.action_url,
          metadata: data.metadata
        })
        .select()
        .single();

      if (error) throw error;

      return this.toUIFormat(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification settings for a user
  static async getNotificationSettings(userId: string): Promise<NotificationSettingsUI> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // Return default settings if none exist
        return this.getDefaultSettings();
      }

      return this.toUISettingsFormat(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  }

  // Save notification settings for a user
  static async saveNotificationSettings(userId: string, settings: NotificationSettingsUI): Promise<void> {
    try {
      const dbSettings = this.toDBSettingsFormat(settings, userId);

      const { error } = await supabase
        .from('notification_settings')
        .upsert(dbSettings, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  // Get default notification settings
  static getDefaultSettings(): NotificationSettingsUI {
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationTypes: {
        'document_created': true,
        'document_signed': true,
        'document_expired': true,
        'appointment_reminder': true,
        'contract_renewal': true,
        'payment_due': true,
        'system_update': true,
        'user_action': true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, callback: (notification: NotificationUI) => void) {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = this.toUIFormat(payload.new as Notification);
          callback(notification);
        }
      )
      .subscribe();

    return subscription;
  }

  // Subscribe to notification updates (read status changes)
  static subscribeToNotificationUpdates(userId: string, callback: (notification: NotificationUI) => void) {
    const subscription = supabase
      .channel('notification_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = this.toUIFormat(payload.new as Notification);
          callback(notification);
        }
      )
      .subscribe();

    return subscription;
  }

  // Get notification templates
  static async getNotificationTemplates(type?: NotificationType): Promise<NotificationTemplate[]> {
    try {
      let query = supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  }

  // Send notification using template
  static async sendNotificationFromTemplate(
    userId: string,
    templateId: string,
    variables: Record<string, string> = {},
    options: {
      relatedDocumentId?: string;
      actionUrl?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<NotificationUI> {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (templateError) throw templateError;

      // Replace variables in template
      let message = template.template;
      let title = template.subject || '';

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        message = message.replace(new RegExp(placeholder, 'g'), value);
        title = title.replace(new RegExp(placeholder, 'g'), value);
      });

      // Create notification
      return await this.createNotification({
        user_id: userId,
        title: title || `${template.type} bildirimi`,
        message,
        type: template.type,
        priority: 'medium',
        related_document_id: options.relatedDocumentId,
        action_url: options.actionUrl,
        metadata: options.metadata
      });
    } catch (error) {
      console.error('Error sending notification from template:', error);
      throw error;
    }
  }
}

export default NotificationService;