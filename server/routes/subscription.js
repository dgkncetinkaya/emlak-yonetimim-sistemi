import express from 'express';
import jwt from 'jsonwebtoken';
import dunningManager from '../services/dunningManager.js';

const router = express.Router();

// Mock data for subscription system
const subscriptionData = {
  plans: [
    {
      id: 1,
      name: 'Starter',
      description: 'Küçük emlak ofisleri için başlangıç paketi',
      price_monthly: 299.00,
      price_yearly: 2990.00,
      features: {
        portfolio_management: true,
        customer_management: true,
        appointment_scheduling: true,
        basic_reporting: true,
        email_notifications: true,
        mobile_app: false,
        advanced_reporting: false,
        api_access: false,
        white_label: false,
        priority_support: false
      },
      limits: {
        portfolio_limit: 50,
        consultant_limit: 2,
        storage_gb: 5,
        esign_count: 10,
        sms_count: 100,
        email_count: 1000
      },
      sort_order: 1
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Orta ölçekli emlak ofisleri için profesyonel paket',
      price_monthly: 599.00,
      price_yearly: 5990.00,
      features: {
        portfolio_management: true,
        customer_management: true,
        appointment_scheduling: true,
        basic_reporting: true,
        advanced_reporting: true,
        email_notifications: true,
        sms_notifications: true,
        mobile_app: true,
        api_access: true,
        document_management: true,
        esign: true,
        white_label: false,
        priority_support: false
      },
      limits: {
        portfolio_limit: 200,
        consultant_limit: 10,
        storage_gb: 25,
        esign_count: 50,
        sms_count: 500,
        email_count: 5000
      },
      sort_order: 2
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'Büyük emlak şirketleri için kurumsal çözüm',
      price_monthly: 1299.00,
      price_yearly: 12990.00,
      features: {
        portfolio_management: true,
        customer_management: true,
        appointment_scheduling: true,
        basic_reporting: true,
        advanced_reporting: true,
        email_notifications: true,
        sms_notifications: true,
        mobile_app: true,
        api_access: true,
        document_management: true,
        esign: true,
        white_label: true,
        priority_support: true,
        custom_integrations: true,
        dedicated_account_manager: true
      },
      limits: {
        portfolio_limit: -1, // Unlimited
        consultant_limit: -1, // Unlimited
        storage_gb: 100,
        esign_count: 200,
        sms_count: 2000,
        email_count: 20000
      },
      sort_order: 3
    }
  ],
  subscriptions: [
    {
      id: 1,
      user_id: 1,
      plan_id: 2,
      status: 'trialing',
      billing_cycle: 'monthly',
      seats: 3,
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      addons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  invoices: [
    {
      id: "inv_001",
      subscription_id: 1,
      invoice_number: 'INV-2024-001',
      status: 'pending',
      amount: 599.00,
      tax_amount: 107.82,
      total_amount: 706.82,
      billing_period_start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      billing_period_end: new Date(Date.now() + 44 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      line_items: [
        {
          description: 'Professional Plan - Aylık Abonelik',
          quantity: 1,
          unit_price: 599.00,
          total: 599.00
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  payment_methods: [
    {
      id: 1,
      user_id: 1,
      type: 'card',
      card_brand: 'visa',
      card_last4: '4242',
      card_exp_month: 12,
      card_exp_year: 2025,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  billing_addresses: [
    {
      id: 1,
      user_id: 1,
      company_name: 'Emlak Ofisi A.Ş.',
      address_line1: 'Atatürk Caddesi No: 123',
      address_line2: 'Kat: 5 Daire: 10',
      city: 'İstanbul',
      state: 'İstanbul',
      postal_code: '34000',
      country: 'TR',
      tax_number: '1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  coupons: [
    {
      id: 1,
      code: 'WELCOME2024',
      name: 'Hoş Geldin İndirimi 2024',
      type: 'percentage',
      value: 25.00,
      duration: 'repeating',
      duration_in_months: 3,
      max_redemptions: 1000,
      times_redeemed: 0,
      valid_until: '2024-12-31T23:59:59+03:00',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      code: 'ANNUAL50',
      name: 'Yıllık Abonelik İndirimi',
      type: 'percentage',
      value: 15.00,
      duration: 'once',
      duration_in_months: null,
      max_redemptions: 500,
      times_redeemed: 0,
      valid_until: '2024-12-31T23:59:59+03:00',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  usage_tracking: [
    {
      id: 1,
      subscription_id: 1,
      feature: 'properties',
      usage_count: 5,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      subscription_id: 1,
      feature: 'consultants',
      usage_count: 2,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }
  ]
};

let nextSubscriptionId = {
  plans: 4,
  subscriptions: 2,
  invoices: 2,
  payment_methods: 2,
  billing_addresses: 2,
  coupons: 3,
  usage_tracking: 3
};

// Helper function to generate string-based invoice IDs
const generateInvoiceId = () => {
  return `inv_${String(nextSubscriptionId.invoices++).padStart(3, '0')}`;
};

// Middleware for authentication (imported from main server)
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

// Helper function to check subscription limits
const checkSubscriptionLimit = (userId, feature, requestedCount = 1) => {
  const subscription = subscriptionData.subscriptions.find(s => s.user_id === userId && s.status === 'active');
  if (!subscription) return false;

  const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
  if (!plan) return false;

  const limit = plan.limits[feature + '_limit'];
  if (limit === -1) return true; // Unlimited

  const usage = subscriptionData.usage_tracking.find(u => 
    u.subscription_id === subscription.id && 
    u.feature === feature &&
    new Date(u.period_start) <= new Date() &&
    new Date(u.period_end) >= new Date()
  );

  const currentUsage = usage ? usage.usage_count : 0;
  return (currentUsage + requestedCount) <= limit;
};

// Helper function to update usage tracking
const updateUsageTracking = (userId, feature, increment = 1) => {
  const subscription = subscriptionData.subscriptions.find(s => s.user_id === userId && s.status === 'active');
  if (!subscription) return;

  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(1);
  currentPeriodStart.setHours(0, 0, 0, 0);
  
  const currentPeriodEnd = new Date(currentPeriodStart);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  currentPeriodEnd.setDate(0);
  currentPeriodEnd.setHours(23, 59, 59, 999);

  let usage = subscriptionData.usage_tracking.find(u => 
    u.subscription_id === subscription.id && 
    u.feature === feature &&
    new Date(u.period_start).getTime() === currentPeriodStart.getTime()
  );

  if (usage) {
    usage.usage_count += increment;
  } else {
    subscriptionData.usage_tracking.push({
      id: nextSubscriptionId.usage_tracking++,
      subscription_id: subscription.id,
      feature,
      usage_count: increment,
      period_start: currentPeriodStart.toISOString(),
      period_end: currentPeriodEnd.toISOString(),
      created_at: new Date().toISOString()
    });
  }
};

// ============= PAYMENT METHODS ENDPOINTS =============

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethods = subscriptionData.payment_methods.filter(pm => pm.user_id === userId);
    res.json({ success: true, data: paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add payment method
router.post('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, card_brand, card_last4, card_exp_month, card_exp_year, is_default } = req.body;
    
    const newPaymentMethod = {
      id: nextSubscriptionId.payment_methods++,
      user_id: userId,
      type,
      card_brand,
      card_last4,
      card_exp_month,
      card_exp_year,
      is_default: is_default || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    subscriptionData.payment_methods.push(newPaymentMethod);
    res.status(201).json({ success: true, data: newPaymentMethod });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = parseInt(req.params.id);
    
    const index = subscriptionData.payment_methods.findIndex(pm => 
      pm.id === paymentMethodId && pm.user_id === userId
    );
    
    if (index === -1) {
      return res.status(404).json({ error: 'Payment method not found' });
    }
    
    subscriptionData.payment_methods.splice(index, 1);
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= BILLING ADDRESS ENDPOINTS =============

// Get billing address
router.get('/billing-address', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const billingAddress = subscriptionData.billing_addresses.find(ba => ba.user_id === userId);
    
    if (!billingAddress) {
      return res.status(404).json({ error: 'Billing address not found' });
    }
    
    res.json({ success: true, data: billingAddress });
  } catch (error) {
    console.error('Error fetching billing address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update billing address
router.put('/billing-address', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, address_line1, address_line2, city, state, postal_code, country, tax_number } = req.body;
    
    let billingAddress = subscriptionData.billing_addresses.find(ba => ba.user_id === userId);
    
    if (billingAddress) {
      // Update existing
      Object.assign(billingAddress, {
        company_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        tax_number,
        updated_at: new Date().toISOString()
      });
    } else {
      // Create new
      billingAddress = {
        id: nextSubscriptionId.billing_addresses++,
        user_id: userId,
        company_name,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        tax_number,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      subscriptionData.billing_addresses.push(billingAddress);
    }
    
    res.json({ success: true, data: billingAddress });
  } catch (error) {
    console.error('Error updating billing address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= PLANS ENDPOINTS =============

// Get all plans (public endpoint)
router.get('/plans', async (req, res) => {
  try {
    const plans = subscriptionData.plans.sort((a, b) => a.sort_order - b.sort_order);
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plan by ID (public endpoint)
router.get('/plans/:id', async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const plan = subscriptionData.plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= SUBSCRIPTIONS ENDPOINTS =============

// Get current user's subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
    const usage = subscriptionData.usage_tracking.filter(u => u.subscription_id === subscription.id);
    
    res.json({ 
      success: true, 
      data: {
        ...subscription,
        plan,
        usage
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new subscription
router.post('/subscription', authenticateToken, async (req, res) => {
  try {
    const { plan_id, billing_cycle, seats = 1, payment_method_id, coupon_code } = req.body;
    
    // Validate plan
    const plan = subscriptionData.plans.find(p => p.id === plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = subscriptionData.subscriptions.find(s => 
      s.user_id === req.user.id && ['active', 'trialing'].includes(s.status)
    );
    
    if (existingSubscription) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }
    
    // Validate coupon if provided
    let coupon = null;
    if (coupon_code) {
      coupon = subscriptionData.coupons.find(c => 
        c.code === coupon_code && 
        c.is_active && 
        new Date(c.valid_until) > new Date() &&
        (!c.max_redemptions || c.times_redeemed < c.max_redemptions)
      );
      
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid or expired coupon code' });
      }
    }
    
    // Calculate pricing
    const basePrice = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    let totalPrice = basePrice;
    
    // Apply coupon discount
    if (coupon) {
      if (coupon.type === 'percentage') {
        totalPrice = basePrice * (1 - coupon.value / 100);
      } else if (coupon.type === 'fixed_amount') {
        totalPrice = Math.max(0, basePrice - coupon.value);
      }
    }
    
    // Create subscription
    const newSubscription = {
      id: nextSubscriptionId.subscriptions++,
      user_id: req.user.id,
      plan_id,
      status: 'trialing', // Start with trial
      billing_cycle,
      seats,
      start_date: new Date().toISOString(),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      addons: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    subscriptionData.subscriptions.push(newSubscription);
    
    // Update coupon usage
    if (coupon) {
      coupon.times_redeemed++;
    }
    
    // Initialize usage tracking
    const features = ['properties', 'consultants', 'storage', 'esign', 'sms'];
    features.forEach(feature => {
      subscriptionData.usage_tracking.push({
        id: nextSubscriptionId.usage_tracking++,
        subscription_id: newSubscription.id,
        feature,
        usage_count: 0,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });
    });
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...newSubscription,
        plan,
        total_price: totalPrice,
        coupon_applied: coupon ? coupon.code : null
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subscription (change plan, seats, etc.)
router.put('/subscription', authenticateToken, async (req, res) => {
  try {
    const { plan_id, seats, billing_cycle } = req.body;
    
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === req.user.id);
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    // Validate new plan if provided
    if (plan_id) {
      const plan = subscriptionData.plans.find(p => p.id === plan_id);
      if (!plan) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }
      subscription.plan_id = plan_id;
    }
    
    if (seats) subscription.seats = seats;
    if (billing_cycle) subscription.billing_cycle = billing_cycle;
    
    subscription.updated_at = new Date().toISOString();
    
    const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
    
    res.json({ 
      success: true, 
      data: {
        ...subscription,
        plan
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.delete('/subscription', authenticateToken, async (req, res) => {
  try {
    const { reason, feedback } = req.body;
    
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === req.user.id);
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelled_at = new Date().toISOString();
    subscription.cancellation_reason = reason;
    subscription.cancellation_feedback = feedback;
    subscription.updated_at = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= INVOICES ENDPOINTS =============

// Get user's invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === req.user.id);
    if (!subscription) {
      return res.json({ success: true, data: [] });
    }
    
    const invoices = subscriptionData.invoices.filter(i => i.subscription_id === subscription.id);
    
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice by ID
router.get('/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const invoice = subscriptionData.invoices.find(i => i.id === invoiceId);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if user owns this invoice
    const subscription = subscriptionData.subscriptions.find(s => 
      s.id === invoice.subscription_id && s.user_id === req.user.id
    );
    
    if (!subscription) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= COUPONS ENDPOINTS =============

// Validate coupon
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    const coupon = subscriptionData.coupons.find(c => 
      c.code === code && 
      c.is_active && 
      new Date(c.valid_until) > new Date() &&
      (!c.max_redemptions || c.times_redeemed < c.max_redemptions)
    );
    
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }
    
    res.json({ 
      success: true, 
      data: {
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        duration: coupon.duration,
        duration_in_months: coupon.duration_in_months
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= USAGE TRACKING ENDPOINTS =============

// Get current usage
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const subscription = subscriptionData.subscriptions.find(s => s.user_id === req.user.id);
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }
    
    const usage = subscriptionData.usage_tracking.filter(u => 
      u.subscription_id === subscription.id &&
      new Date(u.period_start) <= new Date() &&
      new Date(u.period_end) >= new Date()
    );
    
    const plan = subscriptionData.plans.find(p => p.id === subscription.plan_id);
    
    const usageWithLimits = usage.map(u => ({
      ...u,
      limit: plan.limits[u.feature + '_limit'],
      percentage: plan.limits[u.feature + '_limit'] === -1 ? 0 : 
        (u.usage_count / plan.limits[u.feature + '_limit']) * 100
    }));
    
    res.json({ success: true, data: usageWithLimits });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= LIMITS CHECK ENDPOINTS =============

// Check if user can perform an action
router.post('/limits/check', authenticateToken, async (req, res) => {
  try {
    const { feature, count = 1 } = req.body;
    
    const canPerform = checkSubscriptionLimit(req.user.id, feature, count);
    
    res.json({ 
      success: true, 
      data: { 
        can_perform: canPerform,
        feature,
        requested_count: count
      }
    });
  } catch (error) {
    console.error('Error checking limits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update usage (called when user performs an action)
router.post('/usage/update', authenticateToken, async (req, res) => {
  try {
    const { feature, count = 1 } = req.body;
    
    // Check if user can perform this action
    if (!checkSubscriptionLimit(req.user.id, feature, count)) {
      return res.status(403).json({ error: 'Subscription limit exceeded' });
    }
    
    // Update usage
    updateUsageTracking(req.user.id, feature, count);
    
    res.json({ 
      success: true, 
      message: 'Usage updated successfully'
    });
  } catch (error) {
    console.error('Error updating usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason, cancel_at_period_end = true } = req.body;
    const userId = req.user.id;

    const subscription = subscriptionData.subscriptions.find(
      sub => sub.user_id === userId && sub.status !== 'canceled'
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }

    if (cancel_at_period_end) {
      subscription.status = 'cancel_at_period_end';
      subscription.cancel_at_period_end = true;
      subscription.canceled_at = new Date().toISOString();
      subscription.cancellation_reason = reason;
    } else {
      subscription.status = 'canceled';
      subscription.canceled_at = new Date().toISOString();
      subscription.cancellation_reason = reason;
      subscription.ended_at = new Date().toISOString();
    }

    subscription.updated_at = new Date().toISOString();

    res.json({
      success: true,
      data: subscription,
      message: cancel_at_period_end ? 
        'Subscription will be canceled at the end of current billing period' :
        'Subscription canceled immediately'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Pause/Freeze subscription
router.post('/subscription/pause', authenticateToken, async (req, res) => {
  try {
    const { pause_duration_days, reason } = req.body;
    const userId = req.user.id;

    const subscription = subscriptionData.subscriptions.find(
      sub => sub.user_id === userId && ['active', 'trialing'].includes(sub.status)
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }

    const pauseUntil = new Date();
    pauseUntil.setDate(pauseUntil.getDate() + (pause_duration_days || 30));

    subscription.status = 'paused';
    subscription.paused_at = new Date().toISOString();
    subscription.pause_until = pauseUntil.toISOString();
    subscription.pause_reason = reason;
    subscription.updated_at = new Date().toISOString();

    // Extend next billing date
    const nextBilling = new Date(subscription.next_billing_date);
    nextBilling.setDate(nextBilling.getDate() + (pause_duration_days || 30));
    subscription.next_billing_date = nextBilling.toISOString();

    res.json({
      success: true,
      data: subscription,
      message: `Subscription paused until ${pauseUntil.toLocaleDateString()}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resume paused subscription
router.post('/subscription/resume', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = subscriptionData.subscriptions.find(
      sub => sub.user_id === userId && sub.status === 'paused'
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Paused subscription not found'
      });
    }

    subscription.status = 'active';
    subscription.resumed_at = new Date().toISOString();
    subscription.updated_at = new Date().toISOString();
    
    // Remove pause-related fields
    delete subscription.paused_at;
    delete subscription.pause_until;
    delete subscription.pause_reason;

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Dunning Management Endpoints

// Get dunning events for user's subscription
router.get('/dunning/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = subscriptionData.subscriptions.find(
      sub => sub.user_id === userId
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const events = dunningManager.getDunningEvents({
      subscription_id: subscription.id
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Manually retry failed payment
router.post('/dunning/retry/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Verify user owns the subscription
    const events = dunningManager.getDunningEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Dunning event not found'
      });
    }

    const subscription = subscriptionData.subscriptions.find(
      sub => sub.id === event.subscription_id && sub.user_id === userId
    );

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this dunning event'
      });
    }

    const result = await dunningManager.processRetry(eventId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Simulate payment failure (for testing)
router.post('/dunning/simulate-failure', authenticateToken, async (req, res) => {
  try {
    const { invoice_id, failure_reason = 'Card declined' } = req.body;
    const userId = req.user.id;

    const subscription = subscriptionData.subscriptions.find(
      sub => sub.user_id === userId
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Find or create invoice
    let invoice = subscriptionData.invoices.find(inv => inv.id === invoice_id);
    if (!invoice) {
      invoice = {
        id: invoice_id || Date.now(),
        subscription_id: subscription.id,
        invoice_number: `INV-${Date.now()}`,
        status: 'payment_failed',
        amount: 599.00,
        tax_amount: 107.82,
        total_amount: 706.82,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      subscriptionData.invoices.push(invoice);
    }

    const dunningEvent = dunningManager.createDunningEvent(
      subscription.id,
      invoice.id,
      failure_reason
    );

    res.json({
      success: true,
      data: dunningEvent,
      message: 'Payment failure simulated and dunning process started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get dunning statistics (admin only)
router.get('/dunning/stats', authenticateToken, async (req, res) => {
  try {
    // In a real app, check if user is admin
    const stats = dunningManager.getDunningStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { subscriptionData, checkSubscriptionLimit, updateUsageTracking };
export default router;