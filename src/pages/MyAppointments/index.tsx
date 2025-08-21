import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  RadioGroup,
  Radio,
  useDisclosure,
  Checkbox,
  Switch,
  FormHelperText
} from '@chakra-ui/react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Edit, Trash2, Plus, MessageCircle } from 'react-feather';
import { useAuth } from '../../context/AuthContext';

const APPOINTMENT_REASONS = {
  viewing: 'Yer Gösterme',
  meeting: 'Toplantı',
  deed_process: 'Tapu İşlemleri',
  sale: 'Satış Görüşmesi',
  rent: 'Kiralama Görüşmesi',
  valuation: 'Değerleme',
  consultation: 'Danışmanlık',
  other: 'Diğer'
} as const;

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  appointmentDate: string;
  appointmentTime: string | null | undefined;
  appointmentReason: 'viewing' | 'meeting' | 'deed_process' | 'sale' | 'rent' | 'valuation' | 'consultation' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'postponed';
  notes?: string;
  additionalParticipants?: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    role: 'owner' | 'consultant' | 'assistant' | 'other';
  }>;
  reminders?: {
    sms: {
      enabled: boolean;
      timing: '15' | '30' | '60' | '120' | '1440';
    };
    email: {
      enabled: boolean;
      timing: '60' | '120' | '1440' | '2880' | '10080';
    };
  };
  createdAt: string;
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    customerName: '',
    propertyTitle: '',
    status: 'all'
  });
  const [newAppointment, setNewAppointment] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    propertySelectionType: 'portfolio' as 'portfolio' | 'manual',
    propertyId: '',
    propertyTitle: '',
    propertyAddress: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentReason: 'viewing' as keyof typeof APPOINTMENT_REASONS,
    notes: '',
    additionalParticipants: [] as Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      role: 'owner' | 'consultant' | 'assistant' | 'other';
    }>,
    reminders: {
      sms: {
        enabled: false,
        timing: '15' as '15' | '30' | '60' | '120' | '1440' // dakika cinsinden
      },
      email: {
        enabled: false,
        timing: '1440' as '60' | '120' | '1440' | '2880' | '10080' // dakika cinsinden
      }
    }
  });
  const { user } = useAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
    fetchProperties();
  }, []);

  // Filtreleme useEffect'i
  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const applyFilters = () => {
    let filtered = [...appointments];

    // Tarih filtreleme
    if (filters.dateFrom) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.appointmentDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(appointment => 
        new Date(appointment.appointmentDate) <= new Date(filters.dateTo)
      );
    }

    // Müşteri adı filtreleme
    if (filters.customerName) {
      filtered = filtered.filter(appointment => 
        appointment.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    // Emlak adı filtreleme
    if (filters.propertyTitle) {
      filtered = filtered.filter(appointment => 
        appointment.propertyTitle.toLowerCase().includes(filters.propertyTitle.toLowerCase())
      );
    }

    // Durum filtreleme
    if (filters.status !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filters.status);
    }

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      customerName: '',
      propertyTitle: '',
      status: 'all'
    });
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        throw new Error('Randevular yüklenemedi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched customers:', data);
        setCustomers(data);
      }
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties', {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || data);
      }
    } catch (err) {
      console.error('Emlaklar yüklenemedi:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'postponed':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'postponed':
        return 'Ertelendi';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString || typeof timeString !== 'string') {
      return '-';
    }
    return timeString.slice(0, 5);
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchAppointments();
        toast({
          title: 'Başarılı',
          description: 'Randevu durumu güncellendi',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Güncelleme başarısız');
      }
    } catch (err) {
      toast({
        title: 'Hata',
        description: 'Randevu durumu güncellenemedi',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddAppointment = async () => {
    try {
      // Form validasyonu
      if (!newAppointment.customerName || !newAppointment.propertyTitle || 
          !newAppointment.propertyAddress || !newAppointment.appointmentDate || 
          !newAppointment.appointmentTime) {
        toast({
          title: 'Hata',
          description: 'Lütfen tüm gerekli alanları doldurun',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // E-posta validasyonu
      if (newAppointment.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAppointment.customerEmail)) {
        toast({
          title: 'Hata',
          description: 'Geçerli bir e-posta adresi girin',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Telefon validasyonu
      if (newAppointment.customerPhone && !/^[0-9+\-\s()]+$/.test(newAppointment.customerPhone)) {
        toast({
          title: 'Hata',
          description: 'Geçerli bir telefon numarası girin',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Tarih validasyonu (geçmiş tarih kontrolü)
      const selectedDate = new Date(newAppointment.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        toast({
          title: 'Hata',
          description: 'Geçmiş bir tarih seçemezsiniz',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      const appointmentData = {
        customerName: newAppointment.customerName,
        customerPhone: newAppointment.customerPhone,
        customerEmail: newAppointment.customerEmail,
        propertyTitle: newAppointment.propertyTitle,
        propertyAddress: newAppointment.propertyAddress,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        appointmentReason: newAppointment.appointmentReason,
        notes: newAppointment.notes,
        additionalParticipants: newAppointment.additionalParticipants,
        reminders: newAppointment.reminders,
        status: 'pending'
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        // Eğer yeni müşteri eklendiyse, müşteri listesini de güncelle
        if (newAppointment.customerId === 'new') {
          const customerData = {
            name: newAppointment.customerName,
            phone: newAppointment.customerPhone,
            email: newAppointment.customerEmail
          };

          await fetch('/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(customerData)
          });

          // Müşteri listesini yenile
          await fetchCustomers();
        }

        // Randevu listesini yenile
        await fetchAppointments();
        
        // Formu temizle ve modalı kapat
        setNewAppointment({
          customerId: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          propertySelectionType: 'portfolio' as 'portfolio' | 'manual',
          propertyId: '',
          propertyTitle: '',
          propertyAddress: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentReason: 'viewing' as keyof typeof APPOINTMENT_REASONS,
          notes: '',
          additionalParticipants: [],
          reminders: {
            sms: {
              enabled: false,
              timing: '15' as '15' | '30' | '60' | '120' | '1440'
            },
            email: {
              enabled: false,
              timing: '1440' as '60' | '120' | '1440' | '2880' | '10080'
            }
          }
        });
        setIsAddModalOpen(false);

        toast({
          title: 'Başarılı',
          description: 'Randevu başarıyla eklendi',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Randevu eklenemedi');
      }
    } catch (err) {
      toast({
        title: 'Hata',
        description: 'Randevu eklenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const addParticipant = () => {
    const newParticipant = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      email: '',
      role: 'other' as 'owner' | 'consultant' | 'assistant' | 'other'
    };
    setNewAppointment({
      ...newAppointment,
      additionalParticipants: [...newAppointment.additionalParticipants, newParticipant]
    });
  };

  const removeParticipant = (id: string) => {
    setNewAppointment({
      ...newAppointment,
      additionalParticipants: newAppointment.additionalParticipants.filter(p => p.id !== id)
    });
  };

  const updateParticipant = (id: string, field: string, value: string) => {
    setNewAppointment({
      ...newAppointment,
      additionalParticipants: newAppointment.additionalParticipants.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Randevular yükleniyor...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Hata!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" color={headingColor} mb={2}>
              Randevularım
            </Heading>
            <Text color={textColor}>
              Tüm randevularınızı buradan görüntüleyebilir ve yönetebilirsiniz.
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={Plus} />}
            colorScheme="blue"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
          >
            Randevu Ekle
          </Button>
        </Flex>

        {/* Filtreleme Bölümü */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color={headingColor}>Filtreleme</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Başlangıç Tarihi</FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Bitiş Tarihi</FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Müşteri Adı</FormLabel>
                <Input
                  placeholder="Müşteri adı ara..."
                  value={filters.customerName}
                  onChange={(e) => handleFilterChange('customerName', e.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Emlak Adı</FormLabel>
                <Input
                  placeholder="Emlak adı ara..."
                  value={filters.propertyTitle}
                  onChange={(e) => handleFilterChange('propertyTitle', e.target.value)}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Durum</FormLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="sm"
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="completed">Gerçekleşti</option>
                  <option value="postponed">Ertelendi</option>
                  <option value="cancelled">İptal Edildi</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            <HStack mt={4} spacing={2}>
              <Button size="sm" colorScheme="gray" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
              <Text fontSize="sm" color={textColor}>
                {filteredAppointments.length} randevu gösteriliyor
              </Text>
            </HStack>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 6 }} spacing={4}>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'pending').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Beklemede</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'confirmed').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Onaylı</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'completed').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Tamamlandı</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'cancelled').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>İptal</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'postponed').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Ertelendi</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                {Array.isArray(filteredAppointments) ? filteredAppointments.length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Toplam</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Appointments List */}
        {!Array.isArray(filteredAppointments) || filteredAppointments.length === 0 ? (
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={12}>
              <Icon as={Calendar} boxSize={12} color="gray.400" mb={4} />
              <Heading size="md" color="gray.400" mb={2}>
                Henüz randevunuz bulunmuyor
              </Heading>
              <Text color={textColor}>
                Müşterilerinizle randevu oluşturduğunuzda burada görünecektir.
              </Text>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} bg={bgColor} border="1px" borderColor={borderColor} _hover={{ shadow: 'md' }}>
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Avatar size="sm" name={appointment.customerName} />
                      <Box>
                        <Text fontWeight="bold" color={headingColor}>
                        {appointment?.customerName || 'Bilinmeyen Müşteri'}
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {appointment?.propertyTitle || 'Bilinmeyen Emlak'}
                      </Text>
                      </Box>
                    </HStack>
                    <VStack spacing={3} align="end">
                      <Badge colorScheme={getStatusColor(appointment?.status || 'pending')} variant="subtle" fontSize="xs" px={3} py={1} borderRadius="full">
                        {getStatusText(appointment?.status || 'pending')}
                      </Badge>
                      <HStack spacing={2} bg="gray.50" p={2} borderRadius="lg" border="1px" borderColor="gray.200">
                        <Tooltip label="Ara" placement="top">
                          <IconButton
                            aria-label="Ara"
                            icon={<Phone size={16} />}
                            size="sm"
                            variant="solid"
                            colorScheme="green"
                            borderRadius="md"
                            _hover={{ transform: 'scale(1.05)', shadow: 'md' }}
                            onClick={() => window.open(`tel:${appointment.customerPhone}`)}
                          />
                        </Tooltip>
                        <Tooltip label="Mesaj Gönder" placement="top">
                          <IconButton
                            aria-label="Mesaj gönder"
                            icon={<MessageCircle size={16} />}
                            size="sm"
                            variant="solid"
                            colorScheme="blue"
                            borderRadius="md"
                            _hover={{ transform: 'scale(1.05)', shadow: 'md' }}
                            onClick={() => window.open(`sms:${appointment.customerPhone}`)}
                          />
                        </Tooltip>
                        <Tooltip label="Düzenle" placement="top">
                          <IconButton
                            aria-label="Düzenle"
                            icon={<Edit size={16} />}
                            size="sm"
                            variant="solid"
                            colorScheme="orange"
                            borderRadius="md"
                            _hover={{ transform: 'scale(1.05)', shadow: 'md' }}
                            onClick={() => {
                              // TODO: Düzenleme modalını aç
                              console.log('Randevu düzenle:', appointment.id);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="İptal Et" placement="top">
                          <IconButton
                            aria-label="İptal et"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="solid"
                            colorScheme="red"
                            borderRadius="md"
                            _hover={{ transform: 'scale(1.05)', shadow: 'md' }}
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Icon as={Calendar} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor}>
                          {appointment?.appointmentDate ? formatDate(appointment.appointmentDate) : '-'}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={Clock} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor}>
                          {formatTime(appointment?.appointmentTime)}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={User} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor}>
                          {APPOINTMENT_REASONS[appointment?.appointmentReason] || 'Belirtilmemiş'}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={MapPin} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {appointment?.propertyAddress || 'Adres belirtilmemiş'}
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2}>
                        <Icon as={Phone} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor}>
                          {appointment.customerPhone}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={Mail} size={16} color="gray.500" />
                        <Text fontSize="sm" color={textColor}>
                          {appointment.customerEmail}
                        </Text>
                      </HStack>
                      {appointment.notes && (
                        <Text fontSize="sm" color={textColor} fontStyle="italic">
                          "{appointment.notes}"
                        </Text>
                      )}
                    </VStack>
                  </SimpleGrid>
                  
                  {appointment.additionalParticipants && appointment.additionalParticipants.length > 0 && (
                    <>
                      <Divider my={3} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={headingColor} mb={2}>
                          Ek Katılımcılar ({appointment.additionalParticipants.length})
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          {appointment.additionalParticipants.map((participant) => (
                            <Box key={participant.id} p={2} bg="gray.50" borderRadius="md">
                              <HStack spacing={2}>
                                <Avatar size="xs" name={participant.name} />
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text fontSize="xs" fontWeight="medium">
                                    {participant.name}
                                  </Text>
                                  <Text fontSize="xs" color={textColor}>
                                    {participant.role === 'owner' ? 'Mal Sahibi' : 
                                     participant.role === 'consultant' ? 'Danışman' :
                                     participant.role === 'assistant' ? 'Asistan' : 'Diğer'}
                                  </Text>
                                  {participant.phone && (
                                    <Text fontSize="xs" color={textColor}>
                                      {participant.phone}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    </>
                  )}
                  
                  {appointment.reminders && (appointment.reminders.sms.enabled || appointment.reminders.email.enabled) && (
                    <>
                      <Divider my={3} />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={headingColor} mb={2}>
                          Hatırlatmalar
                        </Text>
                        <HStack spacing={4} flexWrap="wrap">
                          {appointment.reminders.sms.enabled && (
                            <HStack spacing={1}>
                              <Icon as={Phone} size={14} color="blue.500" />
                              <Text fontSize="xs" color={textColor}>
                                SMS: {appointment.reminders.sms.timing === '15' ? '15 dk önce' :
                                     appointment.reminders.sms.timing === '30' ? '30 dk önce' :
                                     appointment.reminders.sms.timing === '60' ? '1 saat önce' :
                                     appointment.reminders.sms.timing === '120' ? '2 saat önce' :
                                     '1 gün önce'}
                              </Text>
                            </HStack>
                          )}
                          {appointment.reminders.email.enabled && (
                            <HStack spacing={1}>
                              <Icon as={Mail} size={14} color="green.500" />
                              <Text fontSize="xs" color={textColor}>
                                E-posta: {appointment.reminders.email.timing === '60' ? '1 saat önce' :
                                         appointment.reminders.email.timing === '120' ? '2 saat önce' :
                                         appointment.reminders.email.timing === '1440' ? '1 gün önce' :
                                         appointment.reminders.email.timing === '2880' ? '2 gün önce' :
                                         '1 hafta önce'}
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                      </Box>
                    </>
                  )}
                  
                  {appointment.status === 'pending' && (
                    <>
                      <Divider my={4} />
                      <HStack spacing={2} justify="flex-end" flexWrap="wrap">
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'postponed')}
                        >
                          Ertele
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        >
                          İptal Et
                        </Button>
                      </HStack>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <>
                      <Divider my={4} />
                      <HStack spacing={2} justify="flex-end" flexWrap="wrap">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        >
                          Gerçekleşti
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'postponed')}
                        >
                          Ertele
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        >
                          İptal Et
                        </Button>
                      </HStack>
                    </>
                  )}
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Add Appointment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Randevu Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Müşteri</FormLabel>
                <Select
                  placeholder="Müşteri seçin veya yeni ekleyin"
                  value={newAppointment.customerId}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.id === parseInt(e.target.value));
                    console.log('Selected customer:', selectedCustomer);
                    console.log('Customer ID:', e.target.value);
                    console.log('All customers:', customers);
                    if (selectedCustomer) {
                      setNewAppointment({
                        ...newAppointment,
                        customerId: e.target.value,
                        customerName: selectedCustomer.name,
                        customerPhone: selectedCustomer.phone,
                        customerEmail: selectedCustomer.email
                      });
                    } else {
                      setNewAppointment({
                        ...newAppointment,
                        customerId: e.target.value,
                        customerName: '',
                        customerPhone: '',
                        customerEmail: ''
                      });
                    }
                  }}
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                  <option value="new">+ Yeni Müşteri Ekle</option>
                </Select>
              </FormControl>

              {newAppointment.customerId === 'new' ? (
                <>
                  <FormControl isRequired>
                    <FormLabel>Müşteri Adı</FormLabel>
                    <Input
                      value={newAppointment.customerName}
                      onChange={(e) => setNewAppointment({...newAppointment, customerName: e.target.value})}
                      placeholder="Müşteri adını girin"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={newAppointment.customerPhone}
                      onChange={(e) => setNewAppointment({...newAppointment, customerPhone: e.target.value})}
                      placeholder="Telefon numarasını girin"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>E-posta</FormLabel>
                    <Input
                      type="email"
                      value={newAppointment.customerEmail}
                      onChange={(e) => setNewAppointment({...newAppointment, customerEmail: e.target.value})}
                      placeholder="E-posta adresini girin"
                    />
                  </FormControl>
                </>
              ) : newAppointment.customerId && (
                <>
                  <FormControl>
                    <FormLabel>Müşteri Adı</FormLabel>
                    <Input
                      value={newAppointment.customerName}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Otomatik doldurulacak"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={newAppointment.customerPhone}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Otomatik doldurulacak"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>E-posta</FormLabel>
                    <Input
                      type="email"
                      value={newAppointment.customerEmail}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Otomatik doldurulacak"
                    />
                  </FormControl>
                </>
              )}

              <FormControl isRequired>
                <FormLabel>Emlak Seçim Türü</FormLabel>
                <RadioGroup
                  value={newAppointment.propertySelectionType}
                  onChange={(value: 'portfolio' | 'manual') => {
                    setNewAppointment({
                      ...newAppointment,
                      propertySelectionType: value,
                      propertyId: '',
                      propertyTitle: '',
                      propertyAddress: ''
                    });
                  }}
                >
                  <HStack spacing={6}>
                    <Radio value="portfolio">Portföyden Seç</Radio>
                    <Radio value="manual">Manuel Ekle</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              {newAppointment.propertySelectionType === 'portfolio' ? (
                <>
                  <FormControl isRequired>
                    <FormLabel>Emlak Seçimi</FormLabel>
                    <Select
                      placeholder="Portföyden Seç"
                      value={newAppointment.propertyId}
                      onChange={(e) => {
                        const selectedProperty = properties.find(p => p.id.toString() === e.target.value);
                        if (selectedProperty) {
                          setNewAppointment({
                            ...newAppointment,
                            propertyId: e.target.value,
                            propertyTitle: selectedProperty.title,
                            propertyAddress: selectedProperty.address
                          });
                        } else {
                          setNewAppointment({
                            ...newAppointment,
                            propertyId: '',
                            propertyTitle: '',
                            propertyAddress: ''
                          });
                        }
                      }}
                    >
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title} - {property.address}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {newAppointment.propertyId && (
                    <>
                      <FormControl>
                        <FormLabel>Emlak Başlığı</FormLabel>
                        <Input
                          value={newAppointment.propertyTitle}
                          isReadOnly
                          bg="gray.50"
                          placeholder="Otomatik doldurulacak"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Emlak Adresi</FormLabel>
                        <Input
                          value={newAppointment.propertyAddress}
                          isReadOnly
                          bg="gray.50"
                          placeholder="Otomatik doldurulacak"
                        />
                      </FormControl>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FormControl isRequired>
                    <FormLabel>Emlak Başlığı</FormLabel>
                    <Input
                      value={newAppointment.propertyTitle}
                      onChange={(e) => setNewAppointment({...newAppointment, propertyTitle: e.target.value})}
                      placeholder="Emlak başlığını girin"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Emlak Adresi</FormLabel>
                    <Input
                      value={newAppointment.propertyAddress}
                      onChange={(e) => setNewAppointment({...newAppointment, propertyAddress: e.target.value})}
                      placeholder="Emlak adresini girin"
                    />
                  </FormControl>
                </>
              )}

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Tarih</FormLabel>
                  <Input
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Saat</FormLabel>
                  <Input
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Randevu Nedeni</FormLabel>
                <Select
                  value={newAppointment.appointmentReason}
                  onChange={(e) => setNewAppointment({...newAppointment, appointmentReason: e.target.value as keyof typeof APPOINTMENT_REASONS})}
                >
                  {Object.entries(APPOINTMENT_REASONS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Notlar</FormLabel>
                <Textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  placeholder="Randevu ile ilgili notlar (opsiyonel)"
                  rows={3}
                />
              </FormControl>

              <Box>
                <HStack justify="space-between" mb={3}>
                  <FormLabel mb={0}>Ek Katılımcılar</FormLabel>
                  <Button size="sm" colorScheme="green" onClick={addParticipant}>
                    + Katılımcı Ekle
                  </Button>
                </HStack>
                
                {newAppointment.additionalParticipants.map((participant, index) => (
                  <Box key={participant.id} p={4} border="1px" borderColor={borderColor} borderRadius="md" mb={3}>
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">Katılımcı {index + 1}</Text>
                      <Button size="sm" colorScheme="red" variant="ghost" onClick={() => removeParticipant(participant.id)}>
                        Sil
                      </Button>
                    </HStack>
                    
                    <VStack spacing={3}>
                      <HStack spacing={3} width="100%">
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Ad Soyad</FormLabel>
                          <Input
                            size="sm"
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                            placeholder="Ad Soyad"
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Rol</FormLabel>
                          <Select
                            size="sm"
                            value={participant.role}
                            onChange={(e) => updateParticipant(participant.id, 'role', e.target.value)}
                          >
                            <option value="owner">Mal Sahibi</option>
                            <option value="consultant">Danışman</option>
                            <option value="assistant">Asistan</option>
                            <option value="other">Diğer</option>
                          </Select>
                        </FormControl>
                      </HStack>
                      
                      <HStack spacing={3} width="100%">
                        <FormControl>
                          <FormLabel fontSize="sm">Telefon</FormLabel>
                          <Input
                            size="sm"
                            value={participant.phone}
                            onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                            placeholder="Telefon numarası"
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm">E-posta</FormLabel>
                          <Input
                            size="sm"
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                            placeholder="E-posta adresi"
                          />
                        </FormControl>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
                
                {newAppointment.additionalParticipants.length === 0 && (
                  <Text fontSize="sm" color={textColor} fontStyle="italic">
                    Henüz ek katılımcı eklenmedi. Yukarıdaki butona tıklayarak katılımcı ekleyebilirsiniz.
                  </Text>
                )}
              </Box>
              
              {/* Hatırlatma Seçenekleri */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3}>
                  Hatırlatma Seçenekleri
                </Text>
                <VStack spacing={4} align="stretch">
                  {/* SMS Hatırlatma */}
                  <Box p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                    <HStack justify="space-between" mb={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          SMS Hatırlatma
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Randevu öncesi SMS ile hatırlatma gönder
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={newAppointment.reminders.sms.enabled}
                        onChange={(e) => setNewAppointment(prev => ({
                          ...prev,
                          reminders: {
                            ...prev.reminders,
                            sms: {
                              ...prev.reminders.sms,
                              enabled: e.target.checked
                            }
                          }
                        }))}
                      />
                    </HStack>
                    {newAppointment.reminders.sms.enabled && (
                      <FormControl>
                        <FormLabel fontSize="sm">Hatırlatma Zamanı</FormLabel>
                        <Select
                          size="sm"
                          value={newAppointment.reminders.sms.timing}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            reminders: {
                              ...prev.reminders,
                              sms: {
                                ...prev.reminders.sms,
                                timing: e.target.value as '15' | '30' | '60' | '120' | '1440'
                              }
                            }
                          }))}
                        >
                          <option value="15">15 dakika önce</option>
                          <option value="30">30 dakika önce</option>
                          <option value="60">1 saat önce</option>
                          <option value="120">2 saat önce</option>
                          <option value="1440">1 gün önce</option>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                  
                  {/* E-posta Hatırlatma */}
                  <Box p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                    <HStack justify="space-between" mb={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          E-posta Hatırlatma
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Randevu öncesi e-posta ile hatırlatma gönder
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={newAppointment.reminders.email.enabled}
                        onChange={(e) => setNewAppointment(prev => ({
                          ...prev,
                          reminders: {
                            ...prev.reminders,
                            email: {
                              ...prev.reminders.email,
                              enabled: e.target.checked
                            }
                          }
                        }))}
                      />
                    </HStack>
                    {newAppointment.reminders.email.enabled && (
                      <FormControl>
                        <FormLabel fontSize="sm">Hatırlatma Zamanı</FormLabel>
                        <Select
                          size="sm"
                          value={newAppointment.reminders.email.timing}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            reminders: {
                              ...prev.reminders,
                              email: {
                                ...prev.reminders.email,
                                timing: e.target.value as '60' | '120' | '1440' | '2880' | '10080'
                              }
                            }
                          }))}
                        >
                          <option value="60">1 saat önce</option>
                          <option value="120">2 saat önce</option>
                          <option value="1440">1 gün önce</option>
                          <option value="2880">2 gün önce</option>
                          <option value="10080">1 hafta önce</option>
                        </Select>
                        <FormHelperText fontSize="xs">
                          E-posta hatırlatmaları daha uzun süreli bildirimler için uygundur
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsAddModalOpen(false)}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleAddAppointment}>
              Randevu Ekle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyAppointments;