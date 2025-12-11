import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  Flex,
  Button,
  HStack,
  Card,
  CardBody,
  Text,
  Tabs,
  TabList,
  Tab,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  ButtonGroup,
  IconButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Image,
  Badge,
  Icon,
  Divider,
  Tooltip,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react';
import {
  Search,
  RefreshCw,
  List,
  Grid as GridIcon,
  Map,
  MapPin,
  Trash2,
  Home,
  User,
  Calendar,
  Plus,
  Download,
  Edit
} from 'react-feather';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService, Property } from '../../../services/propertiesService';
import { supabase } from '../../../lib/supabase';
import PropertyForm from './PropertyForm';
import SahibindenScraper from './SahibindenScraper';

type ScopeMode = 'mine' | 'team' | 'all';

const PortfolioManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tenantName } = useParams<{ tenantName: string }>();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cancelRef = useRef(null);

  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [agentSearch, setAgentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('mine');
  const [listingToDelete, setListingToDelete] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isScraperOpen, onOpen: onScraperOpen, onClose: onScraperClose } = useDisclosure();

  // Queries
  const { data: listingsData, isLoading, error } = useQuery({
    queryKey: ['properties', { page: currentPage, type: typeFilter, location: locationFilter, agent: selectedAgent, search: searchTerm, scope: scopeMode }],
    queryFn: () => propertiesService.getProperties({
      page: currentPage,
      limit: 20,
      listing_type: typeFilter !== 'all' ? (typeFilter === 'sale' ? 'for_sale' : 'for_rent') : undefined,
      city: locationFilter !== 'all' ? locationFilter : undefined,
      created_by: selectedAgent !== 'all' ? selectedAgent : undefined,
      search: searchTerm,
      scope: scopeMode
    }),
  });

  const listings = listingsData?.properties || [];
  const totalCount = listingsData?.pagination.total || 0;
  const totalPages = listingsData?.pagination.pages || 1;

  const { data: agents = [] } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      // Get all team members (consultants + current user)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .or(`id.eq.${user.id},parent_user_id.eq.${user.id}`)
        .order('full_name');

      return profiles?.map(p => ({ id: p.id, fullName: p.full_name, email: p.email })) || [];
    },
  });

  const locations = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Muğla'];

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: propertiesService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setListingToDelete(null);
      toast({
        title: 'İlan silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İlan silinirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
  };

  const handleListingClick = (listing: Property) => {
    navigate(`/${tenantName}/portfoy/ilan/${listing.id}`);
  };

  const handleDeleteListing = (listing: Property) => {
    setListingToDelete(listing);
  };

  const confirmDelete = () => {
    if (listingToDelete) {
      deleteMutation.mutate(listingToDelete.id);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLocationFilter('all');
    setSelectedAgent('all');
    setCurrentPage(1);
  };

  const handleResetData = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    toast({
      title: 'Veriler yenilendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate statistics
  const stats = {
    total: totalCount,
    active: listings.filter(l => l.status === 'active').length,
    avgPrice: listings.length > 0
      ? listings.reduce((sum, l) => sum + l.price, 0) / listings.length
      : 0
  };

  // Loading state
  if (isLoading) {
    return (
      <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>İlanlar yükleniyor...</Text>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box bg={bg} minH="100vh" p={6}>
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">İlanlar yüklenirken bir hata oluştu</Text>
            <Text fontSize="sm">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh">
      <VStack spacing={6} align="stretch">

        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>Portföy Yönetimi</Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<Download />}
              colorScheme="orange"
              variant="outline"
              onClick={onScraperOpen}
            >
              Sahibinden'den Çek
            </Button>
            <Button
              leftIcon={<Plus />}
              colorScheme="blue"
              onClick={() => {
                setSelectedProperty(null);
                onFormOpen();
              }}
            >
              Yeni İlan Ekle
            </Button>
            <Button
              leftIcon={<RefreshCw />}
              onClick={handleResetData}
              size="sm"
              variant="outline"
            >
              Yenile
            </Button>
          </HStack>
        </Flex>

        {/* Scope Selector */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                İlan Kapsamı
              </Text>
              <Tabs
                index={scopeMode === 'mine' ? 0 : scopeMode === 'team' ? 1 : 2}
                onChange={(index) => {
                  const modes: ScopeMode[] = ['mine', 'team', 'all'];
                  setScopeMode(modes[index]);
                  setSelectedAgent('all');
                  setCurrentPage(1);
                }}
                variant="enclosed"
                size="sm"
              >
                <TabList>
                  <Tab>Benim İlanlarım</Tab>
                  <Tab>Ofis İlanları</Tab>
                  <Tab>Tüm İlanlar</Tab>
                </TabList>
              </Tabs>
            </VStack>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Flex gap={4} wrap="wrap" align="center">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="İlan ara (başlık, lokasyon)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </InputGroup>

              <Select
                maxW="150px"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tüm Tipler</option>
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </Select>

              <Menu closeOnSelect={true}>
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="md"
                  maxW="200px"
                  textAlign="left"
                >
                  {locationFilter === 'all' ? 'Tüm Bölgeler' : locationFilter}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  <Box px={3} py={2}>
                    <Input
                      placeholder="Şehir ara..."
                      size="sm"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Box>
                  <MenuDivider />
                  <MenuItem
                    onClick={() => {
                      setLocationFilter('all');
                      setLocationSearch('');
                      setCurrentPage(1);
                    }}
                    fontWeight={locationFilter === 'all' ? 'bold' : 'normal'}
                  >
                    Tüm Bölgeler
                  </MenuItem>
                  {locations
                    .filter(location => 
                      location.toLowerCase().includes(locationSearch.toLowerCase())
                    )
                    .map(location => (
                      <MenuItem
                        key={location}
                        onClick={() => {
                          setLocationFilter(location);
                          setLocationSearch('');
                          setCurrentPage(1);
                        }}
                        fontWeight={locationFilter === location ? 'bold' : 'normal'}
                      >
                        {location}
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>

              <ButtonGroup size="sm" isAttached variant="outline">
                <IconButton
                  aria-label="Liste görünümü"
                  icon={<List />}
                  isActive={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                />
                <IconButton
                  aria-label="Kart görünümü"
                  icon={<GridIcon />}
                  isActive={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                />
                <IconButton
                  aria-label="Harita görünümü"
                  icon={<Map />}
                  isActive={viewMode === 'map'}
                  onClick={() => setViewMode('map')}
                />
              </ButtonGroup>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                leftIcon={<RefreshCw />}
              >
                Filtreleri Temizle
              </Button>
            </Flex>

            {/* Agent Filter (only for team and all modes) */}
            {(scopeMode === 'team' || scopeMode === 'all') && (
              <Flex gap={4} align="center" mt={4}>
                <Text fontSize="sm" color={textColor} minW="80px">Danışman:</Text>
                <Menu closeOnSelect={true}>
                  <MenuButton
                    as={Button}
                    variant="outline"
                    size="md"
                    maxW="250px"
                    textAlign="left"
                  >
                    {selectedAgent === 'all' 
                      ? 'Tüm Danışmanlar' 
                      : agents.find(a => a.id === selectedAgent)?.fullName || 'Seçiniz'}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    <Box px={3} py={2}>
                      <Input
                        placeholder="Danışman ara..."
                        size="sm"
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                    <MenuDivider />
                    <MenuItem
                      onClick={() => {
                        setSelectedAgent('all');
                        setAgentSearch('');
                        setCurrentPage(1);
                      }}
                      fontWeight={selectedAgent === 'all' ? 'bold' : 'normal'}
                    >
                      Tüm Danışmanlar
                    </MenuItem>
                    {agents
                      .filter(agent => 
                        agent.fullName.toLowerCase().includes(agentSearch.toLowerCase())
                      )
                      .map(agent => (
                        <MenuItem
                          key={agent.id}
                          onClick={() => {
                            setSelectedAgent(agent.id);
                            setAgentSearch('');
                            setCurrentPage(1);
                          }}
                          fontWeight={selectedAgent === agent.id ? 'bold' : 'normal'}
                        >
                          {agent.fullName}
                        </MenuItem>
                      ))}
                  </MenuList>
                </Menu>
              </Flex>
            )}
          </CardBody>
        </Card>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Toplam İlan</StatLabel>
                <StatNumber fontSize="sm">{stats.total}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Aktif İlan</StatLabel>
                <StatNumber fontSize="sm">{stats.active}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Ortalama Fiyat</StatLabel>
                <StatNumber fontSize="sm">
                  {stats.avgPrice > 0 ? `${Math.round(stats.avgPrice).toLocaleString('tr-TR')} TL` : '-'}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Listings */}
        {listings.length === 0 ? (
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <VStack spacing={4} py={8}>
                <Icon as={Home} size="48px" color="gray.400" />
                <Text color={textColor} textAlign="center">
                  Kayıt bulunamadı
                </Text>
                <Button size="sm" onClick={handleClearFilters}>
                  Filtreleri Temizle
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : viewMode === 'list' ? (
          // Liste Görünümü
          <VStack spacing={3} align="stretch">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                bg={cardBg}
                shadow="sm"
                cursor="pointer"
                _hover={{ shadow: 'md' }}
                transition="all 0.2s"
                onClick={() => handleListingClick(listing)}
              >
                <CardBody>
                  <Flex gap={4}>
                    <Image
                      src={listing.image_urls?.[0] || listing.images?.[0] || '/placeholder-property.jpg'}
                      alt={listing.title}
                      w="150px"
                      h="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="stretch" flex={1} spacing={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" fontSize="md">{listing.title}</Text>
                        <Text fontWeight="bold" color="green.500">{formatPrice(listing.price)}</Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={listing.listing_type === 'for_sale' ? 'green' : 'blue'} size="sm">
                          {listing.listing_type === 'for_sale' ? 'Satılık' : 'Kiralık'}
                        </Badge>
                        <Badge colorScheme={listing.status === 'active' ? 'green' : 'gray'} size="sm">
                          {listing.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                        <Text fontSize="sm" color={textColor}>
                          {listing.area} m² • {listing.rooms} oda
                        </Text>
                      </HStack>
                      <HStack spacing={2} fontSize="sm" color={textColor}>
                        <Icon as={MapPin} size="14px" />
                        <Text>{listing.city}, {listing.district}</Text>
                      </HStack>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        ) : viewMode === 'map' ? (
          // Harita Görünümü
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <VStack spacing={4} py={12}>
                <Icon as={Map} size="48px" color="gray.400" />
                <Text color={textColor} textAlign="center">
                  Harita görünümü yakında eklenecek
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          // Grid Görünümü (varsayılan)
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
            {listings.map((listing) => (
              <Card
                key={listing.id}
                bg={cardBg}
                shadow="sm"
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
                onClick={() => handleListingClick(listing)}
              >
                <Image
                  src={listing.image_urls?.[0] || listing.images?.[0] || '/placeholder-property.jpg'}
                  alt={listing.title}
                  h="200px"
                  w="100%"
                  objectFit="cover"
                />
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Badge
                        colorScheme={
                          listing.listing_type === 'for_sale' ? 'green' :
                            listing.listing_type === 'for_rent' ? 'blue' : 'gray'
                        }
                        size="sm"
                      >
                        {listing.listing_type === 'for_sale' ? 'Satılık' :
                          listing.listing_type === 'for_rent' ? 'Kiralık' : listing.listing_type}
                      </Badge>
                      <Badge
                        colorScheme={
                          listing.status === 'active' ? 'green' :
                            listing.status === 'sold' ? 'red' :
                              listing.status === 'rented' ? 'blue' : 'gray'
                        }
                        size="sm"
                      >
                        {listing.status === 'active' ? 'Aktif' :
                          listing.status === 'sold' ? 'Satıldı' :
                            listing.status === 'rented' ? 'Kiralandı' :
                              listing.status === 'inactive' ? 'Pasif' : listing.status}
                      </Badge>
                      <Badge
                        colorScheme={listing.property_type === 'apartment' ? 'purple' : 'orange'}
                        size="sm"
                      >
                        {listing.property_type === 'apartment' ? 'Daire' :
                          listing.property_type === 'villa' ? 'Villa' :
                            listing.property_type === 'house' ? 'Ev' :
                              listing.property_type === 'office' ? 'Ofis' :
                                listing.property_type === 'land' ? 'Arsa' : 'Ticari'}
                      </Badge>
                    </HStack>

                    <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                      {listing.title}
                    </Text>

                    <HStack spacing={2} fontSize="xs" color={textColor}>
                      <Text>{listing.area} m²</Text>
                      {listing.rooms && (
                        <>
                          <Text>•</Text>
                          <Text>{listing.rooms} oda</Text>
                        </>
                      )}
                    </HStack>

                    <Text fontWeight="bold" color="green.500" fontSize="sm">
                      {formatPrice(listing.price)}
                    </Text>

                    <HStack spacing={1} fontSize="xs" color={textColor}>
                      <Icon as={MapPin} size="12px" />
                      <Text noOfLines={1}>{listing.city}</Text>
                    </HStack>

                    <Text fontSize="xs" color={textColor}>
                      İlanı Ekleyen: {listing.created_by_profile?.full_name || 'Bilinmiyor'}
                    </Text>

                    <Divider />

                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        {/* Düzenleme ve silme butonları sadece kullanıcının kendi ilanları için gösterilir */}
                        {user?.id === listing.created_by && (
                          <>
                            <Tooltip label="Düzenle">
                              <IconButton
                                aria-label="Düzenle"
                                icon={<Edit size={14} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProperty(listing);
                                  onFormOpen();
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Sil">
                              <IconButton
                                aria-label="Sil"
                                icon={<Trash2 size={14} />}
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteListing(listing);
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                      </HStack>
                      <Text fontSize="xs" color={textColor}>
                        {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Flex justify="center" align="center" gap={4}>
            <IconButton
              aria-label="Önceki sayfa"
              icon={<Text>‹</Text>}
              size="sm"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            />
            <Text fontSize="sm" color={textColor}>
              {currentPage} / {totalPages}
            </Text>
            <IconButton
              aria-label="Sonraki sayfa"
              icon={<Text>›</Text>}
              size="sm"
              isDisabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Flex>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!listingToDelete}
        leastDestructiveRef={cancelRef}
        onClose={() => setListingToDelete(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              İlanı Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              {listingToDelete && (
                <Text mt={2} fontWeight="semibold">
                  "{listingToDelete.title}"
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setListingToDelete(null)}>
                İptal
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Property Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProperty ? 'İlan Düzenle' : 'Yeni İlan Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PropertyForm
              property={selectedProperty}
              onSuccess={() => {
                onFormClose();
                queryClient.invalidateQueries({ queryKey: ['properties'] });
                toast({
                  title: selectedProperty ? 'İlan güncellendi' : 'İlan eklendi',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
              }}
              onCancel={onFormClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Sahibinden Scraper Modal */}
      <SahibindenScraper
        isOpen={isScraperOpen}
        onClose={onScraperClose}
        onImport={(scrapedData) => {
          // Convert scraped data to property format and open form with pre-filled data
          const propertyData: Partial<Property> = {
            title: scrapedData.title || 'Sahibinden İlan',
            description: scrapedData.description || '',
            price: scrapedData.price || 0,
            city: scrapedData.city || '',
            district: scrapedData.district || '',
            neighborhood: scrapedData.neighborhood || '',
            address: `${scrapedData.neighborhood || ''}, ${scrapedData.district || ''}, ${scrapedData.city || ''}`.replace(/^, |, $/g, ''),
            area: scrapedData.area || scrapedData.area_net || scrapedData.area_gross || 0,
            rooms: scrapedData.rooms || '',
            floor: typeof scrapedData.floor === 'number' ? scrapedData.floor : parseInt(scrapedData.floor) || 0,
            building_age: typeof scrapedData.building_age === 'number' ? scrapedData.building_age : parseInt(scrapedData.building_age) || 0,
            heating: scrapedData.heating || '',
            furnished: scrapedData.furnished || false,
            listing_type: scrapedData.listing_type || 'for_sale',
            property_type: 'apartment',
            status: 'active',
            image_urls: scrapedData.images || scrapedData.image_urls || [],
            images: scrapedData.images || scrapedData.image_urls || [],
            features: scrapedData.features || []
          };
          
          setSelectedProperty(propertyData as Property);
          onFormOpen();
          
          toast({
            title: 'İlan bilgileri yüklendi',
            description: 'Lütfen bilgileri kontrol edip kaydedin',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }}
      />

    </Box>
  );
};

export default PortfolioManagement;