import React, { useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Image,
  Text,
  Heading,
  Badge,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  IconButton,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  AspectRatio
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Home,
  Maximize,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit
} from 'react-feather';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertiesService, Property } from '../../../services/propertiesService';

// Use Property type from propertiesService
type Listing = Property;

const ListingDetail: React.FC = () => {
  const { id, tenantName } = useParams<{ id: string; tenantName: string }>();
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch property data from Supabase
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesService.getProperty(id!),
    enabled: !!id
  });

  // Debug logging
  console.log('ListingDetail Debug:', { id, listing, isLoading, error });

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Loading and error handling
  if (isLoading) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Text>İlan detayları yükleniyor...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Text color="red.500">İlan detayları yüklenirken bir hata oluştu.</Text>
          <Button onClick={() => navigate(`/${tenantName}/portfoy`)}>
            Portföy Sayfasına Dön
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Text>İlan bulunamadı.</Text>
          <Button onClick={() => navigate(`/${tenantName}/portfoy`)}>
            Portföy Sayfasına Dön
          </Button>
        </VStack>
      </Box>
    );
  }

  // Helper functions

  const formatPrice = (price: number, type: string) => {
    return `${price.toLocaleString('tr-TR')} TL${type === 'for_rent' ? '/ay' : ''}`;
  };



  const nextImage = () => {
    if (listing?.image_urls) {
      setCurrentImageIndex((prev) =>
        prev === listing.image_urls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.image_urls) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.image_urls!.length - 1 : prev - 1
      );
    }
  };

  if (!listing) {
    return (
      <Box p={6}>
        <Text>İlan yükleniyor...</Text>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <Box w="100%">
        {/* Breadcrumb */}
        <Breadcrumb mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/${tenantName}/portfoy`)} cursor="pointer">
              Portföy Yönetimi
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{listing.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Button
            leftIcon={<ArrowLeft />}
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Geri Dön
          </Button>
          <HStack spacing={2}>
            <IconButton
              aria-label="Beğen"
              icon={<Heart />}
              variant={isLiked ? 'solid' : 'outline'}
              colorScheme={isLiked ? 'red' : 'gray'}
              onClick={() => setIsLiked(!isLiked)}
            />
            <IconButton
              aria-label="Paylaş"
              icon={<Share2 />}
              variant="outline"
            />
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Sol Kolon - Ana İçerik */}
          <GridItem>
            {/* Görsel Galeri */}
            <Card mb={6} bg={cardBg}>
              <CardBody p={0}>
                <Box position="relative">
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={listing.image_urls?.[currentImageIndex] || listing.image_urls?.[0]}
                      alt={listing.title}
                      objectFit="cover"
                      borderRadius="lg"
                    />
                  </AspectRatio>

                  {listing.image_urls && listing.image_urls.length > 1 && (
                    <>
                      <IconButton
                        aria-label="Önceki resim"
                        icon={<ChevronLeft />}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        bg="blackAlpha.600"
                        color="white"
                        _hover={{ bg: 'blackAlpha.800' }}
                        onClick={prevImage}
                      />
                      <IconButton
                        aria-label="Sonraki resim"
                        icon={<ChevronRight />}
                        position="absolute"
                        right={4}
                        top="50%"
                        transform="translateY(-50%)"
                        bg="blackAlpha.600"
                        color="white"
                        _hover={{ bg: 'blackAlpha.800' }}
                        onClick={nextImage}
                      />

                      {/* Görsel Sayacı */}
                      <Box
                        position="absolute"
                        bottom={4}
                        right={4}
                        bg="blackAlpha.700"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="sm"
                      >
                        {currentImageIndex + 1} / {listing.image_urls.length}
                      </Box>
                    </>
                  )}
                </Box>

                {/* Küçük Resim Galerisi */}
                {listing.image_urls && listing.image_urls.length > 1 && (
                  <HStack spacing={2} p={4} overflowX="auto">
                    {listing.image_urls.map((image, index) => (
                      <Box
                        key={index}
                        cursor="pointer"
                        onClick={() => setCurrentImageIndex(index)}
                        border={index === currentImageIndex ? '2px solid' : '1px solid'}
                        borderColor={index === currentImageIndex ? 'blue.500' : borderColor}
                        borderRadius="md"
                        overflow="hidden"
                        flexShrink={0}
                      >
                        <Image
                          src={image}
                          alt={`${listing.title} - ${index + 1}`}
                          w="80px"
                          h="60px"
                          objectFit="cover"
                        />
                      </Box>
                    ))}
                  </HStack>
                )}
              </CardBody>
            </Card>

            {/* İlan Detayları */}
            <Card mb={6} bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={6}>
                  {/* Başlık ve Fiyat */}
                  <Box>
                    <HStack justify="space-between" align="start" mb={4}>
                      <VStack align="start" spacing={2}>
                        <Heading size="lg" color={headingColor}>
                          {listing.title}
                        </Heading>
                        <HStack>
                          <Badge
                            colorScheme={listing.status === 'active' ? 'green' : listing.status === 'sold' || listing.status === 'rented' ? 'red' : 'gray'}
                            size="md"
                          >
                            {listing.status === 'active' ? 'Aktif' :
                              listing.status === 'inactive' ? 'Pasif' :
                                listing.status === 'sold' ? 'Satıldı' :
                                  listing.status === 'rented' ? 'Kiralandı' : listing.status}
                          </Badge>
                          <Badge
                            colorScheme={listing.listing_type === 'for_sale' ? 'blue' : 'orange'}
                            size="md"
                          >
                            {listing.listing_type === 'for_sale' ? 'Satılık' : 'Kiralık'}
                          </Badge>
                        </HStack>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {formatPrice(listing.price, listing.listing_type)}
                      </Text>
                    </HStack>

                    <HStack color={textColor} fontSize="md">
                      <MapPin size={16} />
                      <Text>{listing.location}</Text>
                    </HStack>
                  </Box>

                  <Divider />

                  {/* Temel Bilgiler */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Stat>
                      <StatLabel>Alan</StatLabel>
                      <StatNumber fontSize="lg">{listing.size} m²</StatNumber>
                    </Stat>
                    {listing.room_count && (
                      <Stat>
                        <StatLabel>Oda Sayısı</StatLabel>
                        <StatNumber fontSize="lg">{listing.room_count}</StatNumber>
                      </Stat>
                    )}
                    {listing.floor_number && (
                      <Stat>
                        <StatLabel>Kat</StatLabel>
                        <StatNumber fontSize="lg">{listing.floor_number}</StatNumber>
                      </Stat>
                    )}
                    {listing.building_age && (
                      <Stat>
                        <StatLabel>Bina Yaşı</StatLabel>
                        <StatNumber fontSize="lg">{listing.building_age}</StatNumber>
                      </Stat>
                    )}
                  </SimpleGrid>

                  <Divider />

                  {/* Açıklama */}
                  {listing.description && (
                    <Box>
                      <Heading size="md" mb={3} color={headingColor}>
                        Açıklama
                      </Heading>
                      <Text color={textColor} lineHeight={1.6}>
                        {listing.description}
                      </Text>
                    </Box>
                  )}

                  {/* Özellikler */}
                  {listing.features && listing.features.length > 0 && (
                    <Box>
                      <Heading size="md" mb={3} color={headingColor}>
                        Özellikler
                      </Heading>
                      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                        {listing.features.map((feature, index) => (
                          <HStack key={index} spacing={2}>
                            <Box w={2} h={2} bg="green.500" borderRadius="full" />
                            <Text fontSize="sm" color={textColor}>
                              {feature}
                            </Text>
                          </HStack>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Harita Placeholder */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4} color={headingColor}>
                  Konum
                </Heading>
                <AspectRatio ratio={16 / 9}>
                  <Box
                    bg="gray.100"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.500"
                  >
                    <VStack>
                      <MapPin size={48} />
                      <Text>Harita Entegrasyonu</Text>
                      <Text fontSize="sm">{listing.location}</Text>
                    </VStack>
                  </Box>
                </AspectRatio>
              </CardBody>
            </Card>
          </GridItem>

          {/* Sağ Kolon - Sidebar */}
          <GridItem>



          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default ListingDetail;