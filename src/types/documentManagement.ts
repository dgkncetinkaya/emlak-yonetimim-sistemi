// Document Management Types

export type DocType = 'kira' | 'yer' | 'dask' | 'mali' | 'tapu' | 'diger';

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
  tags?: string[]; // Document tags
  hasSignature?: boolean; // Whether document has digital signature
  fileSize?: number; // File size in MB
  version?: number; // Document version number
  parentId?: string; // Parent document ID for versioning
  versionHistory?: DocVersion[]; // Version history
  lastModifiedAt?: string; // Last modification date
  lastModifiedBy?: string; // Last modifier user ID
}

export interface DocVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string; // Description of changes
  url: string; // Version file URL
  fileSize: number;
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
  customerTc: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
  agentName: string;
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
  owner: string;
  department: string;
  tags: string[];
  hasSignature: boolean | null;
  fileSize: {
    min: number;
    max: number;
  };
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
  dask: 'DASK Belgesi',
  mali: 'Mali Belge',
  tapu: 'Tapu Belgesi',
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