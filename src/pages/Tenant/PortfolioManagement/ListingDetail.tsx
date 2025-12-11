import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box, Image, Text, Badge, VStack, HStack, SimpleGrid, Container, Grid, GridItem,
  Heading, Icon, Button, Skeleton, Alert, AlertIcon,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  useColorModeValue, IconButton, useDisclosure, ModalHeader, useToast, Wrap, WrapItem
} from '@chakra-ui/react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, MapPin, Home, Square,
  Calendar, DollarSign, Phone, Mail, User, Edit, Trash2
} from 'react-feather';
import { propertiesService } from '../../../services/propertiesService';
import { useAuth } from '../../../context/AuthContext';
import PropertyForm from './PropertyForm';
import PropertyMapSimple from '../../../components/PropertyMapSimple';

// Tapu durumu çevirisi
const getDeedStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'clear': 'Temiz (Kat Mülkiyetli)',
    'mortgage': 'İpotekli',
    'disputed': 'İhtilaf Var'
  };
  return labels[status] || status;
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesService.getProperty(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Container maxW="1400px" py={8}>
        <Skeleton height="60px" mb={6} />
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <Skeleton height="500px" />
          <Skeleton height="500px" />
        </Grid>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxW="1400px" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          İlan bulunamadı
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

  const InfoItem = ({ icon, label, value }: { icon: any; label: string; value: any }) => {
    if (!value && value !== 0 && value !== false) return null;
    return (
      <HStack spacing={3} py={3} borderBottomWidth="1px" borderColor={borderColor}>
        <Icon as={icon} size={18} color={labelColor} />
        <Text fontSize="sm" color={labelColor} minW="120px">{label}</Text>
        <Text fontSize="sm" fontWeight="medium" color={textColor}>{value}</Text>
      </HStack>
    );
  };

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="1400px">
        
        {/* Header */}
        <HStack justify="space-between" mb={6}>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            variant="ghost"
            onClick={() => navigate(-1)}
            size="sm"
          >
            Geri
          </Button>
          
          {isOwner && (
            <HStack spacing={2}>
              <Button
                leftIcon={<Edit size={16} />}
                colorScheme="blue"
                size="sm"
                onClick={onEditOpen}
              >
                Düzenle
              </Button>
              <IconButton
                aria-label="Sil"
                icon={<Trash2 size={16} />}
                colorScheme="red"
                variant="outline"
                size="sm"
              />
            </HStack>
          )}
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={6}>
          
          {/* Sol Kolon - Fotoğraflar ve Detaylar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              
              {/* Fotoğraf Galerisi - Kompakt */}
              {images.length > 0 && (
                <Box bg={cardBg} borderRadius="xl" overflow="hidden" boxShadow="sm">
                  <Image
                    src={images[currentImageIndex]}
                    alt={property.title}
                    w="full"
                    h="350px"
                    objectFit="cover"
                    cursor="pointer"
                    onClick={() => setIsGalleryOpen(true)}
                  />
                  {images.length > 1 && (
                    <HStack p={3} spacing={2} overflowX="auto" bg={cardBg}>
                      {images.slice(0, 6).map((img: string, idx: number) => (
                        <Image
                          key={idx}
                          src={img}
                          w="60px"
                          h="45px"
                          objectFit="cover"
                          borderRadius="md"
                          cursor="pointer"
                          border="2px"
                          borderColor={idx === currentImageIndex ? 'blue.500' : 'transparent'}
                          onClick={() => setCurrentImageIndex(idx)}
                          flexShrink={0}
                        />
                      ))}
                    </HStack>
                  )}
                </Box>
              )}

              {/* Açıklama */}
              {property.description && (
                <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                  <Heading size="sm" mb={3}>Açıklama</Heading>
                  <Text color={textColor} fontSize="sm" lineHeight="tall">
                    {property.description}
                  </Text>
                </Box>
              )}

              {/* Konum - Google Maps */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                <Heading size="sm" mb={4}>Konum</Heading>
                <PropertyMapSimple
                  address={property.address}
                  city={property.city}
                  district={property.district}
                  neighborhood={property.neighborhood}
                  title={property.title}
                />
                <HStack mt={3} color={textColor} fontSize="sm">
                  <Icon as={MapPin} size={14} />
                  <Text>
                    {property.address || 
                      `${property.neighborhood ? property.neighborhood + ', ' : ''}${property.district}, ${property.city}`
                    }
                  </Text>
                </HStack>
              </Box>

              {/* Detaylı Bilgiler */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                <Heading size="sm" mb={4}>Detaylı Bilgiler</Heading>
                <VStack align="stretch" spacing={0}>
                  <InfoItem icon={Square} label="Alan" value={`${property.area} m²`} />
                  <InfoItem icon={Home} label="Oda Sayısı" value={property.rooms} />
                  <InfoItem icon={Home} label="Kat" value={property.floor} />
                  <InfoItem icon={Calendar} label="Bina Yaşı" value={property.building_age && `${property.building_age} yıl`} />
                  <InfoItem icon={Home} label="Isıtma" value={property.heating} />
                  <InfoItem icon={Home} label="Banyo" value={property.bathrooms} />
                  <InfoItem icon={Home} label="Eşyalı" value={property.furnished ? 'Evet' : 'Hayır'} />
                  <InfoItem icon={Home} label="Tapu Durumu" value={property.deed_status ? getDeedStatusLabel(property.deed_status) : '-'} />
                </VStack>
              </Box>

            </VStack>
          </GridItem>

          {/* Sağ Kolon - Özet Bilgiler */}
          <GridItem>
            <VStack spacing={6} align="stretch" position="sticky" top="20px">
              
              {/* Başlık ve Fiyat */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                <Wrap spacing={2} mb={3}>
                  <WrapItem>
                    <Badge colorScheme={property.status === 'active' ? 'green' : 'gray'} fontSize="xs">
                      {property.status === 'active' ? 'Aktif' : property.status}
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge colorScheme="purple" fontSize="xs">
                      {property.listing_type === 'for_sale' ? 'Satılık' : 'Kiralık'}
                    </Badge>
                  </WrapItem>
                  <WrapItem>
                    <Badge colorScheme="blue" fontSize="xs">
                      {property.property_type === 'apartment' ? 'Daire' : property.property_type}
                    </Badge>
                  </WrapItem>
                </Wrap>
                
                <Heading size="md" mb={3} noOfLines={2}>{property.title}</Heading>
                
                <HStack color={textColor} mb={4} fontSize="sm">
                  <Icon as={MapPin} size={14} />
                  <Text>
                    {property.neighborhood && `${property.neighborhood}, `}
                    {property.district}, {property.city}
                  </Text>
                </HStack>
                
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  {formatPrice(property.price)}
                </Text>
              </Box>

              {/* Öne Çıkan Özellikler */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                <Heading size="sm" mb={4}>Özellikler</Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <VStack spacing={1}>
                    <Icon as={Square} size={24} color="blue.500" />
                    <Text fontSize="xs" color={labelColor}>Alan</Text>
                    <Text fontSize="sm" fontWeight="bold">{property.area} m²</Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Icon as={Home} size={24} color="blue.500" />
                    <Text fontSize="xs" color={labelColor}>Oda</Text>
                    <Text fontSize="sm" fontWeight="bold">{property.rooms}</Text>
                  </VStack>
                  {property.floor !== undefined && (
                    <VStack spacing={1}>
                      <Icon as={Home} size={24} color="blue.500" />
                      <Text fontSize="xs" color={labelColor}>Kat</Text>
                      <Text fontSize="sm" fontWeight="bold">{property.floor}</Text>
                    </VStack>
                  )}
                  {property.building_age !== undefined && (
                    <VStack spacing={1}>
                      <Icon as={Calendar} size={24} color="blue.500" />
                      <Text fontSize="xs" color={labelColor}>Yaş</Text>
                      <Text fontSize="sm" fontWeight="bold">{property.building_age}</Text>
                    </VStack>
                  )}
                </SimpleGrid>
              </Box>

              {/* İlan Sahibi */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
                <Heading size="sm" mb={4}>İlanı Ekleyen</Heading>
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Icon as={User} size={16} color="blue.500" />
                    <Text fontSize="sm" fontWeight="medium">
                      {property.created_by_profile?.full_name || 'Bilinmiyor'}
                    </Text>
                  </HStack>
                  {property.created_by_profile?.email && (
                    <HStack>
                      <Icon as={Mail} size={16} color="blue.500" />
                      <Text fontSize="sm">{property.created_by_profile.email}</Text>
                    </HStack>
                  )}
                  {property.created_by_profile?.phone && (
                    <HStack>
                      <Icon as={Phone} size={16} color="blue.500" />
                      <Text fontSize="sm">{property.created_by_profile.phone}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              {/* Müşteri Bilgileri */}
              {isOwner && (property.customer_name || property.customer_phone) && (
                <Box bg="orange.50" p={6} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor="orange.200">
                  <HStack mb={3}>
                    <Text fontSize="sm" fontWeight="bold" color="orange.700">
                      🔒 Müşteri Bilgileri
                    </Text>
                  </HStack>
                  <VStack align="stretch" spacing={2} fontSize="sm">
                    {property.customer_name && (
                      <HStack>
                        <Icon as={User} size={14} color="orange.600" />
                        <Text>{property.customer_name}</Text>
                      </HStack>
                    )}
                    {property.customer_phone && (
                      <HStack>
                        <Icon as={Phone} size={14} color="orange.600" />
                        <Text>{property.customer_phone}</Text>
                      </HStack>
                    )}
                    {property.customer_email && (
                      <HStack>
                        <Icon as={Mail} size={14} color="orange.600" />
                        <Text>{property.customer_email}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              )}

            </VStack>
          </GridItem>

        </Grid>
      </Container>

      {/* Full Screen Gallery */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} size="full">
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent">
          <ModalCloseButton color="white" size="lg" />
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={0}>
            <HStack spacing={4} w="full" h="100vh" align="center" justify="center">
              <IconButton
                aria-label="Önceki"
                icon={<ChevronLeft size={32} />}
                onClick={() => setCurrentImageIndex((prev) => prev === 0 ? images.length - 1 : prev - 1)}
                size="lg"
                isRound
                bg="blackAlpha.600"
                color="white"
                _hover={{ bg: 'blackAlpha.800' }}
              />

              <Image
                src={images[currentImageIndex]}
                alt={property.title}
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
              />

              <IconButton
                aria-label="Sonraki"
                icon={<ChevronRight size={32} />}
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                size="lg"
                isRound
                bg="blackAlpha.600"
                color="white"
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
              fontSize="sm"
            >
              {currentImageIndex + 1} / {images.length}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>İlan Düzenle</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PropertyForm
              property={property}
              onSuccess={() => {
                onEditClose();
                queryClient.invalidateQueries({ queryKey: ['property', id] });
                toast({
                  title: 'İlan güncellendi',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              onCancel={onEditClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default ListingDetail;
