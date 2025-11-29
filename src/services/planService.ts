// Plan Service - SuperAdmin için plan yönetimi servisleri
// GİZLİLİK KURALI: Bu servis sadece paket yapılandırması içindir
// Müşteri verisi, portföy verisi, kullanım istatistikleri asla gösterilmez

export interface PlanModules {
    crm: boolean;
    appointments: boolean;
    documents: boolean;
    ai: boolean;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    maxUsers: number;
    isActive: boolean;
    modules: PlanModules;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanInput {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    maxUsers: number;
    isActive: boolean;
    modules: PlanModules;
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
    id: string;
}

// Mock data - Gerçek API entegrasyonu için hazır
const mockPlans: Plan[] = [
    {
        id: '1',
        name: 'Starter',
        description: 'Küçük ofisler için ideal başlangıç paketi',
        monthlyPrice: 299,
        yearlyPrice: 2990,
        maxUsers: 3,
        isActive: true,
        modules: {
            crm: true,
            appointments: true,
            documents: false,
            ai: false,
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    },
    {
        id: '2',
        name: 'Pro',
        description: 'Orta ölçekli ofisler için profesyonel paket',
        monthlyPrice: 799,
        yearlyPrice: 7990,
        maxUsers: 10,
        isActive: true,
        modules: {
            crm: true,
            appointments: true,
            documents: true,
            ai: false,
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    },
    {
        id: '3',
        name: 'Enterprise',
        description: 'Büyük ofisler için kurumsal çözüm',
        monthlyPrice: 1999,
        yearlyPrice: 19990,
        maxUsers: 50,
        isActive: true,
        modules: {
            crm: true,
            appointments: true,
            documents: true,
            ai: true,
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    },
    {
        id: '4',
        name: 'Basic',
        description: 'Eski paket - artık aktif değil',
        monthlyPrice: 199,
        yearlyPrice: 1990,
        maxUsers: 2,
        isActive: false,
        modules: {
            crm: true,
            appointments: false,
            documents: false,
            ai: false,
        },
        createdAt: '2023-06-01',
        updatedAt: '2024-06-01',
    },
];

/**
 * Tüm planları getirir
 * GİZLİLİK: Sadece plan yapılandırması, kullanım verisi YOK
 */
export const getPlans = async (): Promise<Plan[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockPlans];
};

/**
 * Tek bir planın detaylarını getirir
 */
export const getPlanById = async (id: string): Promise<Plan | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const plan = mockPlans.find((p) => p.id === id);
    return plan || null;
};

/**
 * Yeni plan oluşturur
 */
export const createPlan = async (input: CreatePlanInput): Promise<Plan> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newPlan: Plan = {
        id: String(mockPlans.length + 1),
        ...input,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    };

    mockPlans.push(newPlan);
    return newPlan;
};

/**
 * Planı günceller
 */
export const updatePlan = async (input: UpdatePlanInput): Promise<Plan> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const planIndex = mockPlans.findIndex((p) => p.id === input.id);
    if (planIndex === -1) {
        throw new Error('Plan bulunamadı');
    }

    const updatedPlan: Plan = {
        ...mockPlans[planIndex],
        ...input,
        updatedAt: new Date().toISOString().split('T')[0],
    };

    mockPlans[planIndex] = updatedPlan;
    return updatedPlan;
};

/**
 * Planı aktif/pasif yapar
 */
export const togglePlanStatus = async (id: string, isActive: boolean): Promise<Plan> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const planIndex = mockPlans.findIndex((p) => p.id === id);
    if (planIndex === -1) {
        throw new Error('Plan bulunamadı');
    }

    mockPlans[planIndex].isActive = isActive;
    mockPlans[planIndex].updatedAt = new Date().toISOString().split('T')[0];

    return mockPlans[planIndex];
};

/**
 * Planı siler
 */
export const deletePlan = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const planIndex = mockPlans.findIndex((p) => p.id === id);
    if (planIndex === -1) {
        throw new Error('Plan bulunamadı');
    }

    mockPlans.splice(planIndex, 1);
};

/**
 * Planın kaç ofis tarafından kullanıldığını kontrol eder
 * NOT: Bu fonksiyon sadece silme işlemi öncesi kontrol için
 * Sayı UI'da gösterilmez, sadece "kullanımda mı?" kontrolü için
 */
export const isPlanInUse = async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Mock: Starter ve Pro kullanımda, diğerleri değil
    return id === '1' || id === '2';
};
