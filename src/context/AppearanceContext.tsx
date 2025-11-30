import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorMode } from '@chakra-ui/react';
import { appearanceService, type UserAppearanceSettings } from '../services/appearanceService';
import { useAuth } from './AuthContext';

interface AppearanceContextType {
  settings: UserAppearanceSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserAppearanceSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserAppearanceSettings = {
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

const AppearanceContext = createContext<AppearanceContextType>({
  settings: defaultSettings,
  isLoading: false,
  updateSettings: async () => {},
  refreshSettings: async () => {}
});

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserAppearanceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { setColorMode } = useColorMode();

  const loadSettings = async () => {
    if (!user) {
      setSettings(defaultSettings);
      setIsLoading(false);
      return;
    }

    try {
      const userSettings = await appearanceService.getAppearanceSettings();
      setSettings(userSettings);
      
      // Tema modunu uygula
      if (userSettings.theme_mode === 'light' || userSettings.theme_mode === 'dark') {
        setColorMode(userSettings.theme_mode);
      }
      
      // CSS değişkenlerini uygula
      applyCustomStyles(userSettings);
    } catch (error) {
      console.error('Görünüm ayarları yüklenemedi:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCustomStyles = (userSettings: UserAppearanceSettings) => {
    const root = document.documentElement;
    
    // Renkleri CSS değişkenleri olarak ayarla
    if (userSettings.primary_color) {
      root.style.setProperty('--chakra-colors-blue-500', userSettings.primary_color);
      root.style.setProperty('--chakra-colors-blue-600', adjustColor(userSettings.primary_color, -10));
    }
    
    if (userSettings.secondary_color) {
      root.style.setProperty('--chakra-colors-purple-500', userSettings.secondary_color);
    }
    
    if (userSettings.accent_color) {
      root.style.setProperty('--chakra-colors-teal-500', userSettings.accent_color);
    }
    
    // Arka plan renkleri
    if (userSettings.background_color) {
      root.style.setProperty('--chakra-colors-gray-50', userSettings.background_color);
      document.body.style.backgroundColor = userSettings.background_color;
    }
    
    if (userSettings.content_background_color) {
      root.style.setProperty('--chakra-colors-white', userSettings.content_background_color);
      
      // Tüm Card bileşenlerinin arka planını güncelle
      const style = document.createElement('style');
      style.id = 'card-background-override';
      const existingStyle = document.getElementById('card-background-override');
      if (existingStyle) {
        existingStyle.remove();
      }
      style.textContent = `
        .chakra-card {
          background-color: ${userSettings.content_background_color} !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Font ayarları
    if (userSettings.font_family) {
      root.style.setProperty('--chakra-fonts-body', userSettings.font_family);
      root.style.setProperty('--chakra-fonts-heading', userSettings.font_family);
    }
    
    // Font boyutu
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    if (userSettings.font_size) {
      root.style.setProperty('--chakra-fontSizes-md', fontSizeMap[userSettings.font_size]);
    }
    
    // Border radius
    const borderRadiusMap = {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    };
    if (userSettings.card_border_radius) {
      root.style.setProperty('--chakra-radii-md', borderRadiusMap[userSettings.card_border_radius]);
      root.style.setProperty('--chakra-radii-lg', borderRadiusMap[userSettings.card_border_radius]);
    }
    
    // Custom CSS
    if (userSettings.custom_css) {
      let styleElement = document.getElementById('custom-appearance-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-appearance-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = userSettings.custom_css;
    }
  };

  // Renk tonunu ayarla (açık/koyu)
  const adjustColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  };

  const updateSettings = async (newSettings: Partial<UserAppearanceSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    applyCustomStyles(updatedSettings);
    
    // Tema modunu güncelle
    if (newSettings.theme_mode && (newSettings.theme_mode === 'light' || newSettings.theme_mode === 'dark')) {
      setColorMode(newSettings.theme_mode);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return (
    <AppearanceContext.Provider value={{ settings, isLoading, updateSettings, refreshSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
};
