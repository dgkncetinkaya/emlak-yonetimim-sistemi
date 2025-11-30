import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Flex, Button, Icon, Text, VStack, HStack, Image,
  useToast
} from '@chakra-ui/react';
import { Upload, X as FiX, Save } from 'react-feather';
import { useMutation } from '@tanstack/react-query';
import { propertiesService } from '../../../services/propertiesService';

interface PropertyFormProps {
  property?: any;
  onChange?: (data: any) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyForm = ({ property, onChange, onSuccess, onCancel }: PropertyFormProps) => {
  const toast = useToast();
  
  // Normalize rooms value to match select options
  const normalizeRooms = (rooms: string | undefined): string => {
    if (!rooms) return '';
    const cleaned = rooms.replace(/\s/g, '');
    // Check if it matches expected format
    if (['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'].includes(cleaned)) {
      return cleaned;
    }
    // Try to extract pattern like "2+1"
    const match = cleaned.match(/(\d)\+(\d)/);
    if (match) {
      return `${match[1]}+${match[2]}`;
    }
    return cleaned;
  };

  const [form, setForm] = useState<any>({
    title: property?.title || '',
    listing_type: property?.listing_type || 'for_sale',
    price: property?.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
    property_type: property?.property_type || 'apartment',
    rooms: normalizeRooms(property?.rooms),
    area: property?.area || 0,
    city: property?.city || '',
    district: property?.district || '',
    neighborhood: property?.neighborhood || '',
    address: property?.address || '',
    description: property?.description || '',
    deed_status: property?.deed_status || 'clear',
    building_age: property?.building_age || 0,
    status: property?.status || 'active',
  });
  const [images, setImages] = useState<string[]>(property?.images || property?.image_urls || []);

  // Update form when property changes (for scraper import)
  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || '',
        listing_type: property.listing_type || 'for_sale',
        price: property.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
        property_type: property.property_type || 'apartment',
        rooms: normalizeRooms(property.rooms),
        area: property.area || 0,
        city: property.city || '',
        district: property.district || '',
        neighborhood: property.neighborhood || '',
        address: property.address || '',
        description: property.description || '',
        deed_status: property.deed_status || 'clear',
        building_age: property.building_age || 0,
        status: property.status || 'active',
      });
      setImages(property.images || property.image_urls || []);
    }
  }, [property]);

  useEffect(() => {
    onChange?.({ ...form, images });
  }, [form, images]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (property?.id) {
        return propertiesService.updateProperty(property.id, data);
      } else {
        return propertiesService.createProperty(data);
      }
    },
    onSuccess: () => {
      toast({
        title: property?.id ? 'İlan güncellendi' : 'İlan eklendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem sırasında bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const handleSubmit = () => {
    // Validation
    if (!form.title || !form.city || !form.district || !form.address) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    saveMutation.mutate({
      ...form,
      images: images,
    });
  };
  
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
            value={form.listing_type} 
            onChange={(e) => setForm({...form, listing_type: e.target.value})}
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
            value={form.property_type} 
            onChange={(e) => setForm({...form, property_type: e.target.value})}
            placeholder="Seçiniz"
          >
            <option value="apartment">Daire</option>
            <option value="villa">Villa</option>
            <option value="house">Müstakil Ev</option>
            <option value="office">Ofis</option>
            <option value="land">Arsa</option>
            <option value="commercial">Ticari</option>
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
            value={form.area} 
            onChange={(val) => setForm({...form, area: Number(val)})}
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
          <Select value={form.deed_status} onChange={(e) => setForm({...form, deed_status: e.target.value})} placeholder="Seçiniz">
            <option value="clear">Temiz</option>
            <option value="mortgage">İpotekli</option>
            <option value="disputed">İhtilafli</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Bina Yaşı</FormLabel>
          <NumberInput 
            value={form.building_age} 
            onChange={(val) => setForm({...form, building_age: Number(val)})}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>

      {/* Action Buttons */}
      <HStack mt={8} spacing={4} justify="flex-end">
        <Button
          variant="ghost"
          onClick={onCancel}
        >
          İptal
        </Button>
        <Button
          leftIcon={<Save />}
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={saveMutation.isPending}
        >
          {property?.id ? 'Güncelle' : 'Kaydet'}
        </Button>
      </HStack>
    </Box>
  );
};

export default PropertyForm;