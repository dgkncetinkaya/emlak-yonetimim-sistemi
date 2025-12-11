import { supabase } from '../lib/supabase';

export interface Consultant {
  id: string;
  email: string;
  full_name: string;
  role: string;
  parent_user_id: string;
  is_sub_user: boolean;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateConsultantData {
  email: string;
  password: string;
  full_name: string;
  commission_rate?: number;
}

class ConsultantsService {
  async getConsultants(): Promise<Consultant[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get consultants created by current user
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('parent_user_id', user.id)
      .eq('is_sub_user', true)
      .eq('role', 'consultant')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createConsultant(consultantData: CreateConsultantData): Promise<Consultant> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Mevcut session'ı kaydet
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: consultantData.email,
      password: consultantData.password,
      options: {
        data: {
          full_name: consultantData.full_name,
          role: 'consultant',
          parent_user_id: user.id,
          is_sub_user: true,
          commission_rate: consultantData.commission_rate || 5
        }
      }
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Failed to create user');

    // Eski session'a geri dön - yeni kullanıcıya geçiş yapma!
    if (currentSession) {
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token
      });
    }

    // Wait a bit for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return the created consultant data
    return {
      id: authData.user.id,
      email: consultantData.email,
      full_name: consultantData.full_name,
      role: 'consultant',
      parent_user_id: user.id,
      is_sub_user: true,
      commission_rate: consultantData.commission_rate || 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async updateCommissionRate(consultantId: string, commissionRate: number): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        commission_rate: commissionRate,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultantId);

    if (error) throw new Error(error.message);
  }

  async deleteConsultant(consultantId: string): Promise<void> {
    // Note: This will only delete the profile, not the auth user
    // For full deletion, you'd need a Supabase Edge Function
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', consultantId);

    if (error) throw new Error(error.message);
  }
}

export const consultantsService = new ConsultantsService();
export default consultantsService;
