import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Stack, Radio, RadioGroup
} from '@chakra-ui/react';

interface CustomerFormProps {
  customer?: any;
}

const CustomerForm = ({ customer }: CustomerFormProps) => {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Ad Soyad</FormLabel>
          <Input defaultValue={customer?.name} placeholder="Ad Soyad" />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Telefon</FormLabel>
          <Input defaultValue={customer?.phone} placeholder="0532 123 4567" />
        </FormControl>
        
        <FormControl>
          <FormLabel>E-posta</FormLabel>
          <Input defaultValue={customer?.email} placeholder="ornek@email.com" type="email" />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Müşteri Tipi</FormLabel>
          <Select defaultValue={customer?.type} placeholder="Seçiniz">
            <option value="Alıcı">Alıcı</option>
            <option value="Satıcı">Satıcı</option>
            <option value="Kiracı">Kiracı</option>
            <option value="Ev Sahibi">Ev Sahibi</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Durum</FormLabel>
          <RadioGroup defaultValue={customer?.status || 'Aktif'}>
            <Stack direction="row">
              <Radio value="Aktif">Aktif</Radio>
              <Radio value="Pasif">Pasif</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </SimpleGrid>
      
      <Box mt={6}>
        <FormControl>
          <FormLabel>Bütçe Aralığı</FormLabel>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <NumberInput defaultValue={customer?.minBudget || 0} min={0}>
              <NumberInputField placeholder="Min" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            
            <NumberInput defaultValue={customer?.maxBudget || 0} min={0}>
              <NumberInputField placeholder="Max" />
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
          <Input defaultValue={customer?.areas} placeholder="Örn: Merkez, Göztepe" />
        </FormControl>
        
        <FormControl>
          <FormLabel>İstediği Özellikler</FormLabel>
          <Input defaultValue={customer?.preferences} placeholder="Örn: 3+1, Bahçeli" />
        </FormControl>
      </SimpleGrid>
      
      <FormControl mt={6}>
        <FormLabel>Notlar</FormLabel>
        <Textarea
          defaultValue={customer?.notes}
          placeholder="Müşteri hakkında notlar"
          rows={4}
        />
      </FormControl>
    </Box>
  );
};

export default CustomerForm;