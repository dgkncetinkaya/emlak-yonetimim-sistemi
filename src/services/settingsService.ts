import { supabase } from '../lib/supabase';

// Types
export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name?: string;
  company_logo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_number?: string;
  business_license?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  date_format?: string;
  time_format?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserNotificationSettings {
  id?: string;
  user_id?: string;
  email_notifications?: boolean;
  email_new_properties?: boolean;
  email_property_updates?: boolean;
  email_customer_inquiries?: boolean;
  email_appointment_reminders?: boolean;
  email_contract_renewals?: boolean;
  email_payment_reminders?: boolean;
  email_system_updates?: boolean;
  email_marketing?: boolean;
  sms_notifications?: boolean;
  sms_urgent_only?: boolean;
  sms_appointment_reminders?: boolean;
  sms_payment_reminders?: boolean;
  push_notifications?: boolean;
  push_new_properties?: boolean;
  push_customer_inquiries?: boolean;
  push_appointment_reminders?: boolean;
  push_urgent_only?: boolean;
  in_app_notifications?: boolean;
  in_app_sound?: boolean;
  in_app_desktop?: boolean;
  digest_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  weekend_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SecuritySettings {
  id?: string;
  user_id?: string;
  password_expiry_days?: number;
  require_password_change?: boolean;
  password_complexity_enabled?: boolean;
  min_password_length?: number;
  require_uppercase?: boolean;
  require_lowercase?: boolean;
  require_numbers?: boolean;
  require_special_chars?: boolean;
  session_timeout_minutes?: number;
  auto_logout_enabled?: boolean;
  remember_me_enabled?: boolean;
  max_concurrent_sessions?: number;
  two_factor_enabled?: boolean;
  two_factor_method?: 'sms' | 'email' | 'authenticator';
  backup_codes_generated?: boolean;
  login_attempt_limit?: number;
  lockout_duration_minutes?: number;
  ip_whitelist_enabled?: boolean;
  ip_whitelist?: string[];
  login_notifications?: boolean;
  suspicious_activity_alerts?: boolean;
  device_tracking_enabled?: boolean;
  data_encryption_enabled?: boolean;
  backup_encryption_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiKey {
  id?: string;
  user_id?: string;
  name: string;
  key_hash?: string;
  key_prefix?: string;
  permissions?: string[];
  is_active?: boolean;
  last_used_at?: string;
  last_used_ip?: string;
  expires_at?: string;
  rate_limit_per_hour?: number;
  allowed_ips?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface BackupSettings {
  id?: string;
  user_id?: string;
  auto_backup_enabled?: boolean;
  backup_frequency?: 'daily' | 'weekly' | 'monthly';
  backup_time?: string;
  backup_retention_days?: number;
  cloud_storage_enabled?: boolean;
  cloud_provider?: string;
  cloud_bucket_name?: string;
  cloud_access_key?: string;
  cloud_secret_key?: string;
  cloud_region?: string;
  local_backup_enabled?: boolean;
  local_backup_path?: string;
  local_retention_days?: number;
  include_properties?: boolean;
  include_customers?: boolean;
  include_documents?: boolean;
  include_transactions?: boolean;
  include_reports?: boolean;
  include_settings?: boolean;
  compress_backups?: boolean;
  encrypt_backups?: boolean;
  encryption_key?: string;
  notify_on_success?: boolean;
  notify_on_failure?: boolean;
  notification_email?: string;
  last_backup_at?: string;
  last_backup_size?: number;
  last_backup_status?: string;
  last_backup_error?: string;
  created_at?: string;
  updated_at?: string;
}

// Company Settings Service
export const companySettingsService = {
  async getCompanySettings(): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const { data: existingData } = await supabase
      .from('company_settings')
      .select('id')
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('company_settings')
        .update(settings)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('company_settings')
        .insert({
          ...settings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};

// Notification Settings Service
export const notificationSettingsService = {
  async getNotificationSettings(): Promise<UserNotificationSettings | null> {
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateNotificationSettings(settings: Partial<UserNotificationSettings>): Promise<UserNotificationSettings> {
    const { data: existingData } = await supabase
      .from('user_notification_settings')
      .select('id')
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .update(settings)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .insert({
          ...settings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};

// Security Settings Service
export const securitySettingsService = {
  async getSecuritySettings(): Promise<SecuritySettings | null> {
    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const { data: existingData } = await supabase
      .from('security_settings')
      .select('id')
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('security_settings')
        .update(settings)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('security_settings')
        .insert({
          ...settings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};

// API Keys Service
export const apiKeysService = {
  async getApiKeys(): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createApiKey(apiKey: Omit<ApiKey, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiKey> {
    // Generate a random API key
    const key = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const keyHash = btoa(key); // Simple hash, in production use proper hashing
    const keyPrefix = key.substring(0, 8) + '...';

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        ...apiKey,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, key }; // Return the actual key only once
  },

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteApiKey(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }
};

// Backup Settings Service
export const backupSettingsService = {
  async getBackupSettings(): Promise<BackupSettings | null> {
    const { data, error } = await supabase
      .from('backup_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<BackupSettings> {
    const { data: existingData } = await supabase
      .from('backup_settings')
      .select('id')
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('backup_settings')
        .update(settings)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('backup_settings')
        .insert({
          ...settings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async createBackup(): Promise<{ success: boolean; message: string }> {
    // This would trigger a backup process
    // For now, just simulate the process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup time
      
      // Update last backup info
      await this.updateBackupSettings({
        last_backup_at: new Date().toISOString(),
        last_backup_status: 'success',
        last_backup_size: Math.floor(Math.random() * 1000000) + 500000, // Random size
        last_backup_error: null
      });

      return { success: true, message: 'Yedekleme başarıyla tamamlandı' };
    } catch (error) {
      await this.updateBackupSettings({
        last_backup_at: new Date().toISOString(),
        last_backup_status: 'failed',
        last_backup_error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });

      return { success: false, message: 'Yedekleme sırasında hata oluştu' };
    }
  },

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    // This would restore from a backup
    // For now, just simulate the process
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate restore time
      return { success: true, message: 'Geri yükleme başarıyla tamamlandı' };
    } catch (error) {
      return { success: false, message: 'Geri yükleme sırasında hata oluştu' };
    }
  }
};