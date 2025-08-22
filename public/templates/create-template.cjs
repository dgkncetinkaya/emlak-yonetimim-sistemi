const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

async function createRentalContractTemplate() {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let yPosition = height - 80;
    
    // Title
    page.drawText('KIRA SOZLESMESI', {
      x: width / 2 - 80,
      y: yPosition,
      size: 18,
      font: boldFont,
    });
    
    yPosition -= 50;
    
    // Landlord Information
    page.drawText('EV SAHIBI BILGILERI:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 25;
    
    const landlordFields = [
      'Ad Soyad: ________________________',
      'TC Kimlik No: ____________________',
      'Telefon: _________________________',
      'Adres: ___________________________',
      '____________________________________'
    ];
    
    landlordFields.forEach(field => {
      page.drawText(field, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 20;
    });
    
    yPosition -= 20;
    
    // Tenant Information
    page.drawText('KIRACI BILGILERI:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 25;
    
    const tenantFields = [
      'Ad Soyad: ________________________',
      'TC Kimlik No: ____________________',
      'Telefon: _________________________',
      'Adres: ___________________________',
      '____________________________________'
    ];
    
    tenantFields.forEach(field => {
      page.drawText(field, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 20;
    });
    
    yPosition -= 20;
    
    // Property Information
    page.drawText('EMLAK BILGILERI:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 25;
    
    const propertyFields = [
      'Adres: ___________________________',
      '____________________________________',
      'Oda Sayisi: ______________________',
      'Kati: ____________________________'
    ];
    
    propertyFields.forEach(field => {
      page.drawText(field, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 20;
    });
    
    yPosition -= 20;
    
    // Contract Details
    page.drawText('SOZLESME DETAYLARI:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 25;
    
    const contractFields = [
      'Kira Bedeli: _____________________',
      'Depozito: ________________________',
      'Baslangic Tarihi: ________________',
      'Bitis Tarihi: ____________________',
      'Odeme Gunu: ______________________'
    ];
    
    contractFields.forEach(field => {
      page.drawText(field, {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 20;
    });
    
    yPosition -= 30;
    
    // Special Conditions
    page.drawText('OZEL SARTLAR:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 25;
    
    for (let i = 0; i < 4; i++) {
      page.drawText('_________________________________________________', {
        x: 70,
        y: yPosition,
        size: 10,
        font: font,
      });
      yPosition -= 20;
    }
    
    yPosition -= 30;
    
    // Signature Areas
    page.drawText('EV SAHIBI IMZASI', {
      x: 100,
      y: yPosition,
      size: 10,
      font: boldFont,
    });
    
    page.drawText('KIRACI IMZASI', {
      x: 350,
      y: yPosition,
      size: 10,
      font: boldFont,
    });
    
    yPosition -= 40;
    
    page.drawText('_________________', {
      x: 100,
      y: yPosition,
      size: 10,
      font: font,
    });
    
    page.drawText('_________________', {
      x: 350,
      y: yPosition,
      size: 10,
      font: font,
    });
    
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('kira-sozlesmesi.pdf', pdfBytes);
    
    console.log('PDF template created successfully: kira-sozlesmesi.pdf');
  } catch (error) {
    console.error('Error:', error);
  }
}

createRentalContractTemplate();