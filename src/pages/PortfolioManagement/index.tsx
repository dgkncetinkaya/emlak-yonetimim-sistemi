import { useState } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid,
  Button, Flex, Icon, Input, InputGroup, InputLeftElement, Select,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Spinner, Text
} from '@chakra-ui/react';
import { Plus, Search, Filter, Map, List, MoreVertical, Edit, Trash2, Eye } from 'react-feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthApi } from '../../lib/api';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
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
  status: 'Aktif',
  image: property.images && property.images.length > 0 ? property.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZWRmMmYyIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIiBmb250LXNpemU9IjE2Ij5QbGFjZWhvbGRlciBJbWFnZTwvdGV4dD4KPHN2Zz4=',
  date: new Date(property.createdAt).toLocaleDateString('tr-TR'),
});

const PortfolioManagement = () => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();
  const { isOpen: isQROpen, onOpen: onQROpen, onClose: onQRClose } = useDisclosure();
  
  const api = useAuthApi();
  const queryClient = useQueryClient();
  
  // Fetch properties
  const { data: propertiesData, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.get('/api/properties'),
  });
  
  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
  
  const properties = propertiesData?.properties || [];

  const handleAddProperty = () => {
    setSelectedProperty(null);
    onOpen();
  };

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    onOpen();
  };

  const handleDeleteProperty = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleGenerateAIText = (property: any) => {
    setSelectedProperty(property);
    onAIOpen();
  };

  const handleGenerateQRCode = (property: any) => {
    setSelectedProperty(property);
    onQROpen();
  };

  return (
    <Box pt="5" px={{ base: '4', md: '8' }}>
      <Heading mb="6" size="lg">Portföy Yönetimi</Heading>
      
      <Tabs variant="enclosed" mb="6">
        <TabList>
          <Tab>Tüm İlanlar</Tab>
          <Tab>Satılık</Tab>
          <Tab>Kiralık</Tab>
          <Tab>Pasif İlanlar</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Flex justifyContent="space-between" mb="4" flexWrap="wrap" gap="2">
              <Flex gap="2" flexWrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="İlan ara..." />
                </InputGroup>
                
                <Menu>
                  <MenuButton as={Button} rightIcon={<Filter />} variant="outline">
                    Filtrele
                  </MenuButton>
                  <MenuList>
                    <MenuItem>Fiyata Göre (Artan)</MenuItem>
                    <MenuItem>Fiyata Göre (Azalan)</MenuItem>
                    <MenuItem>Tarihe Göre (Yeni)</MenuItem>
                    <MenuItem>Tarihe Göre (Eski)</MenuItem>
                  </MenuList>
                </Menu>
                
                <Select placeholder="Tüm Bölgeler" maxW="200px">
                  <option value="merkez">Merkez</option>
                  <option value="goztepe">Göztepe</option>
                  <option value="bahcelievler">Bahçelievler</option>
                  <option value="atasehir">Ataşehir</option>
                </Select>
              </Flex>
              
              <Flex gap="2">
                <Button
                  variant={view === 'grid' ? 'solid' : 'outline'}
                  leftIcon={<Icon as={List} />}
                  onClick={() => setView('grid')}
                >
                  Liste
                </Button>
                <Button
                  variant={view === 'map' ? 'solid' : 'outline'}
                  leftIcon={<Icon as={Map} />}
                  onClick={() => setView('map')}
                >
                  Harita
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={Plus} />}
                  onClick={handleAddProperty}
                >
                  Yeni İlan
                </Button>
              </Flex>
            </Flex>
            
            {isLoading ? (
              <Flex justify="center" align="center" py={10}><Spinner /></Flex>
            ) : error ? (
              <Flex justify="center" align="center" py={10}><Text color="red.500">İlanlar yüklenemedi.</Text></Flex>
            ) : view === 'grid' ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
                {properties.map((property: any) => {
                  const card = formatPropertyForCard(property);
                  return (
                    <PropertyCard
                      key={card.id}
                      property={card}
                      onEdit={() => handleEditProperty(card)}
                      onDelete={() => handleDeleteProperty(card.id)}
                      onGenerateAIText={() => handleGenerateAIText(card)}
                      onGenerateQRCode={() => handleGenerateQRCode(card)}
                    />
                  );
                })}
              </SimpleGrid>
            ) : (
              <Box h="600px" borderRadius="md" overflow="hidden">
                <MapView properties={properties.map((p: any) => formatPropertyForCard(p))} />
              </Box>
            )}
          </TabPanel>
          
          <TabPanel>
            <Box>Satılık İlanlar İçeriği</Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Kiralık İlanlar İçeriği</Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Pasif İlanlar İçeriği</Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Property Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedProperty ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PropertyForm property={selectedProperty} onChange={(data) => setSelectedProperty((prev: any) => ({ ...(prev || {}), ...data }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={async () => {
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
        <ModalContent>
          <ModalHeader>AI İlan Metni Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AITextGenerator property={selectedProperty} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIClose}>
              Kapat
            </Button>
            <Button colorScheme="blue">Metni Kullan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* QR Code Generator Modal */}
      <Modal isOpen={isQROpen} onClose={onQRClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>QR Kod Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <QRCodeGenerator property={selectedProperty} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onQRClose}>
              Kapat
            </Button>
            <Button colorScheme="blue">İndir</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PortfolioManagement;