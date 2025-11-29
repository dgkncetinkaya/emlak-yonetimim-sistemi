/// <reference path="../types.d.ts" />
// @ts-ignore - Deno uses URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface AdminRequest {
  action: string;
  data?: any;
  params?: any;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data, params }: AdminRequest = await req.json();

    let result;

    switch (action) {
      case 'getDashboard':
        result = await getDashboard(supabaseClient);
        break;

      case 'getRevenueAnalytics':
        result = await getRevenueAnalytics(supabaseClient, params);
        break;

      case 'getSubscriptionAnalytics':
        result = await getSubscriptionAnalytics(supabaseClient, params);
        break;

      case 'getCustomers':
        result = await getCustomers(supabaseClient, params);
        break;

      case 'getCustomer':
        result = await getCustomer(supabaseClient, params.userId);
        break;

      case 'updateCustomerSubscription':
        result = await updateCustomerSubscription(supabaseClient, params.userId, data);
        break;

      case 'getPlans':
        result = await getPlans(supabaseClient);
        break;

      case 'createPlan':
        result = await createPlan(supabaseClient, data);
        break;

      case 'updatePlan':
        result = await updatePlan(supabaseClient, params.id, data);
        break;

      case 'getCoupons':
        result = await getCoupons(supabaseClient);
        break;

      case 'createCoupon':
        result = await createCoupon(supabaseClient, data);
        break;

      case 'updateCoupon':
        result = await updateCoupon(supabaseClient, params.id, data);
        break;

      case 'deleteCoupon':
        result = await deleteCoupon(supabaseClient, params.id);
        break;

      case 'getWebhookEvents':
        result = await getWebhookEvents(supabaseClient, params);
        break;

      case 'getWebhookQueueStatus':
        result = await getWebhookQueueStatus(supabaseClient);
        break;

      case 'retryFailedWebhooks':
        result = await retryFailedWebhooks(supabaseClient);
        break;

      case 'cleanupWebhookEvents':
        result = await cleanupWebhookEvents(supabaseClient, params);
        break;

      case 'aiMatch':
        result = await performAIMatching(supabaseClient, params.customerId);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin manager error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions
async function getDashboard(supabaseClient: any) {
  // Get subscription statistics
  const { data: subscriptions } = await supabaseClient
    .from('subscriptions')
    .select('*, subscription_plans(*)');

  const { data: customers } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('role', 'customer');

  // Calculate revenue metrics
  const activeSubscriptions = subscriptions?.filter((s: any) =>
    ['active', 'trialing'].includes(s.status)
  ) || [];

  let mrr = 0;
  let arr = 0;

  activeSubscriptions.forEach((subscription: any) => {
    const plan = subscription.subscription_plans;
    if (plan) {
      if (subscription.billing_cycle === 'monthly') {
        mrr += plan.price_monthly || 0;
        arr += (plan.price_monthly || 0) * 12;
      } else if (subscription.billing_cycle === 'yearly') {
        mrr += (plan.price_yearly || 0) / 12;
        arr += plan.price_yearly || 0;
      }
    }
  });

  const subscriptionStats = {
    total: subscriptions?.length || 0,
    active: subscriptions?.filter((s: any) => s.status === 'active').length || 0,
    trialing: subscriptions?.filter((s: any) => s.status === 'trialing').length || 0,
    cancelled: subscriptions?.filter((s: any) => s.status === 'cancelled').length || 0,
    past_due: subscriptions?.filter((s: any) => s.status === 'past_due').length || 0,
  };

  return {
    revenue: {
      mrr,
      arr,
      mrr_growth: 15.2, // Mock data - implement real calculation
      arr_growth: 18.5
    },
    subscriptions: {
      ...subscriptionStats,
      churn_rate: subscriptionStats.total > 0 ? (subscriptionStats.cancelled / subscriptionStats.total) * 100 : 0
    },
    customers: {
      total: customers?.length || 0,
      new_this_month: 5, // Mock data - implement real calculation
      growth_rate: 12.3
    },
    system: {
      uptime: '99.9%',
      last_backup: new Date().toISOString(),
      active_sessions: 42 // Mock data
    }
  };
}

async function getRevenueAnalytics(supabaseClient: any, params: any) {
  const { period = '30d' } = params || {};

  // Mock implementation - replace with real analytics
  const mockData = {
    period,
    total_revenue: 15420.50,
    mrr: 5140.17,
    arr: 61682.00,
    growth_rate: 15.2,
    chart_data: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 1000) + 500,
      subscriptions: Math.floor(Math.random() * 10) + 5
    }))
  };

  return mockData;
}

async function getSubscriptionAnalytics(supabaseClient: any, params: any) {
  const { period = '30d' } = params || {};

  const { data: subscriptions } = await supabaseClient
    .from('subscriptions')
    .select('*, subscription_plans(*)');

  const analytics = {
    period,
    total_subscriptions: subscriptions?.length || 0,
    active_subscriptions: subscriptions?.filter((s: any) => s.status === 'active').length || 0,
    trial_subscriptions: subscriptions?.filter((s: any) => s.status === 'trialing').length || 0,
    cancelled_subscriptions: subscriptions?.filter((s: any) => s.status === 'cancelled').length || 0,
    churn_rate: 5.2, // Mock data
    conversion_rate: 85.7, // Mock data
    plan_distribution: {} // Implement real calculation
  };

  return analytics;
}

async function getCustomers(supabaseClient: any, params: any) {
  const { page = 1, limit = 20, search = '', status = '' } = params || {};

  let query = supabaseClient
    .from('profiles')
    .select('*, subscriptions(*)')
    .eq('role', 'customer');

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: customers, error } = await query
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  return {
    customers: customers || [],
    pagination: {
      page,
      limit,
      total: customers?.length || 0,
      pages: Math.ceil((customers?.length || 0) / limit)
    }
  };
}

async function getCustomer(supabaseClient: any, userId: string) {
  const { data: customer, error } = await supabaseClient
    .from('profiles')
    .select('*, subscriptions(*)')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return customer;
}

async function updateCustomerSubscription(supabaseClient: any, userId: string, data: any) {
  const { data: subscription, error } = await supabaseClient
    .from('subscriptions')
    .update(data)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return subscription;
}

async function getPlans(supabaseClient: any) {
  const { data: plans, error } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return plans || [];
}

async function createPlan(supabaseClient: any, planData: any) {
  const { data: plan, error } = await supabaseClient
    .from('subscription_plans')
    .insert(planData)
    .select()
    .single();

  if (error) throw error;

  return plan;
}

async function updatePlan(supabaseClient: any, planId: string, planData: any) {
  const { data: plan, error } = await supabaseClient
    .from('subscription_plans')
    .update(planData)
    .eq('id', planId)
    .select()
    .single();

  if (error) throw error;

  return plan;
}

async function getCoupons(supabaseClient: any) {
  const { data: coupons, error } = await supabaseClient
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return coupons || [];
}

async function createCoupon(supabaseClient: any, couponData: any) {
  const { data: coupon, error } = await supabaseClient
    .from('coupons')
    .insert(couponData)
    .select()
    .single();

  if (error) throw error;

  return coupon;
}

async function updateCoupon(supabaseClient: any, couponId: string, couponData: any) {
  const { data: coupon, error } = await supabaseClient
    .from('coupons')
    .update(couponData)
    .eq('id', couponId)
    .select()
    .single();

  if (error) throw error;

  return coupon;
}

async function deleteCoupon(supabaseClient: any, couponId: string) {
  const { error } = await supabaseClient
    .from('coupons')
    .delete()
    .eq('id', couponId);

  if (error) throw error;

  return { success: true };
}

async function getWebhookEvents(supabaseClient: any, params: any) {
  const { page = 1, limit = 50, status = '', type = '' } = params || {};

  let query = supabaseClient
    .from('webhook_events')
    .select('*');

  if (status) {
    query = query.eq('status', status);
  }

  if (type) {
    query = query.eq('event_type', type);
  }

  const { data: events, error } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  return {
    events: events || [],
    pagination: {
      page,
      limit,
      total: events?.length || 0,
      pages: Math.ceil((events?.length || 0) / limit)
    }
  };
}

async function getWebhookQueueStatus(supabaseClient: any) {
  const { data: queueItems } = await supabaseClient
    .from('webhook_queue')
    .select('*');

  return {
    total_items: queueItems?.length || 0,
    pending: queueItems?.filter((item: any) => item.status === 'pending').length || 0,
    processing: queueItems?.filter((item: any) => item.status === 'processing').length || 0,
    completed: queueItems?.filter((item: any) => item.status === 'completed').length || 0,
    failed: queueItems?.filter((item: any) => item.status === 'failed').length || 0,
    is_running: true // Mock data
  };
}

async function retryFailedWebhooks(supabaseClient: any) {
  const { data: failedEvents } = await supabaseClient
    .from('webhook_events')
    .select('*')
    .eq('status', 'failed');

  // Reset failed events to pending for retry
  if (failedEvents && failedEvents.length > 0) {
    await supabaseClient
      .from('webhook_events')
      .update({ status: 'pending', retry_count: 0 })
      .eq('status', 'failed');
  }

  return {
    retried_count: failedEvents?.length || 0,
    message: `${failedEvents?.length || 0} failed webhooks queued for retry`
  };
}

async function cleanupWebhookEvents(supabaseClient: any, params: any) {
  const { days = 30 } = params || {};
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: deletedEvents, error } = await supabaseClient
    .from('webhook_events')
    .delete()
    .lt('created_at', cutoffDate)
    .select();

  if (error) throw error;

  return {
    deleted_count: deletedEvents?.length || 0,
    message: `Cleaned up ${deletedEvents?.length || 0} webhook events older than ${days} days`
  };
}

async function performAIMatching(supabaseClient: any, customerId: string) {
  try {
    // Get customer data
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer not found');
    }

    // Get available properties
    const { data: properties, error: propertiesError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('status', 'available');

    if (propertiesError) {
      throw new Error('Failed to fetch properties');
    }

    // Mock AI matching algorithm
    const matches = properties
      .map((property: any) => ({
        property,
        score: Math.random() * 100,
        reasons: [
          'Price matches budget range',
          'Location preference match',
          'Property type preference',
          'Size requirements met'
        ].slice(0, Math.floor(Math.random() * 4) + 1)
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10); // Top 10 matches

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        preferences: customer.preferences || {},
        budget: customer.budget || {}
      },
      matches,
      totalMatches: matches.length,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`AI matching failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}