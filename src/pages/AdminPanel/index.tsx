import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Building,
  CreditCard,
  Gift,
  Percent,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Webhook,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { webhookService, WebhookEvent } from '../../services/webhookService';

// Mock data for admin panel
const mockCustomers = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    company: 'Yılmaz Emlak',
    plan: 'Professional',
    status: 'active',
    mrr: 299,
    lastPayment: '2024-01-15',
    joinDate: '2023-06-15',
    seats: { used: 3, total: 5 },
  },
  {
    id: '2',
    name: 'Fatma Demir',
    email: 'fatma@example.com',
    company: 'Demir Gayrimenkul',
    plan: 'Enterprise',
    status: 'past_due',
    mrr: 599,
    lastPayment: '2024-01-01',
    joinDate: '2023-03-20',
    seats: { used: 8, total: 10 },
  },
  {
    id: '3',
    name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    company: 'Kaya Emlak',
    plan: 'Starter',
    status: 'active',
    mrr: 99,
    lastPayment: '2024-01-20',
    joinDate: '2023-12-01',
    seats: { used: 1, total: 2 },
  },
];

const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME20',
    name: '20% İndirim Kuponu',
    discount_type: 'percentage',
    discount_value: 20,
    usage_limit: 100,
    used_count: 45,
    expires_at: '2024-12-31',
    is_active: true,
  },
  {
    id: '2',
    code: 'NEWCUSTOMER',
    name: 'Yeni Müşteri İndirimi',
    discount_type: 'fixed',
    discount_value: 50,
    usage_limit: 50,
    used_count: 12,
    expires_at: '2024-06-30',
    is_active: true,
  },
];



interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  mode: 'view' | 'edit';
}

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: any;
  mode: 'create' | 'edit';
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    company: customer?.company || '',
    plan: customer?.plan || '',
    status: customer?.status || 'active',
  });
  
  const toast = useToast();
  
  const handleSave = () => {
    toast({
      title: mode === 'edit' ? 'Müşteri güncellendi' : 'Müşteri görüntülendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'view' ? 'Müşteri Detayları' : 'Müşteri Düzenle'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isReadOnly={mode === 'view'}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>E-posta</FormLabel>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  isReadOnly={mode === 'view'}
                />
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Şirket</FormLabel>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  isReadOnly={mode === 'view'}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Plan</FormLabel>
                <Select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  isDisabled={mode === 'view'}
                >
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            
            {mode === 'edit' && (
              <FormControl>
                <FormLabel>Durum</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="past_due">Ödeme Bekliyor</option>
                  <option value="canceled">İptal Edildi</option>
                  <option value="paused">Donduruldu</option>
                </Select>
              </FormControl>
            )}
            
            {customer && (
              <VStack spacing={3} align="stretch">
                <Divider />
                <Text fontWeight="medium">Abonelik Bilgileri</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Text fontSize="sm">
                    <strong>MRR:</strong> ₺{customer.mrr}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Son Ödeme:</strong> {customer.lastPayment}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Katılım:</strong> {customer.joinDate}
                  </Text>
                  <Text fontSize="sm">
                    <strong>Koltuk:</strong> {customer.seats.used}/{customer.seats.total}
                  </Text>
                </SimpleGrid>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {mode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {mode === 'edit' && (
            <Button colorScheme="blue" onClick={handleSave}>
              Kaydet
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  onClose,
  coupon,
  mode,
}) => {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    name: coupon?.name || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || 0,
    usage_limit: coupon?.usage_limit || 100,
    expires_at: coupon?.expires_at || '',
    is_active: coupon?.is_active ?? true,
  });
  
  const toast = useToast();
  
  const handleSave = () => {
    toast({
      title: mode === 'create' ? 'Kupon oluşturuldu' : 'Kupon güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? 'Yeni Kupon Oluştur' : 'Kupon Düzenle'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Kupon Kodu</FormLabel>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME20"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Kupon Adı</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hoş Geldin İndirimi"
                />
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={2} spacing={4}>
              <FormControl isRequired>
                <FormLabel>İndirim Türü</FormLabel>
                <Select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>
                  İndirim Miktarı ({formData.discount_type === 'percentage' ? '%' : '₺'})
                </FormLabel>
                <NumberInput
                  value={formData.discount_value}
                  onChange={(_, value) => setFormData({ ...formData, discount_value: value })}
                  min={0}
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            
            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Kullanım Limiti</FormLabel>
                <NumberInput
                  value={formData.usage_limit}
                  onChange={(_, value) => setFormData({ ...formData, usage_limit: value })}
                  min={1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Son Kullanma Tarihi</FormLabel>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </FormControl>
            </SimpleGrid>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Aktif</FormLabel>
              <Switch
                isChecked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                colorScheme="blue"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            İptal
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            {mode === 'create' ? 'Oluştur' : 'Güncelle'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};



const AdminPanelPage: React.FC = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookStats, setWebhookStats] = useState<any>(null);
  
  const {
    isOpen: isCustomerModalOpen,
    onOpen: onCustomerModalOpen,
    onClose: onCustomerModalClose,
  } = useDisclosure();
  
  const {
    isOpen: isCouponModalOpen,
    onOpen: onCouponModalOpen,
    onClose: onCouponModalClose,
  } = useDisclosure();
  
  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Load webhook data
  useEffect(() => {
    loadWebhookData();
  }, []);

  const loadWebhookData = async () => {
    try {
      setWebhookLoading(true);
      const [events, stats] = await Promise.all([
        webhookService.getWebhookEvents(50, 0),
        webhookService.getWebhookStats()
      ]);
      setWebhookEvents(events);
      setWebhookStats(stats);
    } catch (error) {
      console.error('Error loading webhook data:', error);
      toast({
        title: 'Hata',
        description: 'Webhook verileri yüklenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleRetryWebhook = async (eventId: string) => {
    try {
      await webhookService.retryWebhookEvent(eventId);
      toast({
        title: 'Başarılı',
        description: 'Webhook eventi yeniden deneniyor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadWebhookData(); // Reload data
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast({
        title: 'Hata',
        description: 'Webhook yeniden denenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Calculate analytics
  const totalMRR = mockCustomers.reduce((sum, customer) => sum + customer.mrr, 0);
  const totalARR = totalMRR * 12;
  const activeCustomers = mockCustomers.filter(c => c.status === 'active').length;
  const churnRate = (mockCustomers.filter(c => c.status === 'canceled').length / mockCustomers.length) * 100;
  
  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    onCustomerModalOpen();
  };
  
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setModalMode('edit');
    onCustomerModalOpen();
  };
  
  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setModalMode('create');
    onCouponModalOpen();
  };
  
  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setModalMode('edit');
    onCouponModalOpen();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'past_due':
        return 'yellow';
      case 'canceled':
        return 'red';
      case 'paused':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'past_due':
        return 'Ödeme Bekliyor';
      case 'canceled':
        return 'İptal Edildi';
      case 'paused':
        return 'Donduruldu';
      default:
        return status;
    }
  };
  
  const filteredCustomers = mockCustomers.filter(
    customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Box w="100%" px={4}>
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center" w="full">
            <Heading size="xl" color={headingColor}>
              Admin Operatör Paneli
            </Heading>
            <Text color={textColor} fontSize="lg">
              Müşteri yönetimi, kupon yönetimi ve sistem raporları
            </Text>
          </VStack>
          
          {/* Analytics Overview */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            <Card style={{ backgroundColor: cardBg }}>
              <CardContent>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={DollarSign} color="green.500" />
                      <Text>Aylık Gelir (MRR)</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>₺{totalMRR.toLocaleString('tr-TR')}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
              </CardContent>
            </Card>
            
            <Card style={{ backgroundColor: cardBg }}>
              <CardContent>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={TrendingUp} color="blue.500" />
                      <Text>Yıllık Gelir (ARR)</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>₺{totalARR.toLocaleString('tr-TR')}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    18.24%
                  </StatHelpText>
                </Stat>
              </CardContent>
            </Card>
            
            <Card style={{ backgroundColor: cardBg }}>
              <CardContent>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={Users} color="purple.500" />
                      <Text>Aktif Müşteri</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{activeCustomers}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12.5%
                  </StatHelpText>
                </Stat>
              </CardContent>
            </Card>
            
            <Card style={{ backgroundColor: cardBg }}>
              <CardContent>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={TrendingDown} color="red.500" />
                      <Text>Churn Oranı</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{churnRate.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    2.1%
                  </StatHelpText>
                </Stat>
              </CardContent>
            </Card>
          </SimpleGrid>
          
          {/* Main Content Tabs */}
          <Card style={{ backgroundColor: cardBg, width: '100%' }}>
            <CardContent>
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Müşteri Yönetimi</Tab>
                  <Tab>Kupon Yönetimi</Tab>
                  <Tab>Webhook Logları</Tab>
                  <Tab>Raporlama</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Customer Management */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                          <Heading size="md" color={headingColor}>
                            Müşteri Listesi
                          </Heading>
                          <Text color={textColor}>
                            Tüm müşterileri görüntüleyin ve yönetin
                          </Text>
                        </VStack>
                        
                        <HStack spacing={4}>
                          <InputGroup maxW="300px">
                            <InputLeftElement>
                              <Icon as={Search} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Müşteri ara..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </InputGroup>
                          
                          <Button leftIcon={<Download />} variant="outline">
                            Dışa Aktar
                          </Button>
                        </HStack>
                      </HStack>
                      
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Müşteri</Th>
                              <Th>Şirket</Th>
                              <Th>Plan</Th>
                              <Th>Durum</Th>
                              <Th>MRR</Th>
                              <Th>Son Ödeme</Th>
                              <Th>Koltuk</Th>
                              <Th>İşlemler</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredCustomers.map((customer) => (
                              <Tr key={customer.id}>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="medium">{customer.name}</Text>
                                    <Text fontSize="sm" color={textColor}>
                                      {customer.email}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td>{customer.company}</Td>
                                <Td>
                                  <Badge colorScheme="blue">{customer.plan}</Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getStatusColor(customer.status)}>
                                    {getStatusText(customer.status)}
                                  </Badge>
                                </Td>
                                <Td>₺{customer.mrr}</Td>
                                <Td>{customer.lastPayment}</Td>
                                <Td>
                                  {customer.seats.used}/{customer.seats.total}
                                </Td>
                                <Td>
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<MoreVertical />}
                                      variant="ghost"
                                      size="sm"
                                    />
                                    <MenuList>
                                      <MenuItem
                                        icon={<Eye />}
                                        onClick={() => handleViewCustomer(customer)}
                                      >
                                        Görüntüle
                                      </MenuItem>
                                      <MenuItem
                                        icon={<Edit />}
                                        onClick={() => handleEditCustomer(customer)}
                                      >
                                        Düzenle
                                      </MenuItem>
                                      <MenuItem
                                        icon={<Mail />}
                                        onClick={() => {
                                          toast({
                                            title: 'E-posta gönderildi',
                                            status: 'success',
                                            duration: 3000,
                                            isClosable: true,
                                          });
                                        }}
                                      >
                                        E-posta Gönder
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </VStack>
                  </TabPanel>
                  
                  {/* Coupon Management */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                          <Heading size="md" color={headingColor}>
                            Kupon Yönetimi
                          </Heading>
                          <Text color={textColor}>
                            İndirim kuponlarını oluşturun ve yönetin
                          </Text>
                        </VStack>
                        
                        <Button
                          colorScheme="blue"
                          leftIcon={<Plus />}
                          onClick={handleCreateCoupon}
                        >
                          Yeni Kupon
                        </Button>
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {mockCoupons.map((coupon) => (
                          <Card key={coupon.id} style={{ backgroundColor: bg }}>
                            <CardContent>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold" fontSize="lg">
                                      {coupon.code}
                                    </Text>
                                    <Text fontSize="sm" color={textColor}>
                                      {coupon.name}
                                    </Text>
                                  </VStack>
                                  
                                  <Badge
                                    colorScheme={coupon.is_active ? 'green' : 'gray'}
                                  >
                                    {coupon.is_active ? 'Aktif' : 'Pasif'}
                                  </Badge>
                                </HStack>
                                
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" color={textColor}>
                                      İndirim
                                    </Text>
                                    <Text fontWeight="medium">
                                      {coupon.discount_type === 'percentage'
                                        ? `%${coupon.discount_value}`
                                        : `₺${coupon.discount_value}`
                                      }
                                    </Text>
                                  </VStack>
                                  
                                  <VStack align="end" spacing={1}>
                                    <Text fontSize="sm" color={textColor}>
                                      Kullanım
                                    </Text>
                                    <Text fontWeight="medium">
                                      {coupon.used_count}/{coupon.usage_limit}
                                    </Text>
                                  </VStack>
                                </HStack>
                                
                                <Text fontSize="sm" color={textColor}>
                                  <strong>Son Kullanma:</strong> {coupon.expires_at}
                                </Text>
                                
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    leftIcon={<Edit />}
                                    onClick={() => handleEditCoupon(coupon)}
                                    flex={1}
                                  >
                                    Düzenle
                                  </Button>
                                  <IconButton
                                    size="sm"
                                    icon={<Trash2 />}
                                    colorScheme="red"
                                    variant="outline"
                                    aria-label="Sil"
                                    onClick={() => {
                                      toast({
                                        title: 'Kupon silindi',
                                        status: 'success',
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                    }}
                                  />
                                </HStack>
                              </VStack>
                            </CardContent>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                  
                  {/* Webhook Logs */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <VStack align="start" spacing={2}>
                        <Heading size="md" color={headingColor}>
                          Webhook Logları
                        </Heading>
                        <Text color={textColor}>
                          Ödeme sağlayıcısından gelen webhook eventlerini görüntüleyin
                        </Text>
                      </VStack>
                      
                      {webhookLoading ? (
                        <Box textAlign="center" py={8}>
                          <Spinner size="lg" />
                          <Text mt={4} color={textColor}>Webhook verileri yükleniyor...</Text>
                        </Box>
                      ) : (
                        <TableContainer>
                          <Table variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Event Türü</Th>
                                <Th>Durum</Th>
                                <Th>Tarih</Th>
                                <Th>Sağlayıcı</Th>
                                <Th>Veri</Th>
                                <Th>İşlemler</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {webhookEvents.length === 0 ? (
                                <Tr>
                                  <Td colSpan={6} textAlign="center" py={8}>
                                    <Text color={textColor}>Henüz webhook eventi bulunmuyor</Text>
                                  </Td>
                                </Tr>
                              ) : (
                                webhookEvents.map((event) => (
                                  <Tr key={event.id}>
                                    <Td>
                                      <HStack>
                                        <Icon as={Webhook} boxSize={4} color="blue.500" />
                                        <Text fontFamily="mono" fontSize="sm">
                                          {event.event_type}
                                        </Text>
                                      </HStack>
                                    </Td>
                                    <Td>
                                      <Badge
                                        colorScheme={event.status === 'success' ? 'green' : event.status === 'failed' ? 'red' : 'yellow'}
                                      >
                                        {event.status === 'success' ? 'Başarılı' : event.status === 'failed' ? 'Başarısız' : 'Beklemede'}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      {new Date(event.created_at).toLocaleString('tr-TR')}
                                    </Td>
                                    <Td>
                                      <Badge colorScheme={event.provider === 'stripe' ? 'purple' : 'blue'}>
                                        {event.provider}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      <Text fontSize="xs" fontFamily="mono" color={textColor} maxW="200px" isTruncated>
                                        {JSON.stringify(event.data)}
                                      </Text>
                                    </Td>
                                    <Td>
                                      <HStack spacing={2}>
                                        <Button size="sm" leftIcon={<Eye />} variant="outline">
                                          Detay
                                        </Button>
                                        {event.status === 'failed' && (
                                          <Button 
                                            size="sm" 
                                            colorScheme="blue" 
                                            onClick={() => handleRetryWebhook(event.id)}
                                          >
                                            Tekrar Dene
                                          </Button>
                                        )}
                                      </HStack>
                                    </Td>
                                  </Tr>
                                ))
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      )}
                    </VStack>
                  </TabPanel>
                  
                  {/* Reporting */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <VStack align="start" spacing={2}>
                        <Heading size="md" color={headingColor}>
                          Raporlama ve Analitik
                        </Heading>
                        <Text color={textColor}>
                          Gelir ve müşteri analitiği raporları
                        </Text>
                      </VStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card style={{ backgroundColor: bg }}>
                          <CardHeader>
                            <HStack>
                              <Icon as={BarChart3} color="blue.500" />
                              <Heading size="sm">Gelir Trendi</Heading>
                            </HStack>
                          </CardHeader>
                          <CardContent>
                            <VStack spacing={4} align="stretch">
                              <Text fontSize="sm" color={textColor}>
                                Son 12 aylık gelir trendi ve büyüme oranları
                              </Text>
                              <Box h="200px" bg="gray.100" borderRadius="md" p={4}>
                                <Text textAlign="center" color={textColor} mt={16}>
                                  [Grafik Alanı - Chart.js entegrasyonu]
                                </Text>
                              </Box>
                              <Button size="sm" leftIcon={<Download />}>
                                Raporu İndir
                              </Button>
                            </VStack>
                          </CardContent>
                        </Card>
                        
                        <Card style={{ backgroundColor: bg }}>
                          <CardHeader>
                            <HStack>
                              <Icon as={PieChart} color="green.500" />
                              <Heading size="sm">Plan Dağılımı</Heading>
                            </HStack>
                          </CardHeader>
                          <CardContent>
                            <VStack spacing={4} align="stretch">
                              <Text fontSize="sm" color={textColor}>
                                Müşterilerin plan tercihlerine göre dağılımı
                              </Text>
                              <Box h="200px" bg="gray.100" borderRadius="md" p={4}>
                                <Text textAlign="center" color={textColor} mt={16}>
                                  [Grafik Alanı - Chart.js entegrasyonu]
                                </Text>
                              </Box>
                              <Button size="sm" leftIcon={<Download />}>
                                Raporu İndir
                              </Button>
                            </VStack>
                          </CardContent>
                        </Card>
                        
                        <Card style={{ backgroundColor: bg }}>
                          <CardHeader>
                            <HStack>
                              <Icon as={Activity} color="purple.500" />
                              <Heading size="sm">Churn Analizi</Heading>
                            </HStack>
                          </CardHeader>
                          <CardContent>
                            <VStack spacing={4} align="stretch">
                              <Text fontSize="sm" color={textColor}>
                                Müşteri kaybı nedenleri ve önleme stratejileri
                              </Text>
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">Çok pahalı</Text>
                                  <Text fontSize="sm" fontWeight="medium">35%</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">Özellikler yetersiz</Text>
                                  <Text fontSize="sm" fontWeight="medium">25%</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">Kullanım zorluğu</Text>
                                  <Text fontSize="sm" fontWeight="medium">20%</Text>
                                </HStack>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">Diğer</Text>
                                  <Text fontSize="sm" fontWeight="medium">20%</Text>
                                </HStack>
                              </VStack>
                              <Button size="sm" leftIcon={<Download />}>
                                Detaylı Rapor
                              </Button>
                            </VStack>
                          </CardContent>
                        </Card>
                        
                        <Card style={{ backgroundColor: bg }}>
                          <CardHeader>
                            <HStack>
                              <Icon as={FileText} color="orange.500" />
                              <Heading size="sm">Ödeme Başarısızlık</Heading>
                            </HStack>
                          </CardHeader>
                          <CardContent>
                            <VStack spacing={4} align="stretch">
                              <Text fontSize="sm" color={textColor}>
                                Ödeme başarısızlık oranları ve nedenleri
                              </Text>
                              <VStack align="stretch" spacing={3}>
                                <Stat size="sm">
                                  <StatLabel>Başarısızlık Oranı</StatLabel>
                                  <StatNumber color="red.500">3.2%</StatNumber>
                                  <StatHelpText>
                                    <StatArrow type="decrease" />
                                    0.5% azaldı
                                  </StatHelpText>
                                </Stat>
                                
                                <Divider />
                                
                                <VStack align="stretch" spacing={1}>
                                  <Text fontSize="xs" fontWeight="medium">Ana Nedenler:</Text>
                                  <Text fontSize="xs" color={textColor}>• Yetersiz bakiye (45%)</Text>
                                  <Text fontSize="xs" color={textColor}>• Kart süresi dolmuş (30%)</Text>
                                  <Text fontSize="xs" color={textColor}>• Kart bloke (25%)</Text>
                                </VStack>
                              </VStack>
                              <Button size="sm" leftIcon={<Download />}>
                                Detaylı Analiz
                              </Button>
                            </VStack>
                          </CardContent>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardContent>
          </Card>
        </VStack>
      </Box>
      
      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={onCustomerModalClose}
        customer={selectedCustomer}
        mode={modalMode as 'view' | 'edit'}
      />
      
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={onCouponModalClose}
        coupon={selectedCoupon}
        mode={modalMode as 'create' | 'edit'}
      />
    </Box>
  );
};

export default AdminPanelPage;