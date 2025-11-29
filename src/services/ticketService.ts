// Ticket Service - SuperAdmin için destek ticket yönetimi
// GİZLİLİK KURALI: Bu servis sadece destek & süreç takibi içindir
// Müşteri/portföy/doküman verisi asla listelenmez, sadece düz text mesajlar

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    senderType: 'OFFICE' | 'SUPERADMIN';
    message: string;
    createdAt: string;
}

export interface Ticket {
    id: string;
    officeId: string;
    officeName: string;
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    assignedTo?: string; // SuperAdmin user ID
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
}

export interface TicketFilters {
    search?: string;
    status?: 'ALL' | TicketStatus;
    officeId?: string;
    priority?: 'ALL' | TicketPriority;
    dateRange?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'ALL';
}

export interface CreateTicketInput {
    officeId: string;
    subject: string;
    priority: TicketPriority;
    message: string;
}

export interface UpdateTicketInput {
    id: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
}

export interface AddMessageInput {
    ticketId: string;
    message: string;
}

// Mock data - Gerçek API entegrasyonu için hazır
const mockTickets: Ticket[] = [
    {
        id: '1',
        officeId: '1',
        officeName: 'Emlak Dünyası',
        subject: 'Fatura görüntüleme sorunu',
        status: 'OPEN',
        priority: 'HIGH',
        assignedTo: 'admin1',
        assignedToName: 'Admin User',
        createdAt: '2024-11-28',
        updatedAt: '2024-11-28',
        messages: [
            {
                id: 'm1',
                ticketId: '1',
                senderId: 'office1',
                senderName: 'Ahmet Yılmaz',
                senderType: 'OFFICE',
                message: 'Merhaba, son 3 aydır faturalarımı görüntüleyemiyorum. Sistem hata veriyor.',
                createdAt: '2024-11-28T10:00:00Z',
            },
        ],
    },
    {
        id: '2',
        officeId: '2',
        officeName: 'Gayrimenkul Pro',
        subject: 'Plan yükseltme talebi',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignedTo: 'admin1',
        assignedToName: 'Admin User',
        createdAt: '2024-11-27',
        updatedAt: '2024-11-28',
        messages: [
            {
                id: 'm2',
                ticketId: '2',
                senderId: 'office2',
                senderName: 'Ayşe Demir',
                senderType: 'OFFICE',
                message: 'Starter plandan Pro plana geçmek istiyorum. Nasıl yapabilirim?',
                createdAt: '2024-11-27T14:30:00Z',
            },
            {
                id: 'm3',
                ticketId: '2',
                senderId: 'admin1',
                senderName: 'Admin User',
                senderType: 'SUPERADMIN',
                message: 'Merhaba, plan yükseltme işleminizi başlattım. 24 saat içinde aktif olacak.',
                createdAt: '2024-11-28T09:15:00Z',
            },
        ],
    },
    {
        id: '3',
        officeId: '3',
        officeName: 'Premium Emlak',
        subject: 'API entegrasyonu hakkında',
        status: 'RESOLVED',
        priority: 'LOW',
        assignedTo: 'admin2',
        assignedToName: 'Support Team',
        createdAt: '2024-11-25',
        updatedAt: '2024-11-26',
        messages: [
            {
                id: 'm4',
                ticketId: '3',
                senderId: 'office3',
                senderName: 'Mehmet Kaya',
                senderType: 'OFFICE',
                message: 'API dokümantasyonuna nasıl ulaşabilirim?',
                createdAt: '2024-11-25T11:00:00Z',
            },
            {
                id: 'm5',
                ticketId: '3',
                senderId: 'admin2',
                senderName: 'Support Team',
                senderType: 'SUPERADMIN',
                message: 'API dokümantasyonunu e-posta ile gönderdim. İyi çalışmalar!',
                createdAt: '2024-11-26T10:00:00Z',
            },
        ],
    },
    {
        id: '4',
        officeId: '4',
        officeName: 'Konut Merkezi',
        subject: 'Hesap askıya alındı',
        status: 'CLOSED',
        priority: 'HIGH',
        assignedTo: 'admin1',
        assignedToName: 'Admin User',
        createdAt: '2024-11-20',
        updatedAt: '2024-11-22',
        messages: [
            {
                id: 'm6',
                ticketId: '4',
                senderId: 'office4',
                senderName: 'Fatma Şahin',
                senderType: 'OFFICE',
                message: 'Hesabım neden askıya alındı? Ödeme yaptım.',
                createdAt: '2024-11-20T16:00:00Z',
            },
            {
                id: 'm7',
                ticketId: '4',
                senderId: 'admin1',
                senderName: 'Admin User',
                senderType: 'SUPERADMIN',
                message: 'Ödemeniz kontrol edildi ve hesabınız yeniden aktif edildi.',
                createdAt: '2024-11-22T09:00:00Z',
            },
        ],
    },
];

/**
 * Ticket listesini filtrelerle birlikte getirir
 */
export const getTickets = async (filters?: TicketFilters): Promise<Ticket[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockTickets];

    // Arama filtresi
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter((ticket) =>
            ticket.subject.toLowerCase().includes(searchLower)
        );
    }

    // Durum filtresi
    if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((ticket) => ticket.status === filters.status);
    }

    // Ofis filtresi
    if (filters?.officeId) {
        filtered = filtered.filter((ticket) => ticket.officeId === filters.officeId);
    }

    // Öncelik filtresi
    if (filters?.priority && filters.priority !== 'ALL') {
        filtered = filtered.filter((ticket) => ticket.priority === filters.priority);
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
            (ticket) => new Date(ticket.createdAt) >= filterDate
        );
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
};

/**
 * Tek bir ticket'ın detaylarını getirir
 */
export const getTicketById = async (id: string): Promise<Ticket | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const ticket = mockTickets.find((t) => t.id === id);
    return ticket || null;
};

/**
 * Yeni ticket oluşturur
 */
export const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Ofis adını bul (mock)
    const officeNames: Record<string, string> = {
        '1': 'Emlak Dünyası',
        '2': 'Gayrimenkul Pro',
        '3': 'Premium Emlak',
        '4': 'Konut Merkezi',
        '5': 'Ev Buldum',
    };

    const newTicket: Ticket = {
        id: String(mockTickets.length + 1),
        officeId: input.officeId,
        officeName: officeNames[input.officeId] || 'Bilinmeyen Ofis',
        subject: input.subject,
        status: 'OPEN',
        priority: input.priority,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        messages: [
            {
                id: `m${Date.now()}`,
                ticketId: String(mockTickets.length + 1),
                senderId: 'superadmin',
                senderName: 'SuperAdmin',
                senderType: 'SUPERADMIN',
                message: input.message,
                createdAt: new Date().toISOString(),
            },
        ],
    };

    mockTickets.push(newTicket);
    return newTicket;
};

/**
 * Ticket'ı günceller
 */
export const updateTicket = async (input: UpdateTicketInput): Promise<Ticket> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ticketIndex = mockTickets.findIndex((t) => t.id === input.id);
    if (ticketIndex === -1) {
        throw new Error('Ticket bulunamadı');
    }

    if (input.status) mockTickets[ticketIndex].status = input.status;
    if (input.priority) mockTickets[ticketIndex].priority = input.priority;
    if (input.assignedTo !== undefined) {
        mockTickets[ticketIndex].assignedTo = input.assignedTo;
        mockTickets[ticketIndex].assignedToName = input.assignedTo ? 'Admin User' : undefined;
    }

    mockTickets[ticketIndex].updatedAt = new Date().toISOString().split('T')[0];

    return mockTickets[ticketIndex];
};

/**
 * Ticket'a mesaj ekler
 */
export const addMessage = async (input: AddMessageInput): Promise<TicketMessage> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ticketIndex = mockTickets.findIndex((t) => t.id === input.ticketId);
    if (ticketIndex === -1) {
        throw new Error('Ticket bulunamadı');
    }

    const newMessage: TicketMessage = {
        id: `m${Date.now()}`,
        ticketId: input.ticketId,
        senderId: 'superadmin',
        senderName: 'SuperAdmin',
        senderType: 'SUPERADMIN',
        message: input.message,
        createdAt: new Date().toISOString(),
    };

    mockTickets[ticketIndex].messages.push(newMessage);
    mockTickets[ticketIndex].updatedAt = new Date().toISOString().split('T')[0];

    return newMessage;
};

/**
 * Ticket istatistiklerini getirir
 */
export const getTicketStats = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
        total: mockTickets.length,
        open: mockTickets.filter((t) => t.status === 'OPEN').length,
        inProgress: mockTickets.filter((t) => t.status === 'IN_PROGRESS').length,
        resolved: mockTickets.filter((t) => t.status === 'RESOLVED').length,
        closed: mockTickets.filter((t) => t.status === 'CLOSED').length,
    };
};
