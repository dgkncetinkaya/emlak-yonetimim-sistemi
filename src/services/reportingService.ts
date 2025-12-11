import { supabase } from '../lib/supabase';

// Tip tanımlamaları
export interface SaleRecord {
  id: string;
  property_id: string;
  customer_id: string;
  agent_id: string;
  sale_price: number;
  commission_amount: number;
  commission_rate: number;
  sale_date: string;
  contract_date?: string;
  completion_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  // İlişkili veriler
  property?: {
    title: string;
    address: string;
    property_type: string;
    district: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  agent?: {
    full_name: string;
    email: string;
  };
}

export interface RentalRecord {
  id: string;
  property_id: string;
  customer_id: string;
  agent_id: string;
  monthly_rent: number;
  deposit_amount?: number;
  commission_amount: number;
  commission_rate: number;
  start_date: string;
  end_date?: string;
  contract_duration?: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  renewal_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // İlişkili veriler
  property?: {
    title: string;
    address: string;
    property_type: string;
    district: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  agent?: {
    full_name: string;
    email: string;
  };
}

export interface AgentPerformance {
  id: string;
  agent_id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_rentals: number;
  total_showings: number;
  total_leads: number;
  sales_commission: number;
  rental_commission: number;
  total_commission: number;
  conversion_rate: number;
  average_sale_price: number;
  average_rental_price: number;
  created_at: string;
  updated_at: string;
  // İlişkili veriler
  agent?: {
    full_name: string;
    email: string;
  };
}

export interface PropertyShowing {
  id: string;
  property_id: string;
  customer_id: string;
  agent_id: string;
  showing_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  interest_level?: 'low' | 'medium' | 'high';
  follow_up_required: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionDistribution {
  id: string;
  agent_id: string;
  transaction_type: 'sale' | 'rental';
  transaction_id: string;
  commission_amount: number;
  commission_rate: number;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_date?: string;
  period_month: number;
  period_year: number;
  created_at: string;
  updated_at: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  agentId?: string;
  propertyType?: string;
  district?: string;
  status?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalRentals: number;
  totalCommission: number;
  totalShowings: number;
  averageSalePrice: number;
  averageRentalPrice: number;
  conversionRate: number;
  monthlyGrowth: number;
}

class ReportingService {
  // Satış raporları
  async getSalesReport(filters: ReportFilters = {}): Promise<SaleRecord[]> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının verilerini getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      let query = supabase
        .from('sales')
        .select(`
          *,
          property:properties(title, address, property_type, district),
          customer:customers(name, email, phone),
          agent:user_profiles(full_name, email)
        `)
        .eq('agent_id', user.id) // İzolasyon: Sadece kendi satışları
        .order('sale_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('sale_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('sale_date', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Satış raporu alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Satış raporu servisi hatası:', error);
      throw error;
    }
  }

  // Kiralama raporları
  async getRentalsReport(filters: ReportFilters = {}): Promise<RentalRecord[]> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının verilerini getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      let query = supabase
        .from('rentals')
        .select(`
          *,
          property:properties(title, address, property_type, district),
          customer:customers(name, email, phone),
          agent:user_profiles(full_name, email)
        `)
        .eq('agent_id', user.id) // İzolasyon: Sadece kendi kiralamaları
        .order('start_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('start_date', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Kiralama raporu alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Kiralama raporu servisi hatası:', error);
      throw error;
    }
  }

  // Danışman performans raporları
  async getAgentPerformance(filters: ReportFilters = {}): Promise<AgentPerformance[]> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının performansını getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      let query = supabase
        .from('agent_performance')
        .select(`
          *,
          agent:user_profiles(full_name, email)
        `)
        .eq('agent_id', user.id) // İzolasyon: Sadece kendi performansı
        .order('period_start', { ascending: false });

      if (filters.startDate) {
        query = query.gte('period_start', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('period_end', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Danışman performans raporu alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Danışman performans servisi hatası:', error);
      throw error;
    }
  }

  // Gösterim raporları
  async getShowingsReport(filters: ReportFilters = {}): Promise<PropertyShowing[]> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının gösterimlerini getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      let query = supabase
        .from('property_showings')
        .select('*')
        .eq('agent_id', user.id) // İzolasyon: Sadece kendi gösterimleri
        .order('showing_date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('showing_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('showing_date', filters.endDate);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Gösterim raporu alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Gösterim raporu servisi hatası:', error);
      throw error;
    }
  }

  // Komisyon dağılım raporları
  async getCommissionDistribution(filters: ReportFilters = {}): Promise<CommissionDistribution[]> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının komisyonlarını getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      let query = supabase
        .from('commission_distributions')
        .select('*')
        .eq('agent_id', user.id) // İzolasyon: Sadece kendi komisyonları
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Komisyon dağılım raporu alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Komisyon dağılım servisi hatası:', error);
      throw error;
    }
  }

  // Dashboard istatistikleri
  async getDashboardStats(filters: ReportFilters = {}): Promise<DashboardStats> {
    try {
      // İzolasyon: Sadece giriş yapan kullanıcının istatistiklerini getir
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      // Satış istatistikleri
      const salesQuery = supabase
        .from('sales')
        .select('sale_price, commission_amount, status')
        .eq('agent_id', user.id); // İzolasyon

      // Kiralama istatistikleri
      const rentalsQuery = supabase
        .from('rentals')
        .select('monthly_rent, commission_amount, status')
        .eq('agent_id', user.id); // İzolasyon

      // Gösterim istatistikleri
      const showingsQuery = supabase
        .from('property_showings')
        .select('status')
        .eq('agent_id', user.id); // İzolasyon

      // Paralel sorgular
      const [salesResult, rentalsResult, showingsResult] = await Promise.all([
        salesQuery,
        rentalsQuery,
        showingsQuery
      ]);

      if (salesResult.error) throw salesResult.error;
      if (rentalsResult.error) throw rentalsResult.error;
      if (showingsResult.error) throw showingsResult.error;

      const sales = salesResult.data || [];
      const rentals = rentalsResult.data || [];
      const showings = showingsResult.data || [];

      // İstatistikleri hesapla
      const completedSales = sales.filter(s => s.status === 'completed');
      const activeRentals = rentals.filter(r => r.status === 'active');
      const completedShowings = showings.filter(s => s.status === 'completed');

      const totalSales = completedSales.length;
      const totalRentals = activeRentals.length;
      const totalCommission = 
        completedSales.reduce((sum, s) => sum + (s.commission_amount || 0), 0) +
        activeRentals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);
      const totalShowings = completedShowings.length;
      
      const averageSalePrice = totalSales > 0 
        ? completedSales.reduce((sum, s) => sum + (s.sale_price || 0), 0) / totalSales 
        : 0;
      
      const averageRentalPrice = totalRentals > 0 
        ? activeRentals.reduce((sum, r) => sum + (r.monthly_rent || 0), 0) / totalRentals 
        : 0;

      const conversionRate = showings.length > 0 
        ? ((totalSales + totalRentals) / showings.length) * 100 
        : 0;

      return {
        totalSales,
        totalRentals,
        totalCommission,
        totalShowings,
        averageSalePrice,
        averageRentalPrice,
        conversionRate,
        monthlyGrowth: 0 // Bu hesaplama için daha karmaşık sorgu gerekli
      };
    } catch (error) {
      console.error('Dashboard istatistikleri alınırken hata:', error);
      throw error;
    }
  }

  // Aylık performans verileri
  async getMonthlyPerformance(year: number): Promise<any[]> {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('sale_date, sale_price, commission_amount')
        .gte('sale_date', `${year}-01-01`)
        .lte('sale_date', `${year}-12-31`)
        .eq('status', 'completed');

      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('start_date, monthly_rent, commission_amount')
        .gte('start_date', `${year}-01-01`)
        .lte('start_date', `${year}-12-31`)
        .eq('status', 'active');

      if (salesError) throw salesError;
      if (rentalsError) throw rentalsError;

      // Aylık verileri grupla
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: new Date(year, i).toLocaleDateString('tr-TR', { month: 'long' }),
        sales: 0,
        rentals: 0,
        salesCommission: 0,
        rentalCommission: 0,
        totalCommission: 0
      }));

      // Satış verilerini işle
      salesData?.forEach(sale => {
        const month = new Date(sale.sale_date).getMonth();
        monthlyData[month].sales += sale.sale_price || 0;
        monthlyData[month].salesCommission += sale.commission_amount || 0;
      });

      // Kiralama verilerini işle
      rentalsData?.forEach(rental => {
        const month = new Date(rental.start_date).getMonth();
        monthlyData[month].rentals += rental.monthly_rent || 0;
        monthlyData[month].rentalCommission += rental.commission_amount || 0;
      });

      // Toplam komisyonu hesapla
      monthlyData.forEach(data => {
        data.totalCommission = data.salesCommission + data.rentalCommission;
      });

      return monthlyData;
    } catch (error) {
      console.error('Aylık performans verileri alınırken hata:', error);
      throw error;
    }
  }

  // Emlak türü dağılımı
  async getPropertyTypeDistribution(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          property:properties(property_type)
        `)
        .eq('status', 'completed');

      if (error) throw error;

      // Emlak türlerini grupla
      const typeCount: { [key: string]: number } = {};
      data?.forEach((sale: any) => {
        const type = sale.property?.property_type || 'Bilinmeyen';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      return Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Emlak türü dağılımı alınırken hata:', error);
      throw error;
    }
  }

  // Yıllık karşılaştırma verileri
  async getYearlyComparison(): Promise<any[]> {
    try {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 2, currentYear - 1, currentYear];

      const yearlyData = await Promise.all(
        years.map(async (year) => {
          const [salesResult, rentalsResult] = await Promise.all([
            supabase
              .from('sales')
              .select('sale_price, commission_amount')
              .gte('sale_date', `${year}-01-01`)
              .lte('sale_date', `${year}-12-31`)
              .eq('status', 'completed'),
            supabase
              .from('rentals')
              .select('commission_amount')
              .gte('start_date', `${year}-01-01`)
              .lte('start_date', `${year}-12-31`)
              .eq('status', 'active')
          ]);

          const sales = salesResult.data || [];
          const rentals = rentalsResult.data || [];

          const totalSales = sales.reduce((sum, s) => sum + (s.sale_price || 0), 0);
          const totalCommission = 
            sales.reduce((sum, s) => sum + (s.commission_amount || 0), 0) +
            rentals.reduce((sum, r) => sum + (r.commission_amount || 0), 0);

          return {
            year,
            sales: totalSales,
            commission: totalCommission
          };
        })
      );

      return yearlyData;
    } catch (error) {
      console.error('Yıllık karşılaştırma verileri alınırken hata:', error);
      throw error;
    }
  }

  // Real-time güncellemeler için subscription
  subscribeToSalesUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('sales_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' }, 
        callback
      )
      .subscribe();
  }

  subscribeToRentalsUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('rentals_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rentals' }, 
        callback
      )
      .subscribe();
  }

  subscribeToPerformanceUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('performance_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_performance' }, 
        callback
      )
      .subscribe();
  }
}

export const reportingService = new ReportingService();
export default reportingService;