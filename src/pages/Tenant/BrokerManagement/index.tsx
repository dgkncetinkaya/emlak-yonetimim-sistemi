import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon,
  Badge,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  VStack,
  HStack,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  TrendingUp,
  Award,
  Shield,
  Eye,
  EyeOff
} from 'react-feather';

interface Broker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'senior_broker' | 'broker' | 'junior_broker';
  commissionRate: number;
  isActive: boolean;
  joinDate: string;
  totalSales: number;
  monthlyTarget: number;
  currentMonthSales: number;
  avatar?: string;
  permissions: {
    canManageProperties: boolean;
    canManageCustomers: boolean;
    canViewReports: boolean;
    canManageBrokers: boolean;
    canManageSettings: boolean;
  };
}

const BrokerManagement: React.FC = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmBroker, setDeleteConfirmBroker] = useState<Broker | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<Broker>>({
    name: '',
    email: '',
    phone: '',
    role: 'broker',
    commissionRate: 3,
    isActive: true,
    monthlyTarget: 10,
    permissions: {
      canManageProperties: true,
      canManageCustomers: true,
      canViewReports: false,
      canManageBrokers: false,
      canManageSettings: false
    }
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleBrokers: Broker[] = [
      {
        id: 'broker-1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet@emlak.com',
        phone: '+90 532 123 4567',
        role: 'admin',
        commissionRate: 5,
        isActive: true,
        joinDate: '2023-01-15',
        totalSales: 15600000,
        monthlyTarget: 20,
        currentMonthSales: 4200000,
        permissions: {
          canManageProperties: true,
          canManageCustomers: true,
          canViewReports: true,
          canManageBrokers: true,
          canManageSettings: true
        }
      },
      {
        id: 'broker-2',
        name: 'Fatma Demir',
        email: 'fatma@emlak.com',
        phone: '+90 533 234 5678',
        role: 'senior_broker',
        commissionRate: 4,
        isActive: true,
        joinDate: '2023-03-20',
        totalSales: 12800000,
        monthlyTarget: 15,
        currentMonthSales: 3600000,
        permissions: {
          canManageProperties: true,
          canManageCustomers: true,
          canViewReports: true,
          canManageBrokers: false,
          canManageSettings: false
        }
      },
      {
        id: 'broker-3',
        name: 'Mehmet Kaya',
        email: 'mehmet@emlak.com',
        phone: '+90 534 345 6789',
        role: 'broker',
        commissionRate: 3,
        isActive: true,
        joinDate: '2023-06-10',
        totalSales: 8400000,
        monthlyTarget: 12,
        currentMonthSales: 2800000,
        permissions: {
          canManageProperties: true,
          canManageCustomers: true,
          canViewReports: false,
          canManageBrokers: false,
          canManageSettings: false
        }
      },
      {
        id: 'broker-4',
        name: 'Ayşe Özkan',
        email: 'ayse@emlak.com',
        phone: '+90 535 456 7890',
        role: 'junior_broker',
        commissionRate: 2.5,
        isActive: false,
        joinDate: '2023-09-05',
        totalSales: 3200000,
        monthlyTarget: 8,
        currentMonthSales: 1200000,
        permissions: {
          canManageProperties: true,
          canManageCustomers: false,
          canViewReports: false,
          canManageBrokers: false,
          canManageSettings: false
        }
      }
    ];
    setBrokers(sampleBrokers);
  }, []);

  const roleLabels = {
    admin: 'Yönetici',
    senior_broker: 'Kıdemli Danışman',
    broker: 'Danışman',
    junior_broker: 'Stajyer Danışman'
  };

  const roleColors = {
    admin: 'red',
    senior_broker: 'purple',
    broker: 'blue',
    junior_broker: 'green'
  };

  const handleAddBroker = () => {
    setSelectedBroker(null);
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'broker',
      commissionRate: 3,
      isActive: true,
      monthlyTarget: 10,
      permissions: {
        canManageProperties: true,
        canManageCustomers: true,
        canViewReports: false,
        canManageBrokers: false,
        canManageSettings: false
      }
    });
    onOpen();
  };

  const handleEditBroker = (broker: Broker) => {
    setSelectedBroker(broker);
    setIsEditing(true);
    setFormData(broker);
    onOpen();
  };

  const handleDeleteBroker = (broker: Broker) => {
    setDeleteConfirmBroker(broker);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (deleteConfirmBroker) {
      setBrokers(prev => prev.filter(b => b.id !== deleteConfirmBroker.id));
      toast({
        title: 'Danışman silindi',
        description: `${deleteConfirmBroker.name} başarıyla silindi.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
    onDeleteClose();
    setDeleteConfirmBroker(null);
  };

  const handleSaveBroker = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (isEditing && selectedBroker) {
      setBrokers(prev => prev.map(b => 
        b.id === selectedBroker.id 
          ? { ...b, ...formData } as Broker
          : b
      ));
      toast({
        title: 'Danışman güncellendi',
        description: `${formData.name} bilgileri güncellendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } else {
      const newBroker: Broker = {
        ...formData,
        id: `broker-${Date.now()}`,
        joinDate: new Date().toISOString().split('T')[0],
        totalSales: 0,
        currentMonthSales: 0
      } as Broker;
      setBrokers(prev => [...prev, newBroker]);
      toast({
        title: 'Danışman eklendi',
        description: `${formData.name} başarıyla eklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
    onClose();
  };

  const toggleBrokerStatus = (brokerId: string) => {
    setBrokers(prev => prev.map(b => 
      b.id === brokerId 
        ? { ...b, isActive: !b.isActive }
        : b
    ));
  };

  const totalBrokers = brokers.length;
  const activeBrokers = brokers.filter(b => b.isActive).length;
  const totalSales = brokers.reduce((sum, b) => sum + b.currentMonthSales, 0);
  const avgCommissionRate = brokers.reduce((sum, b) => sum + b.commissionRate, 0) / brokers.length;

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading size="xl" color={useColorModeValue('gray.800', 'white')} mb={2}>
              👥 Broker Yönetimi
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.300')}>
              Danışman ekleme, komisyon oranları ve rol bazlı yetkilendirme
            </Text>
          </Box>
          <Button
            leftIcon={<UserPlus />}
            colorScheme="blue"
            onClick={handleAddBroker}
            size="lg"
          >
            Yeni Danışman Ekle
          </Button>
        </Flex>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Toplam Danışman</StatLabel>
                <StatNumber color={useColorModeValue('gray.800', 'white')}>
                  {totalBrokers}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {activeBrokers} aktif
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Bu Ay Satış</StatLabel>
                <StatNumber color={useColorModeValue('gray.800', 'white')}>
                  ₺{(totalSales / 1000000).toFixed(1)}M
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  %12.5
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Ortalama Komisyon</StatLabel>
                <StatNumber color={useColorModeValue('gray.800', 'white')}>
                  %{avgCommissionRate.toFixed(1)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Standart oran
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Aktif Oran</StatLabel>
                <StatNumber color={useColorModeValue('gray.800', 'white')}>
                  %{((activeBrokers / totalBrokers) * 100).toFixed(0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Yüksek aktivite
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Brokers Table */}
        <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
          <CardHeader>
            <Heading size="md" color={useColorModeValue('gray.800', 'white')}>
              Danışman Listesi
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Danışman</Th>
                    <Th>Rol</Th>
                    <Th>Komisyon</Th>
                    <Th>Bu Ay Satış</Th>
                    <Th>Hedef</Th>
                    <Th>Durum</Th>
                    <Th>İşlemler</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {brokers.map((broker) => (
                    <Tr key={broker.id}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={broker.name} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                              {broker.name}
                            </Text>
                            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                              {broker.email}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={roleColors[broker.role]} variant="subtle">
                          {roleLabels[broker.role]}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                          %{broker.commissionRate}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                          ₺{(broker.currentMonthSales / 1000000).toFixed(1)}M
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                            {broker.monthlyTarget} emlak
                          </Text>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                            %{((broker.currentMonthSales / (broker.monthlyTarget * 200000)) * 100).toFixed(0)} tamamlandı
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={broker.isActive ? 'green' : 'red'} 
                          variant="subtle"
                        >
                          {broker.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<MoreVertical size={16} />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<Edit size={16} />}
                              onClick={() => handleEditBroker(broker)}
                            >
                              Düzenle
                            </MenuItem>
                            <MenuItem
                              icon={broker.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                              onClick={() => toggleBrokerStatus(broker.id)}
                            >
                              {broker.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                            </MenuItem>
                            <MenuItem
                              icon={<Trash2 size={16} />}
                              onClick={() => handleDeleteBroker(broker)}
                              color="red.500"
                            >
                              Sil
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Add/Edit Broker Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {isEditing ? 'Danışman Düzenle' : 'Yeni Danışman Ekle'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Ad Soyad</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Danışman adı soyadı"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>E-posta</FormLabel>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@emlak.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefon</FormLabel>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    value={formData.role || 'broker'}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Broker['role'] }))}
                  >
                    <option value="junior_broker">Stajyer Danışman</option>
                    <option value="broker">Danışman</option>
                    <option value="senior_broker">Kıdemli Danışman</option>
                    <option value="admin">Yönetici</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Komisyon Oranı (%)</FormLabel>
                  <NumberInput
                    value={formData.commissionRate || 3}
                    onChange={(_, value) => setFormData(prev => ({ ...prev, commissionRate: value }))}
                    min={0}
                    max={10}
                    step={0.5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Aylık Hedef (Emlak Sayısı)</FormLabel>
                  <NumberInput
                    value={formData.monthlyTarget || 10}
                    onChange={(_, value) => setFormData(prev => ({ ...prev, monthlyTarget: value }))}
                    min={1}
                    max={50}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Durum</FormLabel>
                  <Switch
                    isChecked={formData.isActive || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} mt={1}>
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </Text>
                </FormControl>

                <Divider />

                <Box w="100%">
                  <Text fontWeight="medium" mb={3} color={useColorModeValue('gray.800', 'white')}>
                    Yetkilendirmeler
                  </Text>
                  <VStack align="start" spacing={3}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0} flex={1}>Emlak Yönetimi</FormLabel>
                      <Switch
                        isChecked={formData.permissions?.canManageProperties || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            canManageProperties: e.target.checked
                          }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0} flex={1}>Müşteri Yönetimi</FormLabel>
                      <Switch
                        isChecked={formData.permissions?.canManageCustomers || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            canManageCustomers: e.target.checked
                          }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0} flex={1}>Raporları Görüntüleme</FormLabel>
                      <Switch
                        isChecked={formData.permissions?.canViewReports || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            canViewReports: e.target.checked
                          }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0} flex={1}>Danışman Yönetimi</FormLabel>
                      <Switch
                        isChecked={formData.permissions?.canManageBrokers || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            canManageBrokers: e.target.checked
                          }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0} flex={1}>Sistem Ayarları</FormLabel>
                      <Switch
                        isChecked={formData.permissions?.canManageSettings || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            canManageSettings: e.target.checked
                          }
                        }))}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                İptal
              </Button>
              <Button colorScheme="blue" onClick={handleSaveBroker}>
                {isEditing ? 'Güncelle' : 'Ekle'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Danışmanı Sil
              </AlertDialogHeader>
              <AlertDialogBody>
                {deleteConfirmBroker?.name} adlı danışmanı silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteClose}>
                  İptal
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  Sil
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
};

export default BrokerManagement;