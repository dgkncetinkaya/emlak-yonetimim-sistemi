// Document Management Types
export type DocType = 'YER_GOSTERME' | 'KIRA_SOZLESMESI' | 'DIGER';
export type DocStatus = 'DRAFT' | 'COMPLETED' | 'ARCHIVED';

export interface DocItem {
  id: string;
  type: DocType;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  url: string;
  metadata: {
    customerName?: string;
    propertyAddress?: string;
    appointmentDate?: string;
    hasCustomerSignature?: boolean;
    hasAgentSignature?: boolean;
    [key: string]: any;
  };
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'USER';
  phone?: string;
  avatar?: string;
}

// Template Types
export interface YGTemplate {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  isDefault?: boolean;
}

// Form Data Types
export interface YGFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyAddress: string;
  propertyType: string;
  propertyFeatures: string;
  showingDate: string;
  showingTime: string;
  agentName: string;
  notes: string;
}

// Signature Types
export interface SignatureData {
  customerSignature: string | null;
  agentSignature: string | null;
}

// Filter Types
export interface ArchiveFilter {
  search: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

// Pagination Types
export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
  userId: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  price: number;
  currency: string;
  area: number;
  rooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  buildingAge: number;
  heating: string;
  furnished: boolean;
  features: string[];
  description: string;
  images: string[];
  ownerId: string;
  agentId: string;
  status: 'AVAILABLE' | 'RENTED' | 'SOLD' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  agentId: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  customerId: string;
  propertyId: string;
  agentId: string;
  date: string;
  time: string;
  type: 'SHOWING' | 'MEETING' | 'SIGNING';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Contract Types
export interface Contract {
  id: string;
  propertyId: string;
  customerId: string;
  agentId: string;
  type: 'RENTAL' | 'SALE';
  startDate: string;
  endDate?: string;
  monthlyRent?: number;
  deposit?: number;
  salePrice?: number;
  terms: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface ReportData {
  period: string;
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  soldProperties: number;
  totalRevenue: number;
  totalCommission: number;
  newCustomers: number;
  completedAppointments: number;
  activeContracts: number;
}

// Dashboard Types
export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalCustomers: number;
  monthlyRevenue: number;
  pendingAppointments: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'PROPERTY_ADDED' | 'CUSTOMER_ADDED' | 'APPOINTMENT_SCHEDULED' | 'CONTRACT_SIGNED';
  description: string;
  timestamp: string;
  userId: string;
  relatedId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Search Types
export interface SearchFilters {
  query?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  [key: string]: any;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: SearchFilters;
  suggestions?: string[];
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    contactInfoVisible: boolean;
  };
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  features: {
    multiLanguage: boolean;
    darkMode: boolean;
    notifications: boolean;
    reporting: boolean;
  };
}

// Export all types - removed circular import