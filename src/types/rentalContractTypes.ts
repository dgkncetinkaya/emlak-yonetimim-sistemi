export interface RentalContractData {
  // Kiracı Bilgileri
  tenantName: string;
  tenantTcNo: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantAddress: string;
  
  // Kiraya Veren Bilgileri
  landlordName: string;
  landlordTcNo: string;
  landlordPhone: string;
  landlordEmail: string;
  landlordAddress: string;
  
  // Taşınmaz Bilgileri
  propertyAddress: string;
  propertyType: string;
  propertySize: string;
  propertyFloor: string;
  propertyRooms: string;
  
  // Kira Bilgileri
  monthlyRent: string;
  deposit: string;
  rentStartDate: string;
  rentEndDate: string;
  contractDuration: string;
  
  // Ödeme Bilgileri
  paymentDay: string;
  paymentMethod: string;
  
  // Ek Bilgiler
  utilities: string;
  specialConditions: string;
  
  // Sistem Bilgileri
  contractDate: string;
  agentName: string;
  agentPhone: string;
  companyName: string;
}

export interface RentalContractTemplate {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedRentalContract {
  id: string;
  name: string;
  templateId?: string;
  data: RentalContractData;
  status?: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export const defaultRentalContractData: RentalContractData = {
  tenantName: '',
  tenantTcNo: '',
  tenantPhone: '',
  tenantEmail: '',
  tenantAddress: '',
  landlordName: '',
  landlordTcNo: '',
  landlordPhone: '',
  landlordEmail: '',
  landlordAddress: '',
  propertyAddress: '',
  propertyType: '',
  propertySize: '',
  propertyFloor: '',
  propertyRooms: '',
  monthlyRent: '',
  deposit: '',
  rentStartDate: '',
  rentEndDate: '',
  contractDuration: '',
  paymentDay: '',
  paymentMethod: '',
  utilities: '',
  specialConditions: '',
  contractDate: new Date().toISOString().split('T')[0],
  agentName: '',
  agentPhone: '',
  companyName: ''
};