import { useState } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Table,
  Thead, Tbody, Tr, Th, Td, Button, Flex, Icon, Input, InputGroup,
  InputLeftElement, Menu, MenuButton, MenuList, MenuItem, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Badge, Avatar, Text, HStack, VStack, Card, CardBody,
  FormControl, FormLabel, Select, Textarea, Divider, SimpleGrid,
  IconButton, Tooltip, useColorModeValue, Portal
} from '@chakra-ui/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MessageSquare, Home, Calendar, MapPin, MoreHorizontal, FileText } from 'react-feather';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';
import AIMatching from './AIMatching';

// Dummy data for demonstration
const dummyCustomers = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    phone: '0532 123 4567',
    email: 'ahmet.yilmaz@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '1.500.000 TL - 2.000.000 TL',
    preferences: '3+1, Merkez veya Göztepe',
    lastContact: '15.07.2023',
    notes: 'Acil ev arıyor, 2 hafta içinde taşınmak istiyor.',
  },
  {
    id: 2,
    name: 'Ayşe Demir',
    phone: '0533 456 7890',
    email: 'ayse.demir@example.com',
    status: 'Aktif',
    type: 'Satıcı',
    budget: '-',
    preferences: 'Ataşehir, 2+1 Daire',
    lastContact: '10.08.2023',
    notes: 'Evini satmak istiyor, değerleme yapıldı.',
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    phone: '0535 789 0123',
    email: 'mehmet.kaya@example.com',
    status: 'Pasif',
    type: 'Kiracı',
    budget: '8.000 TL - 12.000 TL/ay',
    preferences: 'Bahçelievler, 3+1 veya 4+1',
    lastContact: '01.06.2023',
    notes: 'Şu an için erteledi, 3 ay sonra tekrar aranacak.',
  },
  {
    id: 4,
    name: 'Zeynep Şahin',
    phone: '0536 234 5678',
    email: 'zeynep.sahin@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '3.000.000 TL - 4.500.000 TL',
    preferences: 'Göztepe, Villa veya Bahçeli Ev',
    lastContact: '20.07.2023',
    notes: 'Lüks konut arıyor, bütçesi esnek.',
  },
];

const CustomerManagement = () => {
  const [customers, setCustomers] = useState(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const [historyType, setHistoryType] = useState<'meetings' | 'properties'>('meetings');
  const { isOpen: isEditHistoryOpen, onOpen: onEditHistoryOpen, onClose: onEditHistoryClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [meetings, setMeetings] = useState([
    { id: 1, date: '15.07.2023', type: 'Telefon', notes: 'Müşteri ile ilk görüşme yapıldı, ihtiyaçları belirlendi.' },
    { id: 2, date: '20.07.2023', type: 'E-posta', notes: 'Müşteriye uygun ilanlar gönderildi.' },
    { id: 3, date: '25.07.2023', type: 'Yüz Yüze', notes: 'Göztepe\'deki daireyi gösterdik, beğendi ancak fiyatı yüksek buldu.' },
    { id: 4, date: '01.08.2023', type: 'Telefon', notes: 'Fiyat düşüşü hakkında bilgilendirme yapıldı, tekrar düşünecek.' }
  ]);
  const [properties, setProperties] = useState([
    { id: 1, date: '20.07.2023', property: 'Merkez Mah. 3+1 Daire', status: 'Gösterildi', notes: 'Beğendi, düşünecek.' },
    { id: 2, date: '25.07.2023', property: 'Göztepe Deniz Manzaralı', status: 'Gösterildi', notes: 'Çok beğendi, fiyat pazarlığı yapılacak.' },
    { id: 3, date: '01.08.2023', property: 'Bahçelievler 2+1', status: 'Önerildi', notes: 'Henüz gösterilmedi.' }
  ]);

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerFormOpen(true);
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerFormOpen(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    onDetailOpen();
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const handleAIMatching = (customer: any) => {
    setSelectedCustomer(customer);
    onAIOpen();
  };

  const handleViewHistory = (customer: any, type: 'meetings' | 'properties') => {
    setSelectedCustomer(customer);
    setHistoryType(type);
    onHistoryOpen();
  };

  const handleAddDocument = (customer: any) => {
    setSelectedCustomer(customer);
    setActiveTab(2); // Belgeler sekmesini aç
    onDetailOpen();
  };

  const handleEditHistoryItem = (item: any) => {
    setEditingItem(item);
    onEditHistoryOpen();
  };

  const handleDeleteHistoryItem = (id: number) => {
    if (historyType === 'meetings') {
      setMeetings(meetings.filter(m => m.id !== id));
    } else {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    onEditHistoryOpen();
  };

  const handleSaveHistoryItem = () => {
    const form = document.querySelector('.history-form');
    const formData = new FormData(form);
    
    if (historyType === 'meetings') {
      const newMeeting = {
        id: editingItem ? editingItem.id : Date.now(),
        date: new Date(formData.get('date')).toLocaleDateString('tr-TR'),
        type: formData.get('type'),
        notes: formData.get('notes')
      };
      
      if (editingItem) {
        setMeetings(meetings.map(m => m.id === editingItem.id ? newMeeting : m));
      } else {
        setMeetings([...meetings, newMeeting]);
      }
    } else {
      const newProperty = {
        id: editingItem ? editingItem.id : Date.now(),
        date: new Date(formData.get('date')).toLocaleDateString('tr-TR'),
        property: formData.get('property'),
        status: formData.get('status'),
        notes: formData.get('notes') || ''
      };
      
      if (editingItem) {
        setProperties(properties.map(p => p.id === editingItem.id ? newProperty : p));
      } else {
        setProperties([...properties, newProperty]);
      }
    }
    
    onEditHistoryClose();
  };

  // Filtreleme fonksiyonları
  const getFilteredCustomers = () => {
    let filtered = customers;
    
    // Arama terimine göre filtrele
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aktif sekmeye göre filtrele
    switch (activeTab) {
      case 0: // Tüm Müşteriler
        return filtered;
      case 1: // Alıcılar
        return filtered.filter(customer => customer.type === 'Alıcı');
      case 2: // Satıcılar
        return filtered.filter(customer => customer.type === 'Satıcı');
      case 3: // Kiracılar
        return filtered.filter(customer => customer.type === 'Kiracı');
      case 4: // Pasif Müşteriler
        return filtered.filter(customer => customer.status === 'Pasif');
      default:
        return filtered;
    }
  };

  const filteredCustomers = getFilteredCustomers();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box p={{ base: '4', md: '6' }} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color={useColorModeValue('gray.800', 'white')}>
            Müşteri Yönetimi
          </Heading>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={Plus} />}
            onClick={handleAddCustomer}
            size="lg"
            borderRadius="xl"
            px={6}
          >
            Yeni Müşteri
          </Button>
        </Flex>

        {/* Search and Filter Bar */}
        <Card bg={cardBg} shadow="sm" borderRadius="xl">
          <CardBody>
            <Flex gap={4} align="center" flexWrap="wrap">
              <InputGroup maxW="400px" flex={1}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Müşteri ara (isim, telefon, email)..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="lg"
                  bg={useColorModeValue('white', 'gray.600')}
                />
              </InputGroup>
              
              <Menu strategy="fixed">
                  <MenuButton as={Button} rightIcon={<Filter />} variant="outline" size="sm">
                    Filtrele
                  </MenuButton>
                  <Portal>
                    <MenuList zIndex={9999}>
                    <MenuItem>İsme Göre (A-Z)</MenuItem>
                    <MenuItem>İsme Göre (Z-A)</MenuItem>
                    <MenuItem>Son İletişime Göre</MenuItem>
                    <MenuItem>Müşteri Tipine Göre</MenuItem>
                    </MenuList>
                  </Portal>
              </Menu>
            </Flex>
          </CardBody>
        </Card>
      
        {/* Tabs */}
        <Tabs variant="soft-rounded" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
          <TabList bg={cardBg} p={2} borderRadius="xl" shadow="sm">
            <Tab borderRadius="lg" fontWeight="medium">Tümü ({customers.length})</Tab>
            <Tab borderRadius="lg" fontWeight="medium">Alıcılar ({customers.filter(c => c.type === 'Alıcı').length})</Tab>
            <Tab borderRadius="lg" fontWeight="medium">Satıcılar ({customers.filter(c => c.type === 'Satıcı').length})</Tab>
            <Tab borderRadius="lg" fontWeight="medium">Kiracılar ({customers.filter(c => c.type === 'Kiracı').length})</Tab>
            <Tab borderRadius="lg" fontWeight="medium">Pasif ({customers.filter(c => c.status === 'Pasif').length})</Tab>
          </TabList>
        
          <TabPanels>
            {/* Tüm Müşteriler */}
            <TabPanel p={0} pt={6}>
              {filteredCustomers.length === 0 ? (
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody py={12} textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Bu kategoride müşteri bulunmuyor.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                  {filteredCustomers.map((customer) => (
                      <Card key={customer.id} bg={cardBg} shadow="sm" borderRadius="xl" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="visible">
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4}>
                            {/* Müşteri Bilgileri */}
                            <Flex justify="space-between" align="start">
                              <HStack spacing={3}>
                                <Avatar size="md" name={customer.name} />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="bold" fontSize="lg">{customer.name}</Text>
                                  <HStack spacing={2}>
                                    <Badge
                                      colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                                      borderRadius="full"
                                      px={2}
                                    >
                                      {customer.status}
                                    </Badge>
                                    <Badge
                                      colorScheme={
                                        customer.type === 'Alıcı' ? 'blue' :
                                        customer.type === 'Satıcı' ? 'green' : 'purple'
                                      }
                                      borderRadius="full"
                                      px={2}
                                    >
                                      {customer.type}
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </HStack>
                              
                              {/* Dropdown Menu */}
                              <Menu strategy="fixed">
                                <MenuButton as={IconButton} icon={<MoreHorizontal />} variant="ghost" size="sm" borderRadius="full" />
                                <Portal>
                                   <MenuList zIndex={9999}>
                                    <MenuItem icon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                                      Görüntüle
                                    </MenuItem>
                                    <MenuItem icon={<Edit />} onClick={() => handleEditCustomer(customer)}>
                                      Düzenle
                                    </MenuItem>
                                    <MenuItem icon={<Calendar />} onClick={() => handleViewHistory(customer, 'meetings')}>
                                      Görüşme Geçmişi
                                    </MenuItem>
                                    <MenuItem icon={<MapPin />} onClick={() => handleViewHistory(customer, 'properties')}>
                                      Gayrimenkul Geçmişi
                                    </MenuItem>
                                    <MenuItem icon={<FileText />} onClick={() => handleAddDocument(customer)}>
                                      Belge Ekle
                                    </MenuItem>
                                    {customer.type === 'Alıcı' && (
                                      <MenuItem icon={<Home />} onClick={() => handleAIMatching(customer)}>
                                        AI Eşleştirme
                                      </MenuItem>
                                    )}
                                    <Divider />
                                    <MenuItem icon={<Trash2 />} color="red.500" onClick={() => handleDeleteCustomer(customer.id)}>
                                      Sil
                                    </MenuItem>
                                  </MenuList>
                                </Portal>
                              </Menu>
                            </Flex>
                            
                            {/* İletişim Bilgileri */}
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.600">{customer.phone}</Text>
                              <Text fontSize="sm" color="gray.600">{customer.email}</Text>
                            </VStack>
                            
                            {/* Bütçe ve Tercihler */}
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.800', 'gray.200')}>
                                {customer.budget}
                              </Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                {customer.preferences}
                              </Text>
                            </VStack>
                            
                            {/* Son İletişim */}
                            <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                              <Text fontSize="xs" color="gray.500">
                                Son İletişim: {customer.lastContact}
                              </Text>
                            </Flex>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            
            {/* Alıcılar */}
            <TabPanel p={0} pt={6}>
              {filteredCustomers.length === 0 ? (
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody py={12} textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Bu kategoride müşteri bulunmuyor.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} bg={cardBg} shadow="sm" borderRadius="xl" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="visible">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">{customer.name}</Text>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.status}
                                  </Badge>
                                  <Badge
                                    colorScheme={
                                      customer.type === 'Alıcı' ? 'blue' :
                                      customer.type === 'Satıcı' ? 'green' : 'purple'
                                    }
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.type}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                            
                            {/* Dropdown Menu */}
                            <Menu strategy="fixed">
                                <MenuButton as={IconButton} icon={<MoreHorizontal />} variant="ghost" size="sm" borderRadius="full" />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={() => handleEditCustomer(customer)}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={() => handleViewHistory(customer, 'meetings')}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={() => handleViewHistory(customer, 'properties')}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={() => handleAddDocument(customer)}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={() => handleAIMatching(customer)}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={() => handleDeleteCustomer(customer.id)}>
                                    Sil
                                  </MenuItem>
                                  </MenuList>
                                </Portal>
                            </Menu>
                          </Flex>
                          
                          {/* İletişim Bilgileri */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600">{customer.phone}</Text>
                            <Text fontSize="sm" color="gray.600">{customer.email}</Text>
                          </VStack>
                          
                          {/* Bütçe ve Tercihler */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.800', 'gray.200')}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Son İletişim */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <Text fontSize="xs" color="gray.500">
                              Son İletişim: {customer.lastContact}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
            
            {/* Satıcılar */}
            <TabPanel p={0} pt={6}>
              {filteredCustomers.length === 0 ? (
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody py={12} textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Bu kategoride müşteri bulunmuyor.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} bg={cardBg} shadow="sm" borderRadius="xl" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="visible">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">{customer.name}</Text>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.status}
                                  </Badge>
                                  <Badge
                                    colorScheme={
                                      customer.type === 'Alıcı' ? 'blue' :
                                      customer.type === 'Satıcı' ? 'green' : 'purple'
                                    }
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.type}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                            
                            {/* Dropdown Menu */}
                            <Menu strategy="fixed">
                                <MenuButton as={IconButton} icon={<MoreHorizontal />} variant="ghost" size="sm" borderRadius="full" />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={() => handleEditCustomer(customer)}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={() => handleViewHistory(customer, 'meetings')}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={() => handleViewHistory(customer, 'properties')}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={() => handleAddDocument(customer)}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={() => handleAIMatching(customer)}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={() => handleDeleteCustomer(customer.id)}>
                                    Sil
                                  </MenuItem>
                                  </MenuList>
                                </Portal>
                              </Menu>
                          </Flex>
                          
                          {/* İletişim Bilgileri */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600">{customer.phone}</Text>
                            <Text fontSize="sm" color="gray.600">{customer.email}</Text>
                          </VStack>
                          
                          {/* Bütçe ve Tercihler */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.800', 'gray.200')}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Son İletişim */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <Text fontSize="xs" color="gray.500">
                              Son İletişim: {customer.lastContact}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
            
            {/* Kiracılar */}
            <TabPanel p={0} pt={6}>
              {filteredCustomers.length === 0 ? (
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody py={12} textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Bu kategoride müşteri bulunmuyor.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} bg={cardBg} shadow="sm" borderRadius="xl" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="visible">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">{customer.name}</Text>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.status}
                                  </Badge>
                                  <Badge
                                    colorScheme={
                                      customer.type === 'Alıcı' ? 'blue' :
                                      customer.type === 'Satıcı' ? 'green' : 'purple'
                                    }
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.type}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                            
                            {/* Dropdown Menu */}
                            <Menu strategy="fixed">
                                <MenuButton as={IconButton} icon={<MoreHorizontal />} variant="ghost" size="sm" borderRadius="full" />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={() => handleEditCustomer(customer)}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={() => handleViewHistory(customer, 'meetings')}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={() => handleViewHistory(customer, 'properties')}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={() => handleAddDocument(customer)}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={() => handleAIMatching(customer)}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={() => handleDeleteCustomer(customer.id)}>
                                    Sil
                                  </MenuItem>
                                  </MenuList>
                                </Portal>
                            </Menu>
                          </Flex>
                          
                          {/* İletişim Bilgileri */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600">{customer.phone}</Text>
                            <Text fontSize="sm" color="gray.600">{customer.email}</Text>
                          </VStack>
                          
                          {/* Bütçe ve Tercihler */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.800', 'gray.200')}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Son İletişim */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <Text fontSize="xs" color="gray.500">
                              Son İletişim: {customer.lastContact}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
            
            {/* Pasif Müşteriler */}
            <TabPanel p={0} pt={6}>
              {filteredCustomers.length === 0 ? (
                <Card bg={cardBg} shadow="sm" borderRadius="xl">
                  <CardBody py={12} textAlign="center">
                    <Text color="gray.500" fontSize="lg">
                      {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Bu kategoride müşteri bulunmuyor.'}
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} bg={cardBg} shadow="sm" borderRadius="xl" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" overflow="visible">
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">{customer.name}</Text>
                                <HStack spacing={2}>
                                  <Badge
                                    colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.status}
                                  </Badge>
                                  <Badge
                                    colorScheme={
                                      customer.type === 'Alıcı' ? 'blue' :
                                      customer.type === 'Satıcı' ? 'green' : 'purple'
                                    }
                                    borderRadius="full"
                                    px={2}
                                  >
                                    {customer.type}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                            
                            {/* Dropdown Menu */}
                            <Menu strategy="fixed">
                              <MenuButton as={IconButton} icon={<MoreHorizontal />} variant="ghost" size="sm" borderRadius="full" />
                              <Portal>
                                <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={() => handleViewCustomer(customer)}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={() => handleEditCustomer(customer)}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={() => handleViewHistory(customer, 'meetings')}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={() => handleViewHistory(customer, 'properties')}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={() => handleAddDocument(customer)}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={() => handleAIMatching(customer)}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={() => handleDeleteCustomer(customer.id)}>
                                    Sil
                                  </MenuItem>
                                </MenuList>
                              </Portal>
                            </Menu>
                          </Flex>
                          
                          {/* İletişim Bilgileri */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" color="gray.600">{customer.phone}</Text>
                            <Text fontSize="sm" color="gray.600">{customer.email}</Text>
                          </VStack>
                          
                          {/* Bütçe ve Tercihler */}
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.800', 'gray.200')}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Son İletişim */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <Text fontSize="xs" color="gray.500">
                              Son İletişim: {customer.lastContact}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          </TabPanels>
         </Tabs>
       </VStack>

      {/* Modern Customer Form Modal */}
      <Modal isOpen={isCustomerFormOpen} onClose={() => { setIsCustomerFormOpen(false); setSelectedCustomer(null); }} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={borderColor} pb={4}>
            <Text fontSize="lg" fontWeight="600">
              {selectedCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5}>
              <Input 
                placeholder="Ad Soyad" 
                defaultValue={selectedCustomer?.name || ''}
                size="lg"
                borderRadius="lg"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
              />
              <SimpleGrid columns={2} spacing={4} w="full">
                <Input 
                  placeholder="Telefon" 
                  defaultValue={selectedCustomer?.phone || ''}
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
                <Input 
                  placeholder="E-posta" 
                  defaultValue={selectedCustomer?.email || ''}
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Select 
                  placeholder="Müşteri Tipi" 
                  defaultValue={selectedCustomer?.type || ''}
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                >
                  <option value="Alıcı">Alıcı</option>
                  <option value="Satıcı">Satıcı</option>
                  <option value="Kiracı">Kiracı</option>
                  <option value="Pasif">Pasif Müşteri</option>
                </Select>
                <Input 
                  placeholder="Bütçe" 
                  defaultValue={selectedCustomer?.budget || ''}
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </SimpleGrid>
              <Textarea 
                placeholder="Tercihler ve notlar..." 
                defaultValue={selectedCustomer?.preferences || selectedCustomer?.notes || ''}
                size="lg"
                borderRadius="lg"
                resize="none"
                rows={3}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => { setIsCustomerFormOpen(false); setSelectedCustomer(null); }}
              borderRadius="lg"
            >
              İptal
            </Button>
            <Button 
              colorScheme="blue" 
              borderRadius="lg"
              px={6}
            >
              {selectedCustomer ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Customer Detail Modal with CustomerDetail Component */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="6xl">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} borderRadius="xl" boxShadow="xl" maxH="90vh">
          <ModalHeader borderBottom="1px" borderColor={borderColor} pb={4}>
            <Text fontSize="lg" fontWeight="600">Müşteri Detayları</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={0} overflow="hidden">
            {selectedCustomer && (
              <CustomerDetail 
                customer={selectedCustomer} 
                activeTab={activeTab} 
                autoOpenDocumentModal={activeTab === 2}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modern AI Matching Modal */}
      <Modal isOpen={isAIOpen} onClose={onAIClose} size="xl">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={borderColor} pb={4}>
            <Text fontSize="lg" fontWeight="600">AI İlan Eşleştirme</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedCustomer && (
              <VStack spacing={6}>
                <HStack spacing={4} w="full">
                  <Avatar size="lg" name={selectedCustomer.name} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="lg" fontWeight="600">{selectedCustomer.name}</Text>
                    <Text color="gray.600">için uygun ilanlar aranıyor...</Text>
                  </VStack>
                </HStack>
                
                <Card w="full" bg={useColorModeValue('blue.50', 'blue.900')} borderColor="blue.200">
                  <CardBody>
                    <VStack spacing={3} align="start">
                      <Text fontWeight="600" color="blue.600">🤖 AI Eşleştirme Sistemi</Text>
                      <Text color="gray.600">
                        Yapay zeka teknolojisi kullanılarak müşteri tercihlerine en uygun gayrimenkul ilanları bulunacak.
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Bu özellik yakında aktif olacak.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
            <Button 
              onClick={onAIClose}
              borderRadius="lg"
              px={6}
            >
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modern History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg={cardBg} borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={borderColor} pb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="600">
                {historyType === 'meetings' ? 'Görüşme Geçmişi' : 'Gösterilen Gayrimenkuller'}
              </Text>
              <Text fontSize="sm" color="gray.600">{selectedCustomer?.name}</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
             {selectedCustomer && (
               <VStack spacing={6}>
                 <Button
                   colorScheme="blue"
                   leftIcon={<Icon as={Plus} />}
                   onClick={handleAddNew}
                   alignSelf="flex-start"
                   borderRadius="lg"
                   px={6}
                 >
                   Yeni {historyType === 'meetings' ? 'Görüşme' : 'Gayrimenkul'} Ekle
                 </Button>
                 
                 {historyType === 'meetings' ? (
                   <VStack spacing={4} w="full">
                     {meetings.map((meeting) => (
                       <Card key={meeting.id} w="full" _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all 0.2s">
                         <CardBody>
                           <Flex justifyContent="space-between" alignItems="start">
                             <VStack align="start" spacing={2} flex={1}>
                               <HStack spacing={3}>
                                 <Text fontWeight="600" fontSize="lg">{meeting.date}</Text>
                                 <Badge 
                                   colorScheme="blue"
                                   borderRadius="full"
                                   px={3}
                                   py={1}
                                 >
                                   {meeting.type}
                                 </Badge>
                               </HStack>
                               <Text fontSize="sm" color="gray.500">
                                 {meeting.notes}
                               </Text>
                             </VStack>
                             <HStack spacing={2}>
                               <Tooltip label="Düzenle">
                                 <IconButton
                                   size="sm"
                                   variant="ghost"
                                   icon={<Icon as={Edit} />}
                                   onClick={() => handleEditHistoryItem(meeting)}
                                   borderRadius="lg"
                                 />
                               </Tooltip>
                               <Tooltip label="Sil">
                                 <IconButton
                                   size="sm"
                                   variant="ghost"
                                   colorScheme="red"
                                   icon={<Icon as={Trash2} />}
                                   onClick={() => handleDeleteHistoryItem(meeting.id)}
                                   borderRadius="lg"
                                 />
                               </Tooltip>
                             </HStack>
                           </Flex>
                         </CardBody>
                       </Card>
                     ))}
                   </VStack>
                 ) : (
                   <VStack spacing={4} w="full">
                     {properties.map((property) => (
                       <Card key={property.id} w="full" _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }} transition="all 0.2s">
                         <CardBody>
                           <Flex justifyContent="space-between" alignItems="start">
                             <VStack align="start" spacing={2} flex={1}>
                               <HStack spacing={3}>
                                 <Text fontWeight="600" fontSize="lg">{property.date}</Text>
                                 <Badge 
                                   colorScheme={property.status === 'Gösterildi' ? 'green' : 'blue'}
                                   borderRadius="full"
                                   px={3}
                                   py={1}
                                 >
                                   {property.status}
                                 </Badge>
                               </HStack>
                               <Text color="gray.600" fontWeight="500">
                                 {property.property}
                               </Text>
                               {property.notes && (
                                 <Text fontSize="sm" color="gray.500">
                                   {property.notes}
                                 </Text>
                               )}
                             </VStack>
                             <HStack spacing={2}>
                               <Tooltip label="Düzenle">
                                 <IconButton
                                   size="sm"
                                   variant="ghost"
                                   icon={<Icon as={Edit} />}
                                   onClick={() => handleEditHistoryItem(property)}
                                   borderRadius="lg"
                                 />
                               </Tooltip>
                               <Tooltip label="Sil">
                                 <IconButton
                                   size="sm"
                                   variant="ghost"
                                   colorScheme="red"
                                   icon={<Icon as={Trash2} />}
                                   onClick={() => handleDeleteHistoryItem(property.id)}
                                   borderRadius="lg"
                                 />
                               </Tooltip>
                             </HStack>
                           </Flex>
                         </CardBody>
                       </Card>
                     ))}
                   </VStack>
                 )}
               </VStack>
             )}
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onHistoryClose}
              borderRadius="lg"
              px={6}
            >
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
       </Modal>

       {/* Modern Edit/Add History Item Modal */}
       <Modal isOpen={isEditHistoryOpen} onClose={onEditHistoryClose} size="md">
         <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
         <ModalContent bg={cardBg} borderRadius="xl" boxShadow="xl">
           <ModalHeader borderBottom="1px" borderColor={borderColor} pb={4}>
             <Text fontSize="lg" fontWeight="600">
               {editingItem ? 'Düzenle' : 'Yeni Ekle'} - {historyType === 'meetings' ? 'Görüşme' : 'Gayrimenkul'}
             </Text>
           </ModalHeader>
           <ModalCloseButton />
           <ModalBody py={6}>
             <form className="history-form">
               {historyType === 'meetings' ? (
                 <VStack spacing={5}>
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Tarih</FormLabel>
                     <Input
                       name="date"
                       type="date"
                       defaultValue={editingItem?.date ? new Date(editingItem.date.split('.').reverse().join('-')).toISOString().split('T')[0] : ''}
                       size="lg"
                       borderRadius="lg"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     />
                   </FormControl>
                   
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Görüşme Türü</FormLabel>
                     <Select 
                       name="type" 
                       defaultValue={editingItem?.type || ''}
                       size="lg"
                       borderRadius="lg"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     >
                       <option value="">Seçiniz</option>
                       <option value="Telefon">📞 Telefon</option>
                       <option value="E-posta">📧 E-posta</option>
                       <option value="Yüz Yüze">👥 Yüz Yüze</option>
                       <option value="WhatsApp">💬 WhatsApp</option>
                     </Select>
                   </FormControl>
                   
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Notlar</FormLabel>
                     <Textarea
                       name="notes"
                       defaultValue={editingItem?.notes || ''}
                       placeholder="Görüşme detaylarını yazın..."
                       rows={4}
                       size="lg"
                       borderRadius="lg"
                       resize="none"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     />
                   </FormControl>
                 </VStack>
               ) : (
                 <VStack spacing={5}>
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Tarih</FormLabel>
                     <Input
                       name="date"
                       type="date"
                       defaultValue={editingItem?.date ? new Date(editingItem.date.split('.').reverse().join('-')).toISOString().split('T')[0] : ''}
                       size="lg"
                       borderRadius="lg"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     />
                   </FormControl>
                   
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Gayrimenkul</FormLabel>
                     <Input
                       name="property"
                       defaultValue={editingItem?.property || ''}
                       placeholder="Gayrimenkul adı ve açıklaması"
                       size="lg"
                       borderRadius="lg"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     />
                   </FormControl>
                   
                   <FormControl isRequired>
                     <FormLabel fontWeight="600">Durum</FormLabel>
                     <Select 
                       name="status" 
                       defaultValue={editingItem?.status || ''}
                       size="lg"
                       borderRadius="lg"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     >
                       <option value="">Seçiniz</option>
                       <option value="Önerildi">💡 Önerildi</option>
                       <option value="Gösterildi">👁️ Gösterildi</option>
                       <option value="Beğenildi">❤️ Beğenildi</option>
                       <option value="Reddedildi">❌ Reddedildi</option>
                     </Select>
                   </FormControl>
                   
                   <FormControl>
                     <FormLabel fontWeight="600">Notlar</FormLabel>
                     <Textarea
                       name="notes"
                       defaultValue={editingItem?.notes || ''}
                       placeholder="Gayrimenkul hakkında notlar..."
                       rows={4}
                       size="lg"
                       borderRadius="lg"
                       resize="none"
                       _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                     />
                   </FormControl>
                 </VStack>
               )}
             </form>
           </ModalBody>
           <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
             <Button 
               variant="ghost" 
               mr={3} 
               onClick={onEditHistoryClose}
               borderRadius="lg"
             >
               İptal
             </Button>
             <Button 
               colorScheme="blue" 
               onClick={handleSaveHistoryItem}
               borderRadius="lg"
               px={6}
             >
               {editingItem ? 'Güncelle' : 'Kaydet'}
             </Button>
           </ModalFooter>
         </ModalContent>
       </Modal>
     </Box>
   );
 };

export default CustomerManagement;