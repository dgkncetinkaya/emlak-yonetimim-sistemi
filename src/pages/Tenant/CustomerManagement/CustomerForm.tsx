import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  SimpleGrid,
  Button,
  useToast,
  VStack,
  HStack,
  Text,
  Icon,
  InputGroup,
  InputLeftElement,
  InputLeftAddon,
  Badge,
  Divider,
  useColorModeValue,
  FormHelperText,
  Flex,
  IconButton,
  Heading
} from '@chakra-ui/react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  FileText,
  DollarSign,
  Tag,
  Check,
  X
} from 'react-feather';
import { customersService } from '../../../services/customersService';

interface CustomerFormProps {
  customer?: any;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const CustomerForm = ({ customer, onSubmit, onCancel }: CustomerFormProps) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customer_type: '',
    status: 'active',
    budget_min: 0,
    budget_max: 0,
    preferred_location: '',
    preferred_property_type: '',
    notes: ''
  });

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        customer_type: customer.customer_type || '',
        status: customer.status || 'active',
        budget_min: customer.budget_min || 0,
        budget_max: customer.budget_max || 0,
        preferred_location: customer.preferred_location || '',
        preferred_property_type: customer.preferred_property_type || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.customer_type) {
      toast({
        title: 'Hata',
        description: 'Lütfen zorunlu alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      if (customer?.id) {
        await customersService.updateCustomer(customer.id, formData);
        toast({
          title: 'Başarılı',
          description: 'Müşteri bilgileri güncellendi.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await customersService.createCustomer(formData);
        toast({
          title: 'Başarılı',
          description: 'Yeni müşteri eklendi.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSubmit?.();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Aktif', color: 'green' },
    { value: 'potential', label: 'Potansiyel', color: 'orange' }
  ];

  const customerTypes = [
    { value: 'buyer', label: 'Alıcı', icon: '🏠' },
    { value: 'seller', label: 'Satıcı', icon: '💰' },
    { value: 'tenant', label: 'Kiracı', icon: '🔑' },
    { value: 'landlord', label: 'Ev Sahibi', icon: '🏢' }
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Daire' },
    { value: 'house', label: 'Müstakil Ev' },
    { value: 'villa', label: 'Villa' },
    { value: 'office', label: 'Ofis' },
    { value: 'shop', label: 'Dükkan' },
    { value: 'land', label: 'Arsa' }
  ];

  return (
    <Box as="form" onSubmit={handleSubmit} p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box mb={2}>
          <Heading size="lg" color={labelColor}>
            {customer?.id ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {customer?.id ? 'Müşteri bilgilerini güncelleyin' : 'Yeni müşteri bilgilerini girin'}
          </Text>
        </Box>

        <Divider />

        {/* Kişisel Bilgiler */}
        <Box>
          <HStack mb={4}>
            <Icon as={User} color="blue.500" />
            <Text fontWeight="semibold" color={labelColor}>Kişisel Bilgiler</Text>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Ad Soyad
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={User} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Müşteri adı soyadı"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Telefon
              </FormLabel>
              <InputGroup>
                <InputLeftAddon bg={inputBg} borderColor={borderColor}>
                  <Icon as={Phone} color="gray.500" boxSize={4} />
                  <Text ml={2} fontSize="sm" color="gray.500">+90</Text>
                </InputLeftAddon>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="532 123 4567"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                E-posta
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Mail} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@email.com"
                  type="email"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Müşteri Tipi
              </FormLabel>
              <Select
                value={formData.customer_type}
                onChange={(e) => handleInputChange('customer_type', e.target.value)}
                placeholder="Seçiniz"
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.300' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {customerTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Durum */}
        <Box>
          <HStack mb={4}>
            <Icon as={Tag} color="blue.500" />
            <Text fontWeight="semibold" color={labelColor}>Müşteri Durumu</Text>
          </HStack>
          
          <Flex gap={3} flexWrap="wrap">
            {statusOptions.map(option => (
              <Box
                key={option.value}
                as="button"
                type="button"
                onClick={() => handleInputChange('status', option.value)}
                px={5}
                py={3}
                borderRadius="lg"
                border="2px solid"
                borderColor={formData.status === option.value ? `${option.color}.500` : borderColor}
                bg={formData.status === option.value ? `${option.color}.50` : 'transparent'}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: `${option.color}.400`,
                  bg: `${option.color}.50`
                }}
              >
                <HStack spacing={2}>
                  {formData.status === option.value && (
                    <Icon as={Check} color={`${option.color}.500`} boxSize={4} />
                  )}
                  <Badge
                    colorScheme={option.color}
                    variant={formData.status === option.value ? 'solid' : 'subtle'}
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="md"
                  >
                    {option.label}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </Flex>
        </Box>

        <Divider />

        {/* Bütçe ve Tercihler */}
        <Box>
          <HStack mb={4}>
            <Icon as={DollarSign} color="blue.500" />
            <Text fontWeight="semibold" color={labelColor}>Bütçe ve Tercihler</Text>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Minimum Bütçe
              </FormLabel>
              <InputGroup>
                <InputLeftAddon bg={inputBg} borderColor={borderColor}>₺</InputLeftAddon>
                <Input
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) => handleInputChange('budget_min', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                Maksimum Bütçe
              </FormLabel>
              <InputGroup>
                <InputLeftAddon bg={inputBg} borderColor={borderColor}>₺</InputLeftAddon>
                <Input
                  type="number"
                  value={formData.budget_max || ''}
                  onChange={(e) => handleInputChange('budget_max', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
              <FormHelperText fontSize="xs">
                Müşterinin maksimum bütçesini girin
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                İlgilendiği Bölgeler
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={MapPin} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  value={formData.preferred_location}
                  onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                  placeholder="Örn: Kadıköy, Beşiktaş, Üsküdar"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                İlgilendiği Emlak Tipi
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Home} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Select
                  value={formData.preferred_property_type}
                  onChange={(e) => handleInputChange('preferred_property_type', e.target.value)}
                  placeholder="Seçiniz"
                  pl={10}
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'blue.300' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </InputGroup>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Notlar */}
        <Box>
          <HStack mb={4}>
            <Icon as={FileText} color="blue.500" />
            <Text fontWeight="semibold" color={labelColor}>Notlar</Text>
          </HStack>
          
          <FormControl>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Müşteri hakkında önemli notlar, tercihler, özel istekler..."
              rows={4}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              resize="vertical"
            />
            <FormHelperText fontSize="xs">
              Müşteri ile ilgili hatırlanması gereken önemli bilgileri buraya yazın
            </FormHelperText>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Flex justify="flex-end" gap={3} pt={4}>
          <Button
            variant="ghost"
            onClick={onCancel}
            leftIcon={<X size={18} />}
            size="lg"
          >
            İptal
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText={customer?.id ? 'Güncelleniyor...' : 'Ekleniyor...'}
            leftIcon={<Check size={18} />}
            size="lg"
            px={8}
          >
            {customer?.id ? 'Güncelle' : 'Müşteri Ekle'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default CustomerForm;
