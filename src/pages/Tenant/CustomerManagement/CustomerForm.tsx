import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Stack, Radio, RadioGroup, Button, useToast
} from '@chakra-ui/react';
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

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Ad Soyad</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ad Soyad"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Telefon</FormLabel>
          <Input
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="0532 123 4567"
          />
        </FormControl>

        <FormControl>
          <FormLabel>E-posta</FormLabel>
          <Input
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="ornek@email.com"
            type="email"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Müşteri Tipi</FormLabel>
          <Select
            value={formData.customer_type}
            onChange={(e) => handleInputChange('customer_type', e.target.value)}
            placeholder="Seçiniz"
          >
            <option value="buyer">Alıcı</option>
            <option value="seller">Satıcı</option>
            <option value="tenant">Kiracı</option>
            <option value="landlord">Ev Sahibi</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Durum</FormLabel>
          <RadioGroup
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
          >
            <Stack direction="row">
              <Radio value="active">Aktif</Radio>
              <Radio value="inactive">Pasif</Radio>
              <Radio value="potential">Potansiyel</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </SimpleGrid>

      <Box mt={6}>
        <FormControl>
          <FormLabel>Bütçe Aralığı</FormLabel>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <NumberInput
              value={formData.budget_min}
              onChange={(_, value) => handleInputChange('budget_min', value || 0)}
              min={0}
            >
              <NumberInputField placeholder="Min Bütçe" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <NumberInput
              value={formData.budget_max}
              onChange={(_, value) => handleInputChange('budget_max', value || 0)}
              min={0}
            >
              <NumberInputField placeholder="Max Bütçe" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </SimpleGrid>
        </FormControl>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <FormControl>
          <FormLabel>İlgilendiği Bölgeler</FormLabel>
          <Input
            value={formData.preferred_location}
            onChange={(e) => handleInputChange('preferred_location', e.target.value)}
            placeholder="Örn: Merkez, Göztepe"
          />
        </FormControl>

        <FormControl>
          <FormLabel>İlgilendiği Emlak Tipi</FormLabel>
          <Select
            value={formData.preferred_property_type}
            onChange={(e) => handleInputChange('preferred_property_type', e.target.value)}
            placeholder="Seçiniz"
          >
            <option value="apartment">Daire</option>
            <option value="house">Müstakil Ev</option>
            <option value="villa">Villa</option>
            <option value="office">Ofis</option>
            <option value="shop">Dükkan</option>
            <option value="land">Arsa</option>
          </Select>
        </FormControl>
      </SimpleGrid>

      <FormControl mt={6}>
        <FormLabel>Notlar</FormLabel>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Müşteri hakkında notlar"
          rows={4}
        />
      </FormControl>

      <Stack direction="row" spacing={4} mt={6} justify="flex-end">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={loading}
          loadingText={customer?.id ? 'Güncelleniyor...' : 'Ekleniyor...'}
        >
          {customer?.id ? 'Güncelle' : 'Ekle'}
        </Button>
      </Stack>
    </Box>
  );
};

export default CustomerForm;