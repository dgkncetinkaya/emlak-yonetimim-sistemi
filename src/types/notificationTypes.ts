export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType = 
  | 'document_created'
  | 'document_signed'
  | 'document_expired'
  | 'appointment_reminder'
  | 'contract_renewal'
  | 'payment_due'
  | 'system_update'
  | 'user_action';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  read_at?: string;
  related_document_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

// UI-friendly interface for components
export interface NotificationUI {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  userId?: string;
  relatedDocumentId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  document_created: 'Belge Oluşturuldu',
  document_signed: 'Belge İmzalandı',
  document_expired: 'Belge Süresi Doldu',
  appointment_reminder: 'Randevu Hatırlatması',
  contract_renewal: 'Sözleşme Yenileme',
  payment_due: 'Ödeme Vadesi',
  system_update: 'Sistem Güncellemesi',
  user_action: 'Kullanıcı İşlemi'
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
};

export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red'
};

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  document_created: 'green',
  document_signed: 'blue',
  document_expired: 'red',
  appointment_reminder: 'purple',
  contract_renewal: 'orange',
  payment_due: 'yellow',
  system_update: 'cyan',
  user_action: 'teal'
};

export interface NotificationSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_types: {
    [K in NotificationType]: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  created_at?: string;
  updated_at?: string;
}

// UI-friendly interface for components
export interface NotificationSettingsUI {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    [K in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

// Database template interface
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  template: string;
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Notification creation interface
export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  related_document_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}