import { supabase } from '../lib/supabase';

export interface Inquiry {
  id: string;
  property_id: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  inquiry_type: 'viewing' | 'information' | 'offer' | 'other';
  message?: string;
  preferred_contact_time?: string;
  status: 'new' | 'contacted' | 'responded' | 'closed';
  assigned_agent?: string;
  response_notes?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  // Related data
  property?: {
    id: string;
    title: string;
    address: string;
    price: number;
    property_type: string;
    cover_image?: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    customer_type: string;
  };
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface InquiryFilters {
  page?: number;
  limit?: number;
  property_id?: string;
  customer_id?: string;
  inquiry_type?: string;
  status?: string;
  assigned_agent?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface InquiryResponse {
  inquiries: Inquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateInquiryData {
  property_id: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  inquiry_type: string;
  message?: string;
  preferred_contact_time?: string;
  assigned_agent?: string;
}

export interface UpdateInquiryData extends Partial<CreateInquiryData> {
  id?: string;
  status?: string;
  response_notes?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InquiryStats {
  total: number;
  new: number;
  contacted: number;
  responded: number;
  closed: number;
  by_type: {
    viewing: number;
    information: number;
    offer: number;
    other: number;
  };
  response_rate: number;
  avg_response_time_hours: number;
}

class InquiriesService {
  private basePath = '/inquiries';

  async getInquiries(filters: InquiryFilters = {}): Promise<InquiryResponse> {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(*),
        customer:customers(*),
        assigned_agent_profile:profiles(*)
      `);

    // Apply filters
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters.inquiry_type) query = query.eq('inquiry_type', filters.inquiry_type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.assigned_agent) query = query.eq('assigned_agent', filters.assigned_agent);
    if (filters.search) {
      query = query.or(`contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }
    if (filters.date_from) query = query.gte('created_at', filters.date_from);
    if (filters.date_to) query = query.lte('created_at', filters.date_to);

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query.range(from, to);
    
    if (error) throw error;

    return {
      inquiries: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getInquiry(id: string): Promise<Inquiry> {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(*),
        customer:customers(*),
        assigned_agent_profile:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createInquiry(data: CreateInquiryData): Promise<Inquiry> {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  async updateInquiry(id: string, data: UpdateInquiryData): Promise<Inquiry> {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  async deleteInquiry(id: string): Promise<{ message: string }> {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Inquiry deleted successfully' };
  }

  async respondToInquiry(id: string, responseNotes: string): Promise<Inquiry> {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({
        response_notes: responseNotes,
        status: 'responded',
        responded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  async assignInquiry(id: string, agentId: string): Promise<Inquiry> {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ assigned_agent: agentId })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  async closeInquiry(id: string, notes?: string): Promise<Inquiry> {
    const updateData: any = { status: 'closed' };
    if (notes) updateData.response_notes = notes;

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return inquiry;
  }

  async getInquiryStats(filters: Omit<InquiryFilters, 'page' | 'limit'> = {}): Promise<InquiryStats> {
    let query = supabase.from('inquiries').select('status, inquiry_type, created_at, responded_at');

    // Apply filters
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters.assigned_agent) query = query.eq('assigned_agent', filters.assigned_agent);
    if (filters.date_from) query = query.gte('created_at', filters.date_from);
    if (filters.date_to) query = query.lte('created_at', filters.date_to);

    const { data, error } = await query;
    
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      new: data?.filter(i => i.status === 'new').length || 0,
      contacted: data?.filter(i => i.status === 'contacted').length || 0,
      responded: data?.filter(i => i.status === 'responded').length || 0,
      closed: data?.filter(i => i.status === 'closed').length || 0,
      by_type: {
        viewing: data?.filter(i => i.inquiry_type === 'viewing').length || 0,
        information: data?.filter(i => i.inquiry_type === 'information').length || 0,
        offer: data?.filter(i => i.inquiry_type === 'offer').length || 0,
        other: data?.filter(i => i.inquiry_type === 'other').length || 0,
      },
      response_rate: 0,
      avg_response_time_hours: 0
    };

    // Calculate response rate
    const respondedCount = stats.responded + stats.closed;
    stats.response_rate = stats.total > 0 ? (respondedCount / stats.total) * 100 : 0;

    // Calculate average response time
    const respondedInquiries = data?.filter(i => i.responded_at) || [];
    if (respondedInquiries.length > 0) {
      const totalResponseTime = respondedInquiries.reduce((sum, inquiry) => {
        const created = new Date(inquiry.created_at);
        const responded = new Date(inquiry.responded_at);
        return sum + (responded.getTime() - created.getTime());
      }, 0);
      stats.avg_response_time_hours = totalResponseTime / (respondedInquiries.length * 1000 * 60 * 60);
    }

    return stats;
  }

  // Helper methods for common filters
  async getMyInquiries(filters: Omit<InquiryFilters, 'assigned_agent'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, assigned_agent: 'me' });
  }

  async getInquiriesByProperty(propertyId: string, filters: Omit<InquiryFilters, 'property_id'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, property_id: propertyId });
  }

  async getInquiriesByCustomer(customerId: string, filters: Omit<InquiryFilters, 'customer_id'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, customer_id: customerId });
  }

  async getInquiriesByAgent(agentId: string, filters: Omit<InquiryFilters, 'assigned_agent'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, assigned_agent: agentId });
  }

  async searchInquiries(searchTerm: string, filters: Omit<InquiryFilters, 'search'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, search: searchTerm });
  }

  async getInquiriesByType(inquiryType: string, filters: Omit<InquiryFilters, 'inquiry_type'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, inquiry_type: inquiryType });
  }

  async getInquiriesByStatus(status: string, filters: Omit<InquiryFilters, 'status'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, status });
  }

  async getNewInquiries(filters: Omit<InquiryFilters, 'status'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, status: 'new' });
  }

  async getPendingInquiries(filters: InquiryFilters = {}): Promise<InquiryResponse> {
    return this.getInquiries({ 
      ...filters, 
      status: 'new,contacted' // Multiple statuses
    });
  }

  async getViewingRequests(filters: Omit<InquiryFilters, 'inquiry_type'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, inquiry_type: 'viewing' });
  }

  async getInformationRequests(filters: Omit<InquiryFilters, 'inquiry_type'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, inquiry_type: 'information' });
  }

  async getOfferInquiries(filters: Omit<InquiryFilters, 'inquiry_type'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, inquiry_type: 'offer' });
  }

  async getInquiriesByDateRange(dateFrom: string, dateTo: string, filters: Omit<InquiryFilters, 'date_from' | 'date_to'> = {}): Promise<InquiryResponse> {
    return this.getInquiries({ ...filters, date_from: dateFrom, date_to: dateTo });
  }

  async getTodaysInquiries(filters: InquiryFilters = {}): Promise<InquiryResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.getInquiriesByDateRange(today, today, filters);
  }

  async getThisWeeksInquiries(filters: InquiryFilters = {}): Promise<InquiryResponse> {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.getInquiriesByDateRange(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0],
      filters
    );
  }
}

export const inquiriesService = new InquiriesService();
export default inquiriesService;