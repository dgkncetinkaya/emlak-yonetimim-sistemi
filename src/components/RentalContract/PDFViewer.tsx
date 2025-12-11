import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Spinner,
  Center,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { Download, Printer, Edit3, Save, X } from 'react-feather';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFFormFields } from '../../types/rentalContract';
import {
  extractFormDataFromPDF,
  createRentalContractPDF,
  preparePDFForPrint,
  downloadPDF,
  printPDF
} from '../../utils/pdfTemplate';
import CreateContractModal from './CreateContractModal';

// PDF.js worker'ını ayarla
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfBytes: Uint8Array | null;
  contractData: PDFFormFields | null;
  onUpdate: (contractData: PDFFormFields, pdfBytes: Uint8Array) => void;
  onClose: () => void;
  contractId?: string;
  isReadOnly?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfBytes,
  contractData,
  onUpdate,
  onClose,
  contractId,
  isReadOnly = false
}) => {
  const toast = useToast();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBytes]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF yükleme hatası:', error);
    toast({
      title: 'PDF Yükleme Hatası',
      description: 'PDF dosyası yüklenirken bir hata oluştu.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDownload = () => {
    if (pdfBytes && contractData) {
      const filename = `kira-sozlesmesi-${contractData.tenantName?.replace(/\s+/g, '-').toLowerCase() || 'yeni'}-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBytes, filename);
      
      toast({
        title: 'İndirme Başarılı',
        description: 'PDF dosyası başarıyla indirildi.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handlePrint = async () => {
    if (!pdfBytes) return;

    setIsLoading(true);
    try {
      const printReadyPdf = await preparePDFForPrint(pdfBytes);
      printPDF(printReadyPdf);
      
      toast({
        title: 'Yazdırma Hazır',
        description: 'PDF yazdırma için hazırlandı.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      toast({
        title: 'Yazdırma Hatası',
        description: 'PDF yazdırılırken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (newContractData: PDFFormFields, newPdfBytes: Uint8Array) => {
    onUpdate(newContractData, newPdfBytes);
    setIsEditModalOpen(false);
    
    toast({
      title: 'Güncelleme Başarılı',
      description: 'Sözleşme başarıyla güncellendi.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (!pdfBytes || !pdfUrl) {
    return (
      <Center h="400px">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text>PDF yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Toolbar */}
      <HStack justify="space-between" mb={4} p={4} bg="gray.50" borderRadius="md">
        <HStack>
          <Text fontWeight="bold">
            {contractData?.tenantName ? `${contractData.tenantName} - Kira Sözleşmesi` : 'Kira Sözleşmesi'}
          </Text>
          {contractId && (
            <Text fontSize="sm" color="gray.600">
              ID: {contractId}
            </Text>
          )}
        </HStack>
        
        <HStack>
          {!isReadOnly && (
            <Tooltip label="Düzenle">
              <IconButton
                aria-label="Düzenle"
                icon={<Edit3 size={18} />}
                onClick={handleEdit}
                colorScheme="blue"
                variant="outline"
                size="sm"
              />
            </Tooltip>
          )}
          
          <Tooltip label="İndir">
            <IconButton
              aria-label="İndir"
              icon={<Download size={18} />}
              onClick={handleDownload}
              colorScheme="green"
              variant="outline"
              size="sm"
            />
          </Tooltip>
          
          <Tooltip label="Yazdır">
            <IconButton
              aria-label="Yazdır"
              icon={<Printer size={18} />}
              onClick={handlePrint}
              colorScheme="purple"
              variant="outline"
              size="sm"
              isLoading={isLoading}
            />
          </Tooltip>
          
          <Tooltip label="Kapat">
            <IconButton
              aria-label="Kapat"
              icon={<X size={18} />}
              onClick={onClose}
              colorScheme="red"
              variant="outline"
              size="sm"
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* PDF Viewer */}
      <Box border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <Center h="400px">
              <VStack>
                <Spinner size="xl" color="blue.500" />
                <Text>PDF yükleniyor...</Text>
              </VStack>
            </Center>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={true}
          />
        </Document>
      </Box>

      {/* Page Navigation */}
      {numPages > 1 && (
        <HStack justify="center" mt={4}>
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size="sm"
            variant="outline"
          >
            Önceki
          </Button>
          
          <Text mx={4}>
            Sayfa {pageNumber} / {numPages}
          </Text>
          
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size="sm"
            variant="outline"
          >
            Sonraki
          </Button>
        </HStack>
      )}

      {/* Contract Info */}
      {contractData && (
        <Box mt={6} p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="bold" mb={2}>Sözleşme Bilgileri:</Text>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontWeight="semibold">Ev Sahibi:</Text>
              <Text>{contractData.landlordName}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">Kiracı:</Text>
              <Text>{contractData.tenantName}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">Emlak Adresi:</Text>
              <Text>{contractData.propertyAddress}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">Kira Bedeli:</Text>
              <Text>{contractData.rentAmount} {contractData.currency}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="semibold">Sözleşme Dönemi:</Text>
              <Text>{contractData.startDate} - {contractData.endDate}</Text>
            </HStack>
          </VStack>
        </Box>
      )}

      {/* Edit Modal */}
      {contractData && (
        <CreateContractModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </Box>
  );
};

export default PDFViewer;