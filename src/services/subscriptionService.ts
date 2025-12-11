import { supabase } from '../lib/supabase';

// Tip tanımlamaları
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending' | 'suspended';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan: {
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: any;
    limits: any;
  };
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
  billing_cycle: BillingCycle;
  amount: number;
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  trial_end_date?: string;
  auto_renew: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  canceled_at?: string;
}

export interface SubscriptionPlanDetails {
  plan: SubscriptionPlan;
  name: string;
  description: string;
  features: string[];
  monthly_price: number;
  yearly_price: number;
  currency: string;
  max_properties?: number;
  max_users?: number;
  max_storage_gb?: number;
}

export interface PaymentHistory {
  id: string;
  subscription_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_date: string;
  invoice_url?: string;
  created_at: string;
}

export interface CreateSubscriptionData {
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  payment_method?: string;
  auto_renew?: boolean;
}

export interface UpdateSubscriptionData {
  plan?: SubscriptionPlan;
  billing_cycle?: BillingCycle;
  auto_renew?: boolean;
  payment_method?: string;
}

class SubscriptionService {
  // Mevcut aboneliği getir (izole)
  async getCurrentSubscription(): Promise<Subscription | null> {
    // İzolasyon: Sadece giriş yapan kullanıcının aboneliğini getir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id) // İzolasyon
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(error.message);
    }

    if (!data) return null;

    // Veritabanı yapısını UI'ın beklediği yapıya dönüştür
    const subscription: any = {
      ...data,
      amount: data.billing_cycle === 'monthly' ? data.plan.price_monthly : data.plan.price_yearly,
      end_date: data.next_billing_date,
      auto_renew: data.status === 'active',
      payment_method: 'Kredi Kartı'
    };

    return subscription;
  }

  // Abonelik oluştur
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Plan detaylarını al
    const planDetails = await this.getPlanDetails(subscriptionData.plan);
    const amount = subscriptionData.billing_cycle === 'monthly' 
      ? planDetails.monthly_price 
      : planDetails.yearly_price;

    // Başlangıç ve bitiş tarihlerini hesapla
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (subscriptionData.billing_cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: subscriptionData.plan,
        billing_cycle: subscriptionData.billing_cycle,
        amount,
        currency: 'TRY',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        next_billing_date: endDate.toISOString(),
        auto_renew: subscriptionData.auto_renew !== false,
        payment_method: subscriptionData.payment_method
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Aboneliği güncelle
  async updateSubscription(subscriptionData: UpdateSubscriptionData): Promise<Subscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Mevcut aboneliği bul
    const currentSubscription = await this.getCurrentSubscription();
    if (!currentSubscription) {
      throw new Error('Aktif abonelik bulunamadı');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', currentSubscription.id)
      .eq('user_id', user.id) // İzolasyon
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Aboneliği iptal et
  async cancelSubscription(reason?: string): Promise<Subscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const currentSubscription = await this.getCurrentSubscription();
    if (!currentSubscription) {
      throw new Error('Aktif abonelik bulunamadı');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', currentSubscription.id)
      .eq('user_id', user.id) // İzolasyon
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Aboneliği yeniden başlat
  async reactivateSubscription(): Promise<Subscription> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // İptal edilmiş aboneliği bul
    const { data: cancelledSubscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !cancelledSubscription) {
      throw new Error('İptal edilmiş abonelik bulunamadı');
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        auto_renew: true,
        cancelled_at: null,
        cancellation_reason: null
      })
      .eq('id', cancelledSubscription.id)
      .eq('user_id', user.id) // İzolasyon
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Plan detaylarını getir
  async getPlanDetails(plan: SubscriptionPlan): Promise<SubscriptionPlanDetails> {
    const plans: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
      free: {
        plan: 'free',
        name: 'Ücretsiz Plan',
        description: 'Başlangıç seviyesi için ideal',
        features: [
          '5 emlak ilanı',
          '10 müşteri kaydı',
          'Temel raporlama',
          '1 GB depolama'
        ],
        monthly_price: 0,
        yearly_price: 0,
        currency: 'TRY',
        max_properties: 5,
        max_users: 1,
        max_storage_gb: 1
      },
      basic: {
        plan: 'basic',
        name: 'Temel Plan',
        description: 'Küçük ofisler için',
        features: [
          '50 emlak ilanı',
          '100 müşteri kaydı',
          'Gelişmiş raporlama',
          '10 GB depolama',
          'E-posta desteği'
        ],
        monthly_price: 500,
        yearly_price: 5000,
        currency: 'TRY',
        max_properties: 50,
        max_users: 3,
        max_storage_gb: 10
      },
      premium: {
        plan: 'premium',
        name: 'Premium Plan',
        description: 'Orta ölçekli ofisler için',
        features: [
          'Sınırsız emlak ilanı',
          'Sınırsız müşteri kaydı',
          'Gelişmiş raporlama',
          '100 GB depolama',
          'Öncelikli destek',
          'API erişimi'
        ],
        monthly_price: 2500,
        yearly_price: 25000,
        currency: 'TRY',
        max_storage_gb: 100
      },
      enterprise: {
        plan: 'enterprise',
        name: 'Kurumsal Plan',
        description: 'Büyük ofisler için',
        features: [
          'Sınırsız her şey',
          'Özel raporlama',
          'Sınırsız depolama',
          '7/24 destek',
          'API erişimi',
          'Özel entegrasyonlar',
          'Eğitim ve danışmanlık'
        ],
        monthly_price: 10000,
        yearly_price: 100000,
        currency: 'TRY'
      }
    };

    return plans[plan];
  }

  // Tüm planları listele
  async getAllPlans(): Promise<SubscriptionPlanDetails[]> {
    const plans: SubscriptionPlan[] = ['free', 'basic', 'premium', 'enterprise'];
    return Promise.all(plans.map(plan => this.getPlanDetails(plan)));
  }

  // Ödeme geçmişini getir
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', user.id) // İzolasyon
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Ödeme kaydı oluştur
  async createPayment(subscriptionId: string, amount: number, paymentMethod: string): Promise<PaymentHistory> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        subscription_id: subscriptionId,
        user_id: user.id,
        amount,
        currency: 'TRY',
        status: 'completed',
        payment_method: paymentMethod,
        payment_date: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Abonelik durumunu kontrol et
  async checkSubscriptionStatus(): Promise<{
    isActive: boolean;
    plan: SubscriptionPlan;
    daysRemaining: number;
    needsRenewal: boolean;
  }> {
    const subscription = await this.getCurrentSubscription();

    if (!subscription) {
      return {
        isActive: false,
        plan: 'free',
        daysRemaining: 0,
        needsRenewal: false
      };
    }

    const endDate = new Date(subscription.end_date || '');
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isActive: subscription.status === 'active',
      plan: subscription.plan,
      daysRemaining: Math.max(0, daysRemaining),
      needsRenewal: daysRemaining <= 7 && subscription.auto_renew
    };
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
