import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  soldProperties: number;
  rentedProperties: number;
  totalCustomers: number;
  totalConsultants: number;
  monthlyRevenue: number;
  conversionRate: number;
}

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's tenant ID (either user.id or parent_user_id)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('parent_user_id, is_sub_user')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.is_sub_user ? profile.parent_user_id : user.id;

    // Get all properties count (using RLS, will automatically filter by tenant)
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Get active listings
    const { count: activeListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get sold properties
    const { count: soldProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');

    // Get rented properties
    const { count: rentedProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rented');

    // Get customers count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Get consultants count
    const { count: totalConsultants } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('parent_user_id', tenantId)
      .eq('is_sub_user', true);

    // Calculate conversion rate (sold + rented / total)
    const conversionRate = totalProperties && totalProperties > 0
      ? ((soldProperties || 0) + (rentedProperties || 0)) / totalProperties * 100
      : 0;

    return {
      totalProperties: totalProperties || 0,
      activeListings: activeListings || 0,
      soldProperties: soldProperties || 0,
      rentedProperties: rentedProperties || 0,
      totalCustomers: totalCustomers || 0,
      totalConsultants: totalConsultants || 0,
      monthlyRevenue: 0, // Bu hesaplama için sales tablosu gerekli
      conversionRate: Number(conversionRate.toFixed(1))
    };
  }

  async getRecentProperties(limit: number = 5) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        city,
        district,
        status,
        listing_type,
        created_at,
        created_by_profile:user_profiles!created_by(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getRecentCustomers(limit: number = 5) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        phone,
        status,
        customer_type,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getTopPerformers(limit: number = 5) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's tenant ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('parent_user_id, is_sub_user')
      .eq('id', user.id)
      .single();

    const tenantId = profile?.is_sub_user ? profile.parent_user_id : user.id;

    // Get all team members
    const { data: teamMembers } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .or(`id.eq.${tenantId},parent_user_id.eq.${tenantId}`);

    if (!teamMembers) return [];

    // Get property counts for each member
    const performersWithStats = await Promise.all(
      teamMembers.map(async (member) => {
        const { count: totalProperties } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', member.id);

        const { count: soldProperties } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', member.id)
          .eq('status', 'sold');

        const { count: rentedProperties } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', member.id)
          .eq('status', 'rented');

        const totalSales = (soldProperties || 0) + (rentedProperties || 0);
        const conversionRate = totalProperties && totalProperties > 0
          ? (totalSales / totalProperties) * 100
          : 0;

        return {
          id: member.id,
          name: member.full_name,
          email: member.email,
          total_sales: totalSales,
          total_properties: totalProperties || 0,
          conversion_rate: Number(conversionRate.toFixed(1)),
          total_commission: 0 // Komisyon hesaplama için ek tablo gerekli
        };
      })
    );

    // Sort by total sales
    return performersWithStats
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, limit);
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
