import { supabase } from '../lib/supabase';

export interface Appointment {
  id?: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  property_title: string;
  property_address: string;
  appointment_date: string;
  appointment_time?: string;
  appointment_reason: 'viewing' | 'meeting' | 'deed_process' | 'sale' | 'rent' | 'valuation' | 'consultation' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'postponed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentParticipant {
  id?: string;
  appointment_id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'owner' | 'consultant' | 'assistant' | 'other';
  created_at?: string;
}

export interface AppointmentReminder {
  id?: string;
  appointment_id: string;
  reminder_type: 'sms' | 'email';
  enabled: boolean;
  timing_minutes: number;
  sent?: boolean;
  sent_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentWithDetails extends Appointment {
  participants?: AppointmentParticipant[];
  reminders?: AppointmentReminder[];
}

class AppointmentsService {
  // Get all appointments for the current user (İZOLE)
  async getAppointments(): Promise<AppointmentWithDetails[]> {
    try {
      // İZOLASYON: Sadece giriş yapan kullanıcının randevularını getir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_participants (*),
          appointment_reminders (*)
        `)
        .eq('user_id', user.id) // Sadece kendi randevuları
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      return appointments?.map(appointment => ({
        ...appointment,
        participants: appointment.appointment_participants || [],
        reminders: appointment.appointment_reminders || []
      })) || [];
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  }

  // Get a single appointment by ID (İZOLE)
  async getAppointment(id: string): Promise<AppointmentWithDetails | null> {
    try {
      // İZOLASYON: Sadece kendi randevusunu görebilir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_participants (*),
          appointment_reminders (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id) // Sadece kendi randevusu
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        throw error;
      }

      if (!appointment) return null;

      return {
        ...appointment,
        participants: appointment.appointment_participants || [],
        reminders: appointment.appointment_reminders || []
      };
    } catch (error) {
      console.error('Error in getAppointment:', error);
      throw error;
    }
  }

  // Create a new appointment
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        throw error;
      }

      return appointment.id;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  }

  // Update an appointment (İZOLE)
  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<void> {
    try {
      // İZOLASYON: Sadece kendi randevusunu güncelleyebilir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .eq('user_id', user.id); // Sadece kendi randevusu

      if (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  }

  // Delete an appointment (İZOLE)
  async deleteAppointment(id: string): Promise<void> {
    try {
      // İZOLASYON: Sadece kendi randevusunu silebilir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Sadece kendi randevusu

      if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      throw error;
    }
  }

  // Add participant to appointment
  async addParticipant(participantData: Omit<AppointmentParticipant, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data: participant, error } = await supabase
        .from('appointment_participants')
        .insert([participantData])
        .select()
        .single();

      if (error) {
        console.error('Error adding participant:', error);
        throw error;
      }

      return participant.id;
    } catch (error) {
      console.error('Error in addParticipant:', error);
      throw error;
    }
  }

  // Remove participant from appointment
  async removeParticipant(participantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointment_participants')
        .delete()
        .eq('id', participantId);

      if (error) {
        console.error('Error removing participant:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeParticipant:', error);
      throw error;
    }
  }

  // Update appointment participants
  async updateParticipants(appointmentId: string, participants: Omit<AppointmentParticipant, 'id' | 'appointment_id' | 'created_at'>[]): Promise<void> {
    try {
      // First, delete existing participants
      await supabase
        .from('appointment_participants')
        .delete()
        .eq('appointment_id', appointmentId);

      // Then, add new participants
      if (participants.length > 0) {
        const participantsData = participants.map(p => ({
          ...p,
          appointment_id: appointmentId
        }));

        const { error } = await supabase
          .from('appointment_participants')
          .insert(participantsData);

        if (error) {
          console.error('Error updating participants:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in updateParticipants:', error);
      throw error;
    }
  }

  // Update appointment reminders
  async updateReminders(appointmentId: string, reminders: Omit<AppointmentReminder, 'id' | 'appointment_id' | 'created_at' | 'updated_at' | 'sent' | 'sent_at'>[]): Promise<void> {
    try {
      // First, delete existing reminders
      await supabase
        .from('appointment_reminders')
        .delete()
        .eq('appointment_id', appointmentId);

      // Then, add new reminders
      if (reminders.length > 0) {
        const remindersData = reminders.map(r => ({
          ...r,
          appointment_id: appointmentId
        }));

        const { error } = await supabase
          .from('appointment_reminders')
          .insert(remindersData);

        if (error) {
          console.error('Error updating reminders:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in updateReminders:', error);
      throw error;
    }
  }

  // Update appointment status (İZOLE)
  async updateStatus(id: string, status: Appointment['status']): Promise<void> {
    try {
      // İZOLASYON: Sadece kendi randevusunun durumunu güncelleyebilir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id); // Sadece kendi randevusu

      if (error) {
        console.error('Error updating appointment status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  // Alias for updateStatus to maintain compatibility
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    return this.updateStatus(id, status);
  }

  // Get appointments by date range (İZOLE)
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<AppointmentWithDetails[]> {
    try {
      // İZOLASYON: Sadece kendi randevularını getir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_participants (*),
          appointment_reminders (*)
        `)
        .eq('user_id', user.id) // Sadece kendi randevuları
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by date range:', error);
        throw error;
      }

      return appointments?.map(appointment => ({
        ...appointment,
        participants: appointment.appointment_participants || [],
        reminders: appointment.appointment_reminders || []
      })) || [];
    } catch (error) {
      console.error('Error in getAppointmentsByDateRange:', error);
      throw error;
    }
  }

  // Get appointments by status (İZOLE)
  async getAppointmentsByStatus(status: Appointment['status']): Promise<AppointmentWithDetails[]> {
    try {
      // İZOLASYON: Sadece kendi randevularını getir
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_participants (*),
          appointment_reminders (*)
        `)
        .eq('user_id', user.id) // Sadece kendi randevuları
        .eq('status', status)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments by status:', error);
        throw error;
      }

      return appointments?.map(appointment => ({
        ...appointment,
        participants: appointment.appointment_participants || [],
        reminders: appointment.appointment_reminders || []
      })) || [];
    } catch (error) {
      console.error('Error in getAppointmentsByStatus:', error);
      throw error;
    }
  }
}

export const appointmentsService = new AppointmentsService();