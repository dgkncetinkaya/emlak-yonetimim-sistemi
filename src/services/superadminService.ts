import { supabase } from '../lib/supabase';

// Types
export interface Tenant {
    id: string;
    name: string;
    domain?: string;
    status: 'active' | 'inactive' | 'suspended';
    subscription_plan_id?: string;
    created_at: string;
    updated_at: string;
    user_count?: number;
    property_count?: number;
    mrr?: number;
}

export interface SystemMetrics {
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_properties: number;
    mrr: number;
    arr: number;
    churn_rate: number;
    growth_rate: number;
}

export interface UserStats {
    total_users: number;
    active_users: number;
    new_users_this_month: number;
    users_by_role: Record<string, number>;
}

export interface SubscriptionStats {
    total_subscriptions: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    cancelled_subscriptions: number;
    plan_distribution: Record<string, number>;
    mrr: number;
    arr: number;
}

// SuperAdmin Service
class SuperAdminService {
    /**
     * Get system-wide metrics
     */
    async getSystemMetrics(): Promise<SystemMetrics> {
        try {
            // Get tenant stats
            const { data: tenants, error: tenantsError } = await supabase
                .from('profiles')
                .select('id, role, created_at')
                .eq('role', 'admin');

            if (tenantsError) throw tenantsError;

            // Get subscription stats
            const { data: subscriptions, error: subsError } = await supabase
                .from('subscriptions')
                .select('*, subscription_plans(*)');

            if (subsError) throw subsError;

            // Calculate MRR and ARR
            let mrr = 0;
            let arr = 0;
            const activeSubscriptions = subscriptions?.filter(s =>
                ['active', 'trialing'].includes(s.status)
            ) || [];

            activeSubscriptions.forEach((sub: any) => {
                const plan = sub.subscription_plans;
                if (plan) {
                    if (sub.billing_cycle === 'monthly') {
                        mrr += plan.price_monthly || 0;
                        arr += (plan.price_monthly || 0) * 12;
                    } else if (sub.billing_cycle === 'yearly') {
                        mrr += (plan.price_yearly || 0) / 12;
                        arr += plan.price_yearly || 0;
                    }
                }
            });

            // Get user count
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Get property count
            const { count: propertyCount } = await supabase
                .from('properties')
                .select('*', { count: 'exact', head: true });

            return {
                total_tenants: tenants?.length || 0,
                active_tenants: tenants?.length || 0,
                total_users: userCount || 0,
                total_properties: propertyCount || 0,
                mrr,
                arr,
                churn_rate: 5.2, // Mock - implement real calculation
                growth_rate: 12.5 // Mock - implement real calculation
            };
        } catch (error) {
            console.error('Error fetching system metrics:', error);
            throw error;
        }
    }

    /**
     * Get all tenants (organizations)
     */
    async getTenants(): Promise<Tenant[]> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'admin')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform to Tenant format
            const tenants: Tenant[] = (data || []).map(profile => ({
                id: profile.id,
                name: profile.full_name || profile.email,
                domain: profile.email?.split('@')[1],
                status: 'active' as const,
                created_at: profile.created_at,
                updated_at: profile.updated_at || profile.created_at
            }));

            return tenants;
        } catch (error) {
            console.error('Error fetching tenants:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<UserStats> {
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('id, role, created_at');

            if (error) throw error;

            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const newUsersThisMonth = users?.filter(u =>
                new Date(u.created_at) >= firstDayOfMonth
            ).length || 0;

            const usersByRole = users?.reduce((acc: Record<string, number>, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {}) || {};

            return {
                total_users: users?.length || 0,
                active_users: users?.length || 0, // Mock - implement real active user tracking
                new_users_this_month: newUsersThisMonth,
                users_by_role: usersByRole
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    /**
     * Get subscription statistics
     */
    async getSubscriptionStats(): Promise<SubscriptionStats> {
        try {
            const { data: subscriptions, error } = await supabase
                .from('subscriptions')
                .select('*, subscription_plans(*)');

            if (error) throw error;

            const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
            const trialSubscriptions = subscriptions?.filter(s => s.status === 'trialing') || [];
            const cancelledSubscriptions = subscriptions?.filter(s => s.status === 'cancelled') || [];

            // Calculate MRR and ARR
            let mrr = 0;
            let arr = 0;

            activeSubscriptions.forEach((sub: any) => {
                const plan = sub.subscription_plans;
                if (plan) {
                    if (sub.billing_cycle === 'monthly') {
                        mrr += plan.price_monthly || 0;
                        arr += (plan.price_monthly || 0) * 12;
                    } else if (sub.billing_cycle === 'yearly') {
                        mrr += (plan.price_yearly || 0) / 12;
                        arr += plan.price_yearly || 0;
                    }
                }
            });

            // Plan distribution
            const planDistribution = subscriptions?.reduce((acc: Record<string, number>, sub: any) => {
                const planName = sub.subscription_plans?.name || 'Unknown';
                acc[planName] = (acc[planName] || 0) + 1;
                return acc;
            }, {}) || {};

            return {
                total_subscriptions: subscriptions?.length || 0,
                active_subscriptions: activeSubscriptions.length,
                trial_subscriptions: trialSubscriptions.length,
                cancelled_subscriptions: cancelledSubscriptions.length,
                plan_distribution: planDistribution,
                mrr,
                arr
            };
        } catch (error) {
            console.error('Error fetching subscription stats:', error);
            throw error;
        }
    }

    /**
     * Get webhook events
     */
    async getWebhookEvents(params?: { status?: string; limit?: number }) {
        try {
            let query = supabase
                .from('webhook_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (params?.status) {
                query = query.eq('status', params.status);
            }

            if (params?.limit) {
                query = query.limit(params.limit);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching webhook events:', error);
            throw error;
        }
    }

    /**
     * Retry failed webhooks
     */
    async retryFailedWebhooks() {
        try {
            const { data, error } = await supabase.functions.invoke('admin-manager', {
                body: { action: 'retryFailedWebhooks' }
            });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error retrying failed webhooks:', error);
            throw error;
        }
    }

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    }

    /**
     * Update user status
     */
    async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'banned') {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ status })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }
}

export const superadminService = new SuperAdminService();
