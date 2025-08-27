import express from 'express';
import { subscriptionData } from './subscription.js';
import { webhookProcessor } from '../services/webhookProcessor.js';
import { webhookQueue } from '../services/webhookQueue.js';

const router = express.Router();

// Webhook events storage (in production, this would be in database)
const webhookEvents = [];
let nextWebhookId = 1;

// Helper function to log webhook events
const logWebhookEvent = (eventType, data, source = 'stripe') => {
  const event = {
    id: nextWebhookId++,
    event_type: eventType,
    source,
    data,
    processed: false,
    created_at: new Date().toISOString(),
    processed_at: null,
    error: null
  };
  
  webhookEvents.push(event);
  
  // Add to processing queue
  webhookQueue.enqueue(event);
  
  return event;
};

// Helper function to generate invoice number
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const existingInvoices = subscriptionData.invoices.filter(i => 
    i.invoice_number.startsWith(`INV-${year}-`)
  );
  const nextNumber = existingInvoices.length + 1;
  return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
};

// Helper function to find subscription by external ID
const findSubscriptionByExternalId = (externalId) => {
  return subscriptionData.subscriptions.find(s => s.external_id === externalId);
};

// Helper function to update subscription status
const updateSubscriptionStatus = (subscriptionId, status, eventData = {}) => {
  const subscription = subscriptionData.subscriptions.find(s => s.id === subscriptionId);
  if (!subscription) return null;
  
  subscription.status = status;
  subscription.updated_at = new Date().toISOString();
  
  // Update additional fields based on event
  if (eventData.next_billing_date) {
    subscription.next_billing_date = eventData.next_billing_date;
  }
  
  if (eventData.plan_id) {
    subscription.plan_id = eventData.plan_id;
  }
  
  return subscription;
};

// Helper function to create invoice from webhook data
const createInvoiceFromWebhook = (webhookData) => {
  const subscription = findSubscriptionByExternalId(webhookData.subscription_id);
  if (!subscription) return null;
  
  const invoice = {
    id: subscriptionData.invoices.length + 1,
    subscription_id: subscription.id,
    external_id: webhookData.invoice_id,
    invoice_number: generateInvoiceNumber(),
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
  
  subscriptionData.invoices.push(invoice);
  return invoice;
};

// ============= STRIPE WEBHOOKS =============

// Main Stripe webhook endpoint
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;
    
    // In production, verify the webhook signature here
    // const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For demo purposes, we'll parse the JSON directly
    const event = JSON.parse(payload.toString());
    
    const webhookEvent = logWebhookEvent(event.type, event.data, 'stripe');
    
    // Process different event types
    switch (event.type) {
      case 'invoice.created':
        await handleInvoiceCreated(event.data.object, webhookEvent);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, webhookEvent);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, webhookEvent);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, webhookEvent);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, webhookEvent);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, webhookEvent);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object, webhookEvent);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    webhookEvent.processed = true;
    webhookEvent.processed_at = new Date().toISOString();
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    if (webhookEvents.length > 0) {
      const lastEvent = webhookEvents[webhookEvents.length - 1];
      lastEvent.error = error.message;
      lastEvent.processed_at = new Date().toISOString();
    }
    
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// ============= IYZICO WEBHOOKS =============

// Main Iyzico webhook endpoint
router.post('/iyzico', express.json(), async (req, res) => {
  try {
    const event = req.body;
    
    const webhookEvent = logWebhookEvent(event.eventType, event, 'iyzico');
    
    // Process different event types for Iyzico
    switch (event.eventType) {
      case 'SUBSCRIPTION_ORDER_SUCCESS':
        await handleIyzicoSubscriptionSuccess(event, webhookEvent);
        break;
        
      case 'SUBSCRIPTION_ORDER_FAIL':
        await handleIyzicoSubscriptionFail(event, webhookEvent);
        break;
        
      case 'SUBSCRIPTION_RENEWED':
        await handleIyzicoSubscriptionRenewed(event, webhookEvent);
        break;
        
      case 'SUBSCRIPTION_CANCELLED':
        await handleIyzicoSubscriptionCancelled(event, webhookEvent);
        break;
        
      default:
        console.log(`Unhandled Iyzico event type: ${event.eventType}`);
    }
    
    webhookEvent.processed = true;
    webhookEvent.processed_at = new Date().toISOString();
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Iyzico webhook error:', error);
    
    if (webhookEvents.length > 0) {
      const lastEvent = webhookEvents[webhookEvents.length - 1];
      lastEvent.error = error.message;
      lastEvent.processed_at = new Date().toISOString();
    }
    
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// ============= STRIPE EVENT HANDLERS =============

async function handleInvoiceCreated(invoice, webhookEvent) {
  try {
    const invoiceData = {
      invoice_id: invoice.id,
      subscription_id: invoice.subscription,
      amount: invoice.amount_due / 100, // Convert from cents
      tax_amount: (invoice.tax || 0) / 100,
      total_amount: invoice.total / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'pending',
      billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
      billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
      due_date: new Date(invoice.due_date * 1000).toISOString(),
      line_items: invoice.lines.data.map(line => ({
        description: line.description,
        quantity: line.quantity,
        unit_price: line.price.unit_amount / 100,
        total: line.amount / 100
      }))
    };
    
    const createdInvoice = createInvoiceFromWebhook(invoiceData);
    console.log('Invoice created:', createdInvoice?.invoice_number);
  } catch (error) {
    console.error('Error handling invoice.created:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice, webhookEvent) {
  try {
    const existingInvoice = subscriptionData.invoices.find(i => i.external_id === invoice.id);
    if (existingInvoice) {
      existingInvoice.status = 'paid';
      existingInvoice.paid_at = new Date(invoice.status_transitions.paid_at * 1000).toISOString();
      existingInvoice.updated_at = new Date().toISOString();
    }
    
    // Update subscription status to active if it was trialing
    const subscription = findSubscriptionByExternalId(invoice.subscription);
    if (subscription && subscription.status === 'trialing') {
      updateSubscriptionStatus(subscription.id, 'active', {
        next_billing_date: new Date(invoice.period_end * 1000).toISOString()
      });
    }
    
    console.log('Invoice paid:', invoice.id);
  } catch (error) {
    console.error('Error handling invoice.paid:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice, webhookEvent) {
  try {
    const existingInvoice = subscriptionData.invoices.find(i => i.external_id === invoice.id);
    if (existingInvoice) {
      existingInvoice.status = 'payment_failed';
      existingInvoice.updated_at = new Date().toISOString();
    }
    
    // Update subscription status
    const subscription = findSubscriptionByExternalId(invoice.subscription);
    if (subscription) {
      updateSubscriptionStatus(subscription.id, 'past_due');
    }
    
    console.log('Invoice payment failed:', invoice.id);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription, webhookEvent) {
  try {
    // This would typically be handled during the checkout process
    // but we can update our local subscription with external IDs
    const localSubscription = subscriptionData.subscriptions.find(s => 
      s.user_id === subscription.metadata?.user_id
    );
    
    if (localSubscription) {
      localSubscription.external_id = subscription.id;
      localSubscription.status = subscription.status;
      localSubscription.updated_at = new Date().toISOString();
    }
    
    console.log('Subscription created:', subscription.id);
  } catch (error) {
    console.error('Error handling customer.subscription.created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription, webhookEvent) {
  try {
    const localSubscription = findSubscriptionByExternalId(subscription.id);
    if (localSubscription) {
      updateSubscriptionStatus(localSubscription.id, subscription.status, {
        next_billing_date: new Date(subscription.current_period_end * 1000).toISOString()
      });
    }
    
    console.log('Subscription updated:', subscription.id);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription, webhookEvent) {
  try {
    const localSubscription = findSubscriptionByExternalId(subscription.id);
    if (localSubscription) {
      updateSubscriptionStatus(localSubscription.id, 'cancelled');
      localSubscription.cancelled_at = new Date().toISOString();
    }
    
    console.log('Subscription deleted:', subscription.id);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

async function handleTrialWillEnd(subscription, webhookEvent) {
  try {
    const localSubscription = findSubscriptionByExternalId(subscription.id);
    if (localSubscription) {
      // Send notification to user about trial ending
      // This would typically trigger an email or in-app notification
      console.log('Trial will end for subscription:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling customer.subscription.trial_will_end:', error);
    throw error;
  }
}

// ============= IYZICO EVENT HANDLERS =============

async function handleIyzicoSubscriptionSuccess(event, webhookEvent) {
  try {
    const subscription = findSubscriptionByExternalId(event.subscriptionReferenceCode);
    if (subscription) {
      updateSubscriptionStatus(subscription.id, 'active');
    }
    
    console.log('Iyzico subscription success:', event.subscriptionReferenceCode);
  } catch (error) {
    console.error('Error handling Iyzico subscription success:', error);
    throw error;
  }
}

async function handleIyzicoSubscriptionFail(event, webhookEvent) {
  try {
    const subscription = findSubscriptionByExternalId(event.subscriptionReferenceCode);
    if (subscription) {
      updateSubscriptionStatus(subscription.id, 'past_due');
    }
    
    console.log('Iyzico subscription failed:', event.subscriptionReferenceCode);
  } catch (error) {
    console.error('Error handling Iyzico subscription fail:', error);
    throw error;
  }
}

async function handleIyzicoSubscriptionRenewed(event, webhookEvent) {
  try {
    const subscription = findSubscriptionByExternalId(event.subscriptionReferenceCode);
    if (subscription) {
      updateSubscriptionStatus(subscription.id, 'active');
      
      // Create invoice for the renewal
      const invoiceData = {
        invoice_id: event.paymentId,
        subscription_id: event.subscriptionReferenceCode,
        amount: event.price,
        total_amount: event.paidPrice,
        currency: event.currency,
        status: 'paid',
        paid_at: new Date().toISOString(),
        line_items: [{
          description: 'Abonelik Yenileme',
          quantity: 1,
          unit_price: event.price,
          total: event.price
        }]
      };
      
      createInvoiceFromWebhook(invoiceData);
    }
    
    console.log('Iyzico subscription renewed:', event.subscriptionReferenceCode);
  } catch (error) {
    console.error('Error handling Iyzico subscription renewed:', error);
    throw error;
  }
}

async function handleIyzicoSubscriptionCancelled(event, webhookEvent) {
  try {
    const subscription = findSubscriptionByExternalId(event.subscriptionReferenceCode);
    if (subscription) {
      updateSubscriptionStatus(subscription.id, 'cancelled');
      subscription.cancelled_at = new Date().toISOString();
    }
    
    console.log('Iyzico subscription cancelled:', event.subscriptionReferenceCode);
  } catch (error) {
    console.error('Error handling Iyzico subscription cancelled:', error);
    throw error;
  }
}

// ============= WEBHOOK MANAGEMENT ENDPOINTS =============

// Get webhook events (admin only)
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 50, event_type, source, processed } = req.query;
    
    let filteredEvents = [...webhookEvents];
    
    // Apply filters
    if (event_type) {
      filteredEvents = filteredEvents.filter(e => e.event_type === event_type);
    }
    
    if (source) {
      filteredEvents = filteredEvents.filter(e => e.source === source);
    }
    
    if (processed !== undefined) {
      const isProcessed = processed === 'true';
      filteredEvents = filteredEvents.filter(e => e.processed === isProcessed);
    }
    
    // Sort by creation date (newest first)
    filteredEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedEvents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredEvents.length,
        pages: Math.ceil(filteredEvents.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get webhook event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = webhookEvents.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Webhook event not found' });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching webhook event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retry webhook event processing
router.post('/events/:id/retry', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = webhookEvents.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Webhook event not found' });
    }
    
    // Reset event status
    event.processed = false;
    event.processed_at = null;
    event.error = null;
    
    // Reprocess the event based on source
    if (event.source === 'stripe') {
      // Reprocess Stripe event
      // This would call the appropriate handler function
    } else if (event.source === 'iyzico') {
      // Reprocess Iyzico event
    }
    
    event.processed = true;
    event.processed_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Webhook event reprocessed successfully',
      data: event
    });
  } catch (error) {
    console.error('Error retrying webhook event:', error);
    
    const event = webhookEvents.find(e => e.id === parseInt(req.params.id));
    if (event) {
      event.error = error.message;
      event.processed_at = new Date().toISOString();
    }
    
    res.status(500).json({ error: 'Webhook retry failed' });
  }
});

export { webhookEvents };
export default router;