import { supabase } from '../lib/supabase';

export interface CustomerProperty {
  id: number;
  customer_id: string;
  date: string;
  property: string;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyData {
  customer_id: string;
  date: string;
  property: string;
  status: string;
  notes?: string;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id?: number;
}

export interface PropertyFilters {
  customer_id?: string;
  status?: string;
  property?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface PropertyResponse {
  properties: CustomerProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class CustomerPropertiesService {
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyResponse> {
    try {
      const { 
        customer_id, 
        status, 
        property,
        date_from, 
        date_to, 
        page = 1, 
        limit = 10 
      } = filters;

      let query = supabase
        .from('customer_properties')
        .select('*', { count: 'exact' });

      // Apply filters
      if (customer_id) {
        query = query.eq('customer_id', customer_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (property) {
        query = query.ilike('property', `%${property}%`);
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
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }

      const total = count || 0;
      const pages = Math.ceil(total / limit);

      return {
        properties: data || [],
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getProperty(id: number): Promise<CustomerProperty> {
    try {
      const { data, error } = await supabase
        .from('customer_properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch property: ${error.message}`);
      }

      if (!data) {
        throw new Error('Property not found');
      }

      return data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async createProperty(propertyData: CreatePropertyData): Promise<CustomerProperty> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('customer_properties')
        .insert({
          ...propertyData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create property: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: number, propertyData: UpdatePropertyData): Promise<CustomerProperty> {
    try {
      const { data, error } = await supabase
        .from('customer_properties')
        .update(propertyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update property: ${error.message}`);
      }

      if (!data) {
        throw new Error('Property not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: number): Promise<{ message: string }> {
    try {
      const { error } = await supabase
        .from('customer_properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete property: ${error.message}`);
      }

      return { message: 'Property deleted successfully' };
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async getPropertiesByCustomer(customerId: string, page = 1, limit = 10): Promise<PropertyResponse> {
    return this.getProperties({ customer_id: customerId, page, limit });
  }

  async getPropertiesByStatus(status: string, page = 1, limit = 10): Promise<PropertyResponse> {
    return this.getProperties({ status, page, limit });
  }

  async getPropertiesByDateRange(dateFrom: string, dateTo: string, page = 1, limit = 10): Promise<PropertyResponse> {
    return this.getProperties({ date_from: dateFrom, date_to: dateTo, page, limit });
  }

  async searchProperties(searchTerm: string, page = 1, limit = 10): Promise<PropertyResponse> {
    return this.getProperties({ property: searchTerm, page, limit });
  }
}

export const customerPropertiesService = new CustomerPropertiesService();
export default customerPropertiesService;