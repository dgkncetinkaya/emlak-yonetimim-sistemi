import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Table,
  Thead, Tbody, Tr, Th, Td, Button, Flex, Icon, Input, InputGroup,
  InputLeftElement, Menu, MenuButton, MenuList, MenuItem, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Badge, Avatar, Text, HStack, VStack, Card, CardBody,
  FormControl, FormLabel, Select, Textarea, Divider, SimpleGrid,
  IconButton, Tooltip, useColorModeValue, Portal, Stat, StatLabel,
  StatNumber, StatHelpText, ButtonGroup
} from '@chakra-ui/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MessageSquare, Home, Calendar, MapPin, MoreHorizontal, FileText, UserX, UserCheck, AlertTriangle, Clock, Users, TrendingUp, DollarSign } from 'react-feather';
import CustomerForm from './CustomerForm';
import AIMatching from './AIMatching';
import {
  getContactWarningLevel,
  getContactWarningMessage,
  getDaysSinceLastContact,
  isContactOverdue
} from '../../utils/customerUtils';
import { useAuth } from '../../context/AuthContext';



// Dummy data for demonstration
const dummyCustomers = [
  {
    id: 1,
    name: 'Emirhan Aşkayanar',
    phone: '0532 123 4567',
    email: 'ahmet.yilmaz@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '1.500.000 TL - 2.000.000 TL',
    budgetMin: 1500000,
    budgetMax: 2000000,
    preferences: '3+1, Merkez veya Göztepe',
    lastContact: '15.07.2023',
    notes: 'Acil ev arıyor, 2 hafta içinde taşınmak istiyor.',
    source: 'Referans'
  },
  {
    id: 2,
    name: 'Emin Gülertürk',
    phone: '0533 456 7890',
    email: 'ayse.demir@example.com',
    status: 'Aktif',
    type: 'Satıcı',
    budget: '-',
    budgetMin: 0,
    budgetMax: 0,
    preferences: 'Ataşehir, 2+1 Daire',
    lastContact: '10.08.2023',
    notes: 'Evini satmak istiyor, değerleme yapıldı.',
    source: 'Web Sitesi'
  },
  {
    id: 3,
    name: 'Selim Gülertürk',
    phone: '0535 789 0123',
    email: 'mehmet.kaya@example.com',
    status: 'Sürekli Pasif',
    type: 'Kiracı',
    budget: '8.000 TL - 12.000 TL/ay',
    budgetMin: 8000,
    budgetMax: 12000,
    preferences: 'Bahçelievler, 3+1 veya 4+1',
    lastContact: '01.06.2023',
    notes: 'Şu an için erteledi, 3 ay sonra tekrar aranacak.',
    source: 'Sosyal Medya'
  },
  {
    id: 4,
    name: 'Doğukan Çetinkaya',
    phone: '0536 234 5678',
    email: 'zeynep.sahin@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '3.000.000 TL - 4.500.000 TL',
    budgetMin: 3000000,
    budgetMax: 4500000,
    preferences: 'Göztepe, Villa veya Bahçeli Ev',
    lastContact: '20.07.2023',
    notes: 'Lüks konut arıyor, bütçesi esnek.',
    source: 'Referans'
  },
  {
    id: 5,
    name: ' Hasanım Çalımlı',
    phone: '0537 345 6789',
    email: 'mehmet.kaya2@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '2.500.000 TL - 3.500.000 TL',
    budgetMin: 2500000,
    budgetMax: 3500000,
    preferences: 'Kadıköy, 4+1 Daire',
    lastContact: '18.07.2023',
    notes: 'Yatırım amaçlı konut arıyor.',
    source: 'Web Sitesi'
  },
  {
    id: 6,
    name: 'Sinan Çetinkaya',
    phone: '0538 456 7890',
    email: 'fatma.demir@example.com',
    status: 'Aktif',
    type: 'Kiracı',
    budget: '15.000 TL - 20.000 TL/ay',
    budgetMin: 15000,
    budgetMax: 20000,
    preferences: 'Beşiktaş, 3+1 Daire',
    lastContact: '22.07.2023',
    notes: 'Şirket için ofis arıyor.',
    source: 'Referans'
  }
];

const CustomerManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();
  const [historyType, setHistoryType] = useState<'meetings' | 'properties'>('meetings');
  const { isOpen: isEditHistoryOpen, onOpen: onEditHistoryOpen, onClose: onEditHistoryClose } = useDisclosure();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
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
    navigate(`/customers/${customer.id}`);
  };

  const handleDeleteCustomer = (id: number) => {
    const customer = customers.find(c => c.id === id);
    const confirmed = confirm(`${customer?.name} adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    
    if (confirmed) {
      setCustomers(customers.filter(customer => customer.id !== id));
      console.log(`Müşteri silindi: ${customer?.name}`);
    }
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
    // Müşteri detay sayfasına belge ekleme modalı ile yönlendir
    navigate(`/customers/${customer.id}?openDocumentModal=true`);
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
    const form = document.querySelector('.history-form') as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    
    if (historyType === 'meetings') {
      const newMeeting = {
        id: editingItem ? editingItem.id : Date.now(),
        date: new Date(formData.get('date') as string).toLocaleDateString('tr-TR'),
        type: formData.get('type') as string || '',
        notes: formData.get('notes') as string || ''
      };
      
      if (editingItem) {
        setMeetings(meetings.map(m => m.id === editingItem.id ? newMeeting : m));
      } else {
        setMeetings([...meetings, newMeeting]);
      }
    } else {
      const newProperty = {
        id: editingItem ? editingItem.id : Date.now(),
        date: new Date(formData.get('date') as string).toLocaleDateString('tr-TR'),
        property: formData.get('property') as string || '',
        status: formData.get('status') as string || '',
        notes: formData.get('notes') as string || ''
      };
      
      if (editingItem) {
        setProperties(properties.map(p => p.id === editingItem.id ? newProperty : p));
      } else {
        setProperties([...properties, newProperty]);
      }
    }
    
    onEditHistoryClose();
  };

  // Müşteri durumu değiştirme fonksiyonları
  const handleDeactivateCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setDeactivationReason('');
    onDeactivateOpen();
  };

  const confirmDeactivation = () => {
    if (!deactivationReason) {
      alert('Lütfen pasife alma nedenini seçiniz.');
      return;
    }
    
    setCustomers(customers.map(c => 
      c.id === selectedCustomer.id 
        ? { ...c, status: 'Pasif', deactivationReason: deactivationReason, deactivationDate: new Date().toLocaleDateString('tr-TR') }
        : c
    ));
    console.log(`${selectedCustomer.name} pasife alındı. Neden: ${deactivationReason}`);
    onDeactivateClose();
  };

  const handleActivateCustomer = (customer: any) => {
    const confirmed = confirm(`${customer.name} adlı müşteriyi aktife almak istediğinizden emin misiniz?`);
    
    if (confirmed) {
      setCustomers(customers.map(c => 
        c.id === customer.id 
          ? { ...c, status: 'Aktif', activationDate: new Date().toLocaleDateString('tr-TR') }
          : c
      ));
      console.log(`${customer.name} aktife alındı.`);
    }
  };

  // Filtreleme fonksiyonları
  const getFilteredCustomers = useMemo(() => {
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
  }, [customers, searchTerm, activeTab]);

  const filteredCustomers = getFilteredCustomers;





  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const filterBg = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const warningBg = useColorModeValue('yellow.50', 'yellow.900');
  const warningBorder = useColorModeValue('yellow.400', 'yellow.300');
  const warningText = useColorModeValue('yellow.800', 'yellow.100');
  const infoBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Box p={{ base: '4', md: '6' }} bg={pageBg} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color={headingColor}>
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
            <VStack spacing={4} align="stretch">
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
                    bg={filterBg}
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
              
              {/* Gelişmiş Filtreler */}
              {searchTerm && (
                <Flex gap={4} align="center" flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => {
                      setSearchTerm('');
                    }}
                  >
                    Aramayı Temizle
                  </Button>
                </Flex>
              )}
            </VStack>
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
                      <Card 
                        key={customer.id} 
                        bg={cardBg} 
                        shadow="sm"
                        borderRadius="xl"
                        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        cursor="pointer"
                        onClick={() => handleViewCustomer(customer)}
                        border="1px solid transparent"
                        borderColor="transparent"
                      >
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4}>
                            {/* Müşteri Bilgileri */}
                            <Flex justify="space-between" align="start">
                              <HStack spacing={3}>
                                <Avatar size="md" name={customer.name} />
                                <VStack align="start" spacing={1}>
                                  <Text 
                                    fontWeight="bold" 
                                    fontSize="lg" 
                                    color="blue.500" 
                                    cursor="pointer" 
                                    _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                    onClick={() => handleViewCustomer(customer)}
                                  >
                                    {customer.name}
                                  </Text>
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
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<MoreHorizontal />} 
                                  variant="ghost" 
                                  size="sm" 
                                  borderRadius="full" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Portal>
                                   <MenuList zIndex={9999}>
                                    <MenuItem icon={<Eye />} onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}>
                                      Görüntüle
                                    </MenuItem>
                                    <MenuItem icon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}>
                                      Düzenle
                                    </MenuItem>
                                    <MenuItem icon={<Calendar />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'meetings'); }}>
                                      Görüşme Geçmişi
                                    </MenuItem>
                                    <MenuItem icon={<MapPin />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'properties'); }}>
                                      Gayrimenkul Geçmişi
                                    </MenuItem>
                                    <MenuItem icon={<FileText />} onClick={(e) => { e.stopPropagation(); handleAddDocument(customer); }}>
                                      Belge Ekle
                                    </MenuItem>
                                    {customer.type === 'Alıcı' && (
                                      <MenuItem icon={<Home />} onClick={(e) => { e.stopPropagation(); handleAIMatching(customer); }}>
                                        AI Eşleştirme
                                      </MenuItem>
                                    )}
                                    <Divider />
                                    {customer.status === 'Aktif' ? (
                                      <MenuItem icon={<UserX />} color="orange.500" onClick={(e) => { e.stopPropagation(); handleDeactivateCustomer(customer); }}>
                                        Pasife Al
                                      </MenuItem>
                                    ) : (
                                      <MenuItem icon={<UserCheck />} color="green.500" onClick={(e) => { e.stopPropagation(); handleActivateCustomer(customer); }}>
                                        Aktife Al
                                      </MenuItem>
                                    )}
                                    <Divider />
                                    <MenuItem icon={<Trash2 />} color="red.500" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}>
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
                              <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                {customer.budget}
                              </Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                {customer.preferences}
                              </Text>
                            </VStack>
                            
                            {/* Notlar - Sticky Note Tarzı */}
                            {customer.notes && (
                              <Box
                                bg={warningBg}
                                borderLeft="4px solid"
                                borderLeftColor={warningBorder}
                                p={3}
                                borderRadius="md"
                                position="relative"
                                _before={{
                                  content: '"📝"',
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  fontSize: 'sm',
                                  opacity: 0.7
                                }}
                              >
                                <Text 
                                  fontSize="sm" 
                                  color={warningText}
                                  fontWeight="medium"
                                  noOfLines={3}
                                  lineHeight="1.4"
                                >
                                  {customer.notes}
                                </Text>
                              </Box>
                            )}
                            
                            {/* Son İletişim ve Uyarı */}
                            <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="xs" color="gray.500">
                                  Son İletişim: {customer.lastContact}
                                </Text>
                                {(() => {
                                  const warningLevel = getContactWarningLevel(customer.lastContact);
                                  const daysSince = getDaysSinceLastContact(customer.lastContact);
                                  const message = getContactWarningMessage(customer.lastContact);
                                  
                                  if (warningLevel === 'error') {
                                    return (
                                      <Tooltip label={message} placement="top">
                                        <Badge 
                                          colorScheme="red" 
                                          variant="solid" 
                                          fontSize="xs"
                                          display="flex"
                                          alignItems="center"
                                          gap={1}
                                        >
                                          <AlertTriangle size={10} />
                                          {daysSince} gün
                                        </Badge>
                                      </Tooltip>
                                    );
                                  } else if (warningLevel === 'warning') {
                                    return (
                                      <Tooltip label={message} placement="top">
                                        <Badge 
                                          colorScheme="orange" 
                                          variant="solid" 
                                          fontSize="xs"
                                          display="flex"
                                          alignItems="center"
                                          gap={1}
                                        >
                                          <Clock size={10} />
                                          {daysSince} gün
                                        </Badge>
                                      </Tooltip>
                                    );
                                  }
                                  return null;
                                })()}
                              </VStack>
                            </Flex>
                          </VStack>
                          
                          {/* Genişletilmiş Detay Görünümü */}

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
                    <Card 
                      key={customer.id} 
                      bg={cardBg} 
                      shadow="sm"
                        borderRadius="xl"
                        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        cursor="pointer"
                        onClick={() => handleViewCustomer(customer)}
                        border="1px solid transparent"
                        borderColor="transparent"
                    >
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="lg" 
                                  color="blue.500" 
                                  cursor="pointer" 
                                  _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  {customer.name}
                                </Text>
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
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<MoreHorizontal />} 
                                  variant="ghost" 
                                  size="sm" 
                                  borderRadius="full" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'meetings'); }}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'properties'); }}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={(e) => { e.stopPropagation(); handleAddDocument(customer); }}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={(e) => { e.stopPropagation(); handleAIMatching(customer); }}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  {customer.status === 'Aktif' ? (
                                    <MenuItem icon={<UserX />} color="orange.500" onClick={(e) => { e.stopPropagation(); handleDeactivateCustomer(customer); }}>
                                      Pasife Al
                                    </MenuItem>
                                  ) : (
                                    <MenuItem icon={<UserCheck />} color="green.500" onClick={(e) => { e.stopPropagation(); handleActivateCustomer(customer); }}>
                                      Aktife Al
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}>
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
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Notlar - Sticky Note Tarzı */}
                          {customer.notes && (
                            <Box
                              bg={warningBg}
                              borderLeft="4px solid"
                              borderLeftColor={warningBorder}
                              p={3}
                              borderRadius="md"
                              position="relative"
                              _before={{
                                content: '"📝"',
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                fontSize: 'sm',
                                opacity: 0.7
                              }}
                            >
                              <Text 
                                fontSize="sm" 
                                color={warningText}
                                fontWeight="medium"
                                noOfLines={3}
                                lineHeight="1.4"
                              >
                                {customer.notes}
                              </Text>
                            </Box>
                          )}
                          
                          {/* Son İletişim ve Uyarı */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Son İletişim: {customer.lastContact}
                              </Text>
                              {(() => {
                                const warningLevel = getContactWarningLevel(customer.lastContact);
                                const daysSince = getDaysSinceLastContact(customer.lastContact);
                                const message = getContactWarningMessage(customer.lastContact);
                                
                                if (warningLevel === 'error') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="red" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AlertTriangle size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                } else if (warningLevel === 'warning') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="orange" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </VStack>
                          </Flex>
                        </VStack>
                        
                        {/* Genişletilmiş Detay Görünümü */}

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
                    <Card 
                      key={customer.id} 
                      bg={cardBg} 
                      shadow="sm"
                        borderRadius="xl"
                        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        cursor="pointer"
                        onClick={() => handleViewCustomer(customer)}
                        border="1px solid transparent"
                        borderColor="transparent"
                    >
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="lg" 
                                  color="blue.500" 
                                  cursor="pointer" 
                                  _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  {customer.name}
                                </Text>
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
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<MoreHorizontal />} 
                                  variant="ghost" 
                                  size="sm" 
                                  borderRadius="full" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'meetings'); }}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'properties'); }}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={(e) => { e.stopPropagation(); handleAddDocument(customer); }}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={(e) => { e.stopPropagation(); handleAIMatching(customer); }}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  {customer.status === 'Aktif' ? (
                                    <MenuItem icon={<UserX />} color="orange.500" onClick={(e) => { e.stopPropagation(); handleDeactivateCustomer(customer); }}>
                                      Pasife Al
                                    </MenuItem>
                                  ) : (
                                    <MenuItem icon={<UserCheck />} color="green.500" onClick={(e) => { e.stopPropagation(); handleActivateCustomer(customer); }}>
                                      Aktife Al
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}>
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
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Notlar - Sticky Note Tarzı */}
                          {customer.notes && (
                            <Box
                              bg={warningBg}
                              borderLeft="4px solid"
                              borderLeftColor={warningBorder}
                              p={3}
                              borderRadius="md"
                              position="relative"
                              _before={{
                                content: '"📝"',
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                fontSize: 'sm',
                                opacity: 0.7
                              }}
                            >
                              <Text 
                                fontSize="sm" 
                                color={warningText}
                                fontWeight="medium"
                                noOfLines={3}
                                lineHeight="1.4"
                              >
                                {customer.notes}
                              </Text>
                            </Box>
                          )}
                          
                          {/* Son İletişim ve Uyarı */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Son İletişim: {customer.lastContact}
                              </Text>
                              {(() => {
                                const warningLevel = getContactWarningLevel(customer.lastContact);
                                const daysSince = getDaysSinceLastContact(customer.lastContact);
                                const message = getContactWarningMessage(customer.lastContact);
                                
                                if (warningLevel === 'error') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="red" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AlertTriangle size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                } else if (warningLevel === 'warning') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="orange" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </VStack>
                          </Flex>
                        </VStack>
                        
                        {/* Genişletilmiş Detay Görünümü */}

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
                    <Card 
                      key={customer.id} 
                      bg={cardBg} 
                      shadow="sm"
                      borderRadius="xl"
                      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                      transition="all 0.3s ease"
                      cursor="pointer"
                      onClick={() => handleViewCustomer(customer)}
                      border="1px solid transparent"
                      borderColor="transparent"
                    >
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="lg" 
                                  color="blue.500" 
                                  cursor="pointer" 
                                  _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  {customer.name}
                                </Text>
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
                                <MenuButton 
                                  as={IconButton} 
                                  icon={<MoreHorizontal />} 
                                  variant="ghost" 
                                  size="sm" 
                                  borderRadius="full" 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Portal>
                                  <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'meetings'); }}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'properties'); }}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={(e) => { e.stopPropagation(); handleAddDocument(customer); }}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={(e) => { e.stopPropagation(); handleAIMatching(customer); }}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  {customer.status === 'Aktif' ? (
                                    <MenuItem icon={<UserX />} color="orange.500" onClick={(e) => { e.stopPropagation(); handleDeactivateCustomer(customer); }}>
                                      Pasife Al
                                    </MenuItem>
                                  ) : (
                                    <MenuItem icon={<UserCheck />} color="green.500" onClick={(e) => { e.stopPropagation(); handleActivateCustomer(customer); }}>
                                      Aktife Al
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}>
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
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Notlar - Sticky Note Tarzı */}
                          {customer.notes && (
                            <Box
                              bg={warningBg}
                              borderLeft="4px solid"
                              borderLeftColor={warningBorder}
                              p={3}
                              borderRadius="md"
                              position="relative"
                              _before={{
                                content: '"📝"',
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                fontSize: 'sm',
                                opacity: 0.7
                              }}
                            >
                              <Text 
                                fontSize="sm" 
                                color={warningText}
                                fontWeight="medium"
                                noOfLines={3}
                                lineHeight="1.4"
                              >
                                {customer.notes}
                              </Text>
                            </Box>
                          )}
                          
                          {/* Son İletişim ve Uyarı */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Son İletişim: {customer.lastContact}
                              </Text>
                              {(() => {
                                const warningLevel = getContactWarningLevel(customer.lastContact);
                                const daysSince = getDaysSinceLastContact(customer.lastContact);
                                const message = getContactWarningMessage(customer.lastContact);
                                
                                if (warningLevel === 'error') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="red" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AlertTriangle size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                } else if (warningLevel === 'warning') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="orange" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </VStack>
                          </Flex>
                        </VStack>
                        
                        {/* Genişletilmiş Detay Görünümü */}

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
                    <Card 
                      key={customer.id} 
                      bg={cardBg} 
                      shadow="sm"
                      borderRadius="xl"
                      _hover={{ shadow: 'lg', transform: 'translateY(-4px) scale(1.01)' }}
                      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      onClick={() => handleViewCustomer(customer)}
                      transform="scale(1)"
                      border="1px solid transparent"
                      borderColor="transparent"
                    >
                      <CardBody p={6}>
                        <VStack align="stretch" spacing={4}>
                          {/* Müşteri Bilgileri */}
                          <Flex justify="space-between" align="start">
                            <HStack spacing={3}>
                              <Avatar size="md" name={customer.name} />
                              <VStack align="start" spacing={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="lg" 
                                  color="blue.500" 
                                  cursor="pointer" 
                                  _hover={{ textDecoration: 'underline', color: 'blue.600' }}
                                  onClick={() => handleViewCustomer(customer)}
                                >
                                  {customer.name}
                                </Text>
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
                              <MenuButton 
                                as={IconButton} 
                                icon={<MoreHorizontal />} 
                                variant="ghost" 
                                size="sm" 
                                borderRadius="full" 
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Portal>
                                <MenuList zIndex={9999}>
                                  <MenuItem icon={<Eye />} onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}>
                                    Görüntüle
                                  </MenuItem>
                                  <MenuItem icon={<Edit />} onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}>
                                    Düzenle
                                  </MenuItem>
                                  <MenuItem icon={<Calendar />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'meetings'); }}>
                                    Görüşme Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<MapPin />} onClick={(e) => { e.stopPropagation(); handleViewHistory(customer, 'properties'); }}>
                                    Gayrimenkul Geçmişi
                                  </MenuItem>
                                  <MenuItem icon={<FileText />} onClick={(e) => { e.stopPropagation(); handleAddDocument(customer); }}>
                                    Belge Ekle
                                  </MenuItem>
                                  {customer.type === 'Alıcı' && (
                                    <MenuItem icon={<Home />} onClick={(e) => { e.stopPropagation(); handleAIMatching(customer); }}>
                                      AI Eşleştirme
                                    </MenuItem>
                                  )}
                                  <Divider />
                                  {customer.status === 'Aktif' && (
                                    <MenuItem icon={<UserX />} onClick={(e) => { e.stopPropagation(); handleDeactivateCustomer(customer); }}>
                                      Pasife Al
                                    </MenuItem>
                                  )}
                                  {customer.status === 'Pasif' && (
                                    <MenuItem icon={<UserCheck />} onClick={(e) => { e.stopPropagation(); handleActivateCustomer(customer); }}>
                                      Aktife Al
                                    </MenuItem>
                                  )}
                                  <MenuItem icon={<Trash2 />} color="red.500" onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(customer.id); }}>
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
                            <Text fontSize="sm" fontWeight="medium" color={textColor}>
                              {customer.budget}
                            </Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={2}>
                              {customer.preferences}
                            </Text>
                          </VStack>
                          
                          {/* Notlar - Sticky Note Tarzı */}
                          {customer.notes && (
                            <Box
                              bg={warningBg}
                              borderLeft="4px solid"
                              borderLeftColor={warningBorder}
                              p={3}
                              borderRadius="md"
                              position="relative"
                              _before={{
                                content: '"📝"',
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                fontSize: 'sm',
                                opacity: 0.7
                              }}
                            >
                              <Text 
                                fontSize="sm" 
                                color={warningText}
                                fontWeight="medium"
                                noOfLines={3}
                                lineHeight="1.4"
                              >
                                {customer.notes}
                              </Text>
                            </Box>
                          )}
                          
                          {/* Son İletişim ve Uyarı */}
                          <Flex justify="space-between" align="center" pt={2} borderTop="1px" borderColor={borderColor}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                Son İletişim: {customer.lastContact}
                              </Text>
                              {(() => {
                                const warningLevel = getContactWarningLevel(customer.lastContact);
                                const daysSince = getDaysSinceLastContact(customer.lastContact);
                                const message = getContactWarningMessage(customer.lastContact);
                                
                                if (warningLevel === 'error') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="red" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AlertTriangle size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                } else if (warningLevel === 'warning') {
                                  return (
                                    <Tooltip label={message} placement="top">
                                      <Badge 
                                        colorScheme="orange" 
                                        variant="solid" 
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Clock size={10} />
                                        {daysSince} gün
                                      </Badge>
                                    </Tooltip>
                                  );
                                }
                                return null;
                              })()}
                            </VStack>
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
                
                <Card w="full" bg={infoBg} borderColor="blue.200">
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
                                   aria-label="Düzenle"
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
                                   aria-label="Sil"
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
                                   aria-label="Düzenle"
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
                                   aria-label="Sil"
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

       {/* Pasife Alma Modal */}
       <Modal isOpen={isDeactivateOpen} onClose={onDeactivateClose} size="md">
         <ModalOverlay />
         <ModalContent>
           <ModalHeader>Müşteriyi Pasife Al</ModalHeader>
           <ModalCloseButton />
           <ModalBody>
             <VStack spacing={4}>
               <Text>
                 <strong>{selectedCustomer?.name}</strong> adlı müşteriyi pasife almak istediğinizden emin misiniz?
               </Text>
               <FormControl isRequired>
                 <FormLabel>Pasife alma nedeni:</FormLabel>
                 <Select 
                   placeholder="Neden seçiniz..."
                   value={deactivationReason}
                   onChange={(e) => setDeactivationReason(e.target.value)}
                 >
                   <option value="Artık ilgilenmiyor">Artık ilgilenmiyor</option>
                   <option value="Başka acenteden aldı">Başka acenteden aldı</option>
                   <option value="Bütçe yetersizliği">Bütçe yetersizliği</option>
                   <option value="Zaman problemi">Zaman problemi</option>
                   <option value="Lokasyon değişikliği">Lokasyon değişikliği</option>
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
     </Box>
   );
 };

export default CustomerManagement;