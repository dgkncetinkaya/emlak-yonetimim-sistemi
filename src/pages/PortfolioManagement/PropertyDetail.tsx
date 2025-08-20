import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Box, Image, Text, Badge, VStack, HStack, SimpleGrid,
  Heading, Icon, Flex, IconButton, useColorModeValue,
} from '@chakra-ui/react';
import { 
  MapPin, Home, Calendar, FileText, DollarSign, Square, 
  Shield, Zap, Users, Camera, ChevronLeft, ChevronRight
} from 'react-feather';

interface PropertyDetailProps {
  property: {
    id: number;
    title: string;
    price: number;
    address: string;
    status: string;
    area: number;
    rooms: string;
    images?: string[];
    description?: string;
    propertyType?: string;
    deedStatus?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    bathrooms?: number;
    floor?: number;
    totalFloors?: number;
    heating?: string;
    furnished?: boolean;
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    garden?: boolean;
    createdAt?: string;
    buildingAge?: number;
    usageStatus?: string;
    facade?: string;
    inComplex?: boolean;
    monthlyFee?: number;
    earthquakeSafety?: string;
    energyCertificate?: string;
    thermalInsulation?: boolean;
    nearbyFacilities?: string[];
    transportation?: string[];
    highlights?: string[];
    roomDistribution?: string;
  } | null;
}

const PropertyDetail = ({ property }: PropertyDetailProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const galleryHeadingColor = useColorModeValue('gray.700', 'gray.200');
  const greenBg = useColorModeValue('green.50', 'green.900');
  const greenBorder = useColorModeValue('green.200', 'green.600');
  const blueBg = useColorModeValue('blue.50', 'blue.900');
  const blueBorder = useColorModeValue('blue.200', 'blue.600');
  const grayBg = useColorModeValue('gray.50', 'gray.700');

  if (!property) return null;
  
  const formattedPrice = property.price ? `${property.price.toLocaleString()} TL` : 'Fiyat belirtilmemiş';
// Removed unused propertyType variable
  const propertyStatus = property.status === 'inactive' ? 'Pasif' : 'Aktif';

  return (
    <Box p={1} bg={bgColor} borderRadius="lg" boxShadow="sm" maxW="100%" overflow="hidden">
      {/* Header */}
      <Box mb={4}>
        <HStack justify="space-between" align="start" mb={2}>
          <VStack align="start" spacing={1}>
            <Heading size="md" color={headingColor}>
              {property.title}
            </Heading>
            <HStack>
              <Icon as={MapPin} color="gray.500" size="sm" />
              <Text color={textColor} fontSize="sm">{property.address}</Text>
            </HStack>
          </VStack>
          <Badge 
            colorScheme={property.status === 'active' ? 'green' : 'red'}
            fontSize="sm"
            px={3}
            py={1}
          >
            {propertyStatus}
          </Badge>
        </HStack>
      </Box>

      {/* Ana İçerik - Yatay Layout */}
      <HStack align="start" spacing={4}>
        {/* Sol Taraf - Fotoğraf Galerisi */}
        <Box w="320px" flexShrink={0} h="fit-content">
          <Heading size="sm" mb={2} color={galleryHeadingColor}>
            Fotoğraf Galerisi
          </Heading>
          <SimpleGrid columns={2} spacing={2} h="fit-content">
            {Array.from({ length: 6 }, (_, index) => {
              // Gerçek fotoğraf URL'leri
              const sampleImages = [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
              ];
              const image = property.images?.[index] || sampleImages[index];
              return (
                <Box 
                  key={index} 
                  position="relative" 
                  cursor="pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setIsGalleryOpen(true);
                  }}
                >
                  <Image
                    src={image}
                    alt={`${property.title} - ${index + 1}`}
                    w="full"
                    h="75px"
                    objectFit="cover"
                    borderRadius="md"
                    boxShadow="sm"
                    _hover={{ transform: 'scale(1.02)', transition: 'all 0.2s', opacity: 0.8 }}
                    fallbackSrc={sampleImages[index]}
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Sağ Taraf - Detay Bilgileri */}
        <VStack flex="1" align="stretch" spacing={3} maxW="650px">

          {/* Temel Bilgiler */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
            {/* Fiyat Bilgisi */}
            <Box 
              bg={greenBg} 
              p={2} 
              borderRadius="md" 
              border="1px" 
              borderColor={greenBorder}
            >
              <Flex align="center">
                <Icon as={DollarSign} color="green.600" size={14} mr={2} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="green.600" fontWeight="medium">
                    Fiyat
                  </Text>
                  <Text fontSize="sm" color="green.700" fontWeight="bold">
                    {formattedPrice}
                  </Text>
                </VStack>
              </Flex>
            </Box>

            {/* Alan Bilgisi */}
            <Box 
              bg={blueBg} 
              p={2} 
              borderRadius="md" 
              border="1px" 
              borderColor={blueBorder}
            >
              <Flex align="center">
                <Icon as={Square} color="blue.600" size={14} mr={2} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="blue.600" fontWeight="medium">
                    Alan
                  </Text>
                  <Text fontSize="sm" color="blue.700" fontWeight="bold">
                    {property.area} m²
                  </Text>
                </VStack>
              </Flex>
            </Box>
          </SimpleGrid>

          {/* Oda ve Banyo Bilgileri */}
          <Box>
            <Heading size="xs" mb={2} color={galleryHeadingColor}>
              Oda ve Banyo Bilgileri
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                <Icon as={Home} color="blue.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Oda Sayısı</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.rooms}</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Home} color="teal.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Banyo</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.bathrooms || 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
            </SimpleGrid>
          </Box>

          {/* Yapı Bilgileri */}
          <Box>
            <Heading size="xs" mb={2} color={galleryHeadingColor}>
              Yapı Bilgileri
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={1}>
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Home} color="blue.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Kat</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.floor || 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Calendar} color="purple.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Bina Yaşı</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.buildingAge || 'Belirtilmemiş'} yıl</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Home} color="teal.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Cephe</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.facade || 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Home} color="orange.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Site İçerisinde</Text>
                  <Badge colorScheme={property.inComplex ? 'green' : 'red'} fontSize="xs">
                    {property.inComplex ? 'Evet' : 'Hayır'}
                  </Badge>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={FileText} color="pink.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Tapu Durumu</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.deedStatus || 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={DollarSign} color="green.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Aylık Aidat</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.monthlyFee ? `${property.monthlyFee} TL` : 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
            </SimpleGrid>
          </Box>

          {/* Sistem ve Güvenlik */}
          <Box>
            <Heading size="xs" mb={2} color={galleryHeadingColor}>
              Sistem ve Güvenlik
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={1}>
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Zap} color="yellow.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Isıtma</Text>
                  <Text fontWeight="bold" fontSize="sm">{property.heating || 'Belirtilmemiş'}</Text>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Camera} color="red.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Güvenlik Kamerası</Text>
                  <Badge colorScheme="green" fontSize="xs">Mevcut</Badge>
                </VStack>
              </Flex>
              
              <Flex align="center" p={1.5} bg={grayBg} borderRadius="md">
                <Icon as={Shield} color="orange.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Alarm Sistemi</Text>
                  <Badge colorScheme="green" fontSize="xs">Mevcut</Badge>
                </VStack>
              </Flex>
              
              <Flex align="center" p={1.5} bg={grayBg} borderRadius="md">
                <Icon as={Users} color="blue.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Kapıcı</Text>
                  <Badge colorScheme="green" fontSize="xs">Mevcut</Badge>
                </VStack>
              </Flex>
              
              <Flex align="center" p={2} bg={grayBg} borderRadius="md">
                 <Icon as={Shield} color="blue.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Güvenlik</Text>
                  <Badge colorScheme="green" fontSize="xs">7/24</Badge>
                </VStack>
              </Flex>
              
              <Flex align="center" p={1.5} bg={grayBg} borderRadius="md">
                <Icon as={Calendar} color="blue.500" mr={2} size={14} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={textColor}>Eklenme Tarihi</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    {property.createdAt ? new Date(property.createdAt).toLocaleDateString('tr-TR') : '01.01.2024'}
                  </Text>
                </VStack>
              </Flex>
            </SimpleGrid>
          </Box>
        </VStack>
      </HStack>

      {/* Modal Galeri */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} size="6xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" zIndex={10} />
          <ModalBody p={0} display="flex" alignItems="center" justifyContent="center" minH="80vh">
            <HStack spacing={4} w="full" align="center">
              {/* Sol Ok */}
              <IconButton
                aria-label="Önceki fotoğraf"
                icon={<ChevronLeft size={24} />}
                onClick={() => {
                  const sampleImages = [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
                  ];
                  setCurrentImageIndex((prev) => prev === 0 ? sampleImages.length - 1 : prev - 1);
                }}
                colorScheme="whiteAlpha"
                variant="solid"
                size="lg"
                isRound
                bg="blackAlpha.600"
                _hover={{ bg: 'blackAlpha.800' }}
              />

              {/* Ana Fotoğraf */}
              <Box flex="1" display="flex" justifyContent="center">
                <Image
                  src={(() => {
                    const sampleImages = [
                      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
                    ];
                    return property.images?.[currentImageIndex] || sampleImages[currentImageIndex];
                  })()}
                  alt={`${property.title} - ${currentImageIndex + 1}`}
                  maxH="70vh"
                  maxW="90%"
                  objectFit="contain"
                  borderRadius="lg"
                  boxShadow="2xl"
                />
              </Box>

              {/* Sağ Ok */}
              <IconButton
                aria-label="Sonraki fotoğraf"
                icon={<ChevronRight size={24} />}
                onClick={() => {
                  const sampleImages = [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
                  ];
                  setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
                }}
                colorScheme="whiteAlpha"
                variant="solid"
                size="lg"
                isRound
                bg="blackAlpha.600"
                _hover={{ bg: 'blackAlpha.800' }}
              />
            </HStack>

            {/* Fotoğraf Sayacı */}
            <Box
              position="absolute"
              bottom={4}
              left="50%"
              transform="translateX(-50%)"
              bg="blackAlpha.700"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {currentImageIndex + 1} / 6
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PropertyDetail;