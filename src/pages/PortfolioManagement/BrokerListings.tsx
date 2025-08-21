import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Text,
  Badge,
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  IconButton,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Image,
  Divider
} from '@chakra-ui/react';
import {
  Search,
  Grid,
  List,
  Map,
  Home,
  MapPin,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw
} from 'react-feather';
import { useAuth } from '../../context/AuthContext';

// Types
interface Agent {
  id: string;
  fullName: string;
  email: string;
  managerId: string;
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
}

type ViewMode = 'list' | 'card' | 'map';
type ScopeMode = 'mine' | 'team' | 'all';

// Data Service
class BrokerDataService {
  private static readonly AGENTS_KEY = 'agents';
  private static readonly LISTINGS_KEY = 'listings';

  static getAgents(): Agent[] {
    const data = localStorage.getItem(this.AGENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getListings(): Listing[] {
    const data = localStorage.getItem(this.LISTINGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAgents(agents: Agent[]): void {
    localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
  }

  static saveListings(listings: Listing[]): void {
    localStorage.setItem(this.LISTINGS_KEY, JSON.stringify(listings));
  }

  static seed(currentUserEmail: string): void {
    const existingAgents = this.getAgents();
    const existingListings = this.getListings();

    if (existingAgents.length === 0) {
      const agents: Agent[] = [
        { id: 'agent-1', fullName: 'Ahmet Yılmaz', email: 'ahmet@example.com', managerId: currentUserEmail },
        { id: 'agent-2', fullName: 'Ayşe Demir', email: 'ayse@example.com', managerId: currentUserEmail },
        { id: 'agent-3', fullName: 'Mehmet Kaya', email: 'mehmet@example.com', managerId: currentUserEmail }
      ];
      this.saveAgents(agents);
    }

    if (existingListings.length === 0) {
      const listings: Listing[] = [
        {
          id: 'listing-1',
          title: 'Merkez\'de Lüks 3+1 Daire',
          type: 'Satılık',
          price: 2500000,
          area: '120',
          rooms: '3+1',
          location: 'Kadıköy, İstanbul',
          status: 'Aktif',
          coverUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
          agentId: 'agent-1',
          ownerId: currentUserEmail,
          createdAt: '2024-01-15'
        },
        {
          id: 'listing-2',
          title: 'Deniz Manzaralı Villa',
          type: 'Satılık',
          price: 8500000,
          area: '350',
          rooms: '5+2',
          location: 'Beşiktaş, İstanbul',
          status: 'Aktif',
          coverUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
          agentId: 'agent-2',
          ownerId: currentUserEmail,
          createdAt: '2024-01-14'
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
          agentId: 'agent-3',
          ownerId: currentUserEmail,
          createdAt: '2024-01-13'
        },
        {
          id: 'listing-4',
          title: 'Bahçeli Müstakil Ev',
          type: 'Satılık',
          price: 4200000,
          area: '280',
          rooms: '4+1',
          location: 'Üsküdar, İstanbul',
          status: 'Pasif',
          coverUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
          agentId: 'agent-1',
          ownerId: currentUserEmail,
          createdAt: '2024-01-12'
        },
        {
          id: 'listing-5',
          title: 'Şehir Merkezinde 2+1',
          type: 'Kiralık',
          price: 8500,
          area: '85',
          rooms: '2+1',
          location: 'Beyoğlu, İstanbul',
          status: 'Aktif',
          coverUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
          agentId: 'agent-2',
          ownerId: currentUserEmail,
          createdAt: '2024-01-11'
        },
        {
          id: 'listing-6',
          title: 'Lüks Penthouse',
          type: 'Satılık',
          price: 12000000,
          area: '450',
          rooms: '6+2',
          location: 'Nişantaşı, İstanbul',
          status: 'Aktif',
          coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
          agentId: 'agent-3',
          ownerId: currentUserEmail,
          createdAt: '2024-01-10'
        }
      ];
      
      // Generate more listings to reach 18 total
      const additionalListings: Listing[] = [];
      const locations = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Beyoğlu', 'Nişantaşı', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Pendik', 'Kartal', 'Zeytinburnu'];
      const agents = ['agent-1', 'agent-2', 'agent-3'];
      const propertyImages = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80'
      ];
      
      for (let i = 7; i <= 18; i++) {
          const isForSale = Math.random() > 0.5;
          const location = locations[Math.floor(Math.random() * locations.length)];
          const agentId = agents[Math.floor(Math.random() * agents.length)];
          const randomImage = propertyImages[Math.floor(Math.random() * propertyImages.length)];
          
          additionalListings.push({
            id: `listing-${i}`,
            title: `${isForSale ? 'Satılık' : 'Kiralık'} ${Math.floor(Math.random() * 3) + 2}+1 Daire`,
            type: isForSale ? 'Satılık' : 'Kiralık',
            price: isForSale ? Math.floor(Math.random() * 5000000) + 1000000 : Math.floor(Math.random() * 20000) + 5000,
            area: `${Math.floor(Math.random() * 200) + 80}`,
            rooms: `${Math.floor(Math.random() * 3) + 2}+1`,
            location: `${location}, İstanbul`,
            status: Math.random() > 0.2 ? 'Aktif' : 'Pasif',
            coverUrl: randomImage,
            agentId,
            ownerId: currentUserEmail,
            createdAt: `2024-01-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`
          });
      }
      
      this.saveListings([...listings, ...additionalListings]);
    }
  }

  static getMyListings(userId: string): Listing[] {
    return this.getListings().filter(listing => listing.ownerId === userId);
  }

  static getTeamListings(brokerId: string): Listing[] {
    const agents = this.getAgents().filter(agent => agent.managerId === brokerId);
    const agentIds = agents.map(agent => agent.id);
    return this.getListings().filter(listing => agentIds.includes(listing.agentId));
  }

  static getAllListings(brokerId: string): Listing[] {
    const myListings = this.getMyListings(brokerId);
    const teamListings = this.getTeamListings(brokerId);
    return [...myListings, ...teamListings];
  }

  static clearData(): void {
    localStorage.removeItem(this.AGENTS_KEY);
    localStorage.removeItem(this.LISTINGS_KEY);
  }
}

const BrokerListings: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Satılık' | 'Kiralık'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('mine');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Check authorization - Allow admin and consultant roles
  if (!user || (user.role !== 'admin' && user.role !== 'consultant')) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          Bu sayfaya erişim yetkiniz bulunmamaktadır
        </Alert>
      </Box>
    );
  }

  const userId = user.email; // Use email as user ID
  const agents = BrokerDataService.getAgents();
  const allListings = BrokerDataService.getAllListings(userId);

  // Initialize data
  useEffect(() => {
    BrokerDataService.seed(userId);
  }, [userId]);

  // Debug function to reset data
  const resetData = () => {
    BrokerDataService.clearData();
    BrokerDataService.seed(userId);
    window.location.reload();
  };

  // Get listings based on scope
  const scopedListings = useMemo(() => {
    switch (scopeMode) {
      case 'mine':
        return BrokerDataService.getMyListings(userId);
      case 'team':
        return BrokerDataService.getTeamListings(userId);
      case 'all':
        return BrokerDataService.getAllListings(userId);
      default:
        return [];
    }
  }, [scopeMode, userId]);

  // Filter listings
  const filteredListings = useMemo(() => {
    let filtered = scopedListings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(listing => listing.type === typeFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Agent filter (only for team and all modes)
    if ((scopeMode === 'team' || scopeMode === 'all') && selectedAgent !== 'all') {
      filtered = filtered.filter(listing => listing.agentId === selectedAgent);
    }

    return filtered;
  }, [scopedListings, searchTerm, typeFilter, locationFilter, scopeMode, selectedAgent]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = filteredListings.length;
    const forSale = filteredListings.filter(l => l.type === 'Satılık').length;
    const forRent = filteredListings.filter(l => l.type === 'Kiralık').length;
    const avgPrice = filteredListings.length > 0 
      ? filteredListings.reduce((sum, l) => sum + l.price, 0) / filteredListings.length
      : 0;

    return { total, forSale, forRent, avgPrice };
  }, [filteredListings]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(
      allListings.map(listing => listing.location.split(',')[0])
    ));
    return uniqueLocations.sort();
  }, [allListings]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setLocationFilter('all');
    setSelectedAgent('all');
    setCurrentPage(1);
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'Kiralık') {
      return `${price.toLocaleString('tr-TR')} TL/ay`;
    }
    return `${price.toLocaleString('tr-TR')} TL`;
  };

  const getAgentName = (agentId: string) => {
    if (agentId === userId) return 'Ben';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.fullName : 'Bilinmeyen';
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>İlan Yönetimi</Heading>
          <HStack spacing={2}>
            <Button colorScheme="red" size="sm" onClick={resetData}>
              Verileri Sıfırla
            </Button>
            <Button leftIcon={<RefreshCw />} size="sm" onClick={() => window.location.reload()}>
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
                  <Tab>Benim ({BrokerDataService.getMyListings(userId).length})</Tab>
                  <Tab>Danışmanlarım ({BrokerDataService.getTeamListings(userId).length})</Tab>
                  <Tab>Tümü ({BrokerDataService.getAllListings(userId).length})</Tab>
                </TabList>
              </Tabs>
            </VStack>
          </CardBody>
        </Card>

        {/* Filters */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search and View Controls */}
              <Flex gap={4} align="center" flexWrap="wrap">
                <InputGroup maxW="400px" flex={1}>
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
                    icon={<Grid />}
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
                <Flex gap={4} align="center">
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

              {/* Clear Filters */}
              {(searchTerm || typeFilter !== 'all' || locationFilter !== 'all' || selectedAgent !== 'all') && (
                <Flex>
                  <Button size="sm" variant="ghost" colorScheme="red" onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </Flex>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Toplam İlan</StatLabel>
                <StatNumber color="blue.500">{stats.total}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Satılık</StatLabel>
                <StatNumber color="green.500">{stats.forSale}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} shadow="sm">
            <CardBody>
              <Stat>
                <StatLabel>Kiralık</StatLabel>
                <StatNumber color="orange.500">{stats.forRent}</StatNumber>
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
              <Card key={listing.id} bg={cardBg} shadow="sm" borderRadius="lg" overflow="hidden">
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
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        <Tooltip label="Görüntüle">
                          <IconButton
                            aria-label="Görüntüle"
                            icon={<Eye />}
                            size="xs"
                            variant="ghost"
                          />
                        </Tooltip>
                        <Tooltip label="Düzenle">
                          <IconButton
                            aria-label="Düzenle"
                            icon={<Edit />}
                            size="xs"
                            variant="ghost"
                          />
                        </Tooltip>
                        <Tooltip label="Sil">
                          <IconButton
                            aria-label="Sil"
                            icon={<Trash2 />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                          />
                        </Tooltip>
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
              icon={<ChevronLeft />}
              size="sm"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            />
            <Text fontSize="sm" color={textColor}>
              {currentPage} / {totalPages}
            </Text>
            <IconButton
              aria-label="Sonraki sayfa"
              icon={<ChevronRight />}
              size="sm"
              isDisabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            />
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default BrokerListings;