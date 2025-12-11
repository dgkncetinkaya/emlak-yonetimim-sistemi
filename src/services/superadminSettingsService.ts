// SuperAdmin Settings Service - Sistem geneli ayarlar yönetimi
// GİZLİLİK KURALI: Bu servis sadece sistem konfigürasyon ayarlarını içerir
// Müşteri sayısı, portföy sayısı, CRM kayıtları, kullanım istatistikleri asla gösterilmez

export interface GeneralSettings {
    systemName: string;
    supportEmail: string;
    defaultCurrency: 'TRY' | 'USD' | 'EUR';
    timezone: string;
    maintenanceMode: boolean;
}

export interface EmailSettings {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromName: string;
    fromEmail: string;
}

export interface BillingSettings {
    taxRate: number;
    invoiceFooter: string;
    defaultInvoiceTitle: string;
    companyName: string;
    taxNumber: string;
    paymentProviderApiKey: string;
}

export interface BrandingSettings {
    logoUrl: string;
    theme: 'light' | 'dark';
    primaryColor: string;
}

export interface SuperAdminSecuritySettings {
    minPasswordLength: number;
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    suspiciousLoginAlerts: boolean;
}

export interface SystemSettings {
    general: GeneralSettings;
    email: EmailSettings;
    billing: BillingSettings;
    branding: BrandingSettings;
    security: SuperAdminSecuritySettings;
}

// Mock data - Gerçek API entegrasyonu için hazır
let mockSettings: SystemSettings = {
    general: {
        systemName: 'Emlak Yönetim Sistemi',
        supportEmail: 'destek@emlak.com',
        defaultCurrency: 'TRY',
        timezone: 'Europe/Istanbul',
        maintenanceMode: false,
    },
    email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'noreply@emlak.com',
        smtpPassword: '********',
        fromName: 'Emlak Yönetim Sistemi',
        fromEmail: 'noreply@emlak.com',
    },
    billing: {
        taxRate: 20,
        invoiceFooter: 'Faturanızı incelediğiniz için teşekkür ederiz.',
        defaultInvoiceTitle: 'Abonelik Faturası',
        companyName: 'Emlak Yazılım A.Ş.',
        taxNumber: '1234567890',
        paymentProviderApiKey: 'pk_test_*********************',
    },
    branding: {
        logoUrl: '/logo.png',
        theme: 'light',
        primaryColor: '#3182CE',
    },
    security: {
        minPasswordLength: 8,
        twoFactorEnabled: false,
        sessionTimeout: 60,
        suspiciousLoginAlerts: true,
    },
};

/**
 * Tüm sistem ayarlarını getirir
 */
export const getSettings = async (): Promise<SystemSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...mockSettings };
};

/**
 * Genel ayarları getirir
 */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockSettings.general };
};

/**
 * Genel ayarları günceller
 */
export const updateGeneralSettings = async (
    settings: GeneralSettings
): Promise<GeneralSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockSettings.general = { ...settings };
    return { ...mockSettings.general };
};

/**
 * Mail ayarlarını getirir
 */
export const getEmailSettings = async (): Promise<EmailSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockSettings.email };
};

/**
 * Mail ayarlarını günceller
 */
export const updateEmailSettings = async (settings: EmailSettings): Promise<EmailSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockSettings.email = { ...settings };
    return { ...mockSettings.email };
};

/**
 * Test mail gönderir
 */
export const sendTestEmail = async (toEmail: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Test email sent to: ${toEmail}`);
};

/**
 * Fatura ayarlarını getirir
 */
export const getBillingSettings = async (): Promise<BillingSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockSettings.billing };
};

/**
 * Fatura ayarlarını günceller
 */
export const updateBillingSettings = async (
    settings: BillingSettings
): Promise<BillingSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockSettings.billing = { ...settings };
    return { ...mockSettings.billing };
};

/**
 * Marka ayarlarını getirir
 */
export const getBrandingSettings = async (): Promise<BrandingSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockSettings.branding };
};

/**
 * Marka ayarlarını günceller
 */
export const updateBrandingSettings = async (
    settings: BrandingSettings
): Promise<BrandingSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockSettings.branding = { ...settings };
    return { ...mockSettings.branding };
};

/**
 * Varsayılan temaya döner
 */
export const resetToDefaultTheme = async (): Promise<BrandingSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockSettings.branding = {
        logoUrl: '/logo.png',
        theme: 'light',
        primaryColor: '#3182CE',
    };
    return { ...mockSettings.branding };
};

/**
 * Güvenlik ayarlarını getirir
 */
export const getSecuritySettings = async (): Promise<SuperAdminSecuritySettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockSettings.security };
};

/**
 * Güvenlik ayarlarını günceller
 */
export const updateSecuritySettings = async (
    settings: SuperAdminSecuritySettings
): Promise<SuperAdminSecuritySettings> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    mockSettings.security = { ...settings };
    return { ...mockSettings.security };
};
