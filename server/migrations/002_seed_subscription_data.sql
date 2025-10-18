-- Seed data for subscription system
-- Created: 2024-01-15
-- Description: Inserts initial plans, coupons, and sample data

-- Insert subscription plans
INSERT INTO plans (name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
(
    'Starter',
    'Küçük emlak ofisleri için başlangıç paketi',
    299.00,
    2990.00,
    '{
        "portfolio_management": true,
        "customer_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "email_notifications": true,
        "mobile_app": false,
        "advanced_reporting": false,
        "api_access": false,
        "white_label": false,
        "priority_support": false
    }',
    '{
        "portfolio_limit": 50,
        "consultant_limit": 2,
        "storage_gb": 5,
        "esign_count": 10,
        "sms_count": 100,
        "email_count": 1000
    }',
    1
),
(
    'Professional',
    'Orta ölçekli emlak ofisleri için profesyonel paket',
    599.00,
    5990.00,
    '{
        "portfolio_management": true,
        "customer_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "email_notifications": true,
        "sms_notifications": true,
        "mobile_app": true,
        "api_access": true,
        "document_management": true,
        "esign": true,
        "white_label": false,
        "priority_support": false
    }',
    '{
        "portfolio_limit": 200,
        "consultant_limit": 10,
        "storage_gb": 25,
        "esign_count": 50,
        "sms_count": 500,
        "email_count": 5000
    }',
    2
),
(
    'Enterprise',
    'Büyük emlak şirketleri için kurumsal çözüm',
    1299.00,
    12990.00,
    '{
        "portfolio_management": true,
        "customer_management": true,
        "appointment_scheduling": true,
        "basic_reporting": true,
        "advanced_reporting": true,
        "email_notifications": true,
        "sms_notifications": true,
        "mobile_app": true,
        "api_access": true,
        "document_management": true,
        "esign": true,
        "white_label": true,
        "priority_support": true,
        "custom_integrations": true,
        "dedicated_account_manager": true
    }',
    '{
        "portfolio_limit": -1,
        "consultant_limit": -1,
        "storage_gb": 100,
        "esign_count": 200,
        "sms_count": 2000,
        "email_count": 20000
    }',
    3
);

-- Insert sample coupons
INSERT INTO coupons (code, name, type, value, duration, duration_in_months, max_redemptions, valid_until) VALUES
(
    'WELCOME2024',
    'Hoş Geldin İndirimi 2024',
    'percentage',
    25.00,
    'repeating',
    3,
    1000,
    '2024-12-31 23:59:59+03'
),
(
    'ANNUAL50',
    'Yıllık Abonelik İndirimi',
    'percentage',
    15.00,
    'once',
    NULL,
    500,
    '2024-12-31 23:59:59+03'
),
(
    'STARTUP100',
    'Startup İndirimi',
    'fixed_amount',
    100.00,
    'repeating',
    6,
    100,
    '2024-06-30 23:59:59+03'
),
(
    'UPGRADE20',
    'Plan Yükseltme İndirimi',
    'percentage',
    20.00,
    'once',
    NULL,
    NULL,
    '2024-12-31 23:59:59+03'
);

-- Insert sample subscription for existing admin user (assuming user_id = 1)
INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    billing_cycle,
    seats,
    start_date,
    next_billing_date,
    trial_start_date,
    trial_end_date
) VALUES (
    1,
    2, -- Professional plan
    'trialing',
    'monthly',
    3,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '14 days'
);

-- Insert sample invoice for the subscription
INSERT INTO invoices (
    subscription_id,
    invoice_number,
    status,
    amount,
    tax_amount,
    total_amount,
    billing_period_start,
    billing_period_end,
    due_date,
    line_items
) VALUES (
    1,
    'INV-2024-001',
    'pending',
    599.00,
    107.82, -- 18% KDV
    706.82,
    CURRENT_TIMESTAMP + INTERVAL '14 days',
    CURRENT_TIMESTAMP + INTERVAL '44 days',
    CURRENT_TIMESTAMP + INTERVAL '21 days',
    '[
        {
            "description": "Professional Plan - Aylık Abonelik",
            "quantity": 1,
            "unit_price": 599.00,
            "total": 599.00
        }
    ]'
);

-- Insert initial usage tracking for the subscription
INSERT INTO usage_tracking (
    subscription_id,
    feature,
    usage_count,
    period_start,
    period_end
) VALUES 
(
    1,
    'properties',
    5, -- Current property count from mock data
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
),
(
    1,
    'consultants',
    2, -- Current user count from mock data
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
),
(
    1,
    'storage',
    0, -- No file storage tracking yet
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
),
(
    1,
    'esign',
    0, -- No e-signatures used yet
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
),
(
    1,
    'sms',
    0, -- No SMS sent yet
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
);

-- Create a function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    sequence_part := LPAD(next_number::TEXT, 3, '0');
    
    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
    p_user_id INTEGER,
    p_feature TEXT,
    p_requested_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_limit INTEGER;
    current_usage INTEGER;
BEGIN
    -- Get the current plan limit for the feature
    SELECT (p.limits->p_feature)::INTEGER
    INTO current_limit
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If limit is -1, it means unlimited
    IF current_limit = -1 THEN
        RETURN TRUE;
    END IF;
    
    -- If no limit found, deny access
    IF current_limit IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get current usage for this billing period
    SELECT COALESCE(usage_count, 0)
    INTO current_usage
    FROM usage_tracking ut
    JOIN subscriptions s ON ut.subscription_id = s.id
    WHERE s.user_id = p_user_id
    AND ut.feature = p_feature
    AND ut.period_start <= CURRENT_TIMESTAMP
    AND ut.period_end >= CURRENT_TIMESTAMP
    ORDER BY ut.created_at DESC
    LIMIT 1;
    
    -- Check if adding the requested count would exceed the limit
    RETURN (COALESCE(current_usage, 0) + p_requested_count) <= current_limit;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update usage tracking
CREATE OR REPLACE FUNCTION update_usage_tracking(
    p_user_id INTEGER,
    p_feature TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    subscription_id_var INTEGER;
    current_period_start TIMESTAMP WITH TIME ZONE;
    current_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the active subscription
    SELECT id INTO subscription_id_var
    FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF subscription_id_var IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate current billing period
    SELECT 
        DATE_TRUNC('month', CURRENT_TIMESTAMP),
        DATE_TRUNC('month', CURRENT_TIMESTAMP) + INTERVAL '1 month' - INTERVAL '1 second'
    INTO current_period_start, current_period_end;
    
    -- Insert or update usage tracking
    INSERT INTO usage_tracking (
        subscription_id,
        feature,
        usage_count,
        period_start,
        period_end
    ) VALUES (
        subscription_id_var,
        p_feature,
        p_increment,
        current_period_start,
        current_period_end
    )
    ON CONFLICT (subscription_id, feature, period_start, period_end)
    DO UPDATE SET
        usage_count = usage_tracking.usage_count + p_increment,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for usage tracking to prevent duplicates
ALTER TABLE usage_tracking ADD CONSTRAINT unique_usage_tracking 
    UNIQUE (subscription_id, feature, period_start, period_end);

COMMIT;