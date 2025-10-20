import React, { useState, useEffect, useRef } from 'react';
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
  useDisclosure
} from '@chakra-ui/react';
import { 
  Search, 
  RefreshCw, 
  List, 
  Grid as GridIcon, 
  Map, 
  MapPin, 
  Trash2, 
  Home 
} from 'react-feather';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type ScopeMode = 'mine' | 'team' | 'all';
type ViewMode = 'list' | 'card' | 'map';

interface Agent {
  id: string;
  fullName: string;
  email: string;
  managerId: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

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
  customer?: Customer; // Müşteri bilgileri (sadece kendi ilanlarında gösterilecek)
}

const PortfolioManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scopeMode, setScopeMode] = useState<ScopeMode>('mine');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  
  const itemsPerPage = 12;
  const userId = user?.email || 'current-user@example.com';
  const currentUserEmail = userId;
  
  // Theme colors
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Sample data
  const agents: Agent[] = [
    { id: 'agent-1', fullName: 'Ahmet Yılmaz', email: 'ahmet@example.com', managerId: 'manager-1' },
    { id: 'agent-2', fullName: 'Ayşe Demir', email: 'ayse@example.com', managerId: 'manager-1' },
    { id: 'agent-3', fullName: 'Mehmet Kaya', email: 'mehmet@example.com', managerId: 'manager-1' }
  ];
  
  const [listings] = useState<Listing[]>([
    {
      id: 'listing-1',
      title: 'Merkezi Konumda 3+1 Daire',
      type: 'Satılık',
      price: 2500000,
      area: '120',
      rooms: '3+1',
      location: 'Kadıköy, İstanbul',
      status: 'Aktif',
      coverUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
      agentId: currentUserEmail,
      ownerId: currentUserEmail,
      createdAt: '2024-01-15',
      customer: {
        id: 'customer-1',
        name: 'Ahmet Yılmaz',
        phone: '0532 123 4567',
        email: 'ahmet.yilmaz@example.com'
      }
    },
    {
      id: 'listing-2',
      title: 'Deniz Manzaralı Villa',
      type: 'Kiralık',
      price: 25000,
      area: '350',
      rooms: '5+2',
      location: 'Beşiktaş, İstanbul',
      status: 'Aktif',
      coverUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
      agentId: currentUserEmail,
      ownerId: currentUserEmail,
      createdAt: '2024-01-14',
      customer: {
        id: 'customer-2',
        name: 'Ayşe Demir',
        phone: '0533 456 7890',
        email: 'ayse.demir@example.com'
      }
    },
    {
      id: 'listing-3',
      title: 'Modern Ofis Alanı',
      type: 'Kiralık',
      price: 15000,
      area: '200',
      location: 'Şişli, İstanbul',
      status: 'Aktif',
      coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
      agentId: 'agent-2',
      ownerId: 'agent-2',
      createdAt: '2024-01-13'
      // Ofis ilanı - müşteri bilgisi yok
    },
    {
      id: 'listing-4',
      title: 'Bahçeli Müstakil Ev',
      type: 'Satılık',
      price: 4200000,
      area: '280',
      rooms: '4+1',
      location: 'Üsküdar, İstanbul',
      status: 'Aktif',
      coverUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
      agentId: 'agent-3',
      ownerId: 'agent-3',
      createdAt: '2024-01-12'
      // Ofis ilanı - müşteri bilgisi yok
    }
  ]);
  
  // Helper functions
  const getMyListings = () => listings.filter(listing => listing.ownerId === currentUserEmail);
  const getTeamListings = () => listings.filter(listing => 
    agents.some(agent => agent.id === listing.agentId) && listing.ownerId !== currentUserEmail
  );
  const getAllListings = () => listings;
  
  const getFilteredListings = () => {
    let filtered: Listing[] = [];
    
    switch (scopeMode) {
      case 'mine':
        filtered = getMyListings();
        break;
      case 'team':
        filtered = getTeamListings();
        break;
      case 'all':
        filtered = getAllListings();
        break;
      default:
        filtered = [];
    }
    
    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === typeFilter);
    }
    
    if (locationFilter !== 'all') {
      filtered = filtered.filter(listing => listing.location.includes(locationFilter));
    }
    
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(listing => listing.agentId === selectedAgent);
    }
    
    return filtered;
  };
  
  const filteredListings = getFilteredListings();
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get unique locations
  const locations = Array.from(new Set(listings.map(listing => {
    const parts = listing.location.split(', ');
    return parts[parts.length - 1]; // Get city part
  })));
  
  const formatPrice = (price: number, type: string) => {
    if (type === 'Kiralık') {
      return `${price.toLocaleString('tr-TR')} TL/ay`;
    }
    return `${price.toLocaleString('tr-TR')} TL`;
  };
  
  const getAgentName = (agentId: string) => {
    if (agentId === currentUserEmail) return 'Ben';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.fullName : 'Bilinmeyen';
  };
  
  const handleListingClick = (listing: Listing) => {
    navigate(`/portfolio/listing/${listing.id}`);
  };
  
  const handleDeleteClick = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    setListingToDelete(listing);
    onOpen();
  };
  
  const handleDeleteConfirm = () => {
    if (listingToDelete) {
      // Burada gerçek silme işlemi yapılacak
      console.log('İlan silindi:', listingToDelete.id);
      setListingToDelete(null);
      onClose();
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLocationFilter('all');
    setSelectedAgent('all');
    setCurrentPage(1);
  };
  
  const resetData = () => {
    clearFilters();
    setScopeMode('mine');
  };
  
  // Calculate stats
  const stats = {
    total: filteredListings.length,
    active: filteredListings.filter(l => l.status === 'Aktif').length,
    avgPrice: filteredListings.length > 0 
      ? filteredListings.reduce((sum, l) => sum + l.price, 0) / filteredListings.length 
      : 0
  };
  
  return (
    <Box bg={bg} minH="100vh">
      <VStack spacing={6} align="stretch">
        
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>Portföy Yönetimi</Heading>
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
                  <Tab>Benim ({getMyListings().length})</Tab>
                  <Tab>Ofis ({getTeamListings().length})</Tab>
                  <Tab>Tümü ({getMyListings().length + getTeamListings().length})</Tab>
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
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
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
        {paginatedListings.length === 0 ? (
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <VStack spacing={4} py={8}>
                <Icon as={Home} size="48px" color="gray.400" />
                <Text color={textColor} textAlign="center">
                  Kayıt bulunamadı
                </Text>
                <Button size="sm" onClick={clearFilters}>
                  Filtreleri Temizle
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
            {paginatedListings.map((listing) => (
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
                  src={listing.coverUrl} 
                  alt={listing.title}
                  h="200px"
                  w="100%"
                  objectFit="cover"
                />
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Badge 
                        colorScheme={listing.status === 'Aktif' ? 'green' : 'gray'}
                        size="sm"
                      >
                        {listing.status}
                      </Badge>
                      <Badge 
                        colorScheme={listing.type === 'Satılık' ? 'blue' : 'orange'}
                        size="sm"
                      >
                        {listing.type}
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
                          <Text>{listing.rooms}</Text>
                        </>
                      )}
                    </HStack>
                    
                    <Text fontWeight="bold" color="green.500" fontSize="sm">
                      {formatPrice(listing.price, listing.type)}
                    </Text>
                    
                    <HStack spacing={1} fontSize="xs" color={textColor}>
                      <Icon as={MapPin} size="12px" />
                      <Text noOfLines={1}>{listing.location}</Text>
                    </HStack>
                    
                    <Text fontSize="xs" color={textColor}>
                      Danışman: {getAgentName(listing.agentId)}
                    </Text>
                    
                    {/* Müşteri bilgileri - sadece kendi ilanlarında göster */}
                    {listing.ownerId === currentUserEmail && listing.customer && (
                      <VStack align="stretch" spacing={1} fontSize="xs" color={textColor}>
                        <Text fontWeight="semibold">Müşteri Bilgileri:</Text>
                        <Text>👤 {listing.customer.name}</Text>
                        <Text>📞 {listing.customer.phone}</Text>
                        <Text>✉️ {listing.customer.email}</Text>
                      </VStack>
                    )}
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        {/* Silme butonu sadece kullanıcının kendi ilanları için gösterilir */}
                        {listing.ownerId === currentUserEmail && (
                          <Tooltip label="Sil">
                            <IconButton
                              aria-label="Sil"
                              icon={<Trash2 />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => handleDeleteClick(listing, e)}
                            />
                          </Tooltip>
                        )}
                      </HStack>
                      <Text fontSize="xs" color={textColor}>
                        {listing.createdAt}
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
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
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
              <Button ref={cancelRef} onClick={onClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
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