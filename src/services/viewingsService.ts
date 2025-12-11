import { supabase } from '../lib/supabase';

export interface Viewing {
  id: string;
  property_id: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  scheduled_date: string;
  duration_minutes: number;
  viewing_type: 'in_person' | 'virtual' | 'video_call';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  assigned_agent?: string;
  agent_notes?: string;
  customer_feedback?: string;
  customer_rating?: number;
  follow_up_required: boolean;
  follow_up_notes?: string;
  follow_up_date?: string;
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

export interface ViewingFilters {
  page?: number;
  limit?: number;
  property_id?: string;
  customer_id?: string;
  assigned_agent?: string;
  viewing_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ViewingResponse {
  viewings: Viewing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateViewingData {
  property_id: string;
  customer_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  scheduled_date: string;
  duration_minutes?: number;
  viewing_type: string;
  assigned_agent?: string;
  agent_notes?: string;
}

export interface UpdateViewingData extends Partial<CreateViewingData> {
  id?: string;
  status?: string;
  customer_feedback?: string;
  customer_rating?: number;
  follow_up_required?: boolean;
  follow_up_notes?: string;
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompleteViewingData {
  agent_notes?: string;
  customer_feedback?: string;
  customer_rating?: number;
  follow_up_required: boolean;
  follow_up_notes?: string;
  follow_up_date?: string;
}

export interface ViewingCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  property_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  viewing_type: string;
  status: string;
  property_address: string;
  property_price: number;
}

export interface ViewingStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  by_type: {
    in_person: number;
    virtual: number;
    video_call: number;
  };
  completion_rate: number;
  avg_rating: number;
  follow_up_required: number;
}

class ViewingsService {
  private basePath = '/viewings';

  async getViewings(filters: ViewingFilters = {}): Promise<ViewingResponse> {
    let query = supabase
      .from('viewings')
      .select(`
        *,
        property:properties(*),
        customer:customers(*),
        agent_profile:profiles(*)
      `);

    // Apply filters
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters.assigned_agent) query = query.eq('assigned_agent', filters.assigned_agent);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }
    if (filters.date_from) query = query.gte('scheduled_date', filters.date_from);
    if (filters.date_to) query = query.lte('scheduled_date', filters.date_to);

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Sorting
    const sortBy = filters.sort_by || 'scheduled_date';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query.range(from, to);
    
    if (error) throw error;

    return {
      viewings: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getViewing(id: string): Promise<Viewing> {
    const { data, error } = await supabase
      .from('viewings')
      .select(`
        *,
        property:properties(*),
        customer:customers(*),
        agent_profile:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createViewing(data: CreateViewingData): Promise<Viewing> {
    const { data: viewing, error } = await supabase
      .from('viewings')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async updateViewing(id: string, data: UpdateViewingData): Promise<Viewing> {
    const { data: viewing, error } = await supabase
      .from('viewings')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async deleteViewing(id: string): Promise<{ message: string }> {
    const { error } = await supabase
      .from('viewings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Viewing deleted successfully' };
  }

  async confirmViewing(id: string, notes?: string): Promise<Viewing> {
    const updateData: any = { status: 'confirmed' };
    if (notes) updateData.notes = notes;

    const { data: viewing, error } = await supabase
      .from('viewings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async cancelViewing(id: string, reason?: string): Promise<Viewing> {
    const updateData: any = { status: 'cancelled' };
    if (reason) updateData.cancellation_reason = reason;

    const { data: viewing, error } = await supabase
      .from('viewings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async completeViewing(id: string, feedback?: string): Promise<Viewing> {
    const updateData: any = { 
      status: 'completed',
      completed_at: new Date().toISOString()
    };
    if (feedback) updateData.feedback = feedback;

    const { data: viewing, error } = await supabase
      .from('viewings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async rescheduleViewing(id: string, newDate: string, notes?: string): Promise<Viewing> {
    const updateData: any = { 
      scheduled_date: newDate,
      status: 'rescheduled'
    };
    if (notes) updateData.notes = notes;

    const { data: viewing, error } = await supabase
      .from('viewings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return viewing;
  }

  async getViewingStats(filters: Omit<ViewingFilters, 'page' | 'limit'> = {}): Promise<ViewingStats> {
    let query = supabase.from('viewings').select('status, viewing_type, scheduled_date, completed_at, created_at, customer_rating, follow_up_required');

    // Apply filters
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters.assigned_agent) query = query.eq('assigned_agent', filters.assigned_agent);
    if (filters.date_from) query = query.gte('scheduled_date', filters.date_from);
    if (filters.date_to) query = query.lte('scheduled_date', filters.date_to);

    const { data, error } = await query;
    
    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      scheduled: data?.filter(v => v.status === 'scheduled').length || 0,
      confirmed: data?.filter(v => v.status === 'confirmed').length || 0,
      completed: data?.filter(v => v.status === 'completed').length || 0,
      cancelled: data?.filter(v => v.status === 'cancelled').length || 0,
      no_show: data?.filter(v => v.status === 'no_show').length || 0,
      by_type: {
        in_person: data?.filter(v => v.viewing_type === 'in_person').length || 0,
        virtual: data?.filter(v => v.viewing_type === 'virtual').length || 0,
        video_call: data?.filter(v => v.viewing_type === 'video_call').length || 0,
      },
      completion_rate: 0,
      avg_rating: 0,
      follow_up_required: data?.filter(v => v.follow_up_required === true).length || 0
    };

    // Calculate completion rate
    const completedCount = stats.completed;
    const totalScheduled = stats.total - stats.cancelled;
    stats.completion_rate = totalScheduled > 0 ? (completedCount / totalScheduled) * 100 : 0;

    // Calculate average rating
    const ratedViewings = data?.filter(v => v.customer_rating && v.customer_rating > 0) || [];
    if (ratedViewings.length > 0) {
      const totalRating = ratedViewings.reduce((sum, viewing) => sum + (viewing.customer_rating || 0), 0);
      stats.avg_rating = totalRating / ratedViewings.length;
    }

    return stats;
  }

  async getAvailableSlots(agentId: string, date: string): Promise<string[]> {
    // Get existing viewings for the agent on the specified date
    const { data: existingViewings, error } = await supabase
      .from('viewings')
      .select('scheduled_date')
      .eq('agent_id', agentId)
      .gte('scheduled_date', `${date}T00:00:00`)
      .lt('scheduled_date', `${date}T23:59:59`)
      .in('status', ['scheduled', 'confirmed']);

    if (error) throw error;

    // Generate available time slots (9 AM to 6 PM, 1-hour intervals)
    const allSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Filter out booked slots
    const bookedSlots = existingViewings?.map(v => {
      const date = new Date(v.scheduled_date);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }) || [];

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async getMyViewings(filters: Omit<ViewingFilters, 'assigned_agent'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, assigned_agent: 'me' });
  }

  async getViewingsByProperty(propertyId: string, filters: Omit<ViewingFilters, 'property_id'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, property_id: propertyId });
  }

  async getViewingsByCustomer(customerId: string, filters: Omit<ViewingFilters, 'customer_id'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, customer_id: customerId });
  }

  async getViewingsByAgent(agentId: string, filters: Omit<ViewingFilters, 'assigned_agent'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, assigned_agent: agentId });
  }

  async searchViewings(searchTerm: string, filters: Omit<ViewingFilters, 'search'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, search: searchTerm });
  }

  async getViewingsByType(viewingType: string, filters: Omit<ViewingFilters, 'viewing_type'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, viewing_type: viewingType });
  }

  async getViewingsByStatus(status: string, filters: Omit<ViewingFilters, 'status'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, status });
  }

  async getScheduledViewings(filters: Omit<ViewingFilters, 'status'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, status: 'scheduled' });
  }

  async getConfirmedViewings(filters: Omit<ViewingFilters, 'status'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, status: 'confirmed' });
  }

  async getCompletedViewings(filters: Omit<ViewingFilters, 'status'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, status: 'completed' });
  }

  async getUpcomingViewings(filters: ViewingFilters = {}): Promise<ViewingResponse> {
    const today = new Date().toISOString();
    return this.getViewings({ 
      ...filters, 
      status: 'scheduled,confirmed',
      date_from: today,
      sort_by: 'scheduled_date',
      sort_order: 'asc'
    });
  }

  async getTodaysViewings(filters: ViewingFilters = {}): Promise<ViewingResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.getViewingsByDateRange(today, today, filters);
  }

  async getThisWeeksViewings(filters: ViewingFilters = {}): Promise<ViewingResponse> {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.getViewingsByDateRange(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0],
      filters
    );
  }

  async getViewingsByDateRange(dateFrom: string, dateTo: string, filters: Omit<ViewingFilters, 'date_from' | 'date_to'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, date_from: dateFrom, date_to: dateTo });
  }

  async getInPersonViewings(filters: Omit<ViewingFilters, 'viewing_type'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, viewing_type: 'in_person' });
  }

  async getVirtualViewings(filters: Omit<ViewingFilters, 'viewing_type'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, viewing_type: 'virtual' });
  }

  async getVideoCallViewings(filters: Omit<ViewingFilters, 'viewing_type'> = {}): Promise<ViewingResponse> {
    return this.getViewings({ ...filters, viewing_type: 'video_call' });
  }

  async getViewingsRequiringFollowUp(filters: ViewingFilters = {}): Promise<ViewingResponse> {
    return this.getViewings({ 
      ...filters, 
      status: 'completed',
      // Note: Backend should filter by follow_up_required = true
    });
  }

  async getMyCalendar(dateFrom?: string, dateTo?: string): Promise<ViewingCalendarEvent[]> {
    let query = supabase
      .from('viewings')
      .select(`
        *,
        property:properties(id, title, address, price),
        customer:customers(name, email, phone)
      `)
      .eq('assigned_agent', 'me'); // This should be replaced with actual user ID

    if (dateFrom) query = query.gte('scheduled_date', dateFrom);
    if (dateTo) query = query.lte('scheduled_date', dateTo);

    const { data, error } = await query;
    
    if (error) throw error;

    return (data || []).map(viewing => ({
      id: viewing.id,
      title: `${viewing.contact_name} - ${viewing.property?.title || 'Property'}`,
      start: viewing.scheduled_date,
      end: new Date(new Date(viewing.scheduled_date).getTime() + viewing.duration_minutes * 60000).toISOString(),
      property_id: viewing.property_id,
      customer_name: viewing.contact_name,
      customer_email: viewing.contact_email,
      customer_phone: viewing.contact_phone,
      viewing_type: viewing.viewing_type,
      status: viewing.status,
      property_address: viewing.property?.address || '',
      property_price: viewing.property?.price || 0
    }));
  }

  async getMyTodaysCalendar(): Promise<ViewingCalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMyCalendar(today, today);
  }

  async getMyWeeklyCalendar(): Promise<ViewingCalendarEvent[]> {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return this.getMyCalendar(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0]
    );
  }
}

export const viewingsService = new ViewingsService();
export default viewingsService;