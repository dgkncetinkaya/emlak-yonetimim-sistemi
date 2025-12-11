import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Image, Text, Badge, VStack, HStack, SimpleGrid, Container,
  Heading, Icon, Flex, IconButton, useColorModeValue, Button,
  Divider, Skeleton, Alert, AlertIcon, Grid, GridItem, AspectRatio,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  Tabs, TabList, TabPanels, Tab, TabPanel, Card, CardBody, Avatar
} from '@chakra-ui/react';
import { 
  Home, Calendar, DollarSign, Square, MapPin, 
  Zap, Phone, Mail, User, ChevronLeft, ChevronRight,
  ArrowLeft, Edit, Trash2, Share2, Heart
} from 'react-feather';
import { propertiesService } from '../../../services/propertiesService';
import { useAuth } from '../../../context/AuthContext';

// Tapu durumu çevirisi
const getDeedStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'clear': 'Temiz (Kat Mülkiyetli)',
    'mortgage': 'İpotekli',
    'disputed': 'İhtilaf Var'
  };
  return labels[status] || status;
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesService.getProperty(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="400px" borderRadius="xl" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Skeleton height="200px" borderRadius="lg" />
            <Skeleton height="200px" borderRadius="lg" />
            <Skeleton height="200px" borderRadius="lg" />
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          İlan bulunamadı veya yüklenirken bir hata oluştu.
        </Alert>
      </Container>
    );
  }

  const images = property.images || property.image_urls || [];
  const isOwner = user?.id === property.created_by;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY', 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'sold': return 'red';
      case 'rented': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'sold': return 'Satıldı';
      case 'rented': return 'Kiralandı';
      case 'inactive': return 'Pasif';
      default: return status;
    }
  };

  const getListingTypeText = (type: string) => {
    return type === 'for_sale' ? 'Satılık' : 'Kiralık';
  };

  const getPropertyTypeText = (type: string) => {
    const types: Record<string, string> = {
      'apartment': 'Daire',
      'villa': 'Villa',
      'house': 'Ev',
      'office': 'Ofis',
      'land': 'Arsa',
      'commercial': 'Ticari'
    };
    return types[type] || type;
  };

  return (
    <Box bg={bgColor} minH="100vh" pb={8}>
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} align="stretch">
          
          {/* Header with Back Button */}
          <HStack justify="space-between">
            <Button
              leftIcon={<ArrowLeft size={18} />}
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Geri Dön
            </Button>
            
            <HStack spacing={2}>
              <IconButton
                aria-label="Favorilere ekle"
                icon={<Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />}
                variant="ghost"
                colorScheme={isFavorite ? 'red' : 'gray'}
                onClick={() => setIsFavorite(!isFavorite)}
              />
              <IconButton
                aria-label="Paylaş"
                icon={<Share2 size={20} />}
                variant="ghost"
              />
              {isOwner && (
                <>
                  <IconButton
                    aria-label="Düzenle"
                    icon={<Edit size={20} />}
                    variant="ghost"
                    colorScheme="blue"
                  />
                  <IconButton
                    aria-label="Sil"
                    icon={<Trash2 size={20} />}
                    variant="ghost"
                    colorScheme="red"
                  />
                </>
              )}
            </HStack>
          </HStack>

          {/* Main Image Gallery */}
          <Card overflow="hidden" bg={cardBg}>
            <AspectRatio ratio={16 / 9} maxH="500px">
              <Image
                src={images[currentImageIndex] || '/placeholder-property.jpg'}
                alt={property.title}
                objectFit="cover"
                cursor="pointer"
                onClick={() => setIsGalleryOpen(true)}
                _hover={{ opacity: 0.9 }}
                transition="opacity 0.2s"
              />
            </AspectRatio>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <HStack p={4} spacing={2} overflowX="auto">
                {images.slice(0, 6).map((img: string, idx: number) => (
                  <Image
                    key={idx}
                    src={img}
                    alt={`${property.title} - ${idx + 1}`}
                    w="80px"
                    h="60px"
                    objectFit="cover"
                    borderRadius="md"
                    cursor="pointer"
                    border="2px"
                    borderColor={idx === currentImageIndex ? accentColor : 'transparent'}
                    onClick={() => setCurrentImageIndex(idx)}
                    _hover={{ opacity: 0.8 }}
                  />
                ))}
              </HStack>
            )}
          </Card>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            
            {/* Left Column - Main Info */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                
                {/* Title and Price */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={2} flex={1}>
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme={getStatusColor(property.status)} fontSize="sm">
                              {getStatusText(property.status)}
                            </Badge>
                            <Badge colorScheme="purple" fontSize="sm">
                              {getListingTypeText(property.listing_type)}
                            </Badge>
                            <Badge colorScheme="blue" fontSize="sm">
                              {getPropertyTypeText(property.property_type)}
                            </Badge>
                          </HStack>
                          
                          <Heading size="lg" color={headingColor}>
                            {property.title}
                          </Heading>
                          
                          <HStack color={textColor}>
                            <Icon as={MapPin} size={16} />
                            <Text fontSize="md">
                              {property.neighborhood && `${property.neighborhood}, `}
                              {property.district}, {property.city}
                            </Text>
                          </HStack>
                        </VStack>
                        
                        <VStack align="end" spacing={1}>
                          <Text fontSize="3xl" fontWeight="bold" color="green.500">
                            {formatPrice(property.price)}
                          </Text>
                          <Text fontSize="sm" color={textColor}>
                            {property.listing_type === 'for_rent' && 'Aylık'}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Key Features */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Heading size="md" mb={4} color={headingColor}>
                      Özellikler
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      <VStack align="center" p={3} bg={bgColor} borderRadius="lg">
                        <Icon as={Square} color={accentColor} size={24} />
                        <Text fontSize="sm" color={textColor}>Alan</Text>
                        <Text fontWeight="bold">{property.area} m²</Text>
                      </VStack>
                      
                      <VStack align="center" p={3} bg={bgColor} borderRadius="lg">
                        <Icon as={Home} color={accentColor} size={24} />
                        <Text fontSize="sm" color={textColor}>Oda Sayısı</Text>
                        <Text fontWeight="bold">{property.rooms}</Text>
                      </VStack>
                      
                      {property.floor !== undefined && (
                        <VStack align="center" p={3} bg={bgColor} borderRadius="lg">
                          <Icon as={Home} color={accentColor} size={24} />
                          <Text fontSize="sm" color={textColor}>Kat</Text>
                          <Text fontWeight="bold">{property.floor}</Text>
                        </VStack>
                      )}
                      
                      {property.building_age !== undefined && (
                        <VStack align="center" p={3} bg={bgColor} borderRadius="lg">
                          <Icon as={Calendar} color={accentColor} size={24} />
                          <Text fontSize="sm" color={textColor}>Bina Yaşı</Text>
                          <Text fontWeight="bold">{property.building_age} yıl</Text>
                        </VStack>
                      )}
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Description */}
                {property.description && (
                  <Card bg={cardBg}>
                    <CardBody>
                      <Heading size="md" mb={4} color={headingColor}>
                        Açıklama
                      </Heading>
                      <Text color={textColor} whiteSpace="pre-wrap">
                        {property.description}
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* Detailed Info Tabs */}
                <Card bg={cardBg}>
                  <CardBody>
                    <Tabs colorScheme="blue">
                      <TabList>
                        <Tab>Detaylar</Tab>
                        <Tab>Konum</Tab>
                      </TabList>

                      <TabPanels>
                        <TabPanel px={0}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {property.heating && (
                              <HStack>
                                <Icon as={Zap} color={textColor} />
                                <Text color={textColor}>Isıtma:</Text>
                                <Text fontWeight="medium">{property.heating}</Text>
                              </HStack>
                            )}
                            
                            {property.furnished !== undefined && (
                              <HStack>
                                <Icon as={Home} color={textColor} />
                                <Text color={textColor}>Eşyalı:</Text>
                                <Badge colorScheme={property.furnished ? 'green' : 'red'}>
                                  {property.furnished ? 'Evet' : 'Hayır'}
                                </Badge>
                              </HStack>
                            )}
                            
                            {property.deed_status && (
                              <HStack>
                                <Text color={textColor}>Tapu Durumu:</Text>
                                <Text fontWeight="medium">{getDeedStatusLabel(property.deed_status)}</Text>
                              </HStack>
                            )}
                          </SimpleGrid>
                        </TabPanel>

                        <TabPanel px={0}>
                          <VStack align="stretch" spacing={3}>
                            <Text color={textColor}>
                              <strong>Adres:</strong> {property.address}
                            </Text>
                            {property.latitude && property.longitude && (
                              <Box h="300px" bg={bgColor} borderRadius="lg">
                                {/* Harita buraya eklenebilir */}
                                <Flex h="full" align="center" justify="center" color={textColor}>
                                  <Text>Harita görünümü</Text>
                                </Flex>
                              </Box>
                            )}
                          </VStack>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </CardBody>
                </Card>

              </VStack>
            </GridItem>

            {/* Right Column - Contact & Agent Info */}
            <GridItem>
              <VStack spacing={6} align="stretch" position="sticky" top="20px">
                
                {/* Agent/Owner Info */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="md" color={headingColor}>
                        İlan Sahibi
                      </Heading>
                      
                      <HStack>
                        <Avatar 
                          name={property.created_by_profile?.full_name || 'Kullanıcı'} 
                          size="md"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold">
                            {property.created_by_profile?.full_name || 'Bilinmiyor'}
                          </Text>
                          <Text fontSize="sm" color={textColor}>
                            Emlak Danışmanı
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider />

                      {/* Customer Contact Info (Only visible to owner) */}
                      {isOwner && (property.customer_name || property.customer_phone || property.customer_email) && (
                        <>
                          <Box p={3} bg="orange.50" borderRadius="lg" borderWidth="1px" borderColor="orange.200">
                            <Text fontSize="sm" color="orange.700" fontWeight="medium" mb={2}>
                              🔒 Müşteri Bilgileri (Sadece Siz Görebilirsiniz)
                            </Text>
                            <VStack align="stretch" spacing={2}>
                              {property.customer_name && (
                                <HStack>
                                  <Icon as={User} size={16} color="orange.600" />
                                  <Text fontSize="sm">{property.customer_name}</Text>
                                </HStack>
                              )}
                              {property.customer_phone && (
                                <HStack>
                                  <Icon as={Phone} size={16} color="orange.600" />
                                  <Text fontSize="sm">{property.customer_phone}</Text>
                                </HStack>
                              )}
                              {property.customer_email && (
                                <HStack>
                                  <Icon as={Mail} size={16} color="orange.600" />
                                  <Text fontSize="sm">{property.customer_email}</Text>
                                </HStack>
                              )}
                              {property.customer_notes && (
                                <Box mt={2}>
                                  <Text fontSize="xs" color="orange.600" fontWeight="medium">Notlar:</Text>
                                  <Text fontSize="sm" color={textColor}>{property.customer_notes}</Text>
                                </Box>
                              )}
                            </VStack>
                          </Box>
                          <Divider />
                        </>
                      )}

                      <VStack spacing={2}>
                        <Button
                          leftIcon={<Phone size={18} />}
                          colorScheme="green"
                          size="lg"
                          w="full"
                        >
                          Ara
                        </Button>
                        <Button
                          leftIcon={<Mail size={18} />}
                          colorScheme="blue"
                          variant="outline"
                          size="lg"
                          w="full"
                        >
                          Mesaj Gönder
                        </Button>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Property Stats */}
                <Card bg={cardBg}>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm" color={headingColor}>
                        İlan Bilgileri
                      </Heading>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>İlan No:</Text>
                        <Text fontSize="sm" fontWeight="medium">{property.id.slice(0, 8)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>Yayın Tarihi:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date(property.created_at).toLocaleDateString('tr-TR')}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>Güncellenme:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date(property.updated_at).toLocaleDateString('tr-TR')}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

              </VStack>
            </GridItem>

          </Grid>

        </VStack>
      </Container>

      {/* Full Screen Gallery Modal */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} size="full">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" zIndex={10} />
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={0}>
            <HStack spacing={4} w="full" h="100vh" align="center" justify="center">
              <IconButton
                aria-label="Önceki"
                icon={<ChevronLeft size={32} />}
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                colorScheme="whiteAlpha"
                size="lg"
                isRound
                bg="blackAlpha.600"
                _hover={{ bg: 'blackAlpha.800' }}
              />

              <Box flex="1" display="flex" justifyContent="center" alignItems="center" maxH="90vh">
                <Image
                  src={images[currentImageIndex]}
                  alt={`${property.title} - ${currentImageIndex + 1}`}
                  maxH="90vh"
                  maxW="90vw"
                  objectFit="contain"
                />
              </Box>

              <IconButton
                aria-label="Sonraki"
                icon={<ChevronRight size={32} />}
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                colorScheme="whiteAlpha"
                size="lg"
                isRound
                bg="blackAlpha.600"
                _hover={{ bg: 'blackAlpha.800' }}
              />
            </HStack>

            <Box
              position="absolute"
              bottom={8}
              left="50%"
              transform="translateX(-50%)"
              bg="blackAlpha.700"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
            >
              {currentImageIndex + 1} / {images.length}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default PropertyDetail;
