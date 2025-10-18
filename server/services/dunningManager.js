import { subscriptionData } from '../routes/subscription.js';

/**
 * Dunning Management System
 * Handles failed payments, retry logic, and subscription lifecycle management
 */
class DunningManager {
  constructor() {
    this.dunningEvents = [];
    this.retrySchedule = [1, 3, 7, 14]; // Days to retry after failed payment
    this.maxRetries = 4;
  }

  /**
   * Create a new dunning event for failed payment
   */
  createDunningEvent(subscriptionId, invoiceId, failureReason) {
    const event = {
      id: this.generateId(),
      subscription_id: subscriptionId,
      invoice_id: invoiceId,
      failure_reason: failureReason,
      retry_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      next_retry_date: this.calculateNextRetryDate(0),
      notifications_sent: [],
      updated_at: new Date().toISOString()
    };

    this.dunningEvents.push(event);
    this.sendFailureNotification(event);
    
    return event;
  }

  /**
   * Process retry for a dunning event
   */
  async processRetry(eventId) {
    const event = this.dunningEvents.find(e => e.id === eventId);
    if (!event || event.status !== 'active') {
      return { success: false, message: 'Event not found or not active' };
    }

    event.retry_count++;
    event.updated_at = new Date().toISOString();

    try {
      // Simulate payment retry
      const paymentResult = await this.retryPayment(event.subscription_id, event.invoice_id);
      
      if (paymentResult.success) {
        event.status = 'resolved';
        event.resolved_at = new Date().toISOString();
        this.sendSuccessNotification(event);
        return { success: true, message: 'Payment successful' };
      } else {
        // Payment failed again
        if (event.retry_count >= this.maxRetries) {
          return this.handleMaxRetriesReached(event);
        } else {
          event.next_retry_date = this.calculateNextRetryDate(event.retry_count);
          this.sendRetryNotification(event);
          return { success: false, message: 'Payment failed, will retry', nextRetry: event.next_retry_date };
        }
      }
    } catch (error) {
      console.error('Error processing retry:', error);
      return { success: false, message: 'Error processing payment retry' };
    }
  }

  /**
   * Handle when max retries are reached
   */
  handleMaxRetriesReached(event) {
    event.status = 'failed';
    event.failed_at = new Date().toISOString();

    // Find and update subscription
    const subscription = subscriptionData.subscriptions.find(
      sub => sub.id === event.subscription_id
    );

    if (subscription) {
      subscription.status = 'past_due';
      subscription.updated_at = new Date().toISOString();
      
      // Schedule subscription cancellation after grace period
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7 days grace period
      
      subscription.grace_period_end = gracePeriodEnd.toISOString();
      
      this.sendFinalNotification(event);
      this.scheduleSubscriptionCancellation(subscription.id, gracePeriodEnd);
    }

    return { 
      success: false, 
      message: 'Max retries reached, subscription moved to past_due status',
      gracePeriodEnd: subscription?.grace_period_end
    };
  }

  /**
   * Simulate payment retry
   */
  async retryPayment(subscriptionId, invoiceId) {
    // Simulate payment processing
    const success = Math.random() > 0.3; // 70% success rate for simulation
    
    if (success) {
      // Update invoice status
      const invoice = subscriptionData.invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        invoice.status = 'paid';
        invoice.paid_at = new Date().toISOString();
        invoice.updated_at = new Date().toISOString();
      }

      // Update subscription status
      const subscription = subscriptionData.subscriptions.find(sub => sub.id === subscriptionId);
      if (subscription && subscription.status === 'past_due') {
        subscription.status = 'active';
        subscription.updated_at = new Date().toISOString();
        delete subscription.grace_period_end;
      }
    }

    return { 
      success, 
      payment_intent_id: success ? `pi_${this.generateId()}` : null,
      failure_reason: success ? null : 'Card declined'
    };
  }

  /**
   * Calculate next retry date based on retry count
   */
  calculateNextRetryDate(retryCount) {
    if (retryCount >= this.retrySchedule.length) {
      return null;
    }

    const daysToAdd = this.retrySchedule[retryCount];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate.toISOString();
  }

  /**
   * Send failure notification
   */
  sendFailureNotification(event) {
    const notification = {
      type: 'payment_failed',
      sent_at: new Date().toISOString(),
      channel: 'email',
      template: 'payment_failure_initial'
    };

    event.notifications_sent.push(notification);
    console.log(`Payment failure notification sent for subscription ${event.subscription_id}`);
  }

  /**
   * Send retry notification
   */
  sendRetryNotification(event) {
    const notification = {
      type: 'payment_retry',
      sent_at: new Date().toISOString(),
      channel: 'email',
      template: 'payment_retry_reminder',
      retry_count: event.retry_count
    };

    event.notifications_sent.push(notification);
    console.log(`Payment retry notification sent for subscription ${event.subscription_id}, retry ${event.retry_count}`);
  }

  /**
   * Send success notification
   */
  sendSuccessNotification(event) {
    const notification = {
      type: 'payment_success',
      sent_at: new Date().toISOString(),
      channel: 'email',
      template: 'payment_success_after_failure'
    };

    event.notifications_sent.push(notification);
    console.log(`Payment success notification sent for subscription ${event.subscription_id}`);
  }

  /**
   * Send final notification before cancellation
   */
  sendFinalNotification(event) {
    const notification = {
      type: 'final_notice',
      sent_at: new Date().toISOString(),
      channel: 'email',
      template: 'final_payment_notice'
    };

    event.notifications_sent.push(notification);
    console.log(`Final payment notice sent for subscription ${event.subscription_id}`);
  }

  /**
   * Schedule subscription cancellation
   */
  scheduleSubscriptionCancellation(subscriptionId, cancellationDate) {
    // In a real implementation, this would use a job queue
    console.log(`Subscription ${subscriptionId} scheduled for cancellation on ${cancellationDate}`);
    
    // Simulate scheduling with setTimeout (for demo purposes)
    const timeUntilCancellation = new Date(cancellationDate).getTime() - Date.now();
    if (timeUntilCancellation > 0) {
      setTimeout(() => {
        this.cancelSubscriptionForNonPayment(subscriptionId);
      }, Math.min(timeUntilCancellation, 24 * 60 * 60 * 1000)); // Max 24 hours for demo
    }
  }

  /**
   * Cancel subscription due to non-payment
   */
  cancelSubscriptionForNonPayment(subscriptionId) {
    const subscription = subscriptionData.subscriptions.find(sub => sub.id === subscriptionId);
    if (subscription && subscription.status === 'past_due') {
      subscription.status = 'canceled';
      subscription.canceled_at = new Date().toISOString();
      subscription.cancellation_reason = 'non_payment';
      subscription.ended_at = new Date().toISOString();
      subscription.updated_at = new Date().toISOString();
      
      console.log(`Subscription ${subscriptionId} canceled due to non-payment`);
    }
  }

  /**
   * Get all dunning events
   */
  getDunningEvents(filters = {}) {
    let events = [...this.dunningEvents];

    if (filters.status) {
      events = events.filter(e => e.status === filters.status);
    }

    if (filters.subscription_id) {
      events = events.filter(e => e.subscription_id === filters.subscription_id);
    }

    return events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Get dunning statistics
   */
  getDunningStats() {
    const total = this.dunningEvents.length;
    const active = this.dunningEvents.filter(e => e.status === 'active').length;
    const resolved = this.dunningEvents.filter(e => e.status === 'resolved').length;
    const failed = this.dunningEvents.filter(e => e.status === 'failed').length;

    const avgRetries = this.dunningEvents.reduce((sum, e) => sum + e.retry_count, 0) / total || 0;
    const successRate = total > 0 ? (resolved / total) * 100 : 0;

    return {
      total_events: total,
      active_events: active,
      resolved_events: resolved,
      failed_events: failed,
      average_retries: Math.round(avgRetries * 100) / 100,
      success_rate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Process all pending retries
   */
  async processPendingRetries() {
    const now = new Date();
    const pendingEvents = this.dunningEvents.filter(event => 
      event.status === 'active' && 
      event.next_retry_date && 
      new Date(event.next_retry_date) <= now
    );

    const results = [];
    for (const event of pendingEvents) {
      const result = await this.processRetry(event.id);
      results.push({ eventId: event.id, result });
    }

    return results;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Create singleton instance
const dunningManager = new DunningManager();

export default dunningManager;
export { DunningManager };