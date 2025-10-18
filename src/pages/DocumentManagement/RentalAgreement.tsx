import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Textarea, Select, Checkbox, VStack, HStack,
  Box, Heading, Text, Divider, useToast, FormErrorMessage, Progress
} from '@chakra-ui/react';

interface RentalAgreementProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: any;
}

const RentalAgreement = ({ isOpen, onClose, existingData }: RentalAgreementProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(existingData || {
    // Kiracı bilgileri
    tenantName: '',
    tenantIdNumber: '',
    tenantPhone: '',
    tenantEmail: '',
    
    // Mülk sahibi bilgileri
    ownerName: '',
    ownerIdNumber: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Gayrimenkul bilgileri
    propertyAddress: '',
    propertyType: '',
    propertySize: '',
    propertyFeatures: '',
    
    // Kira bilgileri
    rentAmount: '',
    depositAmount: '',
    contractStartDate: '',
    contractEndDate: '',
    paymentDay: '',
    paymentMethod: '',
    
    // Diğer şartlar
    additionalTerms: '',
    isUtilitiesIncluded: false,
    isPetsAllowed: false,
    isSubletAllowed: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const totalSteps = 4;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.tenantName) newErrors.tenantName = 'Kiracı adı gereklidir';
      if (!formData.tenantIdNumber) newErrors.tenantIdNumber = 'TC Kimlik No gereklidir';
      if (!formData.tenantPhone) newErrors.tenantPhone = 'Telefon numarası gereklidir';
    }
    
    else if (step === 2) {
      if (!formData.ownerName) newErrors.ownerName = 'Mülk sahibi adı gereklidir';
      if (!formData.ownerIdNumber) newErrors.ownerIdNumber = 'TC Kimlik No gereklidir';
      if (!formData.ownerPhone) newErrors.ownerPhone = 'Telefon numarası gereklidir';
    }
    
    else if (step === 3) {
      if (!formData.propertyAddress) newErrors.propertyAddress = 'Adres gereklidir';
      if (!formData.propertyType) newErrors.propertyType = 'Gayrimenkul tipi gereklidir';
      if (!formData.propertySize) newErrors.propertySize = 'Metrekare gereklidir';
    }
    
    else if (step === 4) {
      if (!formData.rentAmount) newErrors.rentAmount = 'Kira tutarı gereklidir';
      if (!formData.depositAmount) newErrors.depositAmount = 'Depozito tutarı gereklidir';
      if (!formData.contractStartDate) newErrors.contractStartDate = 'Başlangıç tarihi gereklidir';
      if (!formData.contractEndDate) newErrors.contractEndDate = 'Bitiş tarihi gereklidir';
      if (!formData.paymentDay) newErrors.paymentDay = 'Ödeme günü gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      
      try {
        // API çağrısı simülasyonu
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: 'Sözleşme kaydedildi',
          description: 'Kira sözleşmesi başarıyla oluşturuldu.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onClose();
      } catch (error) {
        toast({
          title: 'Hata oluştu',
          description: 'Sözleşme kaydedilirken bir hata oluştu.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Kiracı Bilgileri</Heading>
            <Text fontSize="sm" color="gray.600">Kiracıya ait kişisel bilgileri doldurun.</Text>
            
            <FormControl isRequired isInvalid={!!errors.tenantName}>
              <FormLabel>Kiracı Adı Soyadı</FormLabel>
              <Input
                name="tenantName"
                value={formData.tenantName}
                onChange={handleChange}
                placeholder="Kiracının tam adını girin"
              />
              <FormErrorMessage>{errors.tenantName}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.tenantIdNumber}>
              <FormLabel>TC Kimlik No</FormLabel>
              <Input
                name="tenantIdNumber"
                value={formData.tenantIdNumber}
                onChange={handleChange}
                placeholder="11 haneli TC Kimlik No"
                maxLength={11}
              />
              <FormErrorMessage>{errors.tenantIdNumber}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.tenantPhone}>
              <FormLabel>Telefon</FormLabel>
              <Input
                name="tenantPhone"
                value={formData.tenantPhone}
                onChange={handleChange}
                placeholder="05XX XXX XX XX"
              />
              <FormErrorMessage>{errors.tenantPhone}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>E-posta</FormLabel>
              <Input
                name="tenantEmail"
                value={formData.tenantEmail}
                onChange={handleChange}
                placeholder="ornek@email.com"
                type="email"
              />
            </FormControl>
          </VStack>
        );
        
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Mülk Sahibi Bilgileri</Heading>
            <Text fontSize="sm" color="gray.600">Mülk sahibine ait kişisel bilgileri doldurun.</Text>
            
            <FormControl isRequired isInvalid={!!errors.ownerName}>
              <FormLabel>Mülk Sahibi Adı Soyadı</FormLabel>
              <Input
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Mülk sahibinin tam adını girin"
              />
              <FormErrorMessage>{errors.ownerName}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.ownerIdNumber}>
              <FormLabel>TC Kimlik No</FormLabel>
              <Input
                name="ownerIdNumber"
                value={formData.ownerIdNumber}
                onChange={handleChange}
                placeholder="11 haneli TC Kimlik No"
                maxLength={11}
              />
              <FormErrorMessage>{errors.ownerIdNumber}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.ownerPhone}>
              <FormLabel>Telefon</FormLabel>
              <Input
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="05XX XXX XX XX"
              />
              <FormErrorMessage>{errors.ownerPhone}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>E-posta</FormLabel>
              <Input
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="ornek@email.com"
                type="email"
              />
            </FormControl>
          </VStack>
        );
        
      case 3:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Gayrimenkul Bilgileri</Heading>
            <Text fontSize="sm" color="gray.600">Kiralanacak gayrimenkule ait bilgileri doldurun.</Text>
            
            <FormControl isRequired isInvalid={!!errors.propertyAddress}>
              <FormLabel>Adres</FormLabel>
              <Textarea
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleChange}
                placeholder="Gayrimenkulün tam adresini girin"
                rows={3}
              />
              <FormErrorMessage>{errors.propertyAddress}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.propertyType}>
              <FormLabel>Gayrimenkul Tipi</FormLabel>
              <Select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                placeholder="Seçiniz"
              >
                <option value="Daire">Daire</option>
                <option value="Müstakil Ev">Müstakil Ev</option>
                <option value="İş Yeri">İş Yeri</option>
                <option value="Depo">Depo</option>
                <option value="Arsa">Arsa</option>
                <option value="Diğer">Diğer</option>
              </Select>
              <FormErrorMessage>{errors.propertyType}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!errors.propertySize}>
              <FormLabel>Metrekare</FormLabel>
              <Input
                name="propertySize"
                value={formData.propertySize}
                onChange={handleChange}
                placeholder="Metrekare (m²)"
              />
              <FormErrorMessage>{errors.propertySize}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>Özellikler</FormLabel>
              <Textarea
                name="propertyFeatures"
                value={formData.propertyFeatures}
                onChange={handleChange}
                placeholder="Oda sayısı, ısınma tipi, eşya durumu vb."
                rows={3}
              />
            </FormControl>
          </VStack>
        );
        
      case 4:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Kira Bilgileri ve Şartlar</Heading>
            <Text fontSize="sm" color="gray.600">Kira sözleşmesine ait finansal bilgileri ve şartları doldurun.</Text>
            
            <HStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.rentAmount} flex={1}>
                <FormLabel>Kira Tutarı (TL)</FormLabel>
                <Input
                  name="rentAmount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  placeholder="Aylık kira tutarı"
                  type="number"
                />
                <FormErrorMessage>{errors.rentAmount}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.depositAmount} flex={1}>
                <FormLabel>Depozito (TL)</FormLabel>
                <Input
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  placeholder="Depozito tutarı"
                  type="number"
                />
                <FormErrorMessage>{errors.depositAmount}</FormErrorMessage>
              </FormControl>
            </HStack>
            
            <HStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.contractStartDate} flex={1}>
                <FormLabel>Başlangıç Tarihi</FormLabel>
                <Input
                  name="contractStartDate"
                  value={formData.contractStartDate}
                  onChange={handleChange}
                  type="date"
                />
                <FormErrorMessage>{errors.contractStartDate}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!errors.contractEndDate} flex={1}>
                <FormLabel>Bitiş Tarihi</FormLabel>
                <Input
                  name="contractEndDate"
                  value={formData.contractEndDate}
                  onChange={handleChange}
                  type="date"
                />
                <FormErrorMessage>{errors.contractEndDate}</FormErrorMessage>
              </FormControl>
            </HStack>
            
            <HStack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.paymentDay} flex={1}>
                <FormLabel>Ödeme Günü</FormLabel>
                <Input
                  name="paymentDay"
                  value={formData.paymentDay}
                  onChange={handleChange}
                  placeholder="Ayın kaçında (1-31)"
                  type="number"
                  min={1}
                  max={31}
                />
                <FormErrorMessage>{errors.paymentDay}</FormErrorMessage>
              </FormControl>
              
              <FormControl flex={1}>
                <FormLabel>Ödeme Yöntemi</FormLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  placeholder="Seçiniz"
                >
                  <option value="Nakit">Nakit</option>
                  <option value="Banka Havalesi">Banka Havalesi</option>
                  <option value="Otomatik Ödeme">Otomatik Ödeme</option>
                  <option value="Diğer">Diğer</option>
                </Select>
              </FormControl>
            </HStack>
            
            <FormControl>
              <FormLabel>Ek Şartlar</FormLabel>
              <Textarea
                name="additionalTerms"
                value={formData.additionalTerms}
                onChange={handleChange}
                placeholder="Sözleşmeye eklemek istediğiniz özel şartlar"
                rows={3}
              />
            </FormControl>
            
            <VStack align="start" spacing={2}>
              <Checkbox
                name="isUtilitiesIncluded"
                isChecked={formData.isUtilitiesIncluded}
                onChange={handleCheckboxChange}
              >
                Faturalar kira bedeline dahildir
              </Checkbox>
              
              <Checkbox
                name="isPetsAllowed"
                isChecked={formData.isPetsAllowed}
                onChange={handleCheckboxChange}
              >
                Evcil hayvan beslenebilir
              </Checkbox>
              
              <Checkbox
                name="isSubletAllowed"
                isChecked={formData.isSubletAllowed}
                onChange={handleCheckboxChange}
              >
                Alt kiralama yapılabilir
              </Checkbox>
            </VStack>
          </VStack>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Kira Sözleşmesi {existingData ? 'Düzenle' : 'Oluştur'}</ModalHeader>
        <ModalCloseButton />
        
        <Box px={6} pt={2}>
          <Progress
            value={(currentStep / totalSteps) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            mb={4}
          />
          
          <HStack spacing={4} mb={4} justify="center">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <Box
                key={index}
                w={8}
                h={8}
                borderRadius="full"
                bg={currentStep > index ? 'blue.500' : 'gray.200'}
                color={currentStep > index ? 'white' : 'gray.500'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                cursor="pointer"
                onClick={() => {
                  // Sadece tamamlanmış adımlara geri dönülebilir
                  if (currentStep > index + 1) {
                    setCurrentStep(index + 1);
                  }
                }}
              >
                {index + 1}
              </Box>
            ))}
          </HStack>
        </Box>
        
        <Divider />
        
        <ModalBody py={6}>
          {renderStepContent()}
        </ModalBody>
        
        <Divider />
        
        <ModalFooter>
          {currentStep > 1 && (
            <Button variant="outline" mr={3} onClick={handlePrevious}>
              Geri
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button colorScheme="blue" onClick={handleNext}>
              İleri
            </Button>
          ) : (
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Kaydediliyor"
            >
              Sözleşmeyi Kaydet
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RentalAgreement;