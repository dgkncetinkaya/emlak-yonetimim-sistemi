import { useState, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, Textarea, VStack, HStack,
  Box, Heading, Text, Divider, useToast, FormErrorMessage, Flex
} from '@chakra-ui/react';
import SignaturePad from 'signature_pad';

interface ShowingFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingData?: any;
}

const ShowingForm = ({ isOpen, onClose, existingData }: ShowingFormProps) => {
  const [formData, setFormData] = useState(existingData || {
    // Müşteri bilgileri
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Gayrimenkul bilgileri
    propertyAddress: '',
    propertyType: '',
    propertyFeatures: '',
    
    // Gösterim bilgileri
    showingDate: '',
    showingTime: '',
    agentName: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);
  const [agentSignature, setAgentSignature] = useState<string | null>(null);
  
  const customerSignaturePadRef = useRef<HTMLCanvasElement>(null);
  const agentSignaturePadRef = useRef<HTMLCanvasElement>(null);
  const customerSignaturePadInstance = useRef<SignaturePad | null>(null);
  const agentSignaturePadInstance = useRef<SignaturePad | null>(null);
  
  const toast = useToast();
  
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
  
  const initializeSignaturePads = () => {
    if (customerSignaturePadRef.current && !customerSignaturePadInstance.current) {
      customerSignaturePadInstance.current = new SignaturePad(customerSignaturePadRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'black',
      });
    }
    
    if (agentSignaturePadRef.current && !agentSignaturePadInstance.current) {
      agentSignaturePadInstance.current = new SignaturePad(agentSignaturePadRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'black',
      });
    }
  };
  
  const clearCustomerSignature = () => {
    if (customerSignaturePadInstance.current) {
      customerSignaturePadInstance.current.clear();
      setCustomerSignature(null);
    }
  };
  
  const clearAgentSignature = () => {
    if (agentSignaturePadInstance.current) {
      agentSignaturePadInstance.current.clear();
      setAgentSignature(null);
    }
  };
  
  const saveCustomerSignature = () => {
    if (customerSignaturePadInstance.current && !customerSignaturePadInstance.current.isEmpty()) {
      const signatureData = customerSignaturePadInstance.current.toDataURL();
      setCustomerSignature(signatureData);
    } else {
      toast({
        title: 'İmza gerekli',
        description: 'Lütfen müşteri imzasını ekleyin.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const saveAgentSignature = () => {
    if (agentSignaturePadInstance.current && !agentSignaturePadInstance.current.isEmpty()) {
      const signatureData = agentSignaturePadInstance.current.toDataURL();
      setAgentSignature(signatureData);
    } else {
      toast({
        title: 'İmza gerekli',
        description: 'Lütfen danışman imzasını ekleyin.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName) newErrors.customerName = 'Müşteri adı gereklidir';
    if (!formData.customerPhone) newErrors.customerPhone = 'Telefon numarası gereklidir';
    if (!formData.propertyAddress) newErrors.propertyAddress = 'Adres gereklidir';
    if (!formData.propertyType) newErrors.propertyType = 'Gayrimenkul tipi gereklidir';
    if (!formData.showingDate) newErrors.showingDate = 'Gösterim tarihi gereklidir';
    if (!formData.showingTime) newErrors.showingTime = 'Gösterim saati gereklidir';
    if (!formData.agentName) newErrors.agentName = 'Danışman adı gereklidir';
    
    if (!customerSignature) newErrors.customerSignature = 'Müşteri imzası gereklidir';
    if (!agentSignature) newErrors.agentSignature = 'Danışman imzası gereklidir';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // API çağrısı simülasyonu
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: 'Form kaydedildi',
          description: 'Yer gösterme formu başarıyla oluşturuldu.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        onClose();
      } catch (error) {
        toast({
          title: 'Hata oluştu',
          description: 'Form kaydedilirken bir hata oluştu.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      onEntered={initializeSignaturePads}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Yer Gösterme Formu {existingData ? 'Düzenle' : 'Oluştur'}</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Müşteri Bilgileri</Heading>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.customerName}>
                  <FormLabel>Müşteri Adı Soyadı</FormLabel>
                  <Input
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Müşterinin tam adını girin"
                  />
                  <FormErrorMessage>{errors.customerName}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.customerPhone}>
                  <FormLabel>Telefon</FormLabel>
                  <Input
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                  />
                  <FormErrorMessage>{errors.customerPhone}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>E-posta</FormLabel>
                  <Input
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    type="email"
                  />
                </FormControl>
              </VStack>
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="md" mb={4}>Gayrimenkul Bilgileri</Heading>
              
              <VStack spacing={4} align="stretch">
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
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="md" mb={4}>Gösterim Bilgileri</Heading>
              
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.showingDate} flex={1}>
                    <FormLabel>Gösterim Tarihi</FormLabel>
                    <Input
                      name="showingDate"
                      value={formData.showingDate}
                      onChange={handleChange}
                      type="date"
                    />
                    <FormErrorMessage>{errors.showingDate}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={!!errors.showingTime} flex={1}>
                    <FormLabel>Gösterim Saati</FormLabel>
                    <Input
                      name="showingTime"
                      value={formData.showingTime}
                      onChange={handleChange}
                      type="time"
                    />
                    <FormErrorMessage>{errors.showingTime}</FormErrorMessage>
                  </FormControl>
                </HStack>
                
                <FormControl isRequired isInvalid={!!errors.agentName}>
                  <FormLabel>Danışman Adı</FormLabel>
                  <Input
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleChange}
                    placeholder="Danışmanın tam adını girin"
                  />
                  <FormErrorMessage>{errors.agentName}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notlar</FormLabel>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Gösterim ile ilgili ek notlar"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="md" mb={4}>İmzalar</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box>
                  <FormControl isInvalid={!!errors.customerSignature}>
                    <FormLabel>Müşteri İmzası</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={2}
                      bg="white"
                      mb={2}
                    >
                      <canvas
                        ref={customerSignaturePadRef}
                        width={500}
                        height={200}
                        style={{ width: '100%', height: '200px', touchAction: 'none' }}
                      />
                    </Box>
                    <FormErrorMessage>{errors.customerSignature}</FormErrorMessage>
                    
                    <Flex justifyContent="flex-end" gap={2}>
                      <Button size="sm" onClick={clearCustomerSignature}>Temizle</Button>
                      <Button size="sm" colorScheme="blue" onClick={saveCustomerSignature}>İmzayı Kaydet</Button>
                    </Flex>
                  </FormControl>
                </Box>
                
                <Box>
                  <FormControl isInvalid={!!errors.agentSignature}>
                    <FormLabel>Danışman İmzası</FormLabel>
                    <Box
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={2}
                      bg="white"
                      mb={2}
                    >
                      <canvas
                        ref={agentSignaturePadRef}
                        width={500}
                        height={200}
                        style={{ width: '100%', height: '200px', touchAction: 'none' }}
                      />
                    </Box>
                    <FormErrorMessage>{errors.agentSignature}</FormErrorMessage>
                    
                    <Flex justifyContent="flex-end" gap={2}>
                      <Button size="sm" onClick={clearAgentSignature}>Temizle</Button>
                      <Button size="sm" colorScheme="blue" onClick={saveAgentSignature}>İmzayı Kaydet</Button>
                    </Flex>
                  </FormControl>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        
        <Divider />
        
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            İptal
          </Button>
          
          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Kaydediliyor"
          >
            Formu Kaydet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShowingForm;