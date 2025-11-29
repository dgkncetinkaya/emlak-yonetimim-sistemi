import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { RentalContractData, defaultRentalContractData, SavedRentalContract } from '../../../types/rentalContractTypes';
import {
  Button,
  Input,
  FormLabel,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useToast,
  VStack,
  HStack,
  Grid,
  GridItem,
  Box,
  Text,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { Download, Save, FileText, Eye } from 'react-feather';

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface RentalContractEditorProps {
  onSave?: (contract: SavedRentalContract) => void;
}

const RentalContractEditor: React.FC<RentalContractEditorProps> = ({ onSave }) => {
  const [contractData, setContractData] = useState<RentalContractData>(defaultRentalContractData);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedRentalContract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const toast = useToast();

  useEffect(() => {
    loadSavedContracts();
  }, []);

  const loadSavedContracts = () => {
    try {
      const saved = localStorage.getItem('savedRentalContracts');
      if (saved) {
        setSavedContracts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Kaydedilen sözleşmeler yüklenirken hata:', error);
    }
  };

  const handleInputChange = (field: keyof RentalContractData, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveContract = () => {
    try {
      const newContract: SavedRentalContract = {
        id: Date.now().toString(),
        name: `${contractData.tenantName} - ${contractData.propertyAddress}`,
        data: contractData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedContracts = [...savedContracts, newContract];
      setSavedContracts(updatedContracts);
      localStorage.setItem('savedRentalContracts', JSON.stringify(updatedContracts));

      if (onSave) {
        onSave(newContract);
      }

      toast({
        title: 'Başarılı',
        description: 'Sözleşme başarıyla kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Sözleşme kaydedilirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const loadContract = (contract: SavedRentalContract) => {
    setContractData(contract.data);
    toast({
      title: 'Başarılı',
      description: 'Sözleşme başarıyla yüklendi.',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      const fontSize = 12;

      // Title
      page.drawText('KİRA SÖZLEŞMESİ', {
        x: width / 2 - 60,
        y: height - 50,
        size: 16,
        color: rgb(0, 0, 0),
      });

      let yPosition = height - 100;
      const lineHeight = 20;

      // Contract content
      const contractText = [
        `Kiracı: ${contractData.tenantName}`,
        `TC Kimlik No: ${contractData.tenantTcNo}`,
        `Telefon: ${contractData.tenantPhone}`,
        `E-posta: ${contractData.tenantEmail}`,
        `Adres: ${contractData.tenantAddress}`,
        '',
        `Kiraya Veren: ${contractData.landlordName}`,
        `TC Kimlik No: ${contractData.landlordTcNo}`,
        `Telefon: ${contractData.landlordPhone}`,
        `E-posta: ${contractData.landlordEmail}`,
        `Adres: ${contractData.landlordAddress}`,
        '',
        `Taşınmaz Adresi: ${contractData.propertyAddress}`,
        `Taşınmaz Türü: ${contractData.propertyType}`,
        `Brüt Alan: ${contractData.propertySize} m²`,
        `Oda Sayısı: ${contractData.propertyRooms}`,
        '',
        `Aylık Kira: ${contractData.monthlyRent} TL`,
        `Depozito: ${contractData.deposit} TL`,
        `Sözleşme Süresi: ${contractData.contractDuration}`,
        `Başlangıç Tarihi: ${contractData.rentStartDate}`,
        `Bitiş Tarihi: ${contractData.rentEndDate}`,
        `Ödeme Yöntemi: ${contractData.paymentMethod}`,
        '',
        `Özel Şartlar: ${contractData.specialConditions}`,
      ];

      contractText.forEach((line) => {
        if (yPosition < 50) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      toast({
        title: 'Başarılı',
        description: 'PDF başarıyla oluşturuldu.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `kira-sozlesmesi-${contractData.tenantName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Box h="100vh" p={4}>
      <Tabs h="100%" display="flex" flexDirection="column">
        <TabList>
          <Tab>
            <FileText size={16} style={{ marginRight: '8px' }} />
            Form
          </Tab>
          <Tab>
            <Eye size={16} style={{ marginRight: '8px' }} />
            Önizleme
          </Tab>
          <Tab>
            <Save size={16} style={{ marginRight: '8px' }} />
            Kaydedilenler
          </Tab>
        </TabList>

        <TabPanels flex={1} overflow="hidden">
          <TabPanel h="100%" overflow="auto">
            <VStack spacing={6} align="stretch">
              {/* Tenant Information */}
              <Card>
                <CardHeader>
                  <Heading size="md">Kiracı Bilgileri</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input
                        value={contractData.tenantName}
                        onChange={(e) => handleInputChange('tenantName', e.target.value)}
                        placeholder="Kiracının adı soyadı"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>TC Kimlik No</FormLabel>
                      <Input
                        value={contractData.tenantTcNo}
                        onChange={(e) => handleInputChange('tenantTcNo', e.target.value)}
                        placeholder="TC Kimlik numarası"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={contractData.tenantPhone}
                        onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                        placeholder="Telefon numarası"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>E-posta</FormLabel>
                      <Input
                        type="email"
                        value={contractData.tenantEmail}
                        onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                        placeholder="E-posta adresi"
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <FormLabel>Adres</FormLabel>
                      <Textarea
                        value={contractData.tenantAddress}
                        onChange={(e) => handleInputChange('tenantAddress', e.target.value)}
                        placeholder="Kiracının adresi"
                        rows={3}
                      />
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>

              {/* Landlord Information */}
              <Card>
                <CardHeader>
                  <Heading size="md">Kiraya Veren Bilgileri</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input
                        value={contractData.landlordName}
                        onChange={(e) => handleInputChange('landlordName', e.target.value)}
                        placeholder="Kiraya verenin adı soyadı"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>TC Kimlik No</FormLabel>
                      <Input
                        value={contractData.landlordTcNo}
                        onChange={(e) => handleInputChange('landlordTcNo', e.target.value)}
                        placeholder="TC Kimlik numarası"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={contractData.landlordPhone}
                        onChange={(e) => handleInputChange('landlordPhone', e.target.value)}
                        placeholder="Telefon numarası"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>E-posta</FormLabel>
                      <Input
                        type="email"
                        value={contractData.landlordEmail}
                        onChange={(e) => handleInputChange('landlordEmail', e.target.value)}
                        placeholder="E-posta adresi"
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <FormLabel>Adres</FormLabel>
                      <Textarea
                        value={contractData.landlordAddress}
                        onChange={(e) => handleInputChange('landlordAddress', e.target.value)}
                        placeholder="Kiraya verenin adresi"
                        rows={3}
                      />
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>

              {/* Property Information */}
              <Card>
                <CardHeader>
                  <Heading size="md">Taşınmaz Bilgileri</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <FormLabel>Taşınmaz Adresi</FormLabel>
                      <Textarea
                        value={contractData.propertyAddress}
                        onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                        placeholder="Kiralanan taşınmazın tam adresi"
                        rows={3}
                      />
                    </Box>
                    <Box>
                      <FormLabel>Taşınmaz Türü</FormLabel>
                      <Select
                        value={contractData.propertyType}
                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      >
                        <option value="">Taşınmaz türünü seçin</option>
                        <option value="daire">Daire</option>
                        <option value="villa">Villa</option>
                        <option value="ofis">Ofis</option>
                        <option value="dukkkan">Dükkan</option>
                        <option value="depo">Depo</option>
                      </Select>
                    </Box>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem>
                        <FormLabel>Brüt Alan (m²)</FormLabel>
                        <Input
                          value={contractData.propertySize}
                          onChange={(e) => handleInputChange('propertySize', e.target.value)}
                          placeholder="Brüt alan"
                        />
                      </GridItem>
                      <GridItem>
                        <FormLabel>Oda Sayısı</FormLabel>
                        <Input
                          value={contractData.propertyRooms}
                          onChange={(e) => handleInputChange('propertyRooms', e.target.value)}
                          placeholder="Oda sayısı"
                        />
                      </GridItem>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>

              {/* Rental Information */}
              <Card>
                <CardHeader>
                  <Heading size="md">Kira Bilgileri</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormLabel>Aylık Kira (TL)</FormLabel>
                      <Input
                        type="number"
                        value={contractData.monthlyRent}
                        onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                        placeholder="Aylık kira tutarı"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>Depozito (TL)</FormLabel>
                      <Input
                        type="number"
                        value={contractData.deposit}
                        onChange={(e) => handleInputChange('deposit', e.target.value)}
                        placeholder="Depozito tutarı"
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>Sözleşme Süresi</FormLabel>
                      <Select
                        value={contractData.contractDuration}
                        onChange={(e) => handleInputChange('contractDuration', e.target.value)}
                      >
                        <option value="">Sözleşme süresini seçin</option>
                        <option value="1-yil">1 Yıl</option>
                        <option value="2-yil">2 Yıl</option>
                        <option value="3-yil">3 Yıl</option>
                        <option value="belirsiz">Belirsiz Süreli</option>
                      </Select>
                    </GridItem>
                    <GridItem>
                      <FormLabel>Ödeme Yöntemi</FormLabel>
                      <Select
                        value={contractData.paymentMethod}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      >
                        <option value="">Ödeme yöntemini seçin</option>
                        <option value="nakit">Nakit</option>
                        <option value="havale">Havale/EFT</option>
                        <option value="cek">Çek</option>
                        <option value="senet">Senet</option>
                      </Select>
                    </GridItem>
                    <GridItem>
                      <FormLabel>Başlangıç Tarihi</FormLabel>
                      <Input
                        type="date"
                        value={contractData.rentStartDate}
                        onChange={(e) => handleInputChange('rentStartDate', e.target.value)}
                      />
                    </GridItem>
                    <GridItem>
                      <FormLabel>Bitiş Tarihi</FormLabel>
                      <Input
                        type="date"
                        value={contractData.rentEndDate}
                        onChange={(e) => handleInputChange('rentEndDate', e.target.value)}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <FormLabel>Özel Şartlar</FormLabel>
                      <Textarea
                        value={contractData.specialConditions}
                        onChange={(e) => handleInputChange('specialConditions', e.target.value)}
                        placeholder="Sözleşmeye eklenecek özel şartlar"
                        rows={4}
                      />
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>

              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={generatePDF}
                  isLoading={isGenerating}
                  leftIcon={<FileText size={16} />}
                >
                  {isGenerating ? 'PDF Oluşturuluyor...' : 'PDF Oluştur'}
                </Button>
                <Button
                  colorScheme="green"
                  onClick={saveContract}
                  leftIcon={<Save size={16} />}
                >
                  Kaydet
                </Button>
              </HStack>
            </VStack>
          </TabPanel>

          <TabPanel h="100%">
            <VStack h="100%" spacing={4}>
              {!pdfUrl ? (
                <Flex align="center" justify="center" h="100%">
                  <Text color="gray.500">PDF önizlemesi için önce PDF oluşturun</Text>
                </Flex>
              ) : (
                <>
                  <HStack>
                    <Button
                      colorScheme="blue"
                      onClick={downloadPDF}
                      leftIcon={<Download size={16} />}
                    >
                      PDF İndir
                    </Button>
                    <Text>Sayfa {pageNumber} / {numPages}</Text>
                  </HStack>
                  <Box flex={1} overflow="auto">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={<Spinner />}
                    >
                      <Page pageNumber={pageNumber} />
                    </Document>
                  </Box>
                </>
              )}
            </VStack>
          </TabPanel>

          <TabPanel h="100%" overflow="auto">
            <VStack spacing={4} align="stretch">
              <Heading size="md">Kaydedilen Sözleşmeler</Heading>
              {savedContracts.length === 0 ? (
                <Text color="gray.500">Henüz kaydedilmiş sözleşme bulunmuyor.</Text>
              ) : (
                savedContracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardBody>
                      <Flex align="center">
                        <Box flex={1}>
                          <Text fontWeight="bold">{contract.data.tenantName || 'İsimsiz Sözleşme'}</Text>
                          <Text fontSize="sm" color="gray.500">
                            Oluşturulma: {new Date(contract.createdAt).toLocaleDateString('tr-TR')}
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => loadContract(contract)}
                        >
                          Yükle
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default RentalContractEditor;