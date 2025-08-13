import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Flex, Button, Icon, Text, VStack, HStack, Image
} from '@chakra-ui/react';
import { Upload, X as FiX } from 'react-feather';

interface PropertyFormProps {
  property?: any;
  onChange?: (data: any) => void;
}

const PropertyForm = ({ property, onChange }: PropertyFormProps) => {
  const [form, setForm] = useState<any>({
    title: property?.title || '',
    type: property?.type || '',
    price: property?.price ? parseInt(property.price.replace(/[^0-9]/g, '')) : 0,
    propertyType: property?.propertyType || '',
    rooms: property?.rooms || '',
    size: property?.size ? parseInt(property.size) : 0,
    city: property?.city || '',
    district: property?.district || '',
    neighborhood: property?.neighborhood || '',
    address: property?.address || '',
    description: property?.description || '',
    deedStatus: property?.deedStatus || '',
    buildingAge: property?.buildingAge || '',
  });
  const [images, setImages] = useState<string[]>(property?.images || []);

  useEffect(() => {
    onChange?.({ ...form, images });
  }, [form, images]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      const all = [...images, ...newImages];
      setImages(all);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>İlan Başlığı</FormLabel>
          <Input 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="Örn: Merkez Mahallesi 3+1 Daire" 
          />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>İlan Tipi</FormLabel>
          <Select 
            value={form.type} 
            onChange={(e) => setForm({...form, type: e.target.value})}
            placeholder="Seçiniz"
          >
            <option value="for_sale">Satılık</option>
            <option value="for_rent">Kiralık</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Fiyat</FormLabel>
          <NumberInput 
            value={form.price} 
            onChange={(val) => setForm({...form, price: Number(val)})}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Emlak Türü</FormLabel>
          <Select 
            value={form.propertyType} 
            onChange={(e) => setForm({...form, propertyType: e.target.value})}
            placeholder="Seçiniz"
          >
            <option value="apartment">Daire</option>
            <option value="villa">Villa</option>
            <option value="house">Müstakil Ev</option>
            <option value="land">Arsa</option>
            <option value="commercial">İş Yeri</option>
            <option value="office">Ofis</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Oda Sayısı</FormLabel>
          <Select 
            value={form.rooms} 
            onChange={(e) => setForm({...form, rooms: e.target.value})}
            placeholder="Seçiniz"
          >
            <option value="1+0">1+0</option>
            <option value="1+1">1+1</option>
            <option value="2+1">2+1</option>
            <option value="3+1">3+1</option>
            <option value="4+1">4+1</option>
            <option value="5+1">5+1</option>
            <option value="6+ Oda">6+ Oda</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Metrekare (Brüt)</FormLabel>
          <NumberInput 
            value={form.size} 
            onChange={(val) => setForm({...form, size: Number(val)})}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>İl</FormLabel>
          <Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="İl" />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>İlçe</FormLabel>
          <Input value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} placeholder="İlçe" />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Mahalle</FormLabel>
          <Input value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})} placeholder="Mahalle" />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Adres</FormLabel>
          <Textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Tam adres" />
        </FormControl>
      </SimpleGrid>
      
      <FormControl mt={6}>
        <FormLabel>Açıklama</FormLabel>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Gayrimenkul hakkında detaylı açıklama"
          rows={6}
        />
      </FormControl>
      
      <FormControl mt={6}>
        <FormLabel>Fotoğraflar</FormLabel>
        <Flex flexWrap="wrap" gap={4}>
          {images.map((image, index) => (
            <Box key={index} position="relative">
              <Image
                src={image}
                alt={`Property image ${index + 1}`}
                boxSize="100px"
                objectFit="cover"
                borderRadius="md"
              />
              <Button
                size="xs"
                position="absolute"
                top="-2"
                right="-2"
                colorScheme="red"
                borderRadius="full"
                onClick={() => removeImage(index)}
              >
                <Icon as={FiX} />
              </Button>
            </Box>
          ))}
          
          <Flex
            as="label"
            htmlFor="image-upload"
            boxSize="100px"
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="md"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            _hover={{ borderColor: 'blue.500' }}
          >
            <VStack spacing={1}>
              <Icon as={Upload} />
              <Text fontSize="xs">Fotoğraf Ekle</Text>
            </VStack>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              display="none"
            />
          </Flex>
        </Flex>
      </FormControl>
      
      <HStack mt={6} spacing={4}>
        <FormControl>
          <FormLabel>Tapu Durumu</FormLabel>
          <Select value={form.deedStatus} onChange={(e) => setForm({...form, deedStatus: e.target.value})} placeholder="Seçiniz">
            <option value="Kat Mülkiyetli">Kat Mülkiyetli</option>
            <option value="Kat İrtifaklı">Kat İrtifaklı</option>
            <option value="Müstakil Tapulu">Müstakil Tapulu</option>
            <option value="Hisseli Tapu">Hisseli Tapu</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Bina Yaşı</FormLabel>
          <Select value={form.buildingAge} onChange={(e) => setForm({...form, buildingAge: e.target.value})} placeholder="Seçiniz">
            <option value="0">0 (Yeni)</option>
            <option value="1-5">1-5</option>
            <option value="5-10">5-10</option>
            <option value="10-15">10-15</option>
            <option value="15-20">15-20</option>
            <option value="20+">20+</option>
          </Select>
        </FormControl>
      </HStack>
    </Box>
  );
};

export default PropertyForm;