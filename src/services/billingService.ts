import { supabase } from '../lib/supabase';

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
  billing_cycle: 'monthly' | 'yearly';
  seats: number;
  start_date: string;
  next_billing_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  canceled_at?: string;
  paused_at?: string;
  addons: any[];
  plan?: SubscriptionPlan;
  usage?: UsageTracking[];
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  provider: 'stripe' | 'iyzico';
  provider_payment_method_id: string;
  type: 'card' | 'bank_account';
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  bank_name?: string;
  bank_account_last4?: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  id: string;
  user_id: string;
  company_name?: string;
  tax_id?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
  description?: string;
  line_items: InvoiceLineItem[];
  billing_period_start?: string;
  billing_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  period_start?: string;
  period_end?: string;
}

export interface UsageTracking {
  id: string;
  subscription_id: string;
  feature: string;
  usage_count: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency?: string;
  max_redemptions?: number;
  times_redeemed: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applies_to: 'all' | 'specific_plans';
  plan_ids?: string[];
}

class BillingService {
  private async callEdgeFunction(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };

    // Add additional headers if provided
    if (options.headers) {
      const additionalHeaders = options.headers as { [key: string]: string };
      Object.assign(headers, additionalHeaders);
    }

    const method = (options.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') || 'GET';

    const response = await supabase.functions.invoke('billing-manager', {
      body: options.body,
      headers,
      method,
    });

    if (response.error) {
      throw new Error(response.error.message || 'Edge function call failed');
    }

    return response.data;
  }

  // Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.callEdgeFunction('plans');
    return response.data;
  }

  async getPlan(planId: string): Promise<SubscriptionPlan> {
    const plans = await this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }
    return plan;
  }

  // Subscriptions
  async getSubscription(): Promise<Subscription> {
    const response = await this.callEdgeFunction('subscription');
    return response.data;
  }

  async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const response = await this.callEdgeFunction('subscription', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
    return response.data;
  }

  async updateSubscription(updateData: Partial<Subscription>): Promise<Subscription> {
    const response = await this.callEdgeFunction('subscription', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  }

  async cancelSubscription(): Promise<Subscription> {
    const response = await this.callEdgeFunction('subscription', {
      method: 'DELETE',
    });
    return response.data;
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.callEdgeFunction('payment-methods');
    return response.data;
  }

  async addPaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const response = await this.callEdgeFunction('payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
    return response.data;
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await this.callEdgeFunction(`payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  // Billing Address
  async getBillingAddress(): Promise<BillingAddress> {
    const response = await this.callEdgeFunction('billing-address');
    return response.data;
  }

  async updateBillingAddress(addressData: Partial<BillingAddress>): Promise<BillingAddress> {
    const response = await this.callEdgeFunction('billing-address', {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
    return response.data;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await this.callEdgeFunction('invoices');
    return response.data;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.callEdgeFunction(`invoices/${invoiceId}`);
    return response.data;
  }

  // Usage Tracking
  async getUsage(): Promise<UsageTracking[]> {
    const response = await this.callEdgeFunction('usage');
    return response.data;
  }

  async updateUsage(feature: string, increment: number = 1): Promise<UsageTracking> {
    const response = await this.callEdgeFunction('usage', {
      method: 'POST',
      body: JSON.stringify({ feature, increment }),
    });
    return response.data;
  }

  // Coupons
  async validateCoupon(code: string): Promise<Coupon> {
    const response = await this.callEdgeFunction('coupons', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response.data;
  }

  // Utility methods
  async checkSubscriptionLimit(feature: string, requestedCount: number = 1): Promise<boolean> {
    try {
      const subscription = await this.getSubscription();
      const usage = await this.getUsage();
      
      if (!subscription.plan) {
        return false;
      }

      const limit = subscription.plan.limits[feature];
      if (limit === -1) {
        return true; // Unlimited
      }

      const currentUsage = usage.find(u => u.feature === feature)?.usage_count || 0;
      return (currentUsage + requestedCount) <= limit;
    } catch (error) {
      console.error('Error checking subscription limit:', error);
      return false;
    }
  }

  async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    canceledSubscriptions: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
  }> {
    // This would typically be an admin-only endpoint
    // For now, return mock data or implement based on your needs
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      canceledSubscriptions: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
    };
  }
}

export const billingService = new BillingService();