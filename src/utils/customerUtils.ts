// Müşteri takibi için utility fonksiyonları

/**
 * Tarih string'ini Date objesine çevirir (DD.MM.YYYY formatından)
 */
export const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('.');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDifference = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
};

/**
 * Son iletişimden itibaren geçen gün sayısını hesaplar
 */
export const getDaysSinceLastContact = (lastContactString: string): number => {
  const lastContactDate = parseDate(lastContactString);
  const today = new Date();
  return getDaysDifference(lastContactDate, today);
};

/**
 * Müşterinin 15 günden fazla iletişim kurulmamış olup olmadığını kontrol eder
 */
export const isContactOverdue = (lastContactString: string, threshold: number = 15): boolean => {
  const daysSince = getDaysSinceLastContact(lastContactString);
  return daysSince >= threshold;
};

/**
 * Uyarı seviyesini belirler (yeşil: 0-7 gün, sarı: 8-14 gün, kırmızı: 15+ gün)
 */
export const getContactWarningLevel = (lastContactString: string): 'success' | 'warning' | 'error' => {
  const daysSince = getDaysSinceLastContact(lastContactString);
  
  if (daysSince <= 7) return 'success';
  if (daysSince <= 14) return 'warning';
  return 'error';
};

/**
 * Uyarı mesajını oluşturur
 */
export const getContactWarningMessage = (lastContactString: string): string => {
  const daysSince = getDaysSinceLastContact(lastContactString);
  
  if (daysSince <= 7) {
    return `${daysSince} gün önce iletişim kuruldu`;
  } else if (daysSince <= 14) {
    return `${daysSince} gündür iletişim kurulmadı`;
  } else {
    return `${daysSince} gündür iletişim kurulmadı - Acil takip gerekli!`;
  }
};

/**
 * Müşteri listesini son iletişim tarihine göre filtreler
 */
export const filterCustomersByContactStatus = (
  customers: any[], 
  status: 'overdue' | 'warning' | 'recent'
): any[] => {
  return customers.filter(customer => {
    const warningLevel = getContactWarningLevel(customer.lastContact);
    
    switch (status) {
      case 'overdue':
        return warningLevel === 'error';
      case 'warning':
        return warningLevel === 'warning';
      case 'recent':
        return warningLevel === 'success';
      default:
        return true;
    }
  });
};

/**
 * Uyarı gerektiren müşteri sayısını hesaplar
 */
export const getOverdueCustomersCount = (customers: any[]): number => {
  return filterCustomersByContactStatus(customers, 'overdue').length;
};

/**
 * Uyarı seviyesindeki müşteri sayısını hesaplar
 */
export const getWarningCustomersCount = (customers: any[]): number => {
  return filterCustomersByContactStatus(customers, 'warning').length;
};