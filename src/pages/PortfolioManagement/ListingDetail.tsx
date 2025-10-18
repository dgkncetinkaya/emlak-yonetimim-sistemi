import React, { useState, useEffect } from 'react';
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
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
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
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit
} from 'react-feather';
import { useParams, useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  title: string;
  type: 'Satılık' | 'Kiralık';
  price: number;
  area: string;
  rooms?: string;
  location: string;
  status: 'Aktif' | 'Pasif';
  coverUrl: string;
  agentId: string;
  ownerId: string;
  createdAt: string;
  description?: string;
  features?: string[];
  images?: string[];
  floor?: string;
  buildingAge?: string;
  heating?: string;
  furnished?: boolean;
}

interface Agent {
  id: string;
  fullName: string;
  email: string;
  managerId: string;
  phone?: string;
  avatar?: string;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isLiked, setIsLiked] = useState(false);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    // Simulated API call
    const mockListing: Listing = {
      id: id || 'listing-1',
      title: 'Merkez\'de Lüks 3+1 Daire',
      type: 'Satılık',
      price: 2500000,
      area: '120',
      rooms: '3+1',
      location: 'Kadıköy, İstanbul',
      status: 'Aktif',
      coverUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      agentId: 'agent-1',
      ownerId: 'owner-1',
      createdAt: '2024-01-15',
      description: 'Şehrin kalbinde, modern mimarisi ve lüks detaylarıyla öne çıkan bu 3+1 daire, konforlu yaşamın tüm imkanlarını sunuyor. Geniş balkonları, kaliteli malzemeleri ve merkezi konumuyla ideal bir yatırım fırsatı.',
      features: [
        'Merkezi konum',
        'Geniş balkon',
        'Modern mutfak',
        'Parke zemin',
        'Klima',
        'Güvenlik',
        'Asansör',
        'Otopark'
      ],
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
      ],
      floor: '3. Kat',
      buildingAge: '5 Yıl',
      heating: 'Kombi',
      furnished: false
    };

    const mockAgent: Agent = {
      id: 'agent-1',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      managerId: 'broker-1',
      phone: '+90 555 123 4567',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    };

    setListing(mockListing);
    setAgent(mockAgent);
  }, [id]);

  const formatPrice = (price: number, type: string) => {
    return `${price.toLocaleString('tr-TR')} TL${type === 'Kiralık' ? '/ay' : ''}`;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Mesajınız gönderildi',
      description: 'En kısa sürede size dönüş yapacağız.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setContactForm({ name: '', email: '', phone: '', message: '' });
  };

  const nextImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
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
            <BreadcrumbLink onClick={() => navigate('/portfolio')} cursor="pointer">
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
                  <AspectRatio ratio={16/9}>
                    <Image
                      src={listing.images?.[currentImageIndex] || listing.coverUrl}
                      alt={listing.title}
                      objectFit="cover"
                      borderRadius="lg"
                    />
                  </AspectRatio>
                  
                  {listing.images && listing.images.length > 1 && (
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
                        {currentImageIndex + 1} / {listing.images.length}
                      </Box>
                    </>
                  )}
                </Box>
                
                {/* Küçük Resim Galerisi */}
                {listing.images && listing.images.length > 1 && (
                  <HStack spacing={2} p={4} overflowX="auto">
                    {listing.images.map((image, index) => (
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
                            colorScheme={listing.status === 'Aktif' ? 'green' : 'gray'}
                            size="md"
                          >
                            {listing.status}
                          </Badge>
                          <Badge 
                            colorScheme={listing.type === 'Satılık' ? 'blue' : 'orange'}
                            size="md"
                          >
                            {listing.type}
                          </Badge>
                        </HStack>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="bold" color="green.500">
                        {formatPrice(listing.price, listing.type)}
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
                      <StatNumber fontSize="lg">{listing.area} m²</StatNumber>
                    </Stat>
                    {listing.rooms && (
                      <Stat>
                        <StatLabel>Oda Sayısı</StatLabel>
                        <StatNumber fontSize="lg">{listing.rooms}</StatNumber>
                      </Stat>
                    )}
                    {listing.floor && (
                      <Stat>
                        <StatLabel>Kat</StatLabel>
                        <StatNumber fontSize="lg">{listing.floor}</StatNumber>
                      </Stat>
                    )}
                    {listing.buildingAge && (
                      <Stat>
                        <StatLabel>Bina Yaşı</StatLabel>
                        <StatNumber fontSize="lg">{listing.buildingAge}</StatNumber>
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
                <AspectRatio ratio={16/9}>
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
            {/* Danışman Bilgileri */}
            {agent && (
              <Card mb={6} bg={cardBg}>
                <CardBody>
                  <VStack spacing={4}>
                    <Avatar
                      size="xl"
                      src={agent.avatar}
                      name={agent.fullName}
                    />
                    <VStack spacing={1}>
                      <Heading size="md" color={headingColor}>
                        {agent.fullName}
                      </Heading>
                      <Text color={textColor} fontSize="sm">
                        Emlak Danışmanı
                      </Text>
                    </VStack>
                    
                    <VStack spacing={3} w="full">
                      {agent.phone && (
                        <Button
                          leftIcon={<Phone />}
                          colorScheme="green"
                          w="full"
                          as="a"
                          href={`tel:${agent.phone}`}
                        >
                          Ara
                        </Button>
                      )}
                      <Button
                        leftIcon={<Mail />}
                        colorScheme="blue"
                        variant="outline"
                        w="full"
                        as="a"
                        href={`mailto:${agent.email}`}
                      >
                        E-posta Gönder
                      </Button>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* İletişim Formu */}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4} color={headingColor}>
                  İletişim Formu
                </Heading>
                <form onSubmit={handleContactSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Adınız ve soyadınız"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>E-posta</FormLabel>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="E-posta adresiniz"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Telefon numaranız"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Mesaj</FormLabel>
                      <Textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Bu ilan hakkında bilgi almak istiyorum..."
                        rows={4}
                      />
                    </FormControl>
                    
                    <Button
                      type="submit"
                      colorScheme="blue"
                      w="full"
                      size="lg"
                    >
                      Mesaj Gönder
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default ListingDetail;