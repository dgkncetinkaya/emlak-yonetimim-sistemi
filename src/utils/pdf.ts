// PDF manipulation utilities using pdf-lib

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { YGFormData, SignatureData } from '../types/documentManagement';

/**
 * Create a filled PDF from template with form data and optional signatures
 * @param templateUrl - URL or path to the PDF template
 * @param formData - Form data to fill in the PDF
 * @param signatures - Optional signature data
 * @returns Promise<Blob> - Generated PDF as blob
 */
export async function createFilledPdf(
  templateUrl: string,
  formData: YGFormData,
  signatures?: SignatureData
): Promise<Blob> {
  try {
    // Fetch the template PDF
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    const templateBytes = await response.arrayBuffer();

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const textColor = rgb(0, 0, 0);

    // Define text positions (these are example coordinates - adjust based on your template)
    const textPositions = {
      customerName: { x: 150, y: height - 150 },
      customerTCKN: { x: 150, y: height - 180 },
      appointmentDate: { x: 150, y: height - 210 },
      appointmentTime: { x: 300, y: height - 210 },
      propertyAddress: { x: 150, y: height - 240 },
      agentName: { x: 150, y: height - 300 },
      agentPhone: { x: 150, y: height - 330 },
      notes: { x: 150, y: height - 380 }
    };

    // Add form data to PDF
    Object.entries(formData).forEach(([key, value]) => {
      if (value && textPositions[key as keyof typeof textPositions]) {
        const position = textPositions[key as keyof typeof textPositions];
        firstPage.drawText(String(value), {
          x: position.x,
          y: position.y,
          size: fontSize,
          font,
          color: textColor
        });
      }
    });

    // Add signatures if provided
    if (signatures) {
      if (signatures.customerSignature) {
        try {
          const customerSigImage = await pdfDoc.embedPng(signatures.customerSignature);
          firstPage.drawImage(customerSigImage, {
            x: 100,
            y: 100,
            width: 150,
            height: 75
          });
        } catch (error) {
          console.warn('Failed to embed customer signature:', error);
        }
      }

      if (signatures.agentSignature) {
        try {
          const agentSigImage = await pdfDoc.embedPng(signatures.agentSignature);
          firstPage.drawImage(agentSigImage, {
            x: 350,
            y: 100,
            width: 150,
            height: 75
          });
        } catch (error) {
          console.warn('Failed to embed agent signature:', error);
        }
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    // Return as blob
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error creating filled PDF:', error);
    throw new Error('PDF oluşturulurken hata oluştu');
  }
}

/**
 * Download a blob as file
 * @param blob - Blob to download
 * @param filename - Filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading blob:', error);
    throw new Error('Dosya indirilirken hata oluştu');
  }
}

/**
 * Convert file to blob URL
 * @param file - File object
 * @returns Promise<string> - Blob URL
 */
export function fileToBlob(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file);
      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validate if file is PDF
 * @param file - File object
 * @returns boolean
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}