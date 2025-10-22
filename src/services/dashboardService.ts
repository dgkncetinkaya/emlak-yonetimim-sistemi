import { supabase } from '../lib/supabase';

// Dashboard için gerekli tipler
export interface DashboardStats {
  totalProperties: number;
  totalCustomers: number;
  totalAgents: number;
  monthlyRevenue: number;
  activeListings: number;
  pendingContracts: number;
  totalCommissions: number;
  conversionRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'property_added' | 'customer_added' | 'contract_signed' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
  amount?: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  email: string;
  total_sales: number;
  total_commission: number;
  conversion_rate: number;
  avatar_url?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

// Dashboard istatistiklerini getir
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Toplam emlak sayısı
    const { count: totalProperties } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    // Toplam müşteri sayısı
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    // Toplam agent sayısı
    const { count: totalAgents } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'consultant');

    // Aktif listeler
    const { count: activeListings } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    // Bu ay komisyon toplamı
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const { data: commissionData } = await supabase
      .from('commission_distributions')
      .select('commission_amount')
      .eq('period_month', currentMonth)
      .eq('period_year', currentYear)
      .eq('payment_status', 'paid');

    const totalCommissions = commissionData?.reduce((sum, item) => sum + Number(item.commission_amount), 0) || 0;

    // Performans verilerinden dönüşüm oranı hesapla
    const { data: performanceData } = await supabase
      .from('agent_performance')
      .select('conversion_rate')
      .gte('period_start', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`);

    const avgConversionRate = performanceData?.length 
      ? performanceData.reduce((sum, item) => sum + Number(item.conversion_rate), 0) / performanceData.length 
      : 0;

    return {
      totalProperties: totalProperties || 0,
      totalCustomers: totalCustomers || 0,
      totalAgents: totalAgents || 0,
      monthlyRevenue: totalCommissions,
      activeListings: activeListings || 0,
      pendingContracts: 0, // Bu veri için ayrı tablo gerekebilir
      totalCommissions,
      conversionRate: Number(avgConversionRate.toFixed(2))
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw error;
  }
};

// Son aktiviteleri getir
export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  try {
    // Son eklenen emlaklar
    const { data: recentProperties } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        created_at,
        user_profiles!properties_agent_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Son eklenen müşteriler
    const { data: recentCustomers } = await supabase
      .from('customers')
      .select(`
        id,
        first_name,
        last_name,
        created_at,
        user_profiles!customers_assigned_agent_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const activities: RecentActivity[] = [];

    // Emlak aktivitelerini ekle
    recentProperties?.forEach(property => {
      activities.push({
        id: property.id,
        type: 'property_added',
        title: 'Yeni Emlak Eklendi',
        description: property.title,
        timestamp: property.created_at,
        user_name: (property.user_profiles as any)?.full_name
      });
    });

    // Müşteri aktivitelerini ekle
    recentCustomers?.forEach(customer => {
      activities.push({
        id: customer.id,
        type: 'customer_added',
        title: 'Yeni Müşteri Eklendi',
        description: `${customer.first_name} ${customer.last_name}`,
        timestamp: customer.created_at,
        user_name: (customer.user_profiles as any)?.full_name
      });
    });

    // Tarihe göre sırala
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

  } catch (error) {
    console.error('Recent activities error:', error);
    throw error;
  }
};

// En iyi performans gösteren acenteleri getir
export const getTopPerformers = async (): Promise<TopPerformer[]> => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data: performers } = await supabase
      .from('agent_performance')
      .select(`
        agent_id,
        total_sales,
        total_commission,
        conversion_rate,
        user_profiles!agent_performance_agent_id_fkey(
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('period_start', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .order('total_commission', { ascending: false })
      .limit(5);

    return performers?.map(performer => ({
      id: performer.agent_id,
      name: (performer.user_profiles as any)?.full_name || 'Bilinmeyen',
      email: (performer.user_profiles as any)?.email || '',
      total_sales: performer.total_sales || 0,
      total_commission: Number(performer.total_commission) || 0,
      conversion_rate: Number(performer.conversion_rate) || 0,
      avatar_url: (performer.user_profiles as any)?.avatar_url
    })) || [];

  } catch (error) {
    console.error('Top performers error:', error);
    throw error;
  }
};

// Bildirimleri getir
export const getNotifications = async (limit: number = 10): Promise<NotificationData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return notifications || [];

  } catch (error) {
    console.error('Notifications error:', error);
    throw error;
  }
};

// Bildirimi okundu olarak işaretle
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId);

    if (error) throw error;

  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Hızlı aksiyonlar (statik veri)
export const getQuickActions = (): QuickAction[] => {
  return [
    {
      id: '1',
      title: 'Yeni Emlak Ekle',
      description: 'Sisteme yeni emlak kaydı ekleyin',
      icon: 'FiPlus',
      url: '/portfolio',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Müşteri Ekle',
      description: 'Yeni müşteri kaydı oluşturun',
      icon: 'FiUser',
      url: '/customers',
      color: 'green'
    },
    {
      id: '3',
      title: 'Randevu Planla',
      description: 'Müşteri ile randevu planlayın',
      icon: 'FiCalendar',
      url: '/my-appointments',
      color: 'purple'
    },
    {
      id: '4',
      title: 'Rapor Görüntüle',
      description: 'Detaylı raporları inceleyin',
      icon: 'FiBarChart',
      url: '/reports',
      color: 'orange'
    },
    {
      id: '5',
      title: 'Broker Yönetimi',
      description: 'Broker ayarlarını yönetin',
      icon: 'FiDollarSign',
      url: '/broker-management',
      color: 'teal'
    },
    {
      id: '6',
      title: 'Ayarlar',
      description: 'Sistem ayarlarını düzenleyin',
      icon: 'FiSettings',
      url: '/settings',
      color: 'gray'
    }
  ];
};

// Kişisel hedefler (örnek veri - gerçek implementasyon için ayrı tablo gerekebilir)
export const getPersonalGoals = () => {
  return [
    {
      id: '1',
      title: 'Aylık Satış Hedefi',
      current: 8,
      target: 12,
      unit: 'satış',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Komisyon Hedefi',
      current: 45000,
      target: 60000,
      unit: 'TL',
      color: 'green'
    },
    {
      id: '3',
      title: 'Yeni Müşteri Hedefi',
      current: 15,
      target: 20,
      unit: 'müşteri',
      color: 'purple'
    },
    {
      id: '4',
      title: 'Emlak Listeleme Hedefi',
      current: 25,
      target: 30,
      unit: 'emlak',
      color: 'orange'
    }
  ];
};