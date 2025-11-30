import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Flex, Button, Icon, Text, VStack, HStack, Image,
  useToast, Divider, useColorModeValue, Switch, InputGroup, InputRightAddon,
  Heading, Badge
} from '@chakra-ui/react';
import { Upload, X as FiX, Save, Home } from 'react-feather';
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
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Normalize rooms value
  const normalizeRooms = (rooms: string | undefined): string => {
    if (!rooms) return '';
    const cleaned = rooms.replace(/\s/g, '');
    if (['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'].includes(cleaned)) {
      return cleaned;
    }
    const match = cleaned.match(/(\d)\+(\d)/);
    if (match) {
      return `${match[1]}+${match[2]}`;
    }
    return cleaned;
  };

  const [form, setForm] = useState<any>({
    // Temel Bilgiler
    title: property?.title || '',
    listing_type: property?.listing_type || 'for_sale',
    price: property?.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
    property_type: property?.property_type || 'apartment',
    
    // Alan ve Oda
    area: property?.area || property?.area_gross || 0,
    rooms: normalizeRooms(property?.rooms),
    
    // Bina Bilgileri
    building_age: property?.building_age || 0,
    floor: property?.floor || 0,
    total_floors: property?.total_floors || 0,
    
    // Isıtma ve Özellikler
    heating: property?.heating || '',
    bathrooms: property?.bathrooms || 1,
    kitchen_type: property?.kitchen_type || '',
    balcony: property?.balcony || false,
    elevator: property?.elevator || false,
    parking: property?.parking || '',
    furnished: property?.furnished || false,
    usage_status: property?.usage_status || '',
    
    // Site Bilgileri
    in_site: property?.in_site || false,
    site_name: property?.site_name || '',
    dues: property?.dues || 0,
    
    // Tapu ve Kredi
    suitable_for_credit: property?.suitable_for_credit || false,
    deed_status: property?.deed_status || '',
    exchange: property?.exchange || false,
    
    // Konum
    city: property?.city || '',
    district: property?.district || '',
    neighborhood: property?.neighborhood || '',
    address: property?.address || '',
    
    // Müşteri Bilgileri (İzole)
    customer_name: property?.customer_name || '',
    customer_phone: property?.customer_phone || '',
    customer_email: property?.customer_email || '',
    customer_notes: property?.customer_notes || '',
    
    // Açıklama
    description: property?.description || '',
    status: property?.status || 'active',
  });
  
  const [images, setImages] = useState<string[]>(property?.images || property?.image_urls || []);

  // Update form when property changes
  useEffect(() => {
    if (property) {
      console.log('🔄 Updating form with property:', property);
      setForm({
        title: property.title || '',
        listing_type: property.listing_type || 'for_sale',
        price: property.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
        property_type: property.property_type || 'apartment',
        area: property.area || property.area_gross || 0,
        rooms: normalizeRooms(property.rooms),
        building_age: property.building_age || 0,
        floor: property.floor || 0,
        total_floors: property.total_floors || 0,
        heating: property.heating || '',
        bathrooms: property.bathrooms || 1,
        kitchen_type: property.kitchen_type || '',
        balcony: property.balcony || false,
        elevator: property.elevator || false,
        parking: property.parking || '',
        furnished: property.furnished || false,
        usage_status: property.usage_status || '',
        in_site: property.in_site || false,
        site_name: property.site_name || '',
        dues: property.dues || 0,
        suitable_for_credit: property.suitable_for_credit || false,
        deed_status: property.deed_status || '',
        exchange: property.exchange || false,
        city: property.city || '',
        district: property.district || '',
        neighborhood: property.neighborhood || '',
        address: property.address || '',
        customer_name: property.customer_name || '',
        customer_phone: property.customer_phone || '',
        customer_email: property.customer_email || '',
        customer_notes: property.customer_notes || '',
        description: property.description || '',
        status: property.status || 'active',
      });
      setImages(property.images || property.image_urls || []);
      console.log('✅ Form updated');
    }
  }, [property]);

  useEffect(() => {
    onChange?.({ ...form, images });
  }, [form, images]);

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

    const dataToSave = {
      ...form,
      images: images,
    };
    
    console.log('💾 Saving property with data:', dataToSave);
    saveMutation.mutate(dataToSave);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Temel Bilgiler */}
        <Box>
          <HStack mb={4}>
            <Icon as={Home} color="blue.500" />
            <Heading size="md" color={labelColor}>Temel Bilgiler</Heading>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">İlan Başlığı</FormLabel>
              <Input 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Örn: Merkez Mahallesi 3+1 Daire"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">İlan Tipi</FormLabel>
              <Select 
                value={form.listing_type} 
                onChange={(e) => setForm({...form, listing_type: e.target.value})}
                bg={inputBg}
              >
                <option value="for_sale">Satılık</option>
                <option value="for_rent">Kiralık</option>
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">Fiyat</FormLabel>
              <InputGroup>
                <NumberInput 
                  value={form.price} 
                  onChange={(val) => setForm({...form, price: Number(val)})}
                  min={0}
                  w="100%"
                >
                  <NumberInputField bg={inputBg} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <InputRightAddon>TL</InputRightAddon>
              </InputGroup>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">Emlak Türü</FormLabel>
              <Select 
                value={form.property_type} 
                onChange={(e) => setForm({...form, property_type: e.target.value})}
                bg={inputBg}
              >
                <option value="apartment">Daire</option>
                <option value="villa">Villa</option>
                <option value="house">Müstakil Ev</option>
                <option value="office">Ofis</option>
                <option value="land">Arsa</option>
                <option value="commercial">Ticari</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Alan ve Oda Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Alan ve Oda Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Alan (m²)</FormLabel>
              <NumberInput 
                value={form.area} 
                onChange={(val) => setForm({...form, area: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">Oda Sayısı</FormLabel>
              <Select 
                value={form.rooms} 
                onChange={(e) => setForm({...form, rooms: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="1+0">1+0</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="5+1">5+1</option>
                <option value="6+">6+</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Bina Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Bina Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Bina Yaşı</FormLabel>
              <Input
                type="text"
                value={form.building_age}
                onChange={(e) => setForm({...form, building_age: e.target.value})}
                placeholder="Örn: 0 (Oturuma Hazır), 5, 10"
                bg={inputBg}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Bulunduğu Kat</FormLabel>
              <NumberInput 
                value={form.floor} 
                onChange={(val) => setForm({...form, floor: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Kat Sayısı</FormLabel>
              <NumberInput 
                value={form.total_floors} 
                onChange={(val) => setForm({...form, total_floors: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Özellikler */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Özellikler</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Isıtma</FormLabel>
              <Select 
                value={form.heating} 
                onChange={(e) => setForm({...form, heating: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Kombi (Doğalgaz)">Kombi (Doğalgaz)</option>
                <option value="Merkezi Sistem">Merkezi Sistem</option>
                <option value="Yerden Isıtma">Yerden Isıtma</option>
                <option value="Klima">Klima</option>
                <option value="Soba">Soba</option>
                <option value="Yok">Yok</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Banyo Sayısı</FormLabel>
              <NumberInput 
                value={form.bathrooms} 
                onChange={(val) => setForm({...form, bathrooms: Number(val)})}
                min={1}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Mutfak</FormLabel>
              <Select 
                value={form.kitchen_type} 
                onChange={(e) => setForm({...form, kitchen_type: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Açık (Amerikan)">Açık (Amerikan)</option>
                <option value="Kapalı">Kapalı</option>
                <option value="Ankastre">Ankastre</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Otopark</FormLabel>
              <Select 
                value={form.parking} 
                onChange={(e) => setForm({...form, parking: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Yok">Yok</option>
                <option value="Açık Otopark">Açık Otopark</option>
                <option value="Kapalı Otopark">Kapalı Otopark</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Kullanım Durumu</FormLabel>
              <Select 
                value={form.usage_status} 
                onChange={(e) => setForm({...form, usage_status: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Boş">Boş</option>
                <option value="Dolu">Dolu</option>
                <option value="Kiracılı">Kiracılı</option>
                <option value="Mülk Sahibi">Mülk Sahibi</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="balcony" mb="0" fontSize="sm">
                Balkon
              </FormLabel>
              <Switch 
                id="balcony"
                isChecked={form.balcony}
                onChange={(e) => setForm({...form, balcony: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="elevator" mb="0" fontSize="sm">
                Asansör
              </FormLabel>
              <Switch 
                id="elevator"
                isChecked={form.elevator}
                onChange={(e) => setForm({...form, elevator: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="furnished" mb="0" fontSize="sm">
                Eşyalı
              </FormLabel>
              <Switch 
                id="furnished"
                isChecked={form.furnished}
                onChange={(e) => setForm({...form, furnished: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="exchange" mb="0" fontSize="sm">
                Takas
              </FormLabel>
              <Switch 
                id="exchange"
                isChecked={form.exchange}
                onChange={(e) => setForm({...form, exchange: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Site Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Site Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="in_site" mb="0" fontSize="sm">
                Site İçerisinde
              </FormLabel>
              <Switch 
                id="in_site"
                isChecked={form.in_site}
                onChange={(e) => setForm({...form, in_site: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            {form.in_site && (
              <FormControl>
                <FormLabel fontSize="sm">Site Adı</FormLabel>
                <Input 
                  value={form.site_name} 
                  onChange={(e) => setForm({...form, site_name: e.target.value})}
                  placeholder="Site adı"
                  bg={inputBg}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Aidat (TL)</FormLabel>
              <NumberInput 
                value={form.dues} 
                onChange={(val) => setForm({...form, dues: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Tapu ve Kredi */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Tapu ve Kredi</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Tapu Durumu</FormLabel>
              <Select 
                value={form.deed_status} 
                onChange={(e) => setForm({...form, deed_status: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="clear">Temiz (Kat Mülkiyetli)</option>
                <option value="mortgage">İpotekli</option>
                <option value="disputed">İhtilaf Var</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="suitable_for_credit" mb="0" fontSize="sm">
                Krediye Uygun
              </FormLabel>
              <Switch 
                id="suitable_for_credit"
                isChecked={form.suitable_for_credit}
                onChange={(e) => setForm({...form, suitable_for_credit: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Konum */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Konum Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">İl</FormLabel>
              <Input 
                value={form.city} 
                onChange={(e) => setForm({...form, city: e.target.value})} 
                placeholder="İl"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">İlçe</FormLabel>
              <Input 
                value={form.district} 
                onChange={(e) => setForm({...form, district: e.target.value})} 
                placeholder="İlçe"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Mahalle</FormLabel>
              <Input 
                value={form.neighborhood} 
                onChange={(e) => setForm({...form, neighborhood: e.target.value})} 
                placeholder="Mahalle"
                bg={inputBg}
              />
            </FormControl>
          </SimpleGrid>

          <FormControl mt={4} isRequired>
            <FormLabel fontSize="sm">Adres</FormLabel>
            <Textarea 
              value={form.address} 
              onChange={(e) => setForm({...form, address: e.target.value})} 
              placeholder="Tam adres"
              rows={2}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Açıklama */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Açıklama</Heading>
          <FormControl>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Gayrimenkul hakkında detaylı açıklama"
              rows={6}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Müşteri Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={2}>Müşteri İletişim Bilgileri</Heading>
          <Text fontSize="sm" color="orange.500" mb={4}>
            ⚠️ Bu bilgiler sadece sizin tarafınızdan görülebilir. Ofis içinde bile paylaşılmaz.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Müşteri Adı Soyadı</FormLabel>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({...form, customer_name: e.target.value})}
                placeholder="Örn: Ahmet Yılmaz"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Telefon</FormLabel>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({...form, customer_phone: e.target.value})}
                placeholder="Örn: 0532 123 45 67"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">E-posta</FormLabel>
              <Input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({...form, customer_email: e.target.value})}
                placeholder="Örn: ahmet@example.com"
                bg={inputBg}
              />
            </FormControl>
          </SimpleGrid>
          
          <FormControl mt={4}>
            <FormLabel fontSize="sm">Müşteri Notları</FormLabel>
            <Textarea
              value={form.customer_notes}
              onChange={(e) => setForm({...form, customer_notes: e.target.value})}
              placeholder="Müşteri hakkında özel notlar (sadece siz görebilirsiniz)"
              rows={3}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Fotoğraflar */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Fotoğraflar</Heading>
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
        </Box>

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
            size="lg"
          >
            {property?.id ? 'Güncelle' : 'Kaydet'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PropertyForm;
