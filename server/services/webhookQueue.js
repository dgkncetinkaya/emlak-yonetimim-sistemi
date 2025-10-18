import { webhookProcessor } from './webhookProcessor.js';

// Mock webhook events storage (in production, this would be a database)
let webhookEvents = [];

// Webhook queue manager for handling event processing
class WebhookQueue {
  constructor() {
    this.isProcessing = false;
    this.processingInterval = null;
    this.batchSize = 10;
    this.processingDelay = 5000; // 5 seconds
    this.maxConcurrentJobs = 3;
    this.activeJobs = new Set();
  }

  // Start the webhook queue processor
  start() {
    if (this.processingInterval) {
      console.log('Webhook queue is already running');
      return;
    }

    console.log('Starting webhook queue processor...');
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, this.processingDelay);

    // Process immediately on start
    this.processQueue();
  }

  // Stop the webhook queue processor
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Webhook queue processor stopped');
    }
  }

  // Process pending events in the queue
  async processQueue() {
    if (this.isProcessing || this.activeJobs.size >= this.maxConcurrentJobs) {
      return;
    }

    this.isProcessing = true;

    try {
      const pendingEvents = this.getPendingEvents();
      
      if (pendingEvents.length === 0) {
        return;
      }

      console.log(`Processing ${Math.min(pendingEvents.length, this.batchSize)} webhook events`);

      // Process events in batches
      const batch = pendingEvents.slice(0, this.batchSize);
      const promises = batch.map(event => this.processEventSafely(event));
      
      await Promise.allSettled(promises);
      
    } catch (error) {
      console.error('Error processing webhook queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Safely process a single event
  async processEventSafely(event) {
    const jobId = `${event.id}-${Date.now()}`;
    this.activeJobs.add(jobId);

    try {
      await webhookProcessor.processEvent(event.id);
      console.log(`Successfully processed webhook event ${event.id}`);
    } catch (error) {
      console.error(`Failed to process webhook event ${event.id}:`, error.message);
      
      // Mark event as failed if max retries exceeded
      event.error = error.message;
      event.processed_at = new Date().toISOString();
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  // Get pending events that need processing
  getPendingEvents() {
    return webhookEvents.filter(event => 
      !event.processed && 
      !event.error && 
      !this.isEventBeingProcessed(event)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  // Check if event is currently being processed
  isEventBeingProcessed(event) {
    return Array.from(this.activeJobs).some(jobId => jobId.startsWith(`${event.id}-`));
  }

  // Add event to queue for processing
  enqueue(event) {
    console.log(`Enqueued webhook event ${event.id} for processing`);
    
    // If queue is not running, process immediately
    if (!this.processingInterval) {
      setTimeout(() => this.processEventSafely(event), 100);
    }
  }

  // Get queue statistics
  getQueueStats() {
    const pending = this.getPendingEvents().length;
    const processing = this.activeJobs.size;
    const total = webhookEvents.length;
    const processed = webhookEvents.filter(e => e.processed).length;
    const failed = webhookEvents.filter(e => e.error).length;

    return {
      pending,
      processing,
      total,
      processed,
      failed,
      isRunning: !!this.processingInterval,
      maxConcurrentJobs: this.maxConcurrentJobs,
      batchSize: this.batchSize
    };
  }

  // Retry failed events
  async retryFailedEvents(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoffTime = new Date(Date.now() - maxAge);
    const failedEvents = webhookEvents.filter(event => 
      event.error && 
      new Date(event.created_at) > cutoffTime
    );

    console.log(`Retrying ${failedEvents.length} failed webhook events`);

    for (const event of failedEvents) {
      // Reset error state to allow retry
      event.error = null;
      event.processed = false;
      event.processed_at = null;
      
      // Add back to queue
      this.enqueue(event);
    }

    return failedEvents.length;
  }

  // Clean up old processed events
  cleanupOldEvents(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoffTime = new Date(Date.now() - maxAge);
    const initialCount = webhookEvents.length;
    
    // Remove old processed events
    for (let i = webhookEvents.length - 1; i >= 0; i--) {
      const event = webhookEvents[i];
      if (event.processed && new Date(event.created_at) < cutoffTime) {
        webhookEvents.splice(i, 1);
      }
    }

    const removedCount = initialCount - webhookEvents.length;
    console.log(`Cleaned up ${removedCount} old webhook events`);
    
    return removedCount;
  }

  // Update queue configuration
  updateConfig(config) {
    if (config.batchSize && config.batchSize > 0) {
      this.batchSize = config.batchSize;
    }
    
    if (config.processingDelay && config.processingDelay > 0) {
      this.processingDelay = config.processingDelay;
      
      // Restart with new delay if running
      if (this.processingInterval) {
        this.stop();
        this.start();
      }
    }
    
    if (config.maxConcurrentJobs && config.maxConcurrentJobs > 0) {
      this.maxConcurrentJobs = config.maxConcurrentJobs;
    }

    console.log('Webhook queue configuration updated:', {
      batchSize: this.batchSize,
      processingDelay: this.processingDelay,
      maxConcurrentJobs: this.maxConcurrentJobs
    });
  }
}

// Webhook scheduler for periodic tasks
class WebhookScheduler {
  constructor(queue) {
    this.queue = queue;
    this.schedules = new Map();
  }

  // Schedule periodic cleanup
  scheduleCleanup(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    if (this.schedules.has('cleanup')) {
      clearInterval(this.schedules.get('cleanup'));
    }

    const cleanupInterval = setInterval(() => {
      console.log('Running scheduled webhook cleanup...');
      this.queue.cleanupOldEvents();
    }, intervalMs);

    this.schedules.set('cleanup', cleanupInterval);
    console.log(`Scheduled webhook cleanup every ${intervalHours} hours`);
  }

  // Schedule retry of failed events
  scheduleRetry(intervalHours = 6) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    if (this.schedules.has('retry')) {
      clearInterval(this.schedules.get('retry'));
    }

    const retryInterval = setInterval(async () => {
      console.log('Running scheduled webhook retry...');
      await this.queue.retryFailedEvents();
    }, intervalMs);

    this.schedules.set('retry', retryInterval);
    console.log(`Scheduled webhook retry every ${intervalHours} hours`);
  }

  // Schedule health check
  scheduleHealthCheck(intervalMinutes = 30) {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    if (this.schedules.has('healthCheck')) {
      clearInterval(this.schedules.get('healthCheck'));
    }

    const healthCheckInterval = setInterval(() => {
      const stats = this.queue.getQueueStats();
      console.log('Webhook queue health check:', stats);
      
      // Alert if too many failed events
      if (stats.failed > 10) {
        console.warn(`High number of failed webhook events: ${stats.failed}`);
      }
      
      // Alert if queue is not running
      if (!stats.isRunning && stats.pending > 0) {
        console.warn('Webhook queue is not running but has pending events');
        this.queue.start();
      }
    }, intervalMs);

    this.schedules.set('healthCheck', healthCheckInterval);
    console.log(`Scheduled webhook health check every ${intervalMinutes} minutes`);
  }

  // Stop all scheduled tasks
  stopAll() {
    for (const [name, interval] of this.schedules) {
      clearInterval(interval);
      console.log(`Stopped scheduled task: ${name}`);
    }
    this.schedules.clear();
  }

  // Get active schedules
  getActiveSchedules() {
    return Array.from(this.schedules.keys());
  }
}

// Create singleton instances
const webhookQueue = new WebhookQueue();
const webhookScheduler = new WebhookScheduler(webhookQueue);

// Initialize default schedules
webhookScheduler.scheduleCleanup(24); // Daily cleanup
webhookScheduler.scheduleRetry(6);    // Retry every 6 hours
webhookScheduler.scheduleHealthCheck(30); // Health check every 30 minutes

// Start the queue processor
webhookQueue.start();

// Export instances
export { webhookQueue, webhookScheduler };
export default webhookQueue;