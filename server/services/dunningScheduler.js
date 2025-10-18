import dunningManager from './dunningManager.js';

/**
 * Dunning Scheduler
 * Handles automatic processing of dunning events and retries
 */
class DunningScheduler {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.processingInterval = 60 * 1000; // 1 minute
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.lastCleanup = Date.now();
  }

  /**
   * Start the dunning scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Dunning scheduler is already running');
      return;
    }

    console.log('Starting dunning scheduler...');
    this.isRunning = true;
    
    // Process pending retries every minute
    this.intervalId = setInterval(() => {
      this.processPendingRetries();
      this.performCleanupIfNeeded();
    }, this.processingInterval);

    console.log('Dunning scheduler started successfully');
  }

  /**
   * Stop the dunning scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('Dunning scheduler is not running');
      return;
    }

    console.log('Stopping dunning scheduler...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Dunning scheduler stopped successfully');
  }

  /**
   * Process all pending retries
   */
  async processPendingRetries() {
    try {
      const results = await dunningManager.processPendingRetries();
      
      if (results.length > 0) {
        console.log(`Processed ${results.length} pending dunning retries`);
        
        // Log results
        results.forEach(({ eventId, result }) => {
          if (result.success) {
            console.log(`✓ Dunning event ${eventId}: Payment successful`);
          } else {
            console.log(`✗ Dunning event ${eventId}: ${result.message}`);
          }
        });
      }
    } catch (error) {
      console.error('Error processing pending dunning retries:', error);
    }
  }

  /**
   * Perform cleanup if needed
   */
  performCleanupIfNeeded() {
    const now = Date.now();
    if (now - this.lastCleanup >= this.cleanupInterval) {
      this.performCleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * Clean up old dunning events
   */
  performCleanup() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const allEvents = dunningManager.getDunningEvents();
      const oldEvents = allEvents.filter(event => 
        new Date(event.created_at) < thirtyDaysAgo && 
        ['resolved', 'failed'].includes(event.status)
      );
      
      if (oldEvents.length > 0) {
        // In a real implementation, you would remove these from the database
        console.log(`Cleanup: Found ${oldEvents.length} old dunning events to archive`);
        
        // For now, just log the cleanup action
        oldEvents.forEach(event => {
          console.log(`Archiving dunning event ${event.id} (${event.status})`);
        });
      }
    } catch (error) {
      console.error('Error during dunning cleanup:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      processingInterval: this.processingInterval,
      cleanupInterval: this.cleanupInterval,
      lastCleanup: new Date(this.lastCleanup).toISOString(),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(config) {
    if (config.processingInterval && config.processingInterval >= 10000) { // Min 10 seconds
      this.processingInterval = config.processingInterval;
    }
    
    if (config.cleanupInterval && config.cleanupInterval >= 3600000) { // Min 1 hour
      this.cleanupInterval = config.cleanupInterval;
    }
    
    // Restart scheduler with new config if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log('Dunning scheduler configuration updated:', {
      processingInterval: this.processingInterval,
      cleanupInterval: this.cleanupInterval
    });
  }

  /**
   * Force process all pending retries (manual trigger)
   */
  async forceProcessRetries() {
    console.log('Force processing all pending dunning retries...');
    return await this.processPendingRetries();
  }

  /**
   * Force cleanup (manual trigger)
   */
  forceCleanup() {
    console.log('Force cleanup of old dunning events...');
    this.performCleanup();
    this.lastCleanup = Date.now();
  }

  /**
   * Get dunning statistics with scheduler info
   */
  getDetailedStats() {
    const dunningStats = dunningManager.getDunningStats();
    const schedulerStatus = this.getStatus();
    
    return {
      dunning: dunningStats,
      scheduler: schedulerStatus,
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const dunningScheduler = new DunningScheduler();

// Auto-start scheduler
dunningScheduler.start();

export default dunningScheduler;
export { DunningScheduler };