export interface RentalContract {
  id: string;
  contractNumber?: string;
  status: ContractStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  landlord?: LandlordInfo;
  tenant?: TenantInfo;
  property?: PropertyInfo;
  contractDetails?: ContractDetails;
  pdfData?: Uint8Array;
  isPrinted?: boolean;
  printedAt?: string;
}

export interface LandlordInfo {
  name: string;
  tcNo: string;
  address: string;
  phone: string;
  email?: string;
}

export interface TenantInfo {
  name: string;
  tcNo: string;
  address: string;
  phone: string;
  email?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface PropertyInfo {
  address: string;
  district: string;
  city: string;
  propertyType: string;
  roomCount: string;
  area: number;
  floor?: number;
  buildingFloors?: number;
  furnished: boolean;
  features?: string[];
}

export interface ContractDetails {
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  currency: 'TRY' | 'USD' | 'EUR';
  paymentDay: number;
  paymentMethod: 'Nakit' | 'Havale' | 'EFT' | 'Çek';
  utilitiesIncluded: boolean;
  petAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  specialConditions?: string;
  increaseRate?: number;
  increaseMethod?: 'Sabit' | 'TÜFE' | 'ÜFE' | 'Dolar' | 'Euro';
}

export const ContractStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

export interface PDFFormFields {
  landlordName: string;
  landlordTcNo: string;
  landlordAddress: string;
  landlordPhone: string;
  tenantName: string;
  tenantTcNo: string;
  tenantAddress: string;
  tenantPhone: string;
  propertyAddress: string;
  propertyDistrict: string;
  propertyCity: string;
  propertyType: string;
  roomCount: string;
  propertyArea: string;
  propertyFloor: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  deposit: string;
  currency: string;
  paymentDay: string;
  paymentMethod: string;
  utilitiesIncluded: string;
  petAllowed: string;
  smokingAllowed: string;
  specialConditions: string;
  contractDate: string;
  contractLocation: string;
}

export interface CreateContractRequest {
  landlord: LandlordInfo;
  tenant: TenantInfo;
  property: PropertyInfo;
  contractDetails: ContractDetails;
}

export interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;
  status?: ContractStatus;
}

export interface ContractListResponse {
  contracts: RentalContract[];
  total: number;
  page: number;
  limit: number;
}

export interface ContractStatistics {
  totalContracts: number;
  thisMonthContracts: number;
  completedContracts: number;
  draftContracts: number;
  activeContracts: number;
  expiredContracts: number;
}