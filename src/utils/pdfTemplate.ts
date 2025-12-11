import { PDFDocument, PDFTextField, rgb } from 'pdf-lib';
import { PDFFormFields } from '../types/rentalContract';

// Kira sözleşmesi PDF şablonu oluşturma
export const createRentalContractPDF = async (formData?: Partial<PDFFormFields>): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 boyutu
  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const titleFontSize = 16;
  const smallFontSize = 10;
  
  // Başlık
  page.drawText('KİRA SÖZLEŞMESİ', {
    x: width / 2 - 80,
    y: height - 50,
    size: titleFontSize,
    color: rgb(0, 0, 0),
  });
  
  let yPosition = height - 100;
  const lineHeight = 20;
  const leftMargin = 50;
  const rightMargin = width - 50;
  
  // Form oluştur
  const form = pdfDoc.getForm();
  
  // Taraf Bilgileri Bölümü
  page.drawText('TARAF BİLGİLERİ', {
    x: leftMargin,
    y: yPosition,
    size: fontSize + 2,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 1.5;
  
  // Ev Sahibi Bilgileri
  page.drawText('EV SAHİBİ BİLGİLERİ:', {
    x: leftMargin,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Ev sahibi adı
  page.drawText('Ad Soyad:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const landlordNameField = form.createTextField('landlordName');
  landlordNameField.setText(formData?.landlordName || '');
  landlordNameField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 200,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Ev sahibi TC No
  page.drawText('TC No:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const landlordTcField = form.createTextField('landlordTcNo');
  landlordTcField.setText(formData?.landlordTcNo || '');
  landlordTcField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 150,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Ev sahibi adres
  page.drawText('Adres:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const landlordAddressField = form.createTextField('landlordAddress');
  landlordAddressField.setText(formData?.landlordAddress || '');
  landlordAddressField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 300,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Ev sahibi telefon
  page.drawText('Telefon:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const landlordPhoneField = form.createTextField('landlordPhone');
  landlordPhoneField.setText(formData?.landlordPhone || '');
  landlordPhoneField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 150,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 1.5;
  
  // Kiracı Bilgileri
  page.drawText('KİRACI BİLGİLERİ:', {
    x: leftMargin,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Kiracı adı
  page.drawText('Ad Soyad:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const tenantNameField = form.createTextField('tenantName');
  tenantNameField.setText(formData?.tenantName || '');
  tenantNameField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 200,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Kiracı TC No
  page.drawText('TC No:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const tenantTcField = form.createTextField('tenantTcNo');
  tenantTcField.setText(formData?.tenantTcNo || '');
  tenantTcField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 150,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Kiracı adres
  page.drawText('Adres:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const tenantAddressField = form.createTextField('tenantAddress');
  tenantAddressField.setText(formData?.tenantAddress || '');
  tenantAddressField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 300,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Kiracı telefon
  page.drawText('Telefon:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const tenantPhoneField = form.createTextField('tenantPhone');
  tenantPhoneField.setText(formData?.tenantPhone || '');
  tenantPhoneField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 150,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 1.5;
  
  // Emlak Bilgileri
  page.drawText('EMLAK BİLGİLERİ:', {
    x: leftMargin,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Emlak adresi
  page.drawText('Emlak Adresi:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const propertyAddressField = form.createTextField('propertyAddress');
  propertyAddressField.setText(formData?.propertyAddress || '');
  propertyAddressField.addToPage(page, {
    x: leftMargin + 100,
    y: yPosition - 5,
    width: 300,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Oda sayısı ve alan
  page.drawText('Oda Sayısı:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const roomCountField = form.createTextField('roomCount');
  roomCountField.setText(formData?.roomCount || '');
  roomCountField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 80,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('Alan (m²):', {
    x: leftMargin + 200,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const propertyAreaField = form.createTextField('propertyArea');
  propertyAreaField.setText(formData?.propertyArea || '');
  propertyAreaField.addToPage(page, {
    x: leftMargin + 270,
    y: yPosition - 5,
    width: 80,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 1.5;
  
  // Sözleşme Detayları
  page.drawText('SÖZLEŞME DETAYLARI:', {
    x: leftMargin,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Başlangıç ve bitiş tarihi
  page.drawText('Başlangıç Tarihi:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const startDateField = form.createTextField('startDate');
  startDateField.setText(formData?.startDate || '');
  startDateField.addToPage(page, {
    x: leftMargin + 110,
    y: yPosition - 5,
    width: 100,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('Bitiş Tarihi:', {
    x: leftMargin + 250,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const endDateField = form.createTextField('endDate');
  endDateField.setText(formData?.endDate || '');
  endDateField.addToPage(page, {
    x: leftMargin + 330,
    y: yPosition - 5,
    width: 100,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Kira bedeli ve depozito
  page.drawText('Kira Bedeli:', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const rentAmountField = form.createTextField('rentAmount');
  rentAmountField.setText(formData?.rentAmount || '');
  rentAmountField.addToPage(page, {
    x: leftMargin + 80,
    y: yPosition - 5,
    width: 100,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('Depozito:', {
    x: leftMargin + 220,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const depositField = form.createTextField('deposit');
  depositField.setText(formData?.deposit || '');
  depositField.addToPage(page, {
    x: leftMargin + 280,
    y: yPosition - 5,
    width: 100,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  // Ödeme günü
  page.drawText('Ödeme Günü (Ayın):', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const paymentDayField = form.createTextField('paymentDay');
  paymentDayField.setText(formData?.paymentDay || '');
  paymentDayField.addToPage(page, {
    x: leftMargin + 130,
    y: yPosition - 5,
    width: 50,
    height: 15,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= lineHeight * 1.5;
  
  // Özel şartlar
  page.drawText('ÖZEL ŞARTLAR:', {
    x: leftMargin,
    y: yPosition,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  yPosition -= lineHeight;
  
  const specialConditionsField = form.createTextField('specialConditions');
  specialConditionsField.setText(formData?.specialConditions || '');
  specialConditionsField.setFontSize(10);
  specialConditionsField.addToPage(page, {
    x: leftMargin,
    y: yPosition - 60,
    width: rightMargin - leftMargin,
    height: 60,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  yPosition -= 80;
  
  // İmza alanları
  yPosition -= lineHeight;
  page.drawText('Tarih: _______________', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= lineHeight * 2;
  page.drawText('EV SAHİBİ', {
    x: leftMargin + 50,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('KİRACI', {
    x: rightMargin - 100,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= lineHeight;
  page.drawText('_____________________', {
    x: leftMargin,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('_____________________', {
    x: rightMargin - 150,
    y: yPosition,
    size: smallFontSize,
    color: rgb(0, 0, 0),
  });
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

// PDF'den form verilerini çıkarma
export const extractFormDataFromPDF = async (pdfBytes: Uint8Array): Promise<PDFFormFields> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  const formData: PDFFormFields = {
    landlordName: '',
    landlordTcNo: '',
    landlordAddress: '',
    landlordPhone: '',
    tenantName: '',
    tenantTcNo: '',
    tenantAddress: '',
    tenantPhone: '',
    propertyAddress: '',
    propertyDistrict: '',
    propertyCity: '',
    propertyType: '',
    roomCount: '',
    propertyArea: '',
    propertyFloor: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    deposit: '',
    currency: '',
    paymentDay: '',
    paymentMethod: '',
    utilitiesIncluded: '',
    petAllowed: '',
    smokingAllowed: '',
    specialConditions: '',
    contractDate: '',
    contractLocation: ''
  };
  
  try {
    const fields = form.getFields();
    fields.forEach(field => {
      if (field.constructor.name === 'PDFTextField') {
        const textField = field as PDFTextField;
        const fieldName = textField.getName() as keyof PDFFormFields;
        if (fieldName in formData) {
          formData[fieldName] = textField.getText() || '';
        }
      }
    });
  } catch (error) {
    console.error('PDF form verisi çıkarılırken hata:', error);
  }
  
  return formData;
};

// PDF'i yazdırma için hazırlama
export const preparePDFForPrint = async (pdfBytes: Uint8Array): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  
  // Form alanlarını düzenlenemez yap
  form.flatten();
  
  const finalPdfBytes = await pdfDoc.save();
  return finalPdfBytes;
};

// PDF indirme fonksiyonu
export const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// PDF yazdırma fonksiyonu
export const printPDF = (pdfBytes: Uint8Array) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};