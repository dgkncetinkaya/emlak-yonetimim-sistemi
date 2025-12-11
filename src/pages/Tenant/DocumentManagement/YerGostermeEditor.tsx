import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Textarea,
  VStack,
  useToast,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';

// SignatureCanvas artık DigitalSignature bileşeni içinde kullanılıyor
import { Edit3, Save, Download, Archive } from 'react-feather';
import { DocItem, DocType, DocStatus } from '../../../utils/types';
import { DOC_ARCHIVE, saveToStorage } from '../../../utils/storage';
import DigitalSignature from '../../../components/DigitalSignature';

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface YerGostermeEditorProps {
  templateUrl: string;
  onClose?: () => void;
  onSave?: (docItem: DocItem) => void;
}

interface FormFields {
  musteriAdi: string;
  tckn: string;
  telefon: string;
  email: string;
  tasinmazAdresi: string;
  randevuTarihi: string;
  randevuSaati: string;
  acenteAdi: string;
  acenteTelefon: string;
  notlar: string;
}

const YerGostermeEditor: React.FC<YerGostermeEditorProps> = ({ templateUrl, onClose, onSave }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FormFields>({
    musteriAdi: '',
    tckn: '',
    telefon: '',
    email: '',
    tasinmazAdresi: '',
    randevuTarihi: '',
    randevuSaati: '',
    acenteAdi: '',
    acenteTelefon: '',
    notlar: ''
  });
  const [customerSignatureUrl, setCustomerSignatureUrl] = useState<string>('');
  const [agentSignatureUrl, setAgentSignatureUrl] = useState<string>('');
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Signature ref'leri artık DigitalSignature bileşeni tarafından yönetiliyor
  const toast = useToast();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF yükleme hatası:', error);
    setLoading(false);

    let errorMessage = 'PDF dosyası yüklenirken bir hata oluştu.';

    if (error.message.includes('404')) {
      errorMessage = 'PDF dosyası bulunamadı. Lütfen dosya yolunu kontrol edin.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Ağ bağlantısı sorunu. İnternet bağlantınızı kontrol edin.';
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'Geçersiz PDF dosyası. Dosya bozuk olabilir.';
    }

    toast({
      title: 'PDF Yükleme Hatası',
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const onDocumentLoadProgress = ({ loaded, total }: { loaded: number; total: number }) => {
    console.log(`PDF yükleniyor: ${loaded}/${total}`);
  };

  const handleFieldChange = (field: keyof FormFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  // Dijital imza işlemleri artık DigitalSignature bileşeni tarafından yönetiliyor

  const fillPdf = async (templateUrl: string, fields: FormFields, customerSignatureUrl?: string, agentSignatureUrl?: string): Promise<Blob> => {
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');

      const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      firstPage.drawText(fields.musteriAdi, {
        x: 150,
        y: height - 150,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.tckn, {
        x: 150,
        y: height - 180,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.telefon, {
        x: 150,
        y: height - 210,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.email, {
        x: 150,
        y: height - 240,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.tasinmazAdresi, {
        x: 150,
        y: height - 270,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${fields.randevuTarihi} ${fields.randevuSaati}`, {
        x: 150,
        y: height - 300,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.acenteAdi, {
        x: 150,
        y: height - 330,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(fields.acenteTelefon, {
        x: 150,
        y: height - 360,
        size: 12,
        color: rgb(0, 0, 0),
      });

      if (fields.notlar) {
        firstPage.drawText(fields.notlar, {
          x: 150,
          y: height - 420,
          size: 10,
          color: rgb(0, 0, 0),
          maxWidth: 400,
        });
      }

      if (customerSignatureUrl) {
        try {
          const customerSignatureImageBytes = await fetch(customerSignatureUrl).then(res => res.arrayBuffer());
          const customerSignatureImage = await pdfDoc.embedPng(customerSignatureImageBytes);

          firstPage.drawImage(customerSignatureImage, {
            x: 100,
            y: height - 600,
            width: 150,
            height: 75,
          });

          firstPage.drawText('Müşteri İmzası', {
            x: 100,
            y: height - 620,
            size: 10,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.error('Müşteri imzası ekleme hatası:', error);
        }
      }

      if (agentSignatureUrl) {
        try {
          const agentSignatureImageBytes = await fetch(agentSignatureUrl).then(res => res.arrayBuffer());
          const agentSignatureImage = await pdfDoc.embedPng(agentSignatureImageBytes);

          firstPage.drawImage(agentSignatureImage, {
            x: 350,
            y: height - 600,
            width: 150,
            height: 75,
          });

          firstPage.drawText('Danışman İmzası', {
            x: 350,
            y: height - 620,
            size: 10,
            color: rgb(0, 0, 0),
          });
        } catch (error) {
          console.error('Danışman imzası ekleme hatası:', error);
        }
      }

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('PDF doldurma hatası:', error);
      throw error;
    }
  };

  const generatePdf = async () => {
    if (!fields.musteriAdi.trim()) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen en az müşteri adını doldurun.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const pdfBlob = await fillPdf(templateUrl, fields, customerSignatureUrl, agentSignatureUrl);
      const blobUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(blobUrl);

      toast({
        title: 'PDF Oluşturuldu',
        description: 'Yer gösterme formu başarıyla oluşturuldu.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast({
        title: 'PDF Oluşturma Hatası',
        description: 'PDF oluşturulurken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (generatedPdfUrl) {
      const link = document.createElement('a');
      link.href = generatedPdfUrl;
      link.download = `yer-gosterme-formu-${fields.musteriAdi || 'form'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const saveToArchive = () => {
    if (!generatedPdfUrl) {
      toast({
        title: 'PDF Bulunamadı',
        description: 'Önce PDF oluşturun.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const docItem: DocItem = {
      id: Date.now().toString(),
      type: 'YER_GOSTERME' as DocType,
      status: 'COMPLETED' as DocStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: 'current-user',
      url: generatedPdfUrl,
      metadata: {
        customerName: fields.musteriAdi,
        propertyAddress: fields.tasinmazAdresi,
        appointmentDate: fields.randevuTarihi,
        hasCustomerSignature: !!customerSignatureUrl,
        hasAgentSignature: !!agentSignatureUrl
      }
    };

    if (onSave) {
      onSave(docItem);
      if (onClose) onClose();
    } else {
      try {
        const existingDocs = JSON.parse(localStorage.getItem(DOC_ARCHIVE) || '[]');
        existingDocs.push(docItem);
        saveToStorage(DOC_ARCHIVE, existingDocs);

        toast({
          title: 'Arşive Kaydedildi',
          description: 'Belge başarıyla arşive kaydedildi.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Arşive kaydetme hatası:', error);
        toast({
          title: 'Kaydetme Hatası',
          description: 'Belge arşive kaydedilirken bir hata oluştu.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Yer Gösterme Formu Editörü</Heading>
        {onClose && (
          <Button onClick={onClose} variant="ghost">
            Kapat
          </Button>
        )}
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">PDF Önizleme</Heading>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Center h="400px">
                  <Spinner size="xl" />
                </Center>
              ) : (
                <Box>
                  <Document
                    file={templateUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    onLoadProgress={onDocumentLoadProgress}
                    loading={<Center h="400px"><Spinner size="xl" /></Center>}
                  >
                    <Page pageNumber={pageNumber} width={400} />
                  </Document>
                  {numPages && numPages > 1 && (
                    <HStack justify="center" mt={4}>
                      <Button
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                        isDisabled={pageNumber <= 1}
                      >
                        Önceki
                      </Button>
                      <Text fontSize="sm">
                        {pageNumber} / {numPages}
                      </Text>
                      <Button
                        size="sm"
                        onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                        isDisabled={pageNumber >= numPages}
                      >
                        Sonraki
                      </Button>
                    </HStack>
                  )}
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>

        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">Form Bilgileri</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Müşteri Adı</FormLabel>
                    <Input
                      value={fields.musteriAdi}
                      onChange={(e) => handleFieldChange('musteriAdi', e.target.value)}
                      placeholder="Ad Soyad"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <Input
                      value={fields.tckn}
                      onChange={(e) => handleFieldChange('tckn', e.target.value)}
                      placeholder="12345678901"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={fields.telefon}
                      onChange={(e) => handleFieldChange('telefon', e.target.value)}
                      placeholder="0555 123 45 67"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>E-posta</FormLabel>
                    <Input
                      value={fields.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="ornek@email.com"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Randevu Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={fields.randevuTarihi}
                      onChange={(e) => handleFieldChange('randevuTarihi', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Randevu Saati</FormLabel>
                    <Input
                      type="time"
                      value={fields.randevuSaati}
                      onChange={(e) => handleFieldChange('randevuSaati', e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Acente Adı</FormLabel>
                    <Input
                      value={fields.acenteAdi}
                      onChange={(e) => handleFieldChange('acenteAdi', e.target.value)}
                      placeholder="Acente adı"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Acente Telefon</FormLabel>
                    <Input
                      value={fields.acenteTelefon}
                      onChange={(e) => handleFieldChange('acenteTelefon', e.target.value)}
                      placeholder="0555 987 65 43"
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Taşınmaz Adresi</FormLabel>
                  <Textarea
                    value={fields.tasinmazAdresi}
                    onChange={(e) => handleFieldChange('tasinmazAdresi', e.target.value)}
                    placeholder="Tam adres bilgisi"
                    rows={2}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Notlar</FormLabel>
                  <Textarea
                    value={fields.notlar}
                    onChange={(e) => handleFieldChange('notlar', e.target.value)}
                    placeholder="Ek notlar ve açıklamalar"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <VStack spacing={4}>
            <DigitalSignature
              title="Müşteri İmzası"
              onSignatureChange={setCustomerSignatureUrl}
              signature={customerSignatureUrl}
              width={400}
              height={120}
            />

            <DigitalSignature
              title="Danışman İmzası"
              onSignatureChange={setAgentSignatureUrl}
              signature={agentSignatureUrl}
              width={400}
              height={120}
            />

            {(customerSignatureUrl || agentSignatureUrl) && (
              <Alert status="success" size="sm">
                <AlertIcon />
                {customerSignatureUrl && agentSignatureUrl
                  ? 'Her iki imza da kaydedildi ve PDF\'e eklenecek.'
                  : customerSignatureUrl
                    ? 'Müşteri imzası kaydedildi.'
                    : 'Danışman imzası kaydedildi.'
                }
              </Alert>
            )}
          </VStack>

          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Button
                  leftIcon={<Edit3 />}
                  onClick={generatePdf}
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={isGenerating}
                  loadingText="PDF Oluşturuluyor..."
                >
                  PDF Oluştur
                </Button>

                {generatedPdfUrl && (
                  <HStack w="full">
                    <Button
                      leftIcon={<Download />}
                      onClick={downloadPdf}
                      colorScheme="blue"
                      variant="outline"
                      flex={1}
                    >
                      İndir
                    </Button>
                    <Button
                      leftIcon={<Archive />}
                      onClick={saveToArchive}
                      colorScheme="purple"
                      variant="outline"
                      flex={1}
                    >
                      Arşive Kaydet
                    </Button>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

export default YerGostermeEditor;