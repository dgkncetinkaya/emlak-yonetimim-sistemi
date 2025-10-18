import { webhookEvents } from '../routes/webhooks.js';
import { subscriptionData } from '../routes/subscription.js';

// Webhook event processor service
class WebhookProcessor {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.maxRetryDelay = 30000; // 30 seconds
  }

  // Process webhook event with retry logic
  async processEvent(eventId) {
    const event = webhookEvents.find(e => e.id === eventId);
    if (!event) {
      throw new Error(`Webhook event ${eventId} not found`);
    }

    if (event.processed) {
      return { success: true, message: 'Event already processed' };
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < this.retryAttempts) {
      try {
        await this.executeEventHandler(event);
        
        // Mark as processed
        event.processed = true;
        event.processed_at = new Date().toISOString();
        event.error = null;
        
        return { success: true, message: 'Event processed successfully' };
      } catch (error) {
        attempt++;
        lastError = error;
        
        console.error(`Webhook processing attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryAttempts) {
          const delay = Math.min(this.retryDelay * Math.pow(2, attempt - 1), this.maxRetryDelay);
          await this.sleep(delay);
        }
      }
    }

    // Mark as failed after all retries
    event.error = lastError.message;
    event.processed_at = new Date().toISOString();
    
    throw new Error(`Failed to process webhook event after ${this.retryAttempts} attempts: ${lastError.message}`);
  }

  // Execute the appropriate handler based on event type
  async executeEventHandler(event) {
    const { event_type, data, source } = event;

    switch (source) {
      case 'stripe':
        return await this.handleStripeEvent(event_type, data);
      case 'iyzico':
        return await this.handleIyzicoEvent(event_type, data);
      default:
        throw new Error(`Unknown webhook source: ${source}`);
    }
  }

  // Handle Stripe webhook events
  async handleStripeEvent(eventType, data) {
    switch (eventType) {
      case 'invoice.created':
        return await this.handleInvoiceCreated(data);
      case 'invoice.paid':
        return await this.handleInvoicePaid(data);
      case 'invoice.payment_failed':
        return await this.handleInvoicePaymentFailed(data);
      case 'customer.subscription.created':
        return await this.handleSubscriptionCreated(data);
      case 'customer.subscription.updated':
        return await this.handleSubscriptionUpdated(data);
      case 'customer.subscription.deleted':
        return await this.handleSubscriptionDeleted(data);
      case 'customer.subscription.trial_will_end':
        return await this.handleTrialWillEnd(data);
      case 'payment_method.attached':
        return await this.handlePaymentMethodAttached(data);
      case 'payment_method.detached':
        return await this.handlePaymentMethodDetached(data);
      default:
        console.log(`Unhandled Stripe event type: ${eventType}`);
        return { success: true, message: 'Event type not handled' };
    }
  }

  // Handle Iyzico webhook events
  async handleIyzicoEvent(eventType, data) {
    switch (eventType) {
      case 'subscription.success':
        return await this.handleIyzicoSubscriptionSuccess(data);
      case 'subscription.fail':
        return await this.handleIyzicoSubscriptionFail(data);
      case 'subscription.renewed':
        return await this.handleIyzicoSubscriptionRenewed(data);
      case 'subscription.cancelled':
        return await this.handleIyzicoSubscriptionCancelled(data);
      default:
        console.log(`Unhandled Iyzico event type: ${eventType}`);
        return { success: true, message: 'Event type not handled' };
    }
  }

  // Invoice created handler
  async handleInvoiceCreated(invoiceData) {
    const subscription = this.findSubscriptionByExternalId(invoiceData.subscription);
    if (!subscription) {
      throw new Error(`Subscription not found: ${invoiceData.subscription}`);
    }

    const invoice = {
      id: this.generateId(),
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      invoice_number: this.generateInvoiceNumber(),
      external_id: invoiceData.id,
      amount: invoiceData.amount_due / 100, // Convert from cents
      currency: invoiceData.currency,
      status: 'pending',
      due_date: new Date(invoiceData.due_date * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pdf_url: invoiceData.hosted_invoice_url,
      line_items: invoiceData.lines.data.map(item => ({
        description: item.description,
        amount: item.amount / 100,
        quantity: item.quantity,
        unit_price: item.price ? item.price.unit_amount / 100 : 0
      }))
    };

    subscriptionData.invoices.push(invoice);
    
    // Send invoice notification
    await this.sendInvoiceNotification(invoice, 'created');
    
    return { success: true, invoice };
  }

  // Invoice paid handler
  async handleInvoicePaid(invoiceData) {
    const invoice = subscriptionData.invoices.find(i => i.external_id === invoiceData.id);
    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceData.id}`);
    }

    invoice.status = 'paid';
    invoice.paid_at = new Date().toISOString();
    invoice.updated_at = new Date().toISOString();

    // Update subscription status if needed
    const subscription = subscriptionData.subscriptions.find(s => s.id === invoice.subscription_id);
    if (subscription && subscription.status === 'past_due') {
      subscription.status = 'active';
      subscription.updated_at = new Date().toISOString();
    }

    // Send payment confirmation
    await this.sendInvoiceNotification(invoice, 'paid');
    
    return { success: true, invoice };
  }

  // Invoice payment failed handler
  async handleInvoicePaymentFailed(invoiceData) {
    const invoice = subscriptionData.invoices.find(i => i.external_id === invoiceData.id);
    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceData.id}`);
    }

    invoice.status = 'payment_failed';
    invoice.updated_at = new Date().toISOString();

    // Update subscription status
    const subscription = subscriptionData.subscriptions.find(s => s.id === invoice.subscription_id);
    if (subscription) {
      subscription.status = 'past_due';
      subscription.updated_at = new Date().toISOString();
    }

    // Trigger dunning process
    await this.triggerDunningProcess(subscription, invoice);
    
    return { success: true, invoice };
  }

  // Subscription created handler
  async handleSubscriptionCreated(subscriptionData) {
    // This is typically handled during the checkout process
    // But we can update any missing information here
    return { success: true, message: 'Subscription created event processed' };
  }

  // Subscription updated handler
  async handleSubscriptionUpdated(stripeSubscription) {
    const subscription = this.findSubscriptionByExternalId(stripeSubscription.id);
    if (!subscription) {
      throw new Error(`Subscription not found: ${stripeSubscription.id}`);
    }

    // Update subscription details
    subscription.status = stripeSubscription.status;
    subscription.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
    subscription.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
    subscription.updated_at = new Date().toISOString();

    // Handle plan changes
    if (stripeSubscription.items && stripeSubscription.items.data.length > 0) {
      const priceId = stripeSubscription.items.data[0].price.id;
      const plan = subscriptionData.plans.find(p => p.stripe_price_id === priceId);
      if (plan) {
        subscription.plan_id = plan.id;
      }
    }

    return { success: true, subscription };
  }

  // Subscription deleted handler
  async handleSubscriptionDeleted(stripeSubscription) {
    const subscription = this.findSubscriptionByExternalId(stripeSubscription.id);
    if (!subscription) {
      throw new Error(`Subscription not found: ${stripeSubscription.id}`);
    }

    subscription.status = 'canceled';
    subscription.canceled_at = new Date().toISOString();
    subscription.updated_at = new Date().toISOString();

    // Send cancellation notification
    await this.sendSubscriptionNotification(subscription, 'canceled');
    
    return { success: true, subscription };
  }

  // Trial will end handler
  async handleTrialWillEnd(stripeSubscription) {
    const subscription = this.findSubscriptionByExternalId(stripeSubscription.id);
    if (!subscription) {
      throw new Error(`Subscription not found: ${stripeSubscription.id}`);
    }

    // Send trial ending notification
    await this.sendSubscriptionNotification(subscription, 'trial_ending');
    
    return { success: true, subscription };
  }

  // Payment method attached handler
  async handlePaymentMethodAttached(paymentMethodData) {
    // Update user's payment methods
    const customerId = paymentMethodData.customer;
    const user = subscriptionData.users?.find(u => u.stripe_customer_id === customerId);
    
    if (user) {
      const paymentMethod = {
        id: this.generateId(),
        user_id: user.id,
        external_id: paymentMethodData.id,
        type: paymentMethodData.type,
        card: paymentMethodData.card ? {
          brand: paymentMethodData.card.brand,
          last4: paymentMethodData.card.last4,
          exp_month: paymentMethodData.card.exp_month,
          exp_year: paymentMethodData.card.exp_year
        } : null,
        is_default: false,
        created_at: new Date().toISOString()
      };
      
      if (!subscriptionData.paymentMethods) {
        subscriptionData.paymentMethods = [];
      }
      subscriptionData.paymentMethods.push(paymentMethod);
    }
    
    return { success: true, message: 'Payment method attached' };
  }

  // Payment method detached handler
  async handlePaymentMethodDetached(paymentMethodData) {
    if (subscriptionData.paymentMethods) {
      const index = subscriptionData.paymentMethods.findIndex(pm => pm.external_id === paymentMethodData.id);
      if (index > -1) {
        subscriptionData.paymentMethods.splice(index, 1);
      }
    }
    
    return { success: true, message: 'Payment method detached' };
  }

  // Iyzico handlers
  async handleIyzicoSubscriptionSuccess(data) {
    // Handle successful Iyzico subscription payment
    return { success: true, message: 'Iyzico subscription success processed' };
  }

  async handleIyzicoSubscriptionFail(data) {
    // Handle failed Iyzico subscription payment
    return { success: true, message: 'Iyzico subscription failure processed' };
  }

  async handleIyzicoSubscriptionRenewed(data) {
    // Handle Iyzico subscription renewal
    return { success: true, message: 'Iyzico subscription renewal processed' };
  }

  async handleIyzicoSubscriptionCancelled(data) {
    // Handle Iyzico subscription cancellation
    return { success: true, message: 'Iyzico subscription cancellation processed' };
  }

  // Notification services
  async sendInvoiceNotification(invoice, type) {
    console.log(`Sending ${type} notification for invoice ${invoice.invoice_number}`);
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // await emailService.sendInvoiceNotification(invoice, type);
  }

  async sendSubscriptionNotification(subscription, type) {
    console.log(`Sending ${type} notification for subscription ${subscription.id}`);
    // In production, integrate with email service
    // await emailService.sendSubscriptionNotification(subscription, type);
  }

  // Dunning process
  async triggerDunningProcess(subscription, invoice) {
    console.log(`Triggering dunning process for subscription ${subscription.id}`);
    
    // In production, this would:
    // 1. Send payment failure notification
    // 2. Schedule retry attempts
    // 3. Update subscription status based on dunning rules
    // 4. Eventually suspend/cancel if payment continues to fail
    
    // For now, just log the event
    const dunningEvent = {
      subscription_id: subscription.id,
      invoice_id: invoice.id,
      attempt: 1,
      next_attempt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      created_at: new Date().toISOString()
    };
    
    if (!subscriptionData.dunningEvents) {
      subscriptionData.dunningEvents = [];
    }
    subscriptionData.dunningEvents.push(dunningEvent);
  }

  // Helper methods
  findSubscriptionByExternalId(externalId) {
    return subscriptionData.subscriptions.find(s => s.external_id === externalId);
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const existingInvoices = subscriptionData.invoices.filter(i => 
      i.invoice_number.startsWith(`INV-${year}-`)
    );
    const nextNumber = existingInvoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch process pending events
  async processPendingEvents() {
    const pendingEvents = webhookEvents.filter(e => !e.processed && !e.error);
    
    console.log(`Processing ${pendingEvents.length} pending webhook events`);
    
    const results = [];
    for (const event of pendingEvents) {
      try {
        const result = await this.processEvent(event.id);
        results.push({ eventId: event.id, success: true, result });
      } catch (error) {
        results.push({ eventId: event.id, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get webhook statistics
  getWebhookStats() {
    const total = webhookEvents.length;
    const processed = webhookEvents.filter(e => e.processed).length;
    const failed = webhookEvents.filter(e => e.error).length;
    const pending = total - processed - failed;
    
    return {
      total,
      processed,
      failed,
      pending,
      success_rate: total > 0 ? ((processed / total) * 100).toFixed(2) : 0
    };
  }
}

// Export singleton instance
export const webhookProcessor = new WebhookProcessor();
export default WebhookProcessor;