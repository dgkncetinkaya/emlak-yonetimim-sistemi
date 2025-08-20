import { useState } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid,
  Button, Flex, Icon, Input, InputGroup, InputLeftElement, Select,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Spinner, Text,
  Card, CardBody, VStack, HStack, Badge, useColorModeValue, FormControl, FormLabel
} from '@chakra-ui/react';
import { Plus, Search, Filter, Map, List } from 'react-feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '../../lib/api';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyDetail from './PropertyDetail';
import AITextGenerator from './AITextGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import MapView from './MapView';

const formatPropertyForCard = (property: any) => ({
  id: property.id,
  title: property.title,
  price: `${property.price.toLocaleString()} TL`,
  location: property.address,
  type: property.status === 'for_sale' ? 'Satılık' : property.status === 'for_rent' ? 'Kiralık' : 'Bilinmiyor',
  size: `${property.area}m²`,
  rooms: property.rooms,
  status: property.status === 'inactive' ? 'Pasif' : 'Aktif',
  image: property.images && property.images.length > 0 ? property.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZWRmMmYyIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIiBmb250LXNpemU9IjE2Ij5QbGFjZWhvbGRlciBJbWFnZTwvdGV4dD4KPHN2Zz4=',
  date: new Date(property.createdAt).toLocaleDateString('tr-TR'),
});

const PortfolioManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();
  const { isOpen: isQROpen, onOpen: onQROpen, onClose: onQRClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const api = useAuthApi();
  const queryClient = useQueryClient();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)');

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/api/properties');
      return response.properties;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.del(`/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });

  const getFilteredProperties = () => {
    let filtered = properties;
    
    if (activeTab === 1) {
      filtered = properties.filter((p: any) => p.status === 'for_sale');
    } else if (activeTab === 2) {
      filtered = properties.filter((p: any) => p.status === 'for_rent');
    } else if (activeTab === 3) {
      filtered = properties.filter((p: any) => p.status === 'inactive');
    }
    
    if (searchTerm) {
      filtered = filtered.filter((p: any) => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getTabCount = (status?: string) => {
    if (!status) return properties.length;
    return properties.filter((p: any) => p.status === status).length;
  };

  const filteredProperties = getFilteredProperties();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProperty = () => {
    setSelectedProperty(null);
    onOpen();
  };

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    onOpen();
  };

  const handleDeleteProperty = (property: any) => {
    setSelectedProperty(property);
    onDeleteOpen();
  };

  const confirmDeletion = () => {
    if (selectedProperty) {
      deleteMutation.mutate(selectedProperty.id);
      onDeleteClose();
    }
  };

  const handleGenerateAIText = (property: any) => {
    setSelectedProperty(property);
    onAIOpen();
  };

  const handleGenerateQRCode = (property: any) => {
    setSelectedProperty(property);
    onQROpen();
  };

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    onDetailOpen();
  };

  // İlan durumu değiştirme fonksiyonları
  const handleDeactivateProperty = (property: any) => {
    setSelectedProperty(property);
    setDeactivationReason('');
    onDeactivateOpen();
  };

  const confirmDeactivation = () => {
    if (!deactivationReason) {
      alert('Lütfen pasife alma nedenini seçiniz.');
      return;
    }
    
    // API çağrısı yapılacak
    console.log(`${selectedProperty.title} pasife alındı. Neden: ${deactivationReason}`);
    // Geçici olarak state güncellemesi
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    onDeactivateClose();
  };

  const handleActivateProperty = (property: any) => {
    const confirmed = confirm(`"${property.title}" ilanını aktife almak istediğinizden emin misiniz?`);
    
    if (confirmed) {
      // API çağrısı yapılacak
      console.log(`${property.title} aktife alındı.`);
      // Geçici olarak state güncellemesi
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  };

  return (
    <Box p={8} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color={useColorModeValue('gray.800', 'white')}>
            Portföy Yönetimi
          </Heading>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={Plus} />}
            onClick={handleAddProperty}
            borderRadius="lg"
            size="lg"
          >
            Yeni İlan
          </Button>
        </Flex>

        {/* Search and Filter Bar */}
        <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
          <CardBody>
            <Flex gap={4} align="center" flexWrap="wrap">
              <InputGroup maxW="400px" flex="1">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="İlan ara..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  borderRadius="lg"
                />
              </InputGroup>
              
              <Menu>
                <MenuButton as={Button} rightIcon={<Filter />} variant="outline" borderRadius="lg">
                  Filtrele
                </MenuButton>
                <MenuList>
                  <MenuItem>Fiyata Göre (Artan)</MenuItem>
                  <MenuItem>Fiyata Göre (Azalan)</MenuItem>
                  <MenuItem>Tarihe Göre (Yeni)</MenuItem>
                  <MenuItem>Tarihe Göre (Eski)</MenuItem>
                </MenuList>
              </Menu>
              
              <Select placeholder="Tüm Bölgeler" maxW="200px" borderRadius="lg">
                <option value="merkez">Merkez</option>
                <option value="goztepe">Göztepe</option>
                <option value="bahcelievler">Bahçelievler</option>
                <option value="atasehir">Ataşehir</option>
              </Select>

              <Flex gap={2}>
                <Button
                  variant={view === 'grid' ? 'solid' : 'outline'}
                  leftIcon={<Icon as={List} />}
                  onClick={() => setView('grid')}
                  borderRadius="lg"
                >
                  Liste
                </Button>
                <Button
                  variant={view === 'map' ? 'solid' : 'outline'}
                  leftIcon={<Icon as={Map} />}
                  onClick={() => setView('map')}
                  borderRadius="lg"
                >
                  Harita
                </Button>
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList bg={bgColor} borderRadius="xl" p={2} shadow={`0 2px 8px ${shadowColor}`}>
            <Tab borderRadius="lg" _selected={{ bg: 'blue.500', color: 'white' }}>
              <HStack>
                <Text>Tüm İlanlar</Text>
                <Badge colorScheme="blue" borderRadius="full">{getTabCount()}</Badge>
              </HStack>
            </Tab>
            <Tab borderRadius="lg" _selected={{ bg: 'blue.500', color: 'white' }}>
              <HStack>
                <Text>Satılık</Text>
                <Badge colorScheme="green" borderRadius="full">{getTabCount('for_sale')}</Badge>
              </HStack>
            </Tab>
            <Tab borderRadius="lg" _selected={{ bg: 'blue.500', color: 'white' }}>
              <HStack>
                <Text>Kiralık</Text>
                <Badge colorScheme="orange" borderRadius="full">{getTabCount('for_rent')}</Badge>
              </HStack>
            </Tab>
            <Tab borderRadius="lg" _selected={{ bg: 'blue.500', color: 'white' }}>
              <HStack>
                <Text>Pasif İlanlar</Text>
                <Badge colorScheme="red" borderRadius="full">{getTabCount('inactive')}</Badge>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* All Properties */}
            <TabPanel p={0} pt={4}>
              {isLoading ? (
                <Flex justify="center" align="center" py={20}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : error ? (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody>
                    <Flex justify="center" align="center" py={10}>
                      <Text color="red.500" fontSize="lg">İlanlar yüklenemedi.</Text>
                    </Flex>
                  </CardBody>
                </Card>
              ) : view === 'grid' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProperties.map((property: any) => {
                    const card = formatPropertyForCard(property);
                    return (
                      <PropertyCard
                        key={card.id}
                        property={card}
                        onEdit={() => handleEditProperty(property)}
                        onDelete={() => handleDeleteProperty(property)}
                        onView={() => handleViewProperty(property)}
                        onGenerateAIText={() => handleGenerateAIText(property)}
                        onGenerateQRCode={() => handleGenerateQRCode(property)}
                        onDeactivate={property.status !== 'inactive' ? () => handleDeactivateProperty(property) : undefined}
                        onActivate={property.status === 'inactive' ? () => handleActivateProperty(property) : undefined}
                      />
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody p={0}>
                    <Box h="600px" borderRadius="xl" overflow="hidden">
                      <MapView properties={filteredProperties.map((p: any) => formatPropertyForCard(p))} />
                    </Box>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* For Sale Properties */}
            <TabPanel p={0} pt={4}>
              {isLoading ? (
                <Flex justify="center" align="center" py={20}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : error ? (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody>
                    <Flex justify="center" align="center" py={10}>
                      <Text color="red.500" fontSize="lg">İlanlar yüklenemedi.</Text>
                    </Flex>
                  </CardBody>
                </Card>
              ) : view === 'grid' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProperties.map((property: any) => {
                    const card = formatPropertyForCard(property);
                    return (
                      <PropertyCard
                        key={card.id}
                        property={card}
                        onEdit={() => handleEditProperty(property)}
                        onDelete={() => handleDeleteProperty(property)}
                        onView={() => handleViewProperty(property)}
                        onGenerateAIText={() => handleGenerateAIText(property)}
                        onGenerateQRCode={() => handleGenerateQRCode(property)}
                      />
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody p={0}>
                    <Box h="600px" borderRadius="xl" overflow="hidden">
                      <MapView properties={filteredProperties.map((p: any) => formatPropertyForCard(p))} />
                    </Box>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* For Rent Properties */}
            <TabPanel p={0} pt={4}>
              {isLoading ? (
                <Flex justify="center" align="center" py={20}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : error ? (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody>
                    <Flex justify="center" align="center" py={10}>
                      <Text color="red.500" fontSize="lg">İlanlar yüklenemedi.</Text>
                    </Flex>
                  </CardBody>
                </Card>
              ) : view === 'grid' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProperties.map((property: any) => {
                    const card = formatPropertyForCard(property);
                    return (
                      <PropertyCard
                        key={card.id}
                        property={card}
                        onEdit={() => handleEditProperty(property)}
                        onDelete={() => handleDeleteProperty(property)}
                        onView={() => handleViewProperty(property)}
                        onGenerateAIText={() => handleGenerateAIText(property)}
                        onGenerateQRCode={() => handleGenerateQRCode(property)}
                      />
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody p={0}>
                    <Box h="600px" borderRadius="xl" overflow="hidden">
                      <MapView properties={filteredProperties.map((p: any) => formatPropertyForCard(p))} />
                    </Box>
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* Inactive Properties */}
            <TabPanel p={0} pt={4}>
              {isLoading ? (
                <Flex justify="center" align="center" py={20}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : error ? (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody>
                    <Flex justify="center" align="center" py={10}>
                      <Text color="red.500" fontSize="lg">İlanlar yüklenemedi.</Text>
                    </Flex>
                  </CardBody>
                </Card>
              ) : view === 'grid' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProperties.map((property: any) => {
                    const card = formatPropertyForCard(property);
                    return (
                      <PropertyCard
                        key={card.id}
                        property={card}
                        onEdit={() => handleEditProperty(card)}
                        onDelete={() => handleDeleteProperty(card)}
                        onView={() => handleViewProperty(card)}
                        onGenerateAIText={() => handleGenerateAIText(card)}
                        onGenerateQRCode={() => handleGenerateQRCode(card)}
                        onActivate={card.status === 'Pasif' ? () => handleActivateProperty(card) : undefined}
                      />
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Card bg={bgColor} shadow={`0 4px 12px ${shadowColor}`} borderRadius="xl">
                  <CardBody p={0}>
                    <Box h="600px" borderRadius="xl" overflow="hidden">
                      <MapView properties={filteredProperties.map((p: any) => formatPropertyForCard(p))} />
                    </Box>
                  </CardBody>
                </Card>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Property Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>
            {selectedProperty ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PropertyForm property={selectedProperty} onChange={(data) => setSelectedProperty((prev: any) => ({ ...(prev || {}), ...data }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">
              İptal
            </Button>
            <Button colorScheme="blue" borderRadius="lg" onClick={async () => {
              const payload: any = {
                title: selectedProperty?.title || '',
                type: selectedProperty?.type || 'for_sale',
                price: Number(selectedProperty?.price || 0),
                area: Number(selectedProperty?.size || 0),
                rooms: selectedProperty?.rooms || '',
                address: selectedProperty?.address || '',
                status: selectedProperty?.type || 'for_sale',
                description: selectedProperty?.description || '',
                images: selectedProperty?.images || [],
              };
              if (selectedProperty && selectedProperty.id) {
                await api.put(`/api/properties/${selectedProperty.id}`, payload);
              } else {
                await api.post('/api/properties', payload);
              }
              queryClient.invalidateQueries({ queryKey: ['properties'] });
              onClose();
            }}>
              {selectedProperty && selectedProperty.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Text Generator Modal */}
      <Modal isOpen={isAIOpen} onClose={onAIClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>AI İlan Metni Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AITextGenerator property={selectedProperty} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIClose} borderRadius="lg">
              Kapat
            </Button>
            <Button colorScheme="blue" borderRadius="lg">Metni Kullan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Code Generator Modal */}
      <Modal isOpen={isQROpen} onClose={onQRClose}>
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>QR Kod Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <QRCodeGenerator property={selectedProperty} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onQRClose} borderRadius="lg">
              Kapat
            </Button>
            <Button colorScheme="blue" borderRadius="lg">İndir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Property Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="6xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>İlan Detayı</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PropertyDetail property={selectedProperty} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose} borderRadius="lg">
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Pasife Alma Modal */}
      <Modal isOpen={isDeactivateOpen} onClose={onDeactivateClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>İlanı Pasife Al</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                <strong>{selectedProperty?.title}</strong> ilanını pasife almak istediğinizden emin misiniz?
              </Text>
              <FormControl isRequired>
                <FormLabel>Pasife alma nedeni:</FormLabel>
                <Select 
                  placeholder="Neden seçiniz..."
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                >
                  <option value="Satıldı/Kiralandı">Satıldı/Kiralandı</option>
                  <option value="Fiyat değişikliği gerekiyor">Fiyat değişikliği gerekiyor</option>
                  <option value="Müşteri talebi">Müşteri talebi</option>
                  <option value="Bakım/Onarım gerekiyor">Bakım/Onarım gerekiyor</option>
                  <option value="Geçici olarak pasife alındı">Geçici olarak pasife alındı</option>
                  <option value="Diğer">Diğer</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeactivateClose}>
              İptal
            </Button>
            <Button colorScheme="red" onClick={confirmDeactivation}>
              Pasife Al
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader color="red.500">
            İlan Silme Onayı
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>
                <strong>"{selectedProperty?.title}"</strong> ilanını silmek istediğinizden emin misiniz?
              </Text>
              <Text color="red.500" fontSize="sm">
                Bu işlem geri alınamaz ve ilan kalıcı olarak silinecektir.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              İptal
            </Button>
            <Button colorScheme="red" onClick={confirmDeletion}>
              Sil
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PortfolioManagement;