import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Image, Text, Badge, VStack, HStack, SimpleGrid, Divider,
  Heading, Icon, Flex, Button, useColorModeValue, Wrap, WrapItem
} from '@chakra-ui/react';
import { 
  MapPin, Home, Calendar, FileText, DollarSign, Square, 
  Shield, Zap, Thermometer, Users, Truck,
  Wifi, Coffee, ShoppingCart, Navigation, Book
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
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!property) return null;

  const propertyImages = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  ];
  
  const formattedPrice = property.price ? `${property.price.toLocaleString()} TL` : 'Fiyat belirtilmemiş';
  const propertyType = property.status === 'for_sale' ? 'Satılık' : property.status === 'for_rent' ? 'Kiralık' : 'Bilinmiyor';
  const propertyStatus = property.status === 'inactive' ? 'Pasif' : 'Aktif';

  return (
    <VStack spacing={8} align="stretch" bg={bgColor} borderRadius="2xl" p={8} boxShadow="xl" border="1px" borderColor={borderColor}>
      {/* Header */}
      <Box bg={useColorModeValue('blue.50', 'gray.700')} p={6} borderRadius="xl" boxShadow="md">
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading size="xl" bgGradient="linear(to-r, blue.600, purple.600)" bgClip="text" fontWeight="bold">
              {property.title}
            </Heading>
            <HStack spacing={2}>
              <Icon as={MapPin} color="gray.500" size={18} />
              <Text color={textColor} fontSize="lg" fontWeight="medium">
                {property.address}
              </Text>
            </HStack>
          </VStack>
          <VStack align="end" spacing={2}>
            <Badge 
              colorScheme={property.status === 'active' ? 'green' : 'red'} 
              variant="solid" 
              fontSize="md" 
              px={4} 
              py={2} 
              borderRadius="full"
              fontWeight="bold"
            >
              {propertyStatus}
            </Badge>
            <Badge 
              colorScheme="blue" 
              variant="outline" 
              fontSize="sm" 
              px={3} 
              py={1} 
              borderRadius="full"
            >
              {propertyType}
            </Badge>
          </VStack>
        </Flex>
      </Box>

      {/* Fotoğraf Galerisi */}
      <Box>
        <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')} fontWeight="bold">
          Fotoğraf Galerisi
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
          {propertyImages.map((image, index) => (
            <Box key={index} position="relative" overflow="hidden" borderRadius="xl">
              <Image
                src={image}
                alt={`Property ${index + 1}`}
                w="100%"
                h="250px"
                objectFit="cover"
                borderRadius="xl"
                boxShadow="lg"
                transition="all 0.3s ease"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "xl"
                }}
              />
              <Box
                position="absolute"
                bottom={2}
                right={2}
                bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
                color="white"
                px={2}
                py={1}
                borderRadius="md"
                fontSize="sm"
                fontWeight="bold"
              >
                {index + 1}/{propertyImages.length}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Fiyat Bilgisi */}
      <Box 
        bg={useColorModeValue('green.50', 'green.900')} 
        p={6} 
        borderRadius="xl" 
        border="2px" 
        borderColor={useColorModeValue('green.200', 'green.600')}
        boxShadow="lg"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          w="100px"
          h="100px"
          bg={useColorModeValue('green.100', 'green.800')}
          borderRadius="full"
          opacity={0.3}
        />
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <Icon as={DollarSign} color="green.600" size={32} />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="green.600" fontWeight="medium">
                Fiyat
              </Text>
              <Heading size="xl" color="green.700" fontWeight="bold">
                {formattedPrice}
              </Heading>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* Oda ve Banyo Bilgileri */}
      <Box>
        <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
          Oda ve Banyo Bilgileri
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="blue.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Oda Sayısı</Text>
              <Text fontWeight="bold">{property.rooms}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="purple.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Oda Dağılımı</Text>
              <Text fontWeight="bold">{property.roomDistribution || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="teal.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Banyo</Text>
              <Text fontWeight="bold">{property.bathrooms || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Square} color="orange.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Alan</Text>
              <Text fontWeight="bold">{property.area} m²</Text>
            </VStack>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Yapı Bilgileri */}
      <Box>
        <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
          Yapı Bilgileri
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="blue.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Kat</Text>
              <Text fontWeight="bold">{property.floor || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="purple.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Bina Yaşı</Text>
              <Text fontWeight="bold">{property.buildingAge || 'Belirtilmemiş'} yıl</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="teal.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Cephe</Text>
              <Text fontWeight="bold">{property.facade || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="orange.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Site İçerisinde</Text>
              <Badge colorScheme={property.inComplex ? 'green' : 'red'}>
                {property.inComplex ? 'Evet' : 'Hayır'}
              </Badge>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Calendar} color="red.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Yapım Yılı</Text>
              <Text fontWeight="bold">{new Date().getFullYear() - (property.buildingAge || 0)}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="cyan.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Yapı Türü</Text>
              <Text fontWeight="bold">{property.propertyType || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={FileText} color="pink.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Tapu Durumu</Text>
              <Text fontWeight="bold">{property.deedStatus || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={DollarSign} color="green.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Aylık Aidat</Text>
              <Text fontWeight="bold">{property.monthlyFee ? `${property.monthlyFee} TL` : 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Home} color="indigo.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Kullanım Durumu</Text>
              <Text fontWeight="bold">{property.usageStatus || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Calendar} color="blue.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Eklenme Tarihi</Text>
              <Text fontWeight="bold">
                {property.createdAt ? new Date(property.createdAt).toLocaleDateString('tr-TR') : '01.01.2024'}
              </Text>
            </VStack>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Sistem ve Güvenlik */}
      <Box>
        <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
          Sistem ve Güvenlik
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Zap} color="yellow.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Isıtma</Text>
              <Text fontWeight="bold">{property.heating || 'Belirtilmemiş'}</Text>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Shield} color="red.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Güvenlik Kamerası</Text>
              <Badge colorScheme="green">Mevcut</Badge>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Shield} color="orange.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Alarm Sistemi</Text>
              <Badge colorScheme="green">Mevcut</Badge>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Users} color="blue.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Kapıcı</Text>
              <Badge colorScheme="green">Mevcut</Badge>
            </VStack>
          </Flex>
          
          <Flex align="center" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
            <Icon as={Shield} color="purple.500" mr={3} />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" color={textColor}>Güvenlik</Text>
              <Badge colorScheme="green">7/24</Badge>
            </VStack>
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Özellikler */}
      <Box>
        <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
          Özellikler
        </Heading>
        <Wrap spacing={4}>
          {property.furnished && (
            <WrapItem>
              <Flex align="center" p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
                <Icon as={Home} color="blue.500" mr={2} />
                <Text fontWeight="medium">Eşyalı</Text>
              </Flex>
            </WrapItem>
          )}
          {property.balcony && (
            <WrapItem>
              <Flex align="center" p={3} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
                <Icon as={Home} color="green.500" mr={2} />
                <Text fontWeight="medium">Balkon</Text>
              </Flex>
            </WrapItem>
          )}
          {property.parking && (
            <WrapItem>
              <Flex align="center" p={3} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
                <Icon as={Truck} color="purple.500" mr={2} />
                <Text fontWeight="medium">Otopark</Text>
              </Flex>
            </WrapItem>
          )}
          {property.elevator && (
            <WrapItem>
              <Flex align="center" p={3} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
                <Icon as={Navigation} color="orange.500" mr={2} />
                <Text fontWeight="medium">Asansör</Text>
              </Flex>
            </WrapItem>
          )}
          {property.garden && (
            <WrapItem>
              <Flex align="center" p={3} bg={useColorModeValue('teal.50', 'teal.900')} borderRadius="lg">
                <Icon as={Home} color="teal.500" mr={2} />
                <Text fontWeight="medium">Bahçe</Text>
              </Flex>
            </WrapItem>
          )}
        </Wrap>
      </Box>

      {/* Açıklama */}
      {property.description && (
        <Box>
          <Heading size="lg" mb={4} color={useColorModeValue('gray.700', 'gray.200')}>
            Açıklama
          </Heading>
          <Text color={textColor} lineHeight="tall">
            {property.description}
          </Text>
        </Box>
      )}

      {/* Action Buttons */}
      <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="xl" boxShadow="md">
        <Flex gap={4} justify="center">
          <Button
            bgGradient="linear(to-r, blue.500, blue.600)"
            color="white"
            size="lg"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="semibold"
            _hover={{
              bgGradient: "linear(to-r, blue.600, blue.700)",
              transform: "translateY(-2px)",
              boxShadow: "lg"
            }}
            transition="all 0.3s ease"
          >
            İletişime Geç
          </Button>
          <Button
            variant="outline"
            size="lg"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="semibold"
            borderWidth="2px"
            borderColor="blue.500"
            color="blue.500"
            _hover={{
              bg: "blue.50",
              transform: "translateY(-2px)",
              boxShadow: "lg"
            }}
            transition="all 0.3s ease"
          >
            Favorilere Ekle
          </Button>
        </Flex>
      </Box>
    </VStack>
  );
};

export default PropertyDetail;