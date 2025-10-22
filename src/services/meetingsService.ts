import { supabase } from '../lib/supabase';

export interface CustomerMeeting {
  id: number;
  customer_id: string;
  date: string;
  type: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingData {
  customer_id: string;
  date: string;
  type: string;
  notes?: string;
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  id?: number;
}

export interface MeetingFilters {
  customer_id?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface MeetingResponse {
  meetings: CustomerMeeting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class MeetingsService {
  async getMeetings(filters: MeetingFilters = {}): Promise<MeetingResponse> {
    try {
      const { 
        customer_id, 
        type, 
        date_from, 
        date_to, 
        page = 1, 
        limit = 10 
      } = filters;

      let query = supabase
        .from('customer_meetings')
        .select('*', { count: 'exact' });

      // Apply filters
      if (customer_id) {
        query = query.eq('customer_id', customer_id);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (date_from) {
        query = query.gte('date', date_from);
      }

      if (date_to) {
        query = query.lte('date', date_to);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by date descending
      query = query.order('date', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch meetings: ${error.message}`);
      }

      const total = count || 0;
      const pages = Math.ceil(total / limit);

      return {
        meetings: data || [],
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  async getMeeting(id: number): Promise<CustomerMeeting> {
    try {
      const { data, error } = await supabase
        .from('customer_meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch meeting: ${error.message}`);
      }

      if (!data) {
        throw new Error('Meeting not found');
      }

      return data;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  async createMeeting(meetingData: CreateMeetingData): Promise<CustomerMeeting> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('customer_meetings')
        .insert({
          ...meetingData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create meeting: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async updateMeeting(id: number, meetingData: UpdateMeetingData): Promise<CustomerMeeting> {
    try {
      const { data, error } = await supabase
        .from('customer_meetings')
        .update(meetingData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update meeting: ${error.message}`);
      }

      if (!data) {
        throw new Error('Meeting not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(id: number): Promise<{ message: string }> {
    try {
      const { error } = await supabase
        .from('customer_meetings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete meeting: ${error.message}`);
      }

      return { message: 'Meeting deleted successfully' };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  async getMeetingsByCustomer(customerId: string, page = 1, limit = 10): Promise<MeetingResponse> {
    return this.getMeetings({ customer_id: customerId, page, limit });
  }

  async getMeetingsByType(type: string, page = 1, limit = 10): Promise<MeetingResponse> {
    return this.getMeetings({ type, page, limit });
  }

  async getMeetingsByDateRange(dateFrom: string, dateTo: string, page = 1, limit = 10): Promise<MeetingResponse> {
    return this.getMeetings({ date_from: dateFrom, date_to: dateTo, page, limit });
  }
}

export const meetingsService = new MeetingsService();
export default meetingsService;