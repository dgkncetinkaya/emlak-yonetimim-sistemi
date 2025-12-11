import { supabase } from '../lib/supabase';

export interface UserAppearanceSettings {
  id?: string;
  user_id?: string;
  
  // Logo ve Marka
  logo_url?: string;
  company_name?: string;
  brand_color?: string;
  
  // Tema Ayarları
  theme_mode?: 'light' | 'dark' | 'auto';
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  
  // Sidebar Ayarları
  sidebar_color?: string;
  sidebar_text_color?: string;
  sidebar_collapsed?: boolean;
  
  // Header Ayarları
  header_color?: string;
  header_text_color?: string;
  show_company_logo?: boolean;
  
  // Arka Plan Ayarları
  background_color?: string;
  content_background_color?: string;
  
  // Font Ayarları
  font_family?: string;
  font_size?: 'small' | 'medium' | 'large';
  
  // Kart ve Bileşen Stilleri
  card_border_radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  button_style?: 'solid' | 'outline' | 'ghost';
  
  // Dashboard Ayarları
  dashboard_layout?: 'grid' | 'list' | 'compact';
  show_statistics?: boolean;
  show_charts?: boolean;
  
  // Diğer
  custom_css?: string;
  
  created_at?: string;
  updated_at?: string;
}

export const appearanceService = {
  // Kullanıcının görünüm ayarlarını getir
  async getAppearanceSettings(): Promise<UserAppearanceSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı bulunamadı');

    const { data, error } = await supabase
      .from('user_appearance_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Eğer ayar yoksa varsayılan değerleri döndür
    if (!data) {
      return {
        theme_mode: 'light',
        primary_color: '#3182CE',
        secondary_color: '#805AD5',
        accent_color: '#38B2AC',
        sidebar_color: '#1A202C',
        sidebar_text_color: '#FFFFFF',
        sidebar_collapsed: false,
        header_color: '#FFFFFF',
        header_text_color: '#1A202C',
        show_company_logo: true,
        background_color: '#F7FAFC',
        content_background_color: '#FFFFFF',
        font_family: 'Inter',
        font_size: 'medium',
        card_border_radius: 'md',
        button_style: 'solid',
        dashboard_layout: 'grid',
        show_statistics: true,
        show_charts: true,
        brand_color: '#3182CE'
      };
    }

    return data;
  },

  // Görünüm ayarlarını güncelle veya oluştur
  async updateAppearanceSettings(settings: Partial<UserAppearanceSettings>): Promise<UserAppearanceSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı bulunamadı');

    // Önce mevcut ayarı kontrol et
    const { data: existing } = await supabase
      .from('user_appearance_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Güncelle
      const { data, error } = await supabase
        .from('user_appearance_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Yeni oluştur
      const { data, error } = await supabase
        .from('user_appearance_settings')
        .insert({
          user_id: user.id,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Logo yükle
  async uploadLogo(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı bulunamadı');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `logos/${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Ayarları sıfırla
  async resetAppearanceSettings(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı bulunamadı');

    const { error } = await supabase
      .from('user_appearance_settings')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }
};
