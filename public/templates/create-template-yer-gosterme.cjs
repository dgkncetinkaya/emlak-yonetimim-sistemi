const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createYerGostermeTemplate() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Colors
    const blackColor = rgb(0, 0, 0);
    const grayColor = rgb(0.5, 0.5, 0.5);
    
    // Title
    page.drawText('YER GOSTERME FORMU', {
      x: width / 2 - 100,
      y: height - 80,
      size: 18,
      font: boldFont,
      color: blackColor
    });
    
    // Form fields with labels
    const fields = [
      { label: 'Musteri Adi:', y: height - 150 },
      { label: 'TC Kimlik No:', y: height - 180 },
      { label: 'Randevu Tarihi:', y: height - 210 },
      { label: 'Randevu Saati:', y: height - 240 },
      { label: 'Gosterilen Tasinmaz Adresi:', y: height - 270 },
      { label: 'Danisan Adi:', y: height - 330 },
      { label: 'Danisan Telefon:', y: height - 360 },
      { label: 'Notlar:', y: height - 420 }
    ];
    
    fields.forEach(field => {
      // Draw label
      page.drawText(field.label, {
        x: 50,
        y: field.y,
        size: 12,
        font: boldFont,
        color: blackColor
      });
      
      // Draw line for input
      page.drawLine({
        start: { x: 200, y: field.y - 5 },
        end: { x: width - 50, y: field.y - 5 },
        thickness: 1,
        color: grayColor
      });
    });
    
    // Special handling for notes field (multiple lines)
    for (let i = 1; i <= 3; i++) {
      page.drawLine({
        start: { x: 50, y: height - 420 - (i * 25) },
        end: { x: width - 50, y: height - 420 - (i * 25) },
        thickness: 1,
        color: grayColor
      });
    }
    
    // Signature sections
    const signatureY = 150;
    
    // Customer signature
    page.drawText('Musteri Imzasi:', {
      x: 50,
      y: signatureY,
      size: 12,
      font: boldFont,
      color: blackColor
    });
    
    page.drawRectangle({
      x: 50,
      y: signatureY - 80,
      width: 200,
      height: 60,
      borderColor: grayColor,
      borderWidth: 1
    });
    
    // Agent signature
    page.drawText('Danisan Imzasi:', {
      x: 350,
      y: signatureY,
      size: 12,
      font: boldFont,
      color: blackColor
    });
    
    page.drawRectangle({
      x: 350,
      y: signatureY - 80,
      width: 200,
      height: 60,
      borderColor: grayColor,
      borderWidth: 1
    });
    
    // Footer
    page.drawText('Bu form yer gosterme randevusu icin doldurulmustur.', {
      x: 50,
      y: 50,
      size: 10,
      font,
      color: grayColor
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Write to file
    const outputPath = path.join(__dirname, 'yer-gosterme-formu.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log('Yer gosterme formu template created successfully: yer-gosterme-formu.pdf');
  } catch (error) {
    console.error('Error creating yer gosterme template:', error);
  }
}

// Run the function
createYerGostermeTemplate();