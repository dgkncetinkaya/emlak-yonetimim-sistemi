import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Grid,
  GridItem,
  useToast,
  Divider,
  Text,
  Box
} from '@chakra-ui/react';
import { PDFFormFields } from '../../types/rentalContract';
import { createRentalContractPDF } from '../../utils/pdfTemplate';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contractData: PDFFormFields, pdfBytes: Uint8Array) => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PDFFormFields>({
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
    propertyType: 'Daire',
    roomCount: '',
    propertyArea: '',
    propertyFloor: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    deposit: '',
    currency: 'TL',
    paymentDay: '1',
    paymentMethod: 'Nakit',
    utilitiesIncluded: 'Hayır',
    petAllowed: 'Hayır',
    smokingAllowed: 'Hayır',
    specialConditions: '',
    contractDate: new Date().toISOString().split('T')[0],
    contractLocation: 'İstanbul'
  });

  const handleInputChange = (field: keyof PDFFormFields, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Zorunlu alanları kontrol et
    const requiredFields = [
      'landlordName', 'landlordTcNo', 'tenantName', 'tenantTcNo',
      'propertyAddress', 'startDate', 'endDate', 'rentAmount'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof PDFFormFields]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Eksik Bilgiler',
        description: 'Lütfen tüm zorunlu alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await createRentalContractPDF(formData);
      onSave(formData, pdfBytes);
      
      toast({
        title: 'Başarılı',
        description: 'Kira sözleşmesi başarıyla oluşturuldu.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast({
        title: 'Hata',
        description: 'PDF oluşturulurken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
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
      propertyType: 'Daire',
      roomCount: '',
      propertyArea: '',
      propertyFloor: '',
      startDate: '',
      endDate: '',
      rentAmount: '',
      deposit: '',
      currency: 'TL',
      paymentDay: '1',
      paymentMethod: 'Nakit',
      utilitiesIncluded: 'Hayır',
      petAllowed: 'Hayır',
      smokingAllowed: 'Hayır',
      specialConditions: '',
      contractDate: new Date().toISOString().split('T')[0],
      contractLocation: 'İstanbul'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Yeni Kira Sözleşmesi Oluştur</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Ev Sahibi Bilgileri */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="blue.600">
                Ev Sahibi Bilgileri
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Ad Soyad</FormLabel>
                    <Input
                      value={formData.landlordName}
                      onChange={(e) => handleInputChange('landlordName', e.target.value)}
                      placeholder="Ev sahibinin adı soyadı"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <Input
                      value={formData.landlordTcNo}
                      onChange={(e) => handleInputChange('landlordTcNo', e.target.value)}
                      placeholder="11 haneli TC kimlik numarası"
                      maxLength={11}
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Adres</FormLabel>
                    <Textarea
                      value={formData.landlordAddress}
                      onChange={(e) => handleInputChange('landlordAddress', e.target.value)}
                      placeholder="Ev sahibinin adresi"
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={formData.landlordPhone}
                      onChange={(e) => handleInputChange('landlordPhone', e.target.value)}
                      placeholder="0555 123 45 67"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Kiracı Bilgileri */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="green.600">
                Kiracı Bilgileri
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Ad Soyad</FormLabel>
                    <Input
                      value={formData.tenantName}
                      onChange={(e) => handleInputChange('tenantName', e.target.value)}
                      placeholder="Kiracının adı soyadı"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <Input
                      value={formData.tenantTcNo}
                      onChange={(e) => handleInputChange('tenantTcNo', e.target.value)}
                      placeholder="11 haneli TC kimlik numarası"
                      maxLength={11}
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Adres</FormLabel>
                    <Textarea
                      value={formData.tenantAddress}
                      onChange={(e) => handleInputChange('tenantAddress', e.target.value)}
                      placeholder="Kiracının adresi"
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={formData.tenantPhone}
                      onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                      placeholder="0555 123 45 67"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Emlak Bilgileri */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="purple.600">
                Emlak Bilgileri
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Emlak Adresi</FormLabel>
                    <Textarea
                      value={formData.propertyAddress}
                      onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                      placeholder="Kiralanan emlağın tam adresi"
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>İlçe</FormLabel>
                    <Input
                      value={formData.propertyDistrict}
                      onChange={(e) => handleInputChange('propertyDistrict', e.target.value)}
                      placeholder="İlçe"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>İl</FormLabel>
                    <Input
                      value={formData.propertyCity}
                      onChange={(e) => handleInputChange('propertyCity', e.target.value)}
                      placeholder="İl"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Emlak Türü</FormLabel>
                    <Select
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    >
                      <option value="Daire">Daire</option>
                      <option value="Villa">Villa</option>
                      <option value="Müstakil Ev">Müstakil Ev</option>
                      <option value="Dubleks">Dubleks</option>
                      <option value="Stüdyo">Stüdyo</option>
                      <option value="Loft">Loft</option>
                      <option value="Dükkan">Dükkan</option>
                      <option value="Ofis">Ofis</option>
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Oda Sayısı</FormLabel>
                    <Select
                      value={formData.roomCount}
                      onChange={(e) => handleInputChange('roomCount', e.target.value)}
                    >
                      <option value="">Seçiniz</option>
                      <option value="1+0">1+0</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1">5+1</option>
                      <option value="6+1">6+1</option>
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Alan (m²)</FormLabel>
                    <Input
                      type="number"
                      value={formData.propertyArea}
                      onChange={(e) => handleInputChange('propertyArea', e.target.value)}
                      placeholder="Metrekare"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Kat</FormLabel>
                    <Input
                      value={formData.propertyFloor}
                      onChange={(e) => handleInputChange('propertyFloor', e.target.value)}
                      placeholder="Kat numarası"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Sözleşme Detayları */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="orange.600">
                Sözleşme Detayları
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Başlangıç Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Bitiş Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Kira Bedeli</FormLabel>
                    <HStack>
                      <Input
                        type="number"
                        value={formData.rentAmount}
                        onChange={(e) => handleInputChange('rentAmount', e.target.value)}
                        placeholder="Kira bedeli"
                      />
                      <Select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        w="100px"
                      >
                        <option value="TL">TL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </Select>
                    </HStack>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Depozito</FormLabel>
                    <Input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => handleInputChange('deposit', e.target.value)}
                      placeholder="Depozito miktarı"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Ödeme Günü (Ayın)</FormLabel>
                    <Select
                      value={formData.paymentDay}
                      onChange={(e) => handleInputChange('paymentDay', e.target.value)}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day.toString()}>{day}</option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Ödeme Yöntemi</FormLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    >
                      <option value="Nakit">Nakit</option>
                      <option value="Banka Havalesi">Banka Havalesi</option>
                      <option value="EFT">EFT</option>
                      <option value="Çek">Çek</option>
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Ek Bilgiler */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="teal.600">
                Ek Bilgiler
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Faturalar Dahil mi?</FormLabel>
                    <Select
                      value={formData.utilitiesIncluded}
                      onChange={(e) => handleInputChange('utilitiesIncluded', e.target.value)}
                    >
                      <option value="Hayır">Hayır</option>
                      <option value="Evet">Evet</option>
                      <option value="Kısmen">Kısmen</option>
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Evcil Hayvan İzni</FormLabel>
                    <Select
                      value={formData.petAllowed}
                      onChange={(e) => handleInputChange('petAllowed', e.target.value)}
                    >
                      <option value="Hayır">Hayır</option>
                      <option value="Evet">Evet</option>
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Sigara İçme İzni</FormLabel>
                    <Select
                      value={formData.smokingAllowed}
                      onChange={(e) => handleInputChange('smokingAllowed', e.target.value)}
                    >
                      <option value="Hayır">Hayır</option>
                      <option value="Evet">Evet</option>
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Özel Şartlar */}
            <Box>
              <FormControl>
                <FormLabel>Özel Şartlar</FormLabel>
                <Textarea
                  value={formData.specialConditions}
                  onChange={(e) => handleInputChange('specialConditions', e.target.value)}
                  placeholder="Sözleşmeye eklemek istediğiniz özel şartlar..."
                  rows={4}
                />
              </FormControl>
            </Box>

            <Divider />

            {/* Sözleşme Bilgileri */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={4} color="red.600">
                Sözleşme Bilgileri
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Sözleşme Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.contractDate}
                      onChange={(e) => handleInputChange('contractDate', e.target.value)}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Sözleşme Yeri</FormLabel>
                    <Input
                      value={formData.contractLocation}
                      onChange={(e) => handleInputChange('contractLocation', e.target.value)}
                      placeholder="Sözleşmenin imzalandığı yer"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            İptal
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
            loadingText="Oluşturuluyor..."
          >
            Sözleşme Oluştur
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateContractModal;