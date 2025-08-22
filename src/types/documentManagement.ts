// Document Management Types

export type DocType = 'kira' | 'yer' | 'kimlik' | 'mali' | 'tapu' | 'sigorta' | 'diger';

export type DocStatus = 'taslak' | 'tamamlandi';

export interface DocItem {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  createdAt: string; // ISO string
  ownerId: string;
  url: string; // PDF blob URL or file path
  customerName?: string; // Optional customer name for search
}

export interface YGTemplate {
  id: string;
  name: string;
  url: string; // PDF blob URL or file path
  uploadedAt: string; // ISO string
}

export interface User {
  id: string;
  role: 'BROKER' | 'AGENT';
  fullName: string;
}

export interface YGFormData {
  customerName: string;
  customerTCKN: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
  agentName: string;
  agentPhone: string;
  notes?: string;
}

export interface SignatureData {
  customerSignature?: string; // base64 PNG
  agentSignature?: string; // base64 PNG
}

// Filter interface for archive
export interface ArchiveFilter {
  search: string;
  type: DocType | '';
  status: DocStatus | '';
  dateFrom: string;
  dateTo: string;
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Document type labels for UI
export const DOC_TYPE_LABELS: Record<DocType, string> = {
  kira: 'Kira Sözleşmesi',
  yer: 'Yer Gösterme Formu',
  kimlik: 'Kimlik Belgesi',
  mali: 'Mali Belge',
  tapu: 'Tapu Belgesi',
  sigorta: 'Sigorta Belgesi',
  diger: 'Diğer'
};

// Document status labels for UI
export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  taslak: 'Taslak',
  tamamlandi: 'Tamamlandı'
};

// Document status colors for UI
export const DOC_STATUS_COLORS: Record<DocStatus, string> = {
  taslak: 'yellow',
  tamamlandi: 'green'
};