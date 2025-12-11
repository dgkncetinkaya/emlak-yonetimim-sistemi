// Announcement Service - SuperAdmin için duyuru yönetimi
// GİZLİLİK KURALI: Sadece sistemsel duyurular içindir. Kişisel veri içermez.

export type AnnouncementStatus = 'DRAFT' | 'SCHEDULED' | 'SENT';
export type TargetAudience = 'ALL' | 'TRIAL' | 'ACTIVE' | 'SELECTED';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    targetAudience: TargetAudience;
    selectedOfficeIds?: string[]; // Eğer targetAudience === 'SELECTED' ise
    status: AnnouncementStatus;
    scheduledDate?: string; // ISO string
    sentDate?: string; // ISO string
    createdBy: string; // Admin ID
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface AnnouncementFilters {
    status?: 'ALL' | AnnouncementStatus;
    targetAudience?: 'ALL' | TargetAudience;
}

export interface CreateAnnouncementInput {
    title: string;
    content: string;
    targetAudience: TargetAudience;
    selectedOfficeIds?: string[];
    status: AnnouncementStatus;
    scheduledDate?: string;
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> {
    id: string;
}

// Mock data
const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Sistem Bakım Çalışması',
        content: 'Bu gece 03:00 - 05:00 saatleri arasında planlı bakım çalışması yapılacaktır.',
        targetAudience: 'ALL',
        status: 'SENT',
        sentDate: '2024-11-28T10:00:00Z',
        createdBy: 'admin1',
        createdByName: 'Admin User',
        createdAt: '2024-11-28T09:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z',
    },
    {
        id: '2',
        title: 'Yeni Özellik: Gelişmiş Raporlar',
        content: 'Artık raporlar sayfasından detaylı Excel çıktısı alabilirsiniz.',
        targetAudience: 'ACTIVE',
        status: 'SCHEDULED',
        scheduledDate: '2024-12-01T09:00:00Z',
        createdBy: 'admin1',
        createdByName: 'Admin User',
        createdAt: '2024-11-29T14:00:00Z',
        updatedAt: '2024-11-29T14:00:00Z',
    },
    {
        id: '3',
        title: 'Fiyat Güncellemesi Hakkında',
        content: 'Ocak 2025 itibarıyla paket fiyatlarımızda güncelleme yapılacaktır.',
        targetAudience: 'ALL',
        status: 'DRAFT',
        createdBy: 'admin2',
        createdByName: 'Support Team',
        createdAt: '2024-11-29T15:30:00Z',
        updatedAt: '2024-11-29T15:30:00Z',
    },
];

/**
 * Duyuruları getirir
 */
export const getAnnouncements = async (filters?: AnnouncementFilters): Promise<Announcement[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockAnnouncements];

    if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters?.targetAudience && filters.targetAudience !== 'ALL') {
        filtered = filtered.filter((a) => a.targetAudience === filters.targetAudience);
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
};

/**
 * Tek bir duyuruyu getirir
 */
export const getAnnouncementById = async (id: string): Promise<Announcement | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const announcement = mockAnnouncements.find((a) => a.id === id);
    return announcement || null;
};

/**
 * Yeni duyuru oluşturur
 */
export const createAnnouncement = async (input: CreateAnnouncementInput): Promise<Announcement> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newAnnouncement: Announcement = {
        id: String(mockAnnouncements.length + 1),
        ...input,
        createdBy: 'admin1', // Mock user
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentDate: input.status === 'SENT' ? new Date().toISOString() : undefined,
    };

    mockAnnouncements.push(newAnnouncement);
    return newAnnouncement;
};

/**
 * Duyuruyu günceller
 */
export const updateAnnouncement = async (input: UpdateAnnouncementInput): Promise<Announcement> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockAnnouncements.findIndex((a) => a.id === input.id);
    if (index === -1) {
        throw new Error('Duyuru bulunamadı');
    }

    const current = mockAnnouncements[index];

    // Eğer zaten gönderildiyse düzenlemeye izin verme (sadece okunabilir olmalı ama backend koruması olarak burada da duralım)
    // Ancak kullanıcı isteğinde "okunabilir ama değiştirilemez" denmiş, UI tarafında disable edeceğiz.
    // Burada basitçe güncellemeyi yapalım.

    const updated: Announcement = {
        ...current,
        ...input,
        updatedAt: new Date().toISOString(),
        sentDate: input.status === 'SENT' && !current.sentDate ? new Date().toISOString() : current.sentDate,
    };

    mockAnnouncements[index] = updated;
    return updated;
};

/**
 * Duyuruyu siler
 */
export const deleteAnnouncement = async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockAnnouncements.findIndex((a) => a.id === id);
    if (index !== -1) {
        mockAnnouncements.splice(index, 1);
    }
};
