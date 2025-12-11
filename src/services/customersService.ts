import { supabase } from '../lib/supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customer_type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  status: 'active' | 'inactive' | 'potential' | 'converted';
  budget_min?: number;
  budget_max?: number;
  preferred_property_type?: string;
  preferred_location?: string;
  preferred_rooms?: string;
  notes?: string;
  source?: string;
  assigned_agent?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Related data
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  created_by_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  customer_type?: string;
  status?: string;
  assigned_agent?: string;
  created_by?: string;
  search?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_property_type?: string;
  preferred_location?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CustomerResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  customer_type: string;
  status?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_property_type?: string;
  preferred_location?: string;
  preferred_rooms?: string;
  notes?: string;
  source?: string;
  assigned_agent?: string;
  preferences?: any;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerInquiry {
  id: string;
  property_id: string;
  customer_id: string;
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
  };
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CustomerViewing {
  id: string;
  property_id: string;
  customer_id: string;
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
  };
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  interaction_type: 'phone' | 'email' | 'meeting' | 'sms' | 'whatsapp' | 'other';
  interaction_date: string;
  notes?: string;
  assigned_agent?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
  // Related data
  assigned_agent_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_name: string;
  document_type: 'contract' | 'id_document' | 'income_proof' | 'viewing_form' | 'other';
  file_path: string;
  file_size: number;
  file_format: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  // Related data
  uploaded_by_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

class CustomersService {
  async getCustomers(filters: CustomerFilters = {}): Promise<CustomerResponse> {
    const {
      page = 1,
      limit = 10,
      customer_type,
      status,
      assigned_agent,
      created_by,
      search,
      budget_min,
      budget_max,
      preferred_property_type,
      preferred_location,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    // İZOLASYON: Her danışman sadece kendi müşterilerini görebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    let query = supabase
      .from('customers')
      .select(`
        *,
        assigned_agent_profile:assigned_agent(id, full_name, email, phone),
        created_by_profile:created_by(id, full_name, email, phone)
      `, { count: 'exact' })
      .eq('created_by', user.id); // Sadece kendi müşterilerini getir

    // Apply filters
    if (customer_type) {
      query = query.eq('customer_type', customer_type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (assigned_agent) {
      query = query.eq('assigned_agent', assigned_agent);
    }

    if (created_by) {
      if (created_by === 'me') {
        query = query.eq('created_by', user.id);
      } else {
        query = query.eq('created_by', created_by);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (budget_min !== undefined) {
      query = query.gte('budget_min', budget_min);
    }

    if (budget_max !== undefined) {
      query = query.lte('budget_max', budget_max);
    }

    if (preferred_property_type) {
      query = query.eq('preferred_property_type', preferred_property_type);
    }

    if (preferred_location) {
      query = query.ilike('preferred_location', `%${preferred_location}%`);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      customers: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getCustomer(id: string): Promise<Customer> {
    // İZOLASYON: Sadece kendi müşterisini görebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        assigned_agent_profile:assigned_agent(id, full_name, email, phone),
        created_by_profile:created_by(id, full_name, email, phone)
      `)
      .eq('id', id)
      .eq('created_by', user.id) // Sadece kendi müşterisi
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }
    
    const customerData = {
      ...data,
      created_by: user.id,
      status: data.status || 'active'
    };

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select(`
        *,
        assigned_agent_profile:assigned_agent(id, full_name, email, phone),
        created_by_profile:created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return newCustomer;
  }

  async updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
    // İZOLASYON: Sadece kendi müşterisini güncelleyebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('created_by', user.id) // Sadece kendi müşterisi
      .select(`
        *,
        assigned_agent_profile:assigned_agent(id, full_name, email, phone),
        created_by_profile:created_by(id, full_name, email, phone)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<{ message: string }> {
    // İZOLASYON: Sadece kendi müşterisini silebilir
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id); // Sadece kendi müşterisi

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Müşteri başarıyla silindi' };
  }

  async getCustomerInquiries(id: string, page = 1, limit = 10): Promise<{ inquiries: CustomerInquiry[]; pagination: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        property:property_id(id, title, address, price, property_type),
        assigned_agent_profile:assigned_agent(id, full_name, email)
      `, { count: 'exact' })
      .eq('customer_id', id)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

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

  async getCustomerViewings(id: string, page = 1, limit = 10): Promise<{ viewings: CustomerViewing[]; pagination: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('property_viewings')
      .select(`
        *,
        property:property_id(id, title, address, price, property_type),
        assigned_agent_profile:assigned_agent(id, full_name, email)
      `, { count: 'exact' })
      .eq('customer_id', id)
      .range(from, to)
      .order('scheduled_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

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

  // Helper methods for common filters
  async getMyCustomers(filters: Omit<CustomerFilters, 'created_by'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, created_by: 'me' });
  }

  async getCustomersByAgent(agentId: string, filters: Omit<CustomerFilters, 'assigned_agent'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, assigned_agent: agentId });
  }

  async searchCustomers(searchTerm: string, filters: Omit<CustomerFilters, 'search'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, search: searchTerm });
  }

  async getCustomersByType(customerType: string, filters: Omit<CustomerFilters, 'customer_type'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, customer_type: customerType });
  }

  async getCustomersByStatus(status: string, filters: Omit<CustomerFilters, 'status'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, status });
  }

  async getCustomersByBudgetRange(minBudget: number, maxBudget: number, filters: Omit<CustomerFilters, 'budget_min' | 'budget_max'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, budget_min: minBudget, budget_max: maxBudget });
  }

  async getActiveCustomers(filters: Omit<CustomerFilters, 'status'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, status: 'active' });
  }

  async getPotentialCustomers(filters: Omit<CustomerFilters, 'status'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, status: 'potential' });
  }

  async getBuyerCustomers(filters: Omit<CustomerFilters, 'customer_type'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, customer_type: 'buyer' });
  }

  async getSellerCustomers(filters: Omit<CustomerFilters, 'customer_type'> = {}): Promise<CustomerResponse> {
    return this.getCustomers({ ...filters, customer_type: 'seller' });
  }

  async getCustomerInteractions(id: string, page = 1, limit = 10): Promise<{ interactions: CustomerInteraction[]; pagination: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('customer_interactions')
      .select(`
        *,
        assigned_agent_profile:assigned_agent(id, full_name, email)
      `, { count: 'exact' })
      .eq('customer_id', id)
      .range(from, to)
      .order('interaction_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      interactions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getCustomerDocuments(id: string, page = 1, limit = 10): Promise<{ documents: CustomerDocument[]; pagination: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('customer_documents')
      .select(`
        *,
        uploaded_by_profile:uploaded_by(id, full_name, email)
      `, { count: 'exact' })
      .eq('customer_id', id)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      documents: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }
}

export const customersService = new CustomersService();
export default customersService;