import { supabase } from '../lib/supabase';

export interface WebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  provider: 'stripe' | 'iyzico';
  data: any;
  processed: boolean;
  status: 'success' | 'failed' | 'pending';
  retry_count: number;
  last_retry_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface WebhookQueueItem {
  id: string;
  event_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

class WebhookService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-processor`;
  }

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };
  }

  // Webhook olaylarını getir
  async getWebhookEvents(limit = 50, offset = 0): Promise<WebhookEvent[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/events?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      throw error;
    }
  }

  // Webhook olayını yeniden dene
  async retryWebhookEvent(eventId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/retry`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ event_id: eventId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error retrying webhook event:', error);
      throw error;
    }
  }

  // Webhook kuyruğu durumunu getir
  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/queue/status`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching queue status:', error);
      throw error;
    }
  }

  // Webhook konfigürasyonunu getir
  async getWebhookConfig(): Promise<WebhookConfig[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .order('key');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching webhook config:', error);
      throw error;
    }
  }

  // Webhook konfigürasyonunu güncelle
  async updateWebhookConfig(key: string, value: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('webhook_config')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating webhook config:', error);
      throw error;
    }
  }

  // Webhook istatistiklerini getir
  async getWebhookStats(): Promise<{
    total_events: number;
    processed_events: number;
    failed_events: number;
    success_rate: number;
    events_by_type: { [key: string]: number };
    events_by_provider: { [key: string]: number };
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService();