import express from 'express';
import jwt from 'jsonwebtoken';
import { subscriptionData } from './subscription.js';
import { webhookEvents } from './webhooks.js';
import { webhookQueue, webhookScheduler } from '../services/webhookQueue.js';
import { webhookProcessor } from '../services/webhookProcessor.js';
import dunningManager from '../services/dunningManager.js';
import dunningScheduler from '../services/dunningScheduler.js';

const router = express.Router();

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'emlak-secret-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for admin authorization
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Helper function to calculate MRR/ARR
const calculateRevenue = () => {
  const activeSubscriptions = subscriptionData.subscriptions.filter(s => 
    ['active', 'trialing'].includes(s.status)
  );
  
  let mrr = 0;
  let arr = 0;
  
  activeSubscriptions.forEach(subscription => {
    const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
    if (plan) {
      if (subscription.billing_cycle === 'monthly') {
        mrr += plan.price_monthly;
        arr += plan.price_monthly * 12;
      } else if (subscription.billing_cycle === 'yearly') {
        mrr += plan.price_yearly / 12;
        arr += plan.price_yearly;
      }
    }
  });
  
  return { mrr, arr };
};

// Helper function to get subscription analytics
const getSubscriptionAnalytics = () => {
  const total = subscriptionData.subscriptions.length;
  const active = subscriptionData.subscriptions.filter(s => s.status === 'active').length;
  const trialing = subscriptionData.subscriptions.filter(s => s.status === 'trialing').length;
  const cancelled = subscriptionData.subscriptions.filter(s => s.status === 'cancelled').length;
  const pastDue = subscriptionData.subscriptions.filter(s => s.status === 'past_due').length;
  
  return {
    total,
    active,
    trialing,
    cancelled,
    past_due: pastDue,
    churn_rate: total > 0 ? (cancelled / total) * 100 : 0
  };
};

// ============= DASHBOARD & ANALYTICS =============

// Admin dashboard overview
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const revenue = calculateRevenue();
    const subscriptionStats = getSubscriptionAnalytics();
    
    // Calculate growth metrics (mock data for demo)
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;
    
    const dashboard = {
      revenue: {
        mrr: revenue.mrr,
        arr: revenue.arr,
        mrr_growth: 15.2, // Mock growth percentage
        arr_growth: 18.5
      },
      subscriptions: subscriptionStats,
      invoices: {
        total: subscriptionData.invoices.length,
        paid: subscriptionData.invoices.filter(i => i.status === 'paid').length,
        pending: subscriptionData.invoices.filter(i => i.status === 'pending').length,
        failed: subscriptionData.invoices.filter(i => i.status === 'payment_failed').length
      },
      plans: {
        total: subscriptionData.plans.length,
        most_popular: subscriptionData.plans.find(p => p.id === 2)?.name || 'Professional'
      },
      recent_activity: {
        new_subscriptions_today: 0, // Mock data
        cancellations_today: 0,
        failed_payments_today: 0
      }
    };
    
    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revenue analytics
router.get('/analytics/revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    // Mock revenue data for the last 12 months
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      
      // Mock revenue calculation (in production, this would query actual data)
      const baseRevenue = 5000 + (Math.random() * 2000);
      const growth = 1 + (i * 0.1); // Simulate growth over time
      
      months.push({
        month: monthName,
        mrr: Math.round(baseRevenue * growth),
        arr: Math.round(baseRevenue * growth * 12),
        new_subscriptions: Math.floor(Math.random() * 10) + 1,
        churned_subscriptions: Math.floor(Math.random() * 3)
      });
    }
    
    res.json({ success: true, data: months });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subscription analytics
router.get('/analytics/subscriptions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const analytics = getSubscriptionAnalytics();
    
    // Plan distribution
    const planDistribution = subscriptionData.plans.map(plan => {
      const count = subscriptionData.subscriptions.filter(s => 
        s.plan_id === plan.id && ['active', 'trialing'].includes(s.status)
      ).length;
      
      return {
        plan_name: plan.name,
        count,
        percentage: analytics.total > 0 ? (count / analytics.total) * 100 : 0,
        revenue: count * (plan.price_monthly || 0)
      };
    });
    
    // Billing cycle distribution
    const billingCycles = {
      monthly: subscriptionData.subscriptions.filter(s => s.billing_cycle === 'monthly').length,
      yearly: subscriptionData.subscriptions.filter(s => s.billing_cycle === 'yearly').length
    };
    
    res.json({ 
      success: true, 
      data: {
        ...analytics,
        plan_distribution: planDistribution,
        billing_cycles: billingCycles
      }
    });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= CUSTOMER MANAGEMENT =============

// Get all customers with subscription info
router.get('/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan_id, search } = req.query;
    
    // Get all users with their subscription info
    // In production, this would be a proper database join
    const customers = subscriptionData.subscriptions.map(subscription => {
      const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
      const invoices = subscriptionData.invoices.filter(i => i.subscription_id === subscription.id);
      const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0);
      
      return {
        user_id: subscription.user_id,
        email: `user${subscription.user_id}@example.com`, // Mock email
        name: `User ${subscription.user_id}`, // Mock name
        subscription: {
          ...subscription,
          plan_name: plan?.name,
          plan_price: subscription.billing_cycle === 'yearly' ? plan?.price_yearly : plan?.price_monthly
        },
        total_revenue: totalRevenue,
        invoice_count: invoices.length,
        last_payment: invoices
          .filter(i => i.status === 'paid')
          .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0]?.paid_at || null
      };
    });
    
    // Apply filters
    let filteredCustomers = customers;
    
    if (status) {
      filteredCustomers = filteredCustomers.filter(c => c.subscription.status === status);
    }
    
    if (plan_id) {
      filteredCustomers = filteredCustomers.filter(c => c.subscription.plan_id === parseInt(plan_id));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(c => 
        c.email.toLowerCase().includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by creation date (newest first)
    filteredCustomers.sort((a, b) => 
      new Date(b.subscription.created_at) - new Date(a.subscription.created_at)
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredCustomers.length,
        pages: Math.ceil(filteredCustomers.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer details
router.get('/customers/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
    const invoices = subscriptionData.invoices.filter(i => i.subscription_id === subscription.id);
    const usage = subscriptionData.usage_tracking.filter(u => u.subscription_id === subscription.id);
    
    const customer = {
      user_id: userId,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      subscription: {
        ...subscription,
        plan
      },
      invoices,
      usage,
      total_revenue: invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total_amount, 0)
    };
    
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer subscription
router.put('/customers/:userId/subscription', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { plan_id, status, seats, billing_cycle } = req.body;
    
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === userId);
    if (!subscription) {
      return res.status(404).json({ error: 'Customer subscription not found' });
    }
    
    // Update subscription fields
    if (plan_id) {
      const plan = subscriptionData.plans.find(p => p.id === plan_id);
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }
      subscription.plan_id = plan_id;
    }
    
    if (status) subscription.status = status;
    if (seats) subscription.seats = seats;
    if (billing_cycle) subscription.billing_cycle = billing_cycle;
    
    subscription.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Customer subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error updating customer subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= PLAN MANAGEMENT =============

// Get all plans (admin view with usage stats)
router.get('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plansWithStats = subscriptionData.plans.map(plan => {
      const subscriptions = subscriptionData.subscriptions.filter(s => s.plan_id === plan.id);
      const activeSubscriptions = subscriptions.filter(s => ['active', 'trialing'].includes(s.status));
      
      return {
        ...plan,
        stats: {
          total_subscriptions: subscriptions.length,
          active_subscriptions: activeSubscriptions.length,
          monthly_revenue: activeSubscriptions
            .filter(s => s.billing_cycle === 'monthly')
            .length * plan.price_monthly,
          yearly_revenue: activeSubscriptions
            .filter(s => s.billing_cycle === 'yearly')
            .length * plan.price_yearly
        }
      };
    });
    
    res.json({ success: true, data: plansWithStats });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new plan
router.post('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price_monthly, 
      price_yearly, 
      features, 
      limits, 
      sort_order 
    } = req.body;
    
    // Validate required fields
    if (!name || !price_monthly || !features || !limits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newPlan = {
      id: Math.max(...subscriptionData.plans.map(p => p.id)) + 1,
      name,
      description: description || '',
      price_monthly,
      price_yearly: price_yearly || price_monthly * 10, // Default 2 months free
      features,
      limits,
      sort_order: sort_order || subscriptionData.plans.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    subscriptionData.plans.push(newPlan);
    
    res.status(201).json({ 
      success: true, 
      message: 'Plan created successfully',
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update plan
router.put('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const plan = subscriptionData.plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const { 
      name, 
      description, 
      price_monthly, 
      price_yearly, 
      features, 
      limits, 
      sort_order,
      is_active
    } = req.body;
    
    // Update plan fields
    if (name) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (price_monthly) plan.price_monthly = price_monthly;
    if (price_yearly) plan.price_yearly = price_yearly;
    if (features) plan.features = features;
    if (limits) plan.limits = limits;
    if (sort_order) plan.sort_order = sort_order;
    if (is_active !== undefined) plan.is_active = is_active;
    
    plan.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= COUPON MANAGEMENT =============

// Get all coupons
router.get('/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { active_only } = req.query;
    
    let coupons = [...subscriptionData.coupons];
    
    if (active_only === 'true') {
      coupons = coupons.filter(c => 
        c.is_active && 
        new Date(c.valid_until) > new Date() &&
        (!c.max_redemptions || c.times_redeemed < c.max_redemptions)
      );
    }
    
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new coupon
router.post('/coupons', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      code, 
      name, 
      type, 
      value, 
      duration, 
      duration_in_months, 
      max_redemptions, 
      valid_until 
    } = req.body;
    
    // Validate required fields
    if (!code || !name || !type || !value || !valid_until) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if coupon code already exists
    const existingCoupon = subscriptionData.coupons.find(c => c.code === code);
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    
    const newCoupon = {
      id: Math.max(...subscriptionData.coupons.map(c => c.id)) + 1,
      code: code.toUpperCase(),
      name,
      type, // 'percentage' or 'fixed_amount'
      value,
      duration, // 'once', 'repeating', 'forever'
      duration_in_months,
      max_redemptions,
      times_redeemed: 0,
      valid_until,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    subscriptionData.coupons.push(newCoupon);
    
    res.status(201).json({ 
      success: true, 
      message: 'Coupon created successfully',
      data: newCoupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update coupon
router.put('/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const couponId = parseInt(req.params.id);
    const coupon = subscriptionData.coupons.find(c => c.id === couponId);
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    const { 
      name, 
      value, 
      duration, 
      duration_in_months, 
      max_redemptions, 
      valid_until, 
      is_active 
    } = req.body;
    
    // Update coupon fields (code cannot be changed)
    if (name) coupon.name = name;
    if (value) coupon.value = value;
    if (duration) coupon.duration = duration;
    if (duration_in_months !== undefined) coupon.duration_in_months = duration_in_months;
    if (max_redemptions !== undefined) coupon.max_redemptions = max_redemptions;
    if (valid_until) coupon.valid_until = valid_until;
    if (is_active !== undefined) coupon.is_active = is_active;
    
    coupon.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Coupon updated successfully',
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete coupon
router.delete('/coupons/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const couponId = parseInt(req.params.id);
    const couponIndex = subscriptionData.coupons.findIndex(c => c.id === couponId);
    
    if (couponIndex === -1) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    subscriptionData.coupons.splice(couponIndex, 1);
    
    res.json({ 
      success: true, 
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= WEBHOOK MANAGEMENT =============

// Get webhook events (proxy to webhooks route)
router.get('/webhooks/events', authenticateToken, requireAdmin, async (req, res) => {
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

// Webhook queue status endpoint
router.get('/webhooks/queue/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const queueStats = webhookQueue.getQueueStats();
    const webhookStats = webhookProcessor.getWebhookStats();
    const activeSchedules = webhookScheduler.getActiveSchedules();
    
    res.json({
      success: true,
      data: {
        queue: queueStats,
        processor: webhookStats,
        schedules: activeSchedules
      }
    });
  } catch (error) {
    console.error('Error fetching webhook queue status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start/stop webhook queue
router.post('/webhooks/queue/:action', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { action } = req.params;
    
    if (action === 'start') {
      webhookQueue.start();
      res.json({ success: true, message: 'Webhook queue started' });
    } else if (action === 'stop') {
      webhookQueue.stop();
      res.json({ success: true, message: 'Webhook queue stopped' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use start or stop.' });
    }
  } catch (error) {
    console.error('Error controlling webhook queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retry failed webhook events
router.post('/webhooks/events/retry-failed', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { maxAge = 24 } = req.body; // hours
    const maxAgeMs = maxAge * 60 * 60 * 1000;
    
    const retriedCount = await webhookQueue.retryFailedEvents(maxAgeMs);
    
    res.json({
      success: true,
      message: `Retried ${retriedCount} failed webhook events`,
      data: { retriedCount }
    });
  } catch (error) {
    console.error('Error retrying failed webhook events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clean up old webhook events
router.post('/webhooks/events/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { maxAge = 7 } = req.body; // days
    const maxAgeMs = maxAge * 24 * 60 * 60 * 1000;
    
    const removedCount = webhookQueue.cleanupOldEvents(maxAgeMs);
    
    res.json({
      success: true,
      message: `Cleaned up ${removedCount} old webhook events`,
      data: { removedCount }
    });
  } catch (error) {
    console.error('Error cleaning up webhook events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update webhook queue configuration
router.put('/webhooks/queue/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { batchSize, processingDelay, maxConcurrentJobs } = req.body;
    
    webhookQueue.updateConfig({
      batchSize,
      processingDelay,
      maxConcurrentJobs
    });
    
    res.json({
      success: true,
      message: 'Webhook queue configuration updated',
      data: {
        batchSize: webhookQueue.batchSize,
        processingDelay: webhookQueue.processingDelay,
        maxConcurrentJobs: webhookQueue.maxConcurrentJobs
      }
    });
  } catch (error) {
    console.error('Error updating webhook queue config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process specific webhook event
router.post('/webhooks/events/:id/process', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id);
    
    const result = await webhookProcessor.processEvent(eventId);
    
    res.json({
      success: true,
      message: 'Webhook event processed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= DUNNING MANAGEMENT =============

// Get all dunning events
router.get('/dunning/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, subscription_id } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (subscription_id) filters.subscription_id = parseInt(subscription_id);
    
    const events = dunningManager.getDunningEvents(filters);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching dunning events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dunning statistics
router.get('/dunning/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = dunningScheduler.getDetailedStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dunning stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dunning scheduler status
router.get('/dunning/scheduler/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = dunningScheduler.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching dunning scheduler status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start dunning scheduler
router.post('/dunning/scheduler/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    dunningScheduler.start();
    
    res.json({
      success: true,
      message: 'Dunning scheduler started'
    });
  } catch (error) {
    console.error('Error starting dunning scheduler:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stop dunning scheduler
router.post('/dunning/scheduler/stop', authenticateToken, requireAdmin, async (req, res) => {
  try {
    dunningScheduler.stop();
    
    res.json({
      success: true,
      message: 'Dunning scheduler stopped'
    });
  } catch (error) {
    console.error('Error stopping dunning scheduler:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force process dunning retries
router.post('/dunning/process-retries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const results = await dunningScheduler.forceProcessRetries();
    
    res.json({
      success: true,
      data: results,
      message: 'Forced processing of dunning retries completed'
    });
  } catch (error) {
    console.error('Error processing dunning retries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force cleanup old dunning events
router.post('/dunning/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    dunningScheduler.forceCleanup();
    
    res.json({
      success: true,
      message: 'Forced cleanup of old dunning events completed'
    });
  } catch (error) {
    console.error('Error cleaning up dunning events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update dunning scheduler configuration
router.put('/dunning/scheduler/config', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { processingInterval, cleanupInterval } = req.body;
    
    dunningScheduler.updateConfig({
      processingInterval,
      cleanupInterval
    });
    
    res.json({
      success: true,
      message: 'Dunning scheduler configuration updated'
    });
  } catch (error) {
    console.error('Error updating dunning scheduler config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Retry specific dunning event
router.post('/dunning/retry/:eventId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await dunningManager.processRetry(eventId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error retrying dunning event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;