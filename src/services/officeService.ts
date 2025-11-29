// Office Service - SuperAdmin için ofis yönetimi servisleri
// GİZLİLİK KURALI: Bu servis sadece ticari bilgileri döndürür, kullanım verilerini asla döndürmez

export interface Office {
    id: string;
    name: string;
    ownerName: string;
    ownerEmail: string;
    status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
    planName: 'Starter' | 'Pro' | 'Enterprise';
    subscriptionEndDate: string;
    subscriptionStartDate: string;
    billingType: 'MONTHLY' | 'YEARLY';
    trialEndDate?: string;
    createdAt: string;
}

export interface OfficeDetail extends Office {
    maxUsers: number;
    activeModules: {
        crm: boolean;
        appointments: boolean;
        documents: boolean;
        ai: boolean;
    };
}

export interface OfficeFilters {
    search?: string;
    status?: 'ALL' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
    plan?: 'ALL' | 'Starter' | 'Pro' | 'Enterprise';
}

// Mock data - Gerçek API entegrasyonu için hazır
const mockOffices: OfficeDetail[] = [
    {
        id: '1',
        name: 'Emlak Dünyası',
        ownerName: 'Ahmet Yılmaz',
        ownerEmail: 'ahmet@emlakdunyasi.com',
        status: 'ACTIVE',
        planName: 'Pro',
        subscriptionStartDate: '2024-01-15',
        subscriptionEndDate: '2025-01-15',
        billingType: 'YEARLY',
        createdAt: '2024-01-15',
        maxUsers: 10,
        activeModules: {
            crm: true,
            appointments: true,
            documents: true,
            ai: false,
        },
    },
    {
        id: '2',
        name: 'Gayrimenkul Pro',
        ownerName: 'Ayşe Demir',
        ownerEmail: 'ayse@gayrimenkulpro.com',
        status: 'TRIAL',
        planName: 'Starter',
        subscriptionStartDate: '2024-11-20',
        subscriptionEndDate: '2024-12-20',
        billingType: 'MONTHLY',
        trialEndDate: '2024-12-20',
        createdAt: '2024-11-20',
        maxUsers: 3,
        activeModules: {
            crm: true,
            appointments: true,
            documents: false,
            ai: false,
        },
    },
    {
        id: '3',
        name: 'Premium Emlak',
        ownerName: 'Mehmet Kaya',
        ownerEmail: 'mehmet@premiumemlak.com',
        status: 'ACTIVE',
        planName: 'Enterprise',
        subscriptionStartDate: '2023-06-01',
        subscriptionEndDate: '2025-06-01',
        billingType: 'YEARLY',
        createdAt: '2023-06-01',
        maxUsers: 50,
        activeModules: {
            crm: true,
            appointments: true,
            documents: true,
            ai: true,
        },
    },
    {
        id: '4',
        name: 'Konut Merkezi',
        ownerName: 'Fatma Şahin',
        ownerEmail: 'fatma@konutmerkezi.com',
        status: 'SUSPENDED',
        planName: 'Pro',
        subscriptionStartDate: '2024-03-10',
        subscriptionEndDate: '2024-12-10',
        billingType: 'MONTHLY',
        createdAt: '2024-03-10',
        maxUsers: 10,
        activeModules: {
            crm: true,
            appointments: true,
            documents: true,
            ai: false,
        },
    },
    {
        id: '5',
        name: 'Ev Buldum',
        ownerName: 'Ali Çelik',
        ownerEmail: 'ali@evbuldum.com',
        status: 'CANCELLED',
        planName: 'Starter',
        subscriptionStartDate: '2024-02-01',
        subscriptionEndDate: '2024-08-01',
        billingType: 'MONTHLY',
        createdAt: '2024-02-01',
        maxUsers: 3,
        activeModules: {
            crm: true,
            appointments: false,
            documents: false,
            ai: false,
        },
    },
];

/**
 * Ofis listesini filtrelerle birlikte getirir
 * GİZLİLİK: Sadece ticari bilgileri döndürür
 */
export const getOffices = async (filters?: OfficeFilters): Promise<Office[]> => {
    // Simüle edilmiş API gecikmesi
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockOffices];

    // Arama filtresi
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
            (office) =>
                office.name.toLowerCase().includes(searchLower) ||
                office.ownerEmail.toLowerCase().includes(searchLower)
        );
    }

    // Durum filtresi
    if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((office) => office.status === filters.status);
    }

    // Plan filtresi
    if (filters?.plan && filters.plan !== 'ALL') {
        filtered = filtered.filter((office) => office.planName === filters.plan);
    }

    return filtered;
};

/**
 * Tek bir ofisin detaylı bilgilerini getirir
 * GİZLİLİK: Sadece ticari bilgileri döndürür, kullanım verileri YOK
 */
export const getOfficeById = async (id: string): Promise<OfficeDetail | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const office = mockOffices.find((o) => o.id === id);
    return office || null;
};

/**
 * Ofis durumunu günceller (ACTIVE, SUSPENDED, CANCELLED)
 */
export const updateOfficeStatus = async (
    id: string,
    status: Office['status']
): Promise<OfficeDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const office = mockOffices.find((o) => o.id === id);
    if (!office) {
        throw new Error('Ofis bulunamadı');
    }

    office.status = status;
    return office;
};

/**
 * Ofis planını değiştirir
 */
export const updateOfficePlan = async (
    id: string,
    planName: Office['planName']
): Promise<OfficeDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const office = mockOffices.find((o) => o.id === id);
    if (!office) {
        throw new Error('Ofis bulunamadı');
    }

    office.planName = planName;
    return office;
};

/**
 * Aboneliği uzatır (1 ay)
 */
export const extendSubscription = async (id: string): Promise<OfficeDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const office = mockOffices.find((o) => o.id === id);
    if (!office) {
        throw new Error('Ofis bulunamadı');
    }

    const currentEndDate = new Date(office.subscriptionEndDate);
    currentEndDate.setMonth(currentEndDate.getMonth() + 1);
    office.subscriptionEndDate = currentEndDate.toISOString().split('T')[0];

    return office;
};

/**
 * Kullanıcı limitini günceller
 */
export const updateUserLimit = async (
    id: string,
    maxUsers: number
): Promise<OfficeDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const office = mockOffices.find((o) => o.id === id);
    if (!office) {
        throw new Error('Ofis bulunamadı');
    }

    office.maxUsers = maxUsers;
    return office;
};

/**
 * Modül durumunu günceller
 */
export const updateModuleStatus = async (
    id: string,
    moduleName: keyof OfficeDetail['activeModules'],
    enabled: boolean
): Promise<OfficeDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const office = mockOffices.find((o) => o.id === id);
    if (!office) {
        throw new Error('Ofis bulunamadı');
    }

    office.activeModules[moduleName] = enabled;
    return office;
};
