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
  TabPanels,
  Tab,
  TabPanel,
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
  useToast
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
  Calendar
} from 'react-feather';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService, Property, PropertyFilters } from '../../services/propertiesService';

type ScopeMode = 'mine' | 'team' | 'all';
type ViewMode = 'list' | 'card' | 'map';

interface Agent {
  id: string;
  fullName: string;
  email: string;
  managerId: string;
}

// Property service'den gelen Property tipini Listing olarak kullanacağız
type Listing = Property;

const PortfolioManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const currentUserEmail = user?.email || '';
  
  // State
  const [scopeMode, setScopeMode] = useState<ScopeMode>('mine');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  
  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Sample agents data (bu gerçek bir API'den gelecek)
  const agents: Agent[] = [
    { id: 'agent-1', fullName: 'Ahmet Yılmaz', email: 'ahmet@example.com', managerId: 'manager-1' },
    { id: 'agent-2', fullName: 'Ayşe Demir', email: 'ayse@example.com', managerId: 'manager-1' },
    { id: 'agent-3', fullName: 'Mehmet Kaya', email: 'mehmet@example.com', managerId: 'manager-1' }
  ];
  
  // API filters
  const getApiFilters = (): PropertyFilters => {
    const filters: PropertyFilters = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    if (typeFilter !== 'all') {
      filters.listing_type = typeFilter === 'sale' ? 'for_sale' : 'for_rent';
    }
    
    if (locationFilter !== 'all') {
      filters.city = locationFilter;
    }
    
    if (selectedAgent !== 'all') {
      filters.assigned_agent = selectedAgent;
    }
    
    // Scope mode filters
    if (scopeMode === 'mine') {
      filters.created_by = user?.id;
    }
    
    return filters;
  };
  
  // API Queries
  const { 
    data: propertiesData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['properties', scopeMode, currentPage, itemsPerPage, searchTerm, typeFilter, locationFilter, selectedAgent],
    queryFn: () => {
      const filters = getApiFilters();
      console.log('🔍 Portfolio: React Query executing with filters:', filters);
      console.log('🔍 Portfolio: User object:', user);
      console.log('🔍 Portfolio: Scope mode:', scopeMode);
      return propertiesService.getProperties(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesService.deleteProperty(id),
    onSuccess: () => {
      toast({
        title: 'İlan silindi',
        description: 'İlan başarıyla silindi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setListingToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İlan silinirken bir hata oluştu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
  
  // Data from API
  const listings = propertiesData?.properties || [];
  const totalPages = propertiesData?.pagination?.pages || 1;
  const totalCount = propertiesData?.pagination?.total || 0;
  
  // Get unique locations from current data
  const locations = Array.from(new Set(listings.map(listing => {
    if (listing.city) {
      return listing.city;
    }
    return '';
  }).filter(Boolean)));
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  

  
  const handleListingClick = (listing: Listing) => {
    navigate(`/portfolio/listing/${listing.id}`);
  };
  
  const handleDeleteListing = (listing: Listing) => {
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
          <Button
            leftIcon={<RefreshCw />}
            onClick={handleResetData}
            size="sm"
            variant="outline"
          >
            Yenile
          </Button>
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

              <Select 
                maxW="150px" 
                value={locationFilter} 
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tüm Bölgeler</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>

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
                  isActive={viewMode === 'card'}
                  onClick={() => setViewMode('card')}
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
                <Select 
                  maxW="200px" 
                  value={selectedAgent} 
                  onChange={(e) => {
                    setSelectedAgent(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Tüm Danışmanlar</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.fullName}</option>
                  ))}
                </Select>
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
        ) : (
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
                      Danışman: {listing.assigned_agent_profile?.full_name || 'Atanmamış'}
                    </Text>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        {/* Silme butonu sadece kullanıcının kendi ilanları için gösterilir */}
                        {user?.id === listing.created_by && (
                          <Tooltip label="Sil">
                            <IconButton
                              aria-label="Sil"
                              icon={<Trash2 />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteListing(listing);
                              }}
                            />
                          </Tooltip>
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

    </Box>
  );
};

export default PortfolioManagement;