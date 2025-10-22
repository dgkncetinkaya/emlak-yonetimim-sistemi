import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import reportingService, { 
  SaleRecord, 
  RentalRecord, 
  AgentPerformance, 
  PropertyShowing, 
  CommissionDistribution,
  DashboardStats,
  ReportFilters 
} from '../services/reportingService';

// State interface
interface ReportingState {
  // Data
  sales: SaleRecord[];
  rentals: RentalRecord[];
  agentPerformance: AgentPerformance[];
  showings: PropertyShowing[];
  commissionDistribution: CommissionDistribution[];
  dashboardStats: DashboardStats | null;
  monthlyPerformance: any[];
  propertyTypeDistribution: any[];
  yearlyComparison: any[];
  
  // Loading states
  loading: {
    sales: boolean;
    rentals: boolean;
    agentPerformance: boolean;
    showings: boolean;
    commissionDistribution: boolean;
    dashboardStats: boolean;
    monthlyPerformance: boolean;
    propertyTypeDistribution: boolean;
    yearlyComparison: boolean;
  };
  
  // Filters
  filters: ReportFilters;
  
  // Error states
  error: string | null;
}

// Action types
type ReportingAction =
  | { type: 'SET_LOADING'; payload: { key: keyof ReportingState['loading']; value: boolean } }
  | { type: 'SET_SALES'; payload: SaleRecord[] }
  | { type: 'SET_RENTALS'; payload: RentalRecord[] }
  | { type: 'SET_AGENT_PERFORMANCE'; payload: AgentPerformance[] }
  | { type: 'SET_SHOWINGS'; payload: PropertyShowing[] }
  | { type: 'SET_COMMISSION_DISTRIBUTION'; payload: CommissionDistribution[] }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'SET_MONTHLY_PERFORMANCE'; payload: any[] }
  | { type: 'SET_PROPERTY_TYPE_DISTRIBUTION'; payload: any[] }
  | { type: 'SET_YEARLY_COMPARISON'; payload: any[] }
  | { type: 'SET_FILTERS'; payload: ReportFilters }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_SALE'; payload: SaleRecord }
  | { type: 'UPDATE_SALE'; payload: SaleRecord }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'ADD_RENTAL'; payload: RentalRecord }
  | { type: 'UPDATE_RENTAL'; payload: RentalRecord }
  | { type: 'DELETE_RENTAL'; payload: string }
  | { type: 'UPDATE_AGENT_PERFORMANCE'; payload: AgentPerformance };

// Initial state
const initialState: ReportingState = {
  sales: [],
  rentals: [],
  agentPerformance: [],
  showings: [],
  commissionDistribution: [],
  dashboardStats: null,
  monthlyPerformance: [],
  propertyTypeDistribution: [],
  yearlyComparison: [],
  loading: {
    sales: false,
    rentals: false,
    agentPerformance: false,
    showings: false,
    commissionDistribution: false,
    dashboardStats: false,
    monthlyPerformance: false,
    propertyTypeDistribution: false,
    yearlyComparison: false,
  },
  filters: {},
  error: null,
};

// Reducer
function reportingReducer(state: ReportingState, action: ReportingAction): ReportingState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    
    case 'SET_RENTALS':
      return { ...state, rentals: action.payload };
    
    case 'SET_AGENT_PERFORMANCE':
      return { ...state, agentPerformance: action.payload };
    
    case 'SET_SHOWINGS':
      return { ...state, showings: action.payload };
    
    case 'SET_COMMISSION_DISTRIBUTION':
      return { ...state, commissionDistribution: action.payload };
    
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    
    case 'SET_MONTHLY_PERFORMANCE':
      return { ...state, monthlyPerformance: action.payload };
    
    case 'SET_PROPERTY_TYPE_DISTRIBUTION':
      return { ...state, propertyTypeDistribution: action.payload };
    
    case 'SET_YEARLY_COMPARISON':
      return { ...state, yearlyComparison: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_SALE':
      return { ...state, sales: [action.payload, ...state.sales] };
    
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id ? action.payload : sale
        ),
      };
    
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(sale => sale.id !== action.payload),
      };
    
    case 'ADD_RENTAL':
      return { ...state, rentals: [action.payload, ...state.rentals] };
    
    case 'UPDATE_RENTAL':
      return {
        ...state,
        rentals: state.rentals.map(rental =>
          rental.id === action.payload.id ? action.payload : rental
        ),
      };
    
    case 'DELETE_RENTAL':
      return {
        ...state,
        rentals: state.rentals.filter(rental => rental.id !== action.payload),
      };
    
    case 'UPDATE_AGENT_PERFORMANCE':
      return {
        ...state,
        agentPerformance: state.agentPerformance.map(performance =>
          performance.id === action.payload.id ? action.payload : performance
        ),
      };
    
    default:
      return state;
  }
}

// Context interface
interface ReportingContextType {
  state: ReportingState;
  
  // Data fetching functions
  fetchSalesReport: (filters?: ReportFilters) => Promise<void>;
  fetchRentalsReport: (filters?: ReportFilters) => Promise<void>;
  fetchAgentPerformance: (filters?: ReportFilters) => Promise<void>;
  fetchShowingsReport: (filters?: ReportFilters) => Promise<void>;
  fetchCommissionDistribution: (filters?: ReportFilters) => Promise<void>;
  fetchDashboardStats: (filters?: ReportFilters) => Promise<void>;
  fetchMonthlyPerformance: (year: number) => Promise<void>;
  fetchPropertyTypeDistribution: () => Promise<void>;
  fetchYearlyComparison: () => Promise<void>;
  
  // Filter functions
  updateFilters: (filters: ReportFilters) => void;
  clearFilters: () => void;
  
  // Utility functions
  refreshAllData: () => Promise<void>;
  exportToExcel: (reportType: string) => Promise<void>;
  exportToPDF: (reportType: string) => Promise<void>;
}

// Create context
const ReportingContext = createContext<ReportingContextType | undefined>(undefined);

// Provider component
interface ReportingProviderProps {
  children: ReactNode;
}

export const ReportingProvider: React.FC<ReportingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reportingReducer, initialState);
  const toast = useToast();

  // Data fetching functions
  const fetchSalesReport = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'sales', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getSalesReport(filters);
      dispatch({ type: 'SET_SALES', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Satış raporu alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'sales', value: false } });
    }
  };

  const fetchRentalsReport = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'rentals', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getRentalsReport(filters);
      dispatch({ type: 'SET_RENTALS', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kiralama raporu alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'rentals', value: false } });
    }
  };

  const fetchAgentPerformance = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'agentPerformance', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getAgentPerformance(filters);
      dispatch({ type: 'SET_AGENT_PERFORMANCE', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Danışman performans raporu alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'agentPerformance', value: false } });
    }
  };

  const fetchShowingsReport = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'showings', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getShowingsReport(filters);
      dispatch({ type: 'SET_SHOWINGS', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gösterim raporu alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'showings', value: false } });
    }
  };

  const fetchCommissionDistribution = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'commissionDistribution', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getCommissionDistribution(filters);
      dispatch({ type: 'SET_COMMISSION_DISTRIBUTION', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Komisyon dağılım raporu alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'commissionDistribution', value: false } });
    }
  };

  const fetchDashboardStats = async (filters: ReportFilters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'dashboardStats', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getDashboardStats(filters);
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Dashboard istatistikleri alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'dashboardStats', value: false } });
    }
  };

  const fetchMonthlyPerformance = async (year: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'monthlyPerformance', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getMonthlyPerformance(year);
      dispatch({ type: 'SET_MONTHLY_PERFORMANCE', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Aylık performans verileri alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'monthlyPerformance', value: false } });
    }
  };

  const fetchPropertyTypeDistribution = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'propertyTypeDistribution', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getPropertyTypeDistribution();
      dispatch({ type: 'SET_PROPERTY_TYPE_DISTRIBUTION', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Emlak türü dağılımı alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'propertyTypeDistribution', value: false } });
    }
  };

  const fetchYearlyComparison = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'yearlyComparison', value: true } });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await reportingService.getYearlyComparison();
      dispatch({ type: 'SET_YEARLY_COMPARISON', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Yıllık karşılaştırma verileri alınırken hata oluştu';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: 'Hata',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'yearlyComparison', value: false } });
    }
  };

  // Filter functions
  const updateFilters = (filters: ReportFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
  };

  // Utility functions
  const refreshAllData = async () => {
    const currentYear = new Date().getFullYear();
    await Promise.all([
      fetchSalesReport(state.filters),
      fetchRentalsReport(state.filters),
      fetchAgentPerformance(state.filters),
      fetchDashboardStats(state.filters),
      fetchMonthlyPerformance(currentYear),
      fetchPropertyTypeDistribution(),
      fetchYearlyComparison(),
    ]);
  };

  const exportToExcel = async (reportType: string) => {
    try {
      toast({
        title: 'Dışa Aktarma',
        description: 'Excel dosyası hazırlanıyor...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      let data: any[] = [];
      let fileName = '';
      
      switch (reportType) {
        case 'dashboard':
          data = state.agentPerformance.map(agent => ({
            'Danışman': agent.agent?.full_name || 'Bilinmiyor',
            'Toplam Satış': agent.total_sales,
            'Toplam Kiralama': agent.total_rentals,
            'Toplam Komisyon': agent.total_commission,
            'Satış Komisyonu': agent.sales_commission,
            'Kiralama Komisyonu': agent.rental_commission,
            'Dönüşüm Oranı (%)': agent.conversion_rate
          }));
          fileName = `dashboard_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
          
        case 'sales':
          data = state.sales.map(sale => ({
            'Tarih': new Date(sale.sale_date).toLocaleDateString('tr-TR'),
            'Mülk ID': sale.property_id,
            'Müşteri ID': sale.customer_id,
            'Danışman': sale.agent?.full_name || 'Bilinmiyor',
            'Satış Fiyatı': sale.sale_price,
            'Komisyon': sale.commission_amount,
            'Durum': sale.status === 'completed' ? 'Tamamlandı' : 
                    sale.status === 'pending' ? 'Beklemede' : 'İptal Edildi'
          }));
          fileName = `satis_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
          
        case 'rentals':
          data = state.rentals.map(rental => ({
            'Tarih': new Date(rental.start_date).toLocaleDateString('tr-TR'),
            'Mülk ID': rental.property_id,
            'Müşteri ID': rental.customer_id,
            'Danışman': rental.agent?.full_name || 'Bilinmiyor',
            'Aylık Kira': rental.monthly_rent,
            'Depozito': rental.deposit_amount,
            'Komisyon': rental.commission_amount,
            'Durum': rental.status === 'active' ? 'Aktif' : 
                    rental.status === 'pending' ? 'Beklemede' : 'Sonlandırıldı'
          }));
          fileName = `kira_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
          
        case 'agent-performance':
          data = state.agentPerformance.map(performance => ({
            'Danışman ID': performance.agent_id,
            'Dönem Başlangıç': new Date(performance.period_start).toLocaleDateString('tr-TR'),
            'Dönem Bitiş': new Date(performance.period_end).toLocaleDateString('tr-TR'),
            'Toplam Satış': performance.total_sales,
            'Toplam Kira': performance.total_rentals,
            'Toplam Gösterim': performance.total_showings,
            'Toplam Komisyon': performance.total_commission,
            'Dönüşüm Oranı': `%${(performance.conversion_rate * 100).toFixed(2)}`,
            'Ortalama Satış Fiyatı': performance.average_sale_price,
            'Ortalama Kira Fiyatı': performance.average_rental_price
          }));
          fileName = `danisan_performans_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
          
        default:
          throw new Error('Geçersiz rapor türü');
      }

      if (data.length === 0) {
        toast({
          title: 'Uyarı',
          description: 'Dışa aktarılacak veri bulunamadı',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Excel dosyası oluştur
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapor');

      // Dosyayı indir
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: 'Başarılı',
        description: 'Excel dosyası başarıyla indirildi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: 'Hata',
        description: 'Excel dosyası oluşturulurken hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const exportToPDF = async (reportType: string) => {
    try {
      toast({
        title: 'Dışa Aktarma',
        description: 'PDF dosyası hazırlanıyor...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      let data: any[] = [];
      let title = '';
      let fileName = '';
      
      switch (reportType) {
        case 'dashboard':
          data = state.agentPerformance.map(agent => ({
            'Danışman': agent.agent?.full_name || 'Bilinmiyor',
            'Toplam Satış': agent.total_sales,
            'Toplam Kiralama': agent.total_rentals,
            'Toplam Komisyon': `₺${agent.total_commission.toLocaleString('tr-TR')}`,
            'Satış Komisyonu': `₺${agent.sales_commission.toLocaleString('tr-TR')}`,
            'Kiralama Komisyonu': `₺${agent.rental_commission.toLocaleString('tr-TR')}`,
            'Dönüşüm Oranı': `%${agent.conversion_rate.toFixed(1)}`
          }));
          title = 'Dashboard Raporu';
          fileName = `dashboard_raporu_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'sales':
          data = state.sales.map(sale => ({
            'Tarih': new Date(sale.sale_date).toLocaleDateString('tr-TR'),
            'Mülk ID': sale.property_id,
            'Müşteri ID': sale.customer_id,
            'Danışman': sale.agent?.full_name || 'Bilinmiyor',
            'Satış Fiyatı': `₺${sale.sale_price.toLocaleString('tr-TR')}`,
            'Komisyon': `₺${sale.commission_amount.toLocaleString('tr-TR')}`,
            'Durum': sale.status === 'completed' ? 'Tamamlandı' : 
                    sale.status === 'pending' ? 'Beklemede' : 'İptal Edildi'
          }));
          title = 'Satış Raporu';
          fileName = `satis_raporu_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'rentals':
          data = state.rentals.map(rental => ({
            'Tarih': new Date(rental.start_date).toLocaleDateString('tr-TR'),
            'Mülk ID': rental.property_id,
            'Müşteri ID': rental.customer_id,
            'Danışman': rental.agent?.full_name || 'Bilinmiyor',
            'Aylık Kira': `₺${rental.monthly_rent.toLocaleString('tr-TR')}`,
            'Depozito': `₺${(rental.deposit_amount || 0).toLocaleString('tr-TR')}`,
            'Komisyon': `₺${rental.commission_amount.toLocaleString('tr-TR')}`,
            'Durum': rental.status === 'active' ? 'Aktif' : 
                    rental.status === 'pending' ? 'Beklemede' : 'Sonlandırıldı'
          }));
          title = 'Kira Raporu';
          fileName = `kira_raporu_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        case 'agent-performance':
          data = state.agentPerformance.map(performance => ({
            'Danışman ID': performance.agent_id,
            'Dönem': `${new Date(performance.period_start).toLocaleDateString('tr-TR')} - ${new Date(performance.period_end).toLocaleDateString('tr-TR')}`,
            'Satış': performance.total_sales.toString(),
            'Kira': performance.total_rentals.toString(),
            'Gösterim': performance.total_showings.toString(),
            'Komisyon': `₺${performance.total_commission.toLocaleString('tr-TR')}`,
            'Dönüşüm': `%${(performance.conversion_rate * 100).toFixed(2)}`
          }));
          title = 'Danışman Performans Raporu';
          fileName = `danisan_performans_raporu_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
          
        default:
          throw new Error('Geçersiz rapor türü');
      }

      if (data.length === 0) {
        toast({
          title: 'Uyarı',
          description: 'Dışa aktarılacak veri bulunamadı',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // PDF oluştur
      const pdf = new jsPDF();
      
      // Başlık ekle
      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30);
      
      // Tablo oluştur
      let yPosition = 50;
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 8;
      
      if (data.length > 0) {
        // Başlıkları ekle
        const headers = Object.keys(data[0]);
        const columnWidth = 180 / headers.length;
        
        pdf.setFontSize(8);
        headers.forEach((header, index) => {
          pdf.text(header, 20 + (index * columnWidth), yPosition);
        });
        
        yPosition += lineHeight;
        
        // Verileri ekle
        data.forEach((row, rowIndex) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          headers.forEach((header, colIndex) => {
            const value = row[header]?.toString() || '';
            pdf.text(value.substring(0, 15), 20 + (colIndex * columnWidth), yPosition);
          });
          
          yPosition += lineHeight;
        });
      }
      
      // PDF'i indir
      pdf.save(fileName);
      
      toast({
        title: 'Başarılı',
        description: 'PDF dosyası başarıyla indirildi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Hata',
        description: 'PDF dosyası oluşturulurken hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    const salesSubscription = reportingService.subscribeToSalesUpdates((payload) => {
      if (payload.eventType === 'INSERT') {
        dispatch({ type: 'ADD_SALE', payload: payload.new });
      } else if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_SALE', payload: payload.new });
      } else if (payload.eventType === 'DELETE') {
        dispatch({ type: 'DELETE_SALE', payload: payload.old.id });
      }
    });

    const rentalsSubscription = reportingService.subscribeToRentalsUpdates((payload) => {
      if (payload.eventType === 'INSERT') {
        dispatch({ type: 'ADD_RENTAL', payload: payload.new });
      } else if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_RENTAL', payload: payload.new });
      } else if (payload.eventType === 'DELETE') {
        dispatch({ type: 'DELETE_RENTAL', payload: payload.old.id });
      }
    });

    const performanceSubscription = reportingService.subscribeToPerformanceUpdates((payload) => {
      if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_AGENT_PERFORMANCE', payload: payload.new });
      }
    });

    return () => {
      salesSubscription.unsubscribe();
      rentalsSubscription.unsubscribe();
      performanceSubscription.unsubscribe();
    };
  }, []);

  // Initial data load
  useEffect(() => {
    refreshAllData();
  }, []);

  const contextValue: ReportingContextType = {
    state,
    fetchSalesReport,
    fetchRentalsReport,
    fetchAgentPerformance,
    fetchShowingsReport,
    fetchCommissionDistribution,
    fetchDashboardStats,
    fetchMonthlyPerformance,
    fetchPropertyTypeDistribution,
    fetchYearlyComparison,
    updateFilters,
    clearFilters,
    refreshAllData,
    exportToExcel,
    exportToPDF,
  };

  return (
    <ReportingContext.Provider value={contextValue}>
      {children}
    </ReportingContext.Provider>
  );
};

// Custom hook
export const useReporting = (): ReportingContextType => {
  const context = useContext(ReportingContext);
  if (context === undefined) {
    throw new Error('useReporting must be used within a ReportingProvider');
  }
  return context;
};

export default ReportingContext;