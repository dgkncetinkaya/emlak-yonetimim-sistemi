/// <reference path="../types.d.ts" />
// @ts-ignore - Deno uses URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface WebhookEvent {
  id?: string;
  event_type: string;
  source: string;
  data: any;
  status: string;
  retry_count?: number;
  created_at?: string;
  processed_at?: string;
  error?: string;
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

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (path) {
      case 'stripe':
        return await handleStripeWebhook(req, supabaseClient);

      case 'iyzico':
        return await handleIyzicoWebhook(req, supabaseClient);

      case 'events':
        return await handleWebhookEvents(req, supabaseClient);

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid webhook endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleStripeWebhook(req: Request, supabaseClient: any) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook event
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log webhook event
    const webhookEvent = await logWebhookEvent(event.type, event.data, 'stripe', supabaseClient);

    // Process webhook based on event type
    switch (event.type) {
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, webhookEvent, supabaseClient);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object, webhookEvent, supabaseClient);
        break;

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Mark webhook as processed
    await supabaseClient
      .from('webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', webhookEvent.id);

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stripe webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleIyzicoWebhook(req: Request, supabaseClient: any) {
  try {
    const event = await req.json();

    // Log webhook event
    const webhookEvent = await logWebhookEvent(event.eventType, event, 'iyzico', supabaseClient);

    // Process webhook based on event type
    switch (event.eventType) {
      case 'SUBSCRIPTION_ORDER_SUCCESS':
        await handleIyzicoSubscriptionSuccess(event, webhookEvent, supabaseClient);
        break;

      case 'SUBSCRIPTION_ORDER_FAIL':
        await handleIyzicoSubscriptionFail(event, webhookEvent, supabaseClient);
        break;

      case 'SUBSCRIPTION_RENEWED':
        await handleIyzicoSubscriptionRenewed(event, webhookEvent, supabaseClient);
        break;

      case 'SUBSCRIPTION_CANCELLED':
        await handleIyzicoSubscriptionCancelled(event, webhookEvent, supabaseClient);
        break;

      default:
        console.log(`Unhandled Iyzico event type: ${event.eventType}`);
    }

    // Mark webhook as processed
    await supabaseClient
      .from('webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', webhookEvent.id);

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Iyzico webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleWebhookEvents(req: Request, supabaseClient: any) {
  const url = new URL(req.url);
  const method = req.method;

  if (method === 'GET') {
    // Get webhook events with pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');

    let query = supabaseClient
      .from('webhook_events')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (source) {
      query = query.eq('source', source);
    }

    const { data: events, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        events: events || [],
        pagination: {
          page,
          limit,
          total: events?.length || 0,
          pages: Math.ceil((events?.length || 0) / limit)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
async function logWebhookEvent(eventType: string, data: any, source: string, supabaseClient: any): Promise<WebhookEvent> {
  const event: WebhookEvent = {
    event_type: eventType,
    source,
    data,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString()
  };

  const { data: savedEvent, error } = await supabaseClient
    .from('webhook_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;

  return savedEvent;
}

async function generateInvoiceNumber(supabaseClient: any): Promise<string> {
  const year = new Date().getFullYear();

  const { data: existingInvoices } = await supabaseClient
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `INV-${year}-%`);

  const nextNumber = (existingInvoices?.length || 0) + 1;
  return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

async function findSubscriptionByExternalId(externalId: string, supabaseClient: any) {
  const { data: subscription } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('external_id', externalId)
    .single();

  return subscription;
}

async function updateSubscriptionStatus(subscriptionId: string, status: string, eventData: any, supabaseClient: any) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (eventData.next_billing_date) {
    updateData.next_billing_date = eventData.next_billing_date;
  }

  if (eventData.plan_id) {
    updateData.plan_id = eventData.plan_id;
  }

  const { data: subscription, error } = await supabaseClient
    .from('subscriptions')
    .update(updateData)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;

  return subscription;
}

async function createInvoiceFromWebhook(webhookData: any, supabaseClient: any) {
  const subscription = await findSubscriptionByExternalId(webhookData.subscription_id, supabaseClient);
  if (!subscription) return null;

  const invoiceNumber = await generateInvoiceNumber(supabaseClient);

  const invoice = {
    subscription_id: subscription.id,
    external_id: webhookData.invoice_id,
    invoice_number: invoiceNumber,
    status: webhookData.status || 'pending',
    amount: webhookData.amount || 0,
    tax_amount: webhookData.tax_amount || 0,
    total_amount: webhookData.total_amount || webhookData.amount || 0,
    currency: webhookData.currency || 'TRY',
    billing_period_start: webhookData.billing_period_start,
    billing_period_end: webhookData.billing_period_end,
    due_date: webhookData.due_date,
    paid_at: webhookData.paid_at || null,
    line_items: webhookData.line_items || [],
    payment_method: webhookData.payment_method || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: savedInvoice, error } = await supabaseClient
    .from('invoices')
    .insert(invoice)
    .select()
    .single();

  if (error) throw error;

  return savedInvoice;
}

// Stripe event handlers
async function handleInvoiceCreated(invoice: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing invoice.created event:', invoice.id);

  await createInvoiceFromWebhook({
    invoice_id: invoice.id,
    subscription_id: invoice.subscription,
    status: 'pending',
    amount: invoice.amount_due / 100, // Convert from cents
    tax_amount: invoice.tax / 100,
    total_amount: invoice.total / 100,
    currency: invoice.currency.toUpperCase(),
    billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
    billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
    due_date: new Date(invoice.due_date * 1000).toISOString(),
    line_items: invoice.lines?.data || []
  }, supabaseClient);
}

async function handleInvoicePaid(invoice: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing invoice.payment_succeeded event:', invoice.id);

  // Update invoice status
  await supabaseClient
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('external_id', invoice.id);

  // Update subscription status to active
  const subscription = await findSubscriptionByExternalId(invoice.subscription, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'active', {
      next_billing_date: new Date(invoice.period_end * 1000).toISOString()
    }, supabaseClient);
  }
}

async function handleInvoicePaymentFailed(invoice: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing invoice.payment_failed event:', invoice.id);

  // Update invoice status
  await supabaseClient
    .from('invoices')
    .update({
      status: 'payment_failed',
      updated_at: new Date().toISOString()
    })
    .eq('external_id', invoice.id);

  // Update subscription status to past_due
  const subscription = await findSubscriptionByExternalId(invoice.subscription, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'past_due', {}, supabaseClient);
  }
}

async function handleSubscriptionCreated(subscription: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing customer.subscription.created event:', subscription.id);

  // Find or create subscription record
  const existingSubscription = await findSubscriptionByExternalId(subscription.id, supabaseClient);

  if (!existingSubscription) {
    // Create new subscription record
    await supabaseClient
      .from('subscriptions')
      .insert({
        external_id: subscription.id,
        user_id: subscription.customer, // This should be mapped to actual user ID
        status: subscription.status,
        billing_cycle: subscription.items.data[0]?.price?.recurring?.interval || 'monthly',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  }
}

async function handleSubscriptionUpdated(subscription: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing customer.subscription.updated event:', subscription.id);

  const existingSubscription = await findSubscriptionByExternalId(subscription.id, supabaseClient);
  if (existingSubscription) {
    await updateSubscriptionStatus(existingSubscription.id, subscription.status, {
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
    }, supabaseClient);
  }
}

async function handleSubscriptionDeleted(subscription: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing customer.subscription.deleted event:', subscription.id);

  const existingSubscription = await findSubscriptionByExternalId(subscription.id, supabaseClient);
  if (existingSubscription) {
    await updateSubscriptionStatus(existingSubscription.id, 'cancelled', {}, supabaseClient);
  }
}

async function handleTrialWillEnd(subscription: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing customer.subscription.trial_will_end event:', subscription.id);

  // Send notification to user about trial ending
  // This could trigger an email or in-app notification
}

// Iyzico event handlers
async function handleIyzicoSubscriptionSuccess(event: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing Iyzico subscription success:', event.subscriptionReferenceCode);

  const subscription = await findSubscriptionByExternalId(event.subscriptionReferenceCode, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'active', {}, supabaseClient);
  }
}

async function handleIyzicoSubscriptionFail(event: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing Iyzico subscription fail:', event.subscriptionReferenceCode);

  const subscription = await findSubscriptionByExternalId(event.subscriptionReferenceCode, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'payment_failed', {}, supabaseClient);
  }
}

async function handleIyzicoSubscriptionRenewed(event: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing Iyzico subscription renewed:', event.subscriptionReferenceCode);

  const subscription = await findSubscriptionByExternalId(event.subscriptionReferenceCode, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'active', {
      next_billing_date: event.nextPaymentDate
    }, supabaseClient);

    // Create invoice for the renewal
    await createInvoiceFromWebhook({
      invoice_id: event.paymentId,
      subscription_id: event.subscriptionReferenceCode,
      status: 'paid',
      amount: event.price,
      total_amount: event.paidPrice,
      currency: event.currency,
      paid_at: new Date().toISOString()
    }, supabaseClient);
  }
}

async function handleIyzicoSubscriptionCancelled(event: any, webhookEvent: WebhookEvent, supabaseClient: any) {
  console.log('Processing Iyzico subscription cancelled:', event.subscriptionReferenceCode);

  const subscription = await findSubscriptionByExternalId(event.subscriptionReferenceCode, supabaseClient);
  if (subscription) {
    await updateSubscriptionStatus(subscription.id, 'cancelled', {}, supabaseClient);
  }
}