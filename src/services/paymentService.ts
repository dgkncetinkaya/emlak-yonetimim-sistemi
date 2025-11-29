// Payment Service - SuperAdmin için ödeme yönetimi servisleri
// GİZLİLİK KURALI: Bu servis sadece ticari ödeme verilerini içerir
// Müşteri sayıları, portföy bilgileri, kullanım istatistikleri asla gösterilmez

export type PaymentStatus = 'PAID' | 'FAILED' | 'PENDING' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'MANUAL';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Payment {
    id: string;
    officeId: string;
    officeName: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    transactionId: string;
    subscriptionId?: string;
    invoiceNumber?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentFilters {
    search?: string;
    status?: 'ALL' | PaymentStatus;
    dateRange?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'ALL';
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: 'ALL' | PaymentMethod;
}

export interface CreatePaymentInput {
    officeId: string;
    amount: number;
    currency: Currency;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    description?: string;
}

export interface UpdatePaymentInput {
    id: string;
    status?: PaymentStatus;
    notes?: string;
}

// Mock data - Gerçek API entegrasyonu için hazır
const mockPayments: Payment[] = [
    {
        id: '1',
        officeId: '1',
        officeName: 'Emlak Dünyası',
        amount: 7990,
        currency: 'TRY',
        status: 'PAID',
        paymentDate: '2024-11-15',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'TXN-2024-001',
        subscriptionId: 'SUB-001',
        invoiceNumber: 'INV-2024-001',
        notes: 'Yıllık abonelik ödemesi',
        createdAt: '2024-11-15',
        updatedAt: '2024-11-15',
    },
    {
        id: '2',
        officeId: '2',
        officeName: 'Gayrimenkul Pro',
        amount: 299,
        currency: 'TRY',
        status: 'PAID',
        paymentDate: '2024-11-20',
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN-2024-002',
        subscriptionId: 'SUB-002',
        invoiceNumber: 'INV-2024-002',
        notes: 'Havale ile ödeme yapıldı',
        createdAt: '2024-11-20',
        updatedAt: '2024-11-20',
    },
    {
        id: '3',
        officeId: '3',
        officeName: 'Premium Emlak',
        amount: 19990,
        currency: 'TRY',
        status: 'PAID',
        paymentDate: '2024-11-01',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'TXN-2024-003',
        subscriptionId: 'SUB-003',
        invoiceNumber: 'INV-2024-003',
        createdAt: '2024-11-01',
        updatedAt: '2024-11-01',
    },
    {
        id: '4',
        officeId: '4',
        officeName: 'Konut Merkezi',
        amount: 799,
        currency: 'TRY',
        status: 'FAILED',
        paymentDate: '2024-11-25',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'TXN-2024-004',
        subscriptionId: 'SUB-004',
        notes: 'Kart limiti yetersiz',
        createdAt: '2024-11-25',
        updatedAt: '2024-11-25',
    },
    {
        id: '5',
        officeId: '5',
        officeName: 'Ev Buldum',
        amount: 299,
        currency: 'TRY',
        status: 'PENDING',
        paymentDate: '2024-11-28',
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN-2024-005',
        subscriptionId: 'SUB-005',
        notes: 'Havale bekleniyor',
        createdAt: '2024-11-28',
        updatedAt: '2024-11-28',
    },
    {
        id: '6',
        officeId: '1',
        officeName: 'Emlak Dünyası',
        amount: 799,
        currency: 'TRY',
        status: 'REFUNDED',
        paymentDate: '2024-10-15',
        paymentMethod: 'CREDIT_CARD',
        transactionId: 'TXN-2024-006',
        subscriptionId: 'SUB-006',
        invoiceNumber: 'INV-2024-006',
        notes: 'Müşteri talebi üzerine iade edildi',
        createdAt: '2024-10-15',
        updatedAt: '2024-10-20',
    },
];

/**
 * Ödeme listesini filtrelerle birlikte getirir
 * GİZLİLİK: Sadece ticari ödeme bilgileri
 */
export const getPayments = async (filters?: PaymentFilters): Promise<Payment[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockPayments];

    // Arama filtresi (ofis adı)
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((payment) =>
            payment.officeName.toLowerCase().includes(searchLower)
        );
    }

    // Durum filtresi
    if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((payment) => payment.status === filters.status);
    }

    // Tarih filtresi
    if (filters?.dateRange && filters.dateRange !== 'ALL') {
        const now = new Date();
        const filterDate = new Date();

        switch (filters.dateRange) {
            case 'LAST_7_DAYS':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'LAST_30_DAYS':
                filterDate.setDate(now.getDate() - 30);
                break;
            case 'THIS_MONTH':
                filterDate.setDate(1);
                break;
        }

        filtered = filtered.filter(
            (payment) => new Date(payment.paymentDate) >= filterDate
        );
    }

    // Tutar aralığı filtresi
    if (filters?.minAmount !== undefined) {
        filtered = filtered.filter((payment) => payment.amount >= filters.minAmount!);
    }
    if (filters?.maxAmount !== undefined) {
        filtered = filtered.filter((payment) => payment.amount <= filters.maxAmount!);
    }

    // Ödeme metodu filtresi
    if (filters?.paymentMethod && filters.paymentMethod !== 'ALL') {
        filtered = filtered.filter((payment) => payment.paymentMethod === filters.paymentMethod);
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    return filtered;
};

/**
 * Tek bir ödemenin detaylarını getirir
 */
export const getPaymentById = async (id: string): Promise<Payment | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const payment = mockPayments.find((p) => p.id === id);
    return payment || null;
};

/**
 * Manuel ödeme oluşturur
 */
export const createManualPayment = async (input: CreatePaymentInput): Promise<Payment> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Ofis adını bul (mock - gerçekte API'den gelecek)
    const officeNames: Record<string, string> = {
        '1': 'Emlak Dünyası',
        '2': 'Gayrimenkul Pro',
        '3': 'Premium Emlak',
        '4': 'Konut Merkezi',
        '5': 'Ev Buldum',
    };

    const newPayment: Payment = {
        id: String(mockPayments.length + 1),
        officeId: input.officeId,
        officeName: officeNames[input.officeId] || 'Bilinmeyen Ofis',
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: input.paymentMethod,
        transactionId: `TXN-${new Date().getFullYear()}-${String(mockPayments.length + 1).padStart(3, '0')}`,
        notes: input.description,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    };

    mockPayments.push(newPayment);
    return newPayment;
};

/**
 * Ödeme durumunu günceller
 */
export const updatePaymentStatus = async (
    id: string,
    status: PaymentStatus
): Promise<Payment> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const paymentIndex = mockPayments.findIndex((p) => p.id === id);
    if (paymentIndex === -1) {
        throw new Error('Ödeme bulunamadı');
    }

    mockPayments[paymentIndex].status = status;
    mockPayments[paymentIndex].updatedAt = new Date().toISOString().split('T')[0];

    return mockPayments[paymentIndex];
};

/**
 * Ödemeye not ekler
 */
export const addPaymentNote = async (id: string, note: string): Promise<Payment> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const paymentIndex = mockPayments.findIndex((p) => p.id === id);
    if (paymentIndex === -1) {
        throw new Error('Ödeme bulunamadı');
    }

    const existingNotes = mockPayments[paymentIndex].notes || '';
    mockPayments[paymentIndex].notes = existingNotes
        ? `${existingNotes}\n${note}`
        : note;
    mockPayments[paymentIndex].updatedAt = new Date().toISOString().split('T')[0];

    return mockPayments[paymentIndex];
};

/**
 * Ödeme istatistiklerini getirir (sadece toplam tutarlar)
 */
export const getPaymentStats = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stats = {
        totalPaid: mockPayments
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + p.amount, 0),
        totalPending: mockPayments
            .filter((p) => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.amount, 0),
        totalFailed: mockPayments
            .filter((p) => p.status === 'FAILED')
            .reduce((sum, p) => sum + p.amount, 0),
        totalRefunded: mockPayments
            .filter((p) => p.status === 'REFUNDED')
            .reduce((sum, p) => sum + p.amount, 0),
        thisMonthTotal: mockPayments
            .filter((p) => {
                const paymentDate = new Date(p.paymentDate);
                const now = new Date();
                return (
                    paymentDate.getMonth() === now.getMonth() &&
                    paymentDate.getFullYear() === now.getFullYear() &&
                    p.status === 'PAID'
                );
            })
            .reduce((sum, p) => sum + p.amount, 0),
    };

    return stats;
};
