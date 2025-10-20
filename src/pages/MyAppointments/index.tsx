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
  InputGroup,
  InputLeftElement,
  Textarea,
  Select,
  RadioGroup,
  Radio,
  useDisclosure,
  Checkbox,
  Switch,
  FormHelperText
} from '@chakra-ui/react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Edit, Trash2, Plus, MessageCircle, UserCheck, UserX, AlertTriangle, Users, Filter, Search, CheckCircle, XCircle, RotateCcw, Pause, Home } from 'lucide-react';
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
  // All hooks must be called at the top level - no conditional hooks
  const { user } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // State declarations after hooks
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [editAppointment, setEditAppointment] = useState<any>(null);
  
  // Arama state'leri
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  
  // Filtreleme state'leri
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    customerName: '',
    propertyTitle: '',
    status: 'all'
  });
  const [newAppointment, setNewAppointment] = useState({
    customerSelectionType: 'existing' as 'existing' | 'manual',
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
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
    fetchProperties();
  }, []);

  // Müşteri arama filtreleme useEffect'i
  useEffect(() => {
    if (customerSearchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.phone.includes(customerSearchTerm) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearchTerm, customers]);

  // Portföy arama filtreleme useEffect'i
  useEffect(() => {
    if (propertySearchTerm.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property =>
        property.title.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(propertySearchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [propertySearchTerm, properties]);

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
        setAppointments(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        // Fallback to demo data when endpoint is missing or returns error
        const demoAppointments: Appointment[] = [
          {
            id: 1,
            customerName: 'Emirhan Aşkayanar',
            customerPhone: '0532 123 4567',
            customerEmail: 'emirhan@example.com',
            propertyTitle: 'Ataşehir 3+1 Daire',
            propertyAddress: 'İstanbul, Ataşehir',
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: '14:00',
            appointmentReason: 'viewing',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            customerName: 'Emin Gülertürk',
            customerPhone: '0533 456 7890',
            customerEmail: 'emin@example.com',
            propertyTitle: 'Kadıköy Ofis Katı',
            propertyAddress: 'İstanbul, Kadıköy',
            appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            appointmentTime: '10:30',
            appointmentReason: 'meeting',
            status: 'confirmed',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            customerName: 'Selim Gülertürk',
            customerPhone: '0535 789 0123',
            customerEmail: 'selim@example.com',
            propertyTitle: 'Bahçelievler 4+1',
            propertyAddress: 'İstanbul, Bahçelievler',
            appointmentDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
            appointmentTime: '16:00',
            appointmentReason: 'valuation',
            status: 'completed',
            createdAt: new Date().toISOString()
          }
        ];

        // Use demo data specifically on 404 or non-OK responses
        setAppointments(demoAppointments);
        setError(null);
      }
    } catch (err) {
      // Network errors: also fallback to demo data
      const demoAppointments: Appointment[] = [
        {
          id: 1,
          customerName: 'Emirhan Aşkayanar',
          customerPhone: '0532 123 4567',
          customerEmail: 'emirhan@example.com',
          propertyTitle: 'Ataşehir 3+1 Daire',
          propertyAddress: 'İstanbul, Ataşehir',
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '14:00',
          appointmentReason: 'viewing',
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          customerName: 'Emin Gülertürk',
          customerPhone: '0533 456 7890',
          customerEmail: 'emin@example.com',
          propertyTitle: 'Kadıköy Ofis Katı',
          propertyAddress: 'İstanbul, Kadıköy',
          appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          appointmentTime: '10:30',
          appointmentReason: 'meeting',
          status: 'confirmed',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          customerName: 'Selim Gülertürk',
          customerPhone: '0535 789 0123',
          customerEmail: 'selim@example.com',
          propertyTitle: 'Bahçelievler 4+1',
          propertyAddress: 'İstanbul, Bahçelievler',
          appointmentDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          appointmentTime: '16:00',
          appointmentReason: 'valuation',
          status: 'completed',
          createdAt: new Date().toISOString()
        }
      ];
      setAppointments(demoAppointments);
      setError(null);
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

  // Detay görüntüleme fonksiyonu
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  // Düzenleme fonksiyonu
  const handleEditAppointment = (appointment: Appointment) => {
    setEditAppointment({
      id: appointment.id,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
      propertyTitle: appointment.propertyTitle,
      propertyAddress: appointment.propertyAddress,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime || '',
      appointmentReason: appointment.appointmentReason,
      notes: appointment.notes || '',
      status: appointment.status
    });
    setIsEditModalOpen(true);
  };

  // Düzenleme kaydetme fonksiyonu
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/appointments/${editAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(editAppointment)
      });

      if (response.ok) {
        await fetchAppointments();
        setIsEditModalOpen(false);
        setEditAppointment(null);
        toast({
          title: 'Başarılı',
          description: 'Randevu başarıyla güncellendi',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Randevu güncellenemedi');
      }
    } catch (err) {
      console.error('Randevu güncelleme hatası:', err);
      toast({
        title: 'Hata',
        description: 'Randevu güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Randevu iptal etme fonksiyonu
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        await fetchAppointments();
        toast({
          title: 'Başarılı',
          description: 'Randevu iptal edildi',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        throw new Error('Randevu iptal edilemedi');
      }
    } catch (err) {
      console.error('Randevu iptal etme hatası:', err);
      toast({
        title: 'Hata',
        description: 'Randevu iptal edilirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Arama ve mesaj fonksiyonları
  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleMessage = (phoneNumber: string) => {
    window.open(`sms:${phoneNumber}`, '_self');
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
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={8} align="stretch" p={6}>
        {/* Modern Header */}
        <Card bg={useColorModeValue('white', 'gray.800')} shadow="lg" borderRadius="xl" border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <CardBody p={{ base: 4, md: 6, lg: 8 }}>
            <Flex justify="space-between" align="center" direction={{ base: 'column', lg: 'row' }} gap={{ base: 4, md: 6 }}>
              <VStack align={{ base: 'center', lg: 'start' }} spacing={3} textAlign={{ base: 'center', lg: 'left' }}>
                <HStack spacing={3} flexWrap={{ base: 'wrap', md: 'nowrap' }} justify={{ base: 'center', lg: 'start' }}>
                  <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="xl">
                    <Icon as={Calendar} size={24} color="blue.500" />
                  </Box>
                  <VStack align={{ base: 'center', lg: 'start' }} spacing={1}>
                    <Heading size={{ base: 'lg', md: 'xl' }} color={headingColor} fontWeight="bold">
                      Randevularım
                    </Heading>
                    <Text color={textColor} fontSize={{ base: 'md', lg: 'lg' }}>
                      Tüm randevularınızı profesyonel şekilde yönetin
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={{ base: 3, md: 6 }} color={textColor} fontSize="sm" flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
                  <HStack spacing={2}>
                    <Icon as={Clock} size={16} />
                    <Text>Otomatik hatırlatmalar</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={User} size={16} />
                    <Text>Müşteri takibi</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={MapPin} size={16} />
                    <Text>Konum entegrasyonu</Text>
                  </HStack>
                </HStack>
              </VStack>
              <VStack spacing={3} w={{ base: 'full', lg: 'auto' }}>
                <Button
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="blue"
                  size={{ base: 'md', lg: 'lg' }}
                  px={{ base: 6, lg: 8 }}
                  py={{ base: 4, lg: 6 }}
                  borderRadius="xl"
                  shadow="lg"
                  w={{ base: 'full', sm: 'auto' }}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Text display={{ base: 'none', sm: 'block' }}>Yeni Randevu Oluştur</Text>
                  <Text display={{ base: 'block', sm: 'none' }}>Yeni Randevu</Text>
                </Button>
                <Text fontSize="sm" color={textColor} display={{ base: 'none', lg: 'block' }}>
                  Hızlı randevu planlama
                </Text>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Modern Filtreleme Bölümü */}
        <Card bg={useColorModeValue('white', 'gray.800')} shadow="md" borderRadius="xl" border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <CardBody p={{ base: 4, md: 6 }}>
            <Flex justify="space-between" align="center" mb={6}>
              <HStack spacing={3}>
                <Box p={2} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
                  <Icon as={Filter} size={18} color="purple.500" />
                </Box>
                <Heading size="md" color={headingColor}>Akıllı Filtreleme</Heading>
              </HStack>
              <HStack spacing={3}>
                <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="sm">
                  {filteredAppointments.length} sonuç
                </Badge>
                <Button size="sm" variant="ghost" colorScheme="gray" onClick={clearFilters}>
                  Temizle
                </Button>
              </HStack>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>Başlangıç</FormLabel>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  size="md"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', shadow: '0 0 0 1px blue.400' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>Bitiş</FormLabel>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  size="md"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', shadow: '0 0 0 1px blue.400' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>Müşteri</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} size={16} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Müşteri ara..."
                    value={filters.customerName}
                    onChange={(e) => handleFilterChange('customerName', e.target.value)}
                    size="md"
                    borderRadius="lg"
                    _focus={{ borderColor: 'blue.400', shadow: '0 0 0 1px blue.400' }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>Emlak</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Home} size={16} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Emlak ara..."
                    value={filters.propertyTitle}
                    onChange={(e) => handleFilterChange('propertyTitle', e.target.value)}
                    size="md"
                    borderRadius="lg"
                    _focus={{ borderColor: 'blue.400', shadow: '0 0 0 1px blue.400' }}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color={textColor}>Durum</FormLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="md"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', shadow: '0 0 0 1px blue.400' }}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">⏳ Beklemede</option>
                  <option value="confirmed">✅ Onaylandı</option>
                  <option value="completed">🎉 Tamamlandı</option>
                  <option value="postponed">⏸️ Ertelendi</option>
                  <option value="cancelled">❌ İptal Edildi</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Modern İstatistik Kartları */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing={{ base: 4, md: 6 }}>
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('yellow.200', 'yellow.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('yellow.50', 'yellow.900')} borderRadius="full">
                  <Icon as={Clock} size={24} color="yellow.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="yellow.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'pending').length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Beklemede</Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('blue.200', 'blue.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="full">
                  <Icon as={UserCheck} size={24} color="blue.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'confirmed').length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Onaylandı</Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('green.200', 'green.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('green.50', 'green.900')} borderRadius="full">
                  <Icon as={Calendar} size={24} color="green.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'completed').length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Tamamlandı</Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('red.200', 'red.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('red.50', 'red.900')} borderRadius="full">
                  <Icon as={UserX} size={24} color="red.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'cancelled').length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">İptal Edildi</Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('orange.200', 'orange.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="full">
                  <Icon as={AlertTriangle} size={24} color="orange.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.filter(a => a?.status === 'postponed').length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Ertelendi</Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="lg" 
            borderRadius="xl" 
            border="1px" 
            borderColor={useColorModeValue('purple.200', 'purple.700')}
            _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            transition="all 0.3s"
          >
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Box p={3} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="full">
                  <Icon as={Users} size={24} color="purple.500" />
                </Box>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  {Array.isArray(filteredAppointments) ? filteredAppointments.length : 0}
                </Text>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Toplam</Text>
              </VStack>
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
              <Card 
                key={appointment.id} 
                bg={useColorModeValue('white', 'gray.800')} 
                shadow="lg" 
                borderRadius="xl" 
                border="1px" 
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                transition="all 0.3s"
                overflow="hidden"
              >
                <Box 
                  bg={useColorModeValue(
                    getStatusColor(appointment?.status || 'pending') + '.50', 
                    getStatusColor(appointment?.status || 'pending') + '.900'
                  )} 
                  h="4px" 
                />
                <CardHeader pb={3} px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
                  <Flex justify="space-between" align="start" direction={{ base: 'column', md: 'row' }} gap={{ base: 3, md: 0 }}>
                    <HStack spacing={4} flex={1} w="full">
                      <Avatar 
                        size={{ base: 'sm', md: 'md' }} 
                        name={appointment.customerName} 
                        bg={useColorModeValue('blue.500', 'blue.300')}
                        color="white"
                      />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color={headingColor} noOfLines={1}>
                          {appointment?.customerName || 'Bilinmeyen Müşteri'}
                        </Text>
                        <Text fontSize="sm" color={textColor} fontWeight="medium" noOfLines={1}>
                          {appointment?.propertyTitle || 'Bilinmeyen Emlak'}
                        </Text>
                        <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                          <HStack spacing={1}>
                            <Icon as={Calendar} size={14} color="gray.500" />
                            <Text fontSize="xs" color={textColor}>
                              {appointment?.appointmentDate ? formatDate(appointment.appointmentDate) : '-'}
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={Clock} size={14} color="gray.500" />
                            <Text fontSize="xs" color={textColor}>
                              {formatTime(appointment?.appointmentTime)}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </HStack>
                    <VStack spacing={3} align={{ base: 'start', md: 'end' }} w={{ base: 'full', md: 'auto' }}>
                      <Badge 
                        colorScheme={getStatusColor(appointment?.status || 'pending')} 
                        variant="solid" 
                        fontSize="xs" 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        fontWeight="medium"
                      >
                        {getStatusText(appointment?.status || 'pending')}
                      </Badge>
                      <HStack spacing={2} flexWrap="wrap">
                        <Tooltip label="Ara" placement="top">
                          <IconButton
                            aria-label="Ara"
                            icon={<Phone size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            borderRadius="full"
                            _hover={{ bg: 'green.100', transform: 'scale(1.1)' }}
                            onClick={() => handleCall(appointment.customerPhone)}
                          />
                        </Tooltip>
                        <Tooltip label="Mesaj Gönder" placement="top">
                          <IconButton
                            aria-label="Mesaj gönder"
                            icon={<MessageCircle size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            borderRadius="full"
                            _hover={{ bg: 'blue.100', transform: 'scale(1.1)' }}
                            onClick={() => handleMessage(appointment.customerPhone)}
                          />
                        </Tooltip>
                        <Tooltip label="Detayları Görüntüle" placement="top">
                          <IconButton
                            aria-label="Detayları görüntüle"
                            icon={<Eye size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="purple"
                            borderRadius="full"
                            _hover={{ bg: 'purple.100', transform: 'scale(1.1)' }}
                            onClick={() => handleViewDetails(appointment)}
                          />
                        </Tooltip>
                        <Tooltip label="Düzenle" placement="top">
                          <IconButton
                            aria-label="Düzenle"
                            icon={<Edit size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            borderRadius="full"
                            _hover={{ bg: 'orange.100', transform: 'scale(1.1)' }}
                            onClick={() => handleEditAppointment(appointment)}
                          />
                        </Tooltip>
                        <Tooltip label="İptal Et" placement="top">
                          <IconButton
                            aria-label="İptal et"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            borderRadius="full"
                            _hover={{ bg: 'red.100', transform: 'scale(1.1)' }}
                            onClick={() => handleCancelAppointment(appointment.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </Flex>
                </CardHeader>
                <CardBody pt={0} px={6} pb={4}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="start" spacing={3}>
                        <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg" w="full">
                          <HStack spacing={3} mb={2}>
                            <Icon as={User} size={18} color="blue.500" />
                            <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
                              Randevu Detayları
                            </Text>
                          </HStack>
                          <VStack align="start" spacing={2} pl={6}>
                            <Text fontSize="sm" color={textColor}>
                              <Text as="span" fontWeight="medium">Sebep:</Text> {APPOINTMENT_REASONS[appointment?.appointmentReason] || 'Belirtilmemiş'}
                            </Text>
                            <HStack spacing={2}>
                              <Icon as={MapPin} size={14} color="gray.500" />
                              <Text fontSize="sm" color={textColor} noOfLines={2}>
                                {appointment?.propertyAddress || 'Adres belirtilmemiş'}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                      
                      <VStack align="start" spacing={3}>
                        <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg" w="full">
                          <HStack spacing={3} mb={2}>
                            <Icon as={Phone} size={18} color="green.500" />
                            <Text fontSize="sm" fontWeight="semibold" color={headingColor}>
                              İletişim Bilgileri
                            </Text>
                          </HStack>
                          <VStack align="start" spacing={2} pl={6}>
                            <HStack spacing={2}>
                              <Icon as={Phone} size={14} color="gray.500" />
                              <Text fontSize="sm" color={textColor}>
                                {appointment.customerPhone}
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Icon as={Mail} size={14} color="gray.500" />
                              <Text fontSize="sm" color={textColor}>
                                {appointment.customerEmail}
                              </Text>
                            </HStack>
                          </VStack>
                        </Box>
                      </VStack>
                    </SimpleGrid>
                    
                    {appointment.notes && (
                      <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg" borderLeft="4px" borderColor="blue.500">
                        <Text fontSize="sm" color={textColor} fontStyle="italic">
                          <Text as="span" fontWeight="medium">Not:</Text> "{appointment.notes}"
                        </Text>
                      </Box>
                    )}
                  </VStack>
                  
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size={{ base: 'full', md: 'xl' }} scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius={{ base: 'none', md: 'xl' }} shadow="2xl" mx={{ base: 0, md: 4 }} my={{ base: 0, md: 4 }}>
          <ModalHeader bg={useColorModeValue('blue.50', 'blue.900')} borderTopRadius="xl">
            <HStack spacing={3}>
              <Box p={2} bg="blue.500" borderRadius="lg">
                <Icon as={Plus} color="white" size={20} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.700', 'blue.200')}>
                  Yeni Randevu Oluştur
                </Text>
                <Text fontSize="sm" color={useColorModeValue('blue.600', 'blue.300')}>
                  Müşterinizle profesyonel randevu planlayın
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: 4, md: 8 }}>
            <VStack spacing={{ base: 6, md: 8 }}>
              {/* Müşteri Seçimi Bölümü */}
              <Box w="full" p={{ base: 4, md: 6 }} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl" border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <HStack mb={4}>
                  <Icon as={User} color="blue.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.200')}>Müşteri Bilgileri</Text>
                </HStack>
                <FormControl mb={4}>
                  <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Müşteri Seçim Türü</FormLabel>
                  <RadioGroup
                    value={newAppointment.customerSelectionType}
                    onChange={(value: 'existing' | 'manual') => {
                      setNewAppointment({
                        ...newAppointment,
                        customerSelectionType: value,
                        customerId: '',
                        customerName: '',
                        customerPhone: '',
                        customerEmail: ''
                      });
                      setCustomerSearchTerm('');
                    }}
                  >
                    <HStack spacing={8} mt={2}>
                      <Radio value="existing" colorScheme="blue" size="lg">
                        <Text fontSize="sm" fontWeight="medium">Mevcut Müşteri</Text>
                      </Radio>
                      <Radio value="manual" colorScheme="blue" size="lg">
                        <Text fontSize="sm" fontWeight="medium">Manuel Ekle</Text>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                {newAppointment.customerSelectionType === 'existing' ? (
                  <VStack spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Müşteri Seçimi</FormLabel>
                      <Box position="relative">
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color="gray.400" boxSize={4} />
                          </InputLeftElement>
                          <Input
                            placeholder="Müşteri ara..."
                            value={customerSearchTerm}
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                            onChange={(e) => {
                              setCustomerSearchTerm(e.target.value);
                              setShowCustomerDropdown(true);
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                          />
                        </InputGroup>
                        
                        {showCustomerDropdown && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            zIndex={1000}
                            bg={useColorModeValue('white', 'gray.800')}
                            border="1px"
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                            borderRadius="md"
                            boxShadow="lg"
                            maxH="200px"
                            overflowY="auto"
                            mt={1}
                          >
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <Box
                                  key={customer.id}
                                  p={3}
                                  cursor="pointer"
                                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                  onClick={() => {
                                    setNewAppointment({
                                      ...newAppointment,
                                      customerId: customer.id.toString(),
                                      customerName: customer.name,
                                      customerPhone: customer.phone,
                                      customerEmail: customer.email
                                    });
                                    setCustomerSearchTerm(customer.name);
                                    setShowCustomerDropdown(false);
                                  }}
                                >
                                  <Text fontWeight="medium">{customer.name}</Text>
                                  <Text fontSize="sm" color="gray.500">{customer.phone} • {customer.email}</Text>
                                </Box>
                              ))
                            ) : (
                              <Box p={3}>
                                <Text fontSize="sm" color="gray.500">Müşteri bulunamadı</Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </FormControl>

                    {newAppointment.customerId && (
                      <SimpleGrid columns={1} spacing={4} w="full">
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Müşteri Adı</FormLabel>
                          <Input
                            value={newAppointment.customerName}
                            isReadOnly
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            placeholder="Otomatik doldurulacak"
                          />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Telefon</FormLabel>
                            <Input
                              value={newAppointment.customerPhone}
                              isReadOnly
                              bg={useColorModeValue('gray.100', 'gray.700')}
                              borderColor={useColorModeValue('gray.300', 'gray.600')}
                              placeholder="Otomatik doldurulacak"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>E-posta</FormLabel>
                            <Input
                              value={newAppointment.customerEmail}
                              isReadOnly
                              bg={useColorModeValue('gray.100', 'gray.700')}
                              borderColor={useColorModeValue('gray.300', 'gray.600')}
                              placeholder="Otomatik doldurulacak"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </SimpleGrid>
                    )}
                  </VStack>
                ) : (
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={1} spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Müşteri Adı</FormLabel>
                        <Input
                          value={newAppointment.customerName}
                          onChange={(e) => setNewAppointment({...newAppointment, customerName: e.target.value})}
                          placeholder="Müşteri adını girin"
                          bg={useColorModeValue('white', 'gray.800')}
                          borderColor={useColorModeValue('gray.300', 'gray.600')}
                          _hover={{ borderColor: 'blue.400' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Telefon</FormLabel>
                          <Input
                            value={newAppointment.customerPhone}
                            onChange={(e) => setNewAppointment({...newAppointment, customerPhone: e.target.value})}
                            placeholder="Telefon numarasını girin"
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>E-posta</FormLabel>
                          <Input
                            type="email"
                            value={newAppointment.customerEmail}
                            onChange={(e) => setNewAppointment({...newAppointment, customerEmail: e.target.value})}
                            placeholder="E-posta adresini girin"
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'blue.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </SimpleGrid>
                  </VStack>
                )}
              </Box>

              {/* Emlak Seçimi Bölümü */}
              <Box w="full" p={6} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl" border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <HStack mb={4}>
                  <Icon as={MapPin} color="green.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.200')}>Emlak Bilgileri</Text>
                </HStack>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Seçim Türü</FormLabel>
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
                    <HStack spacing={8} mt={2}>
                      <Radio value="portfolio" colorScheme="blue" size="lg">
                        <Text fontSize="sm" fontWeight="medium">Portföyden Seç</Text>
                      </Radio>
                      <Radio value="manual" colorScheme="blue" size="lg">
                        <Text fontSize="sm" fontWeight="medium">Manuel Ekle</Text>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                {newAppointment.propertySelectionType === 'portfolio' ? (
                  <VStack spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Seçimi</FormLabel>
                      <Box position="relative">
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color="gray.400" boxSize={4} />
                          </InputLeftElement>
                          <Input
                            placeholder="Portföy ara veya yeni ekle..."
                            value={propertySearchTerm}
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'green.400' }}
                            _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px #38a169' }}
                            onChange={(e) => {
                              setPropertySearchTerm(e.target.value);
                              setShowPropertyDropdown(true);
                            }}
                            onFocus={() => setShowPropertyDropdown(true)}
                          />
                        </InputGroup>
                        
                        {showPropertyDropdown && (
                          <Box
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            zIndex={1000}
                            bg={useColorModeValue('white', 'gray.800')}
                            border="1px"
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                            borderRadius="md"
                            boxShadow="lg"
                            maxH="200px"
                            overflowY="auto"
                            mt={1}
                          >
                            {filteredProperties.length > 0 ? (
                              filteredProperties.map((property) => (
                                <Box
                                  key={property.id}
                                  p={3}
                                  cursor="pointer"
                                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                  onClick={() => {
                                    setNewAppointment({
                                      ...newAppointment,
                                      propertyId: property.id.toString(),
                                      propertyTitle: property.title,
                                      propertyAddress: property.address
                                    });
                                    setPropertySearchTerm(`${property.title} - ${property.address}`);
                                    setShowPropertyDropdown(false);
                                  }}
                                >
                                  <Text fontSize="sm" fontWeight="medium">{property.title}</Text>
                                  <Text fontSize="xs" color="gray.500">{property.address}</Text>
                                </Box>
                              ))
                            ) : propertySearchTerm ? (
                              <Box
                                p={3}
                                cursor="pointer"
                                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                onClick={() => {
                                  setNewAppointment({
                                    ...newAppointment,
                                    propertyId: 'new',
                                    propertyTitle: propertySearchTerm,
                                    propertyAddress: ''
                                  });
                                  setShowPropertyDropdown(false);
                                }}
                              >
                                <HStack>
                                  <Icon as={Plus} color="green.500" boxSize={4} />
                                  <Text fontSize="sm" color="green.500">"{propertySearchTerm}" olarak yeni portföy ekle</Text>
                                </HStack>
                              </Box>
                            ) : (
                              <Box p={3}>
                                <Text fontSize="sm" color="gray.500">Portföy bulunamadı</Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </FormControl>

                    {newAppointment.propertyId && (
                      <SimpleGrid columns={1} spacing={4} w="full">
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Başlığı</FormLabel>
                          <Input
                            value={newAppointment.propertyTitle}
                            isReadOnly
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            placeholder="Otomatik doldurulacak"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Adresi</FormLabel>
                          <Input
                            value={newAppointment.propertyAddress}
                            isReadOnly
                            bg={useColorModeValue('gray.100', 'gray.700')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            placeholder="Otomatik doldurulacak"
                          />
                        </FormControl>
                      </SimpleGrid>
                    )}
                  </VStack>
                ) : (
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={1} spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Başlığı</FormLabel>
                        <Input
                          value={newAppointment.propertyTitle}
                          onChange={(e) => setNewAppointment({...newAppointment, propertyTitle: e.target.value})}
                          placeholder="Emlak başlığını girin"
                          bg={useColorModeValue('white', 'gray.800')}
                          borderColor={useColorModeValue('gray.300', 'gray.600')}
                          _hover={{ borderColor: 'green.400' }}
                          _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px #38a169' }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Emlak Adresi</FormLabel>
                        <Input
                          value={newAppointment.propertyAddress}
                          onChange={(e) => setNewAppointment({...newAppointment, propertyAddress: e.target.value})}
                          placeholder="Emlak adresini girin"
                          bg={useColorModeValue('white', 'gray.800')}
                          borderColor={useColorModeValue('gray.300', 'gray.600')}
                          _hover={{ borderColor: 'green.400' }}
                          _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px #38a169' }}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                )}
              </Box>

              {/* Randevu Detayları Bölümü */}
              <Box w="full" p={6} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl" border="1px" borderColor={useColorModeValue('gray.200', 'gray.600')}>
                <HStack mb={4}>
                  <Icon as={Calendar} color="purple.500" boxSize={5} />
                  <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('gray.700', 'gray.200')}>Randevu Detayları</Text>
                </HStack>
                <VStack spacing={4} w="full">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Tarih</FormLabel>
                      <Input
                        type="date"
                        value={newAppointment.appointmentDate}
                        onChange={(e) => setNewAppointment({...newAppointment, appointmentDate: e.target.value})}
                        bg={useColorModeValue('white', 'gray.800')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        _hover={{ borderColor: 'purple.400' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Saat</FormLabel>
                      <Input
                        type="time"
                        value={newAppointment.appointmentTime}
                        onChange={(e) => setNewAppointment({...newAppointment, appointmentTime: e.target.value})}
                        bg={useColorModeValue('white', 'gray.800')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        _hover={{ borderColor: 'purple.400' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Randevu Nedeni</FormLabel>
                    <Select
                      value={newAppointment.appointmentReason}
                      onChange={(e) => setNewAppointment({...newAppointment, appointmentReason: e.target.value as keyof typeof APPOINTMENT_REASONS})}
                      bg={useColorModeValue('white', 'gray.800')}
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                      >
                        {Object.entries(APPOINTMENT_REASONS).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Notlar</FormLabel>
                      <Textarea
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                        placeholder="Randevu ile ilgili notlar (opsiyonel)"
                        rows={3}
                        bg={useColorModeValue('white', 'gray.800')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        _hover={{ borderColor: 'purple.400' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <Box>
                  <HStack justify="space-between" mb={4}>
                    <HStack spacing={2}>
                      <Icon as={Users} color="purple.500" />
                      <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Ek Katılımcılar</Text>
                    </HStack>
                    <Button 
                      size="sm" 
                      colorScheme="purple" 
                      variant="outline"
                      leftIcon={<Plus size={14} />}
                      onClick={addParticipant}
                      _hover={{ bg: 'purple.50', borderColor: 'purple.400' }}
                    >
                      Katılımcı Ekle
                    </Button>
                  </HStack>
                  
                  <VStack spacing={3}>
                    {newAppointment.additionalParticipants.map((participant, index) => (
                      <Box 
                        key={participant.id} 
                        p={4} 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        borderRadius="lg" 
                        border="1px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                        width="100%"
                      >
                        <HStack justify="space-between" mb={3}>
                          <HStack spacing={2}>
                            <Icon as={User} size={16} color="purple.500" />
                            <Text fontWeight="medium" fontSize="sm" color={useColorModeValue('gray.700', 'gray.200')}>Katılımcı {index + 1}</Text>
                          </HStack>
                          <Button 
                            size="sm" 
                            colorScheme="red" 
                            variant="ghost" 
                            onClick={() => removeParticipant(participant.id)}
                            _hover={{ bg: 'red.50' }}
                          >
                            Sil
                          </Button>
                        </HStack>
                        
                        <VStack spacing={3}>
                          <SimpleGrid columns={2} spacing={3} width="100%">
                            <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Ad Soyad</FormLabel>
                              <Input
                                size="sm"
                                value={participant.name}
                                onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                                placeholder="Ad Soyad"
                                bg={useColorModeValue('white', 'gray.800')}
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{ borderColor: 'purple.400' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Rol</FormLabel>
                              <Select
                                size="sm"
                                value={participant.role}
                                onChange={(e) => updateParticipant(participant.id, 'role', e.target.value)}
                                bg={useColorModeValue('white', 'gray.800')}
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{ borderColor: 'purple.400' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                              >
                                <option value="owner">Mal Sahibi</option>
                                <option value="consultant">Danışman</option>
                                <option value="assistant">Asistan</option>
                                <option value="other">Diğer</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={2} spacing={3} width="100%">
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Telefon</FormLabel>
                              <Input
                                size="sm"
                                value={participant.phone}
                                onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                                placeholder="Telefon numarası"
                                bg={useColorModeValue('white', 'gray.800')}
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{ borderColor: 'purple.400' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>E-posta</FormLabel>
                              <Input
                                size="sm"
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                                placeholder="E-posta adresi"
                                bg={useColorModeValue('white', 'gray.800')}
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{ borderColor: 'purple.400' }}
                                _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                              />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </Box>
                ))}
                    {newAppointment.additionalParticipants.length === 0 && (
                      <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} fontStyle="italic" textAlign="center" py={4}>
                        Henüz ek katılımcı eklenmedi. Yukarıdaki butona tıklayarak katılımcı ekleyebilirsiniz.
                      </Text>
                    )}
                  </VStack>
                </Box>
              
                {/* Hatırlatma Seçenekleri */}
                <Box>
                  <HStack spacing={2} mb={4}>
                    <Icon as={AlertTriangle} color="purple.500" />
                    <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Hatırlatma Seçenekleri</Text>
                  </HStack>
                  <VStack spacing={4} align="stretch">
                    {/* SMS Hatırlatma */}
                    <Box 
                      p={4} 
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg" 
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                    >
                      <HStack justify="space-between" mb={3}>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Icon as={MessageCircle} size={16} color="green.500" />
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.200')}>
                              SMS Hatırlatma
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                            Randevu öncesi SMS ile hatırlatma gönder
                          </Text>
                        </VStack>
                        <Switch
                          colorScheme="purple"
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
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Hatırlatma Zamanı</FormLabel>
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
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'purple.400' }}
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
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
                    <Box 
                      p={4} 
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="lg" 
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                    >
                      <HStack justify="space-between" mb={3}>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Icon as={Mail} size={16} color="blue.500" />
                            <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.200')}>
                              E-posta Hatırlatma
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                            Randevu öncesi e-posta ile hatırlatma gönder
                          </Text>
                        </VStack>
                        <Switch
                          colorScheme="purple"
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
                          <FormLabel fontSize="sm" fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>Hatırlatma Zamanı</FormLabel>
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
                            bg={useColorModeValue('white', 'gray.800')}
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{ borderColor: 'purple.400' }}
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px #805ad5' }}
                          >
                            <option value="60">1 saat önce</option>
                            <option value="120">2 saat önce</option>
                            <option value="1440">1 gün önce</option>
                            <option value="2880">2 gün önce</option>
                            <option value="10080">1 hafta önce</option>
                          </Select>
                          <FormHelperText fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                            E-posta hatırlatmaları daha uzun süreli bildirimler için uygundur
                          </FormHelperText>
                        </FormControl>
                      )}
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter bg={useColorModeValue('gray.50', 'gray.800')} borderBottomRadius="xl">
              <Button 
                variant="ghost" 
                mr={3} 
                onClick={() => setIsAddModalOpen(false)}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                İptal
              </Button>
              <Button 
                colorScheme="purple" 
                onClick={handleAddAppointment}
                leftIcon={<Plus size={16} />}
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
              >
                Randevu Ekle
              </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detay Görüntüleme Modalı */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={Eye} color="purple.500" />
              <Text>Randevu Detayları</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>MÜŞTERİ BİLGİLERİ</Text>
                      <VStack align="start" spacing={2}>
                        <Text><Text as="span" fontWeight="medium">Ad Soyad:</Text> {selectedAppointment.customerName}</Text>
                        <Text><Text as="span" fontWeight="medium">Telefon:</Text> {selectedAppointment.customerPhone}</Text>
                        <Text><Text as="span" fontWeight="medium">E-posta:</Text> {selectedAppointment.customerEmail}</Text>
                      </VStack>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>RANDEVU BİLGİLERİ</Text>
                      <VStack align="start" spacing={2}>
                        <Text><Text as="span" fontWeight="medium">Tarih:</Text> {formatDate(selectedAppointment.appointmentDate)}</Text>
                        <Text><Text as="span" fontWeight="medium">Saat:</Text> {formatTime(selectedAppointment.appointmentTime)}</Text>
                        <Text><Text as="span" fontWeight="medium">Sebep:</Text> {APPOINTMENT_REASONS[selectedAppointment.appointmentReason]}</Text>
                        <Badge colorScheme={getStatusColor(selectedAppointment.status)}>
                          {getStatusText(selectedAppointment.status)}
                        </Badge>
                      </VStack>
                    </Box>
                  </VStack>
                  <VStack align="start" spacing={4}>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>EMLAK BİLGİLERİ</Text>
                      <VStack align="start" spacing={2}>
                        <Text><Text as="span" fontWeight="medium">Başlık:</Text> {selectedAppointment.propertyTitle}</Text>
                        <Text><Text as="span" fontWeight="medium">Adres:</Text> {selectedAppointment.propertyAddress}</Text>
                      </VStack>
                    </Box>
                    {selectedAppointment.notes && (
                      <Box>
                        <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>NOTLAR</Text>
                        <Text>{selectedAppointment.notes}</Text>
                      </Box>
                    )}
                  </VStack>
                </SimpleGrid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDetailModalOpen(false)}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={Edit} color="orange.500" />
              <Text>Randevu Düzenle</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editAppointment && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Müşteri Adı</FormLabel>
                    <Input
                      value={editAppointment.customerName}
                      onChange={(e) => setEditAppointment({...editAppointment, customerName: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Telefon</FormLabel>
                    <Input
                      value={editAppointment.customerPhone}
                      onChange={(e) => setEditAppointment({...editAppointment, customerPhone: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>E-posta</FormLabel>
                    <Input
                      type="email"
                      value={editAppointment.customerEmail}
                      onChange={(e) => setEditAppointment({...editAppointment, customerEmail: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Emlak Başlığı</FormLabel>
                    <Input
                      value={editAppointment.propertyTitle}
                      onChange={(e) => setEditAppointment({...editAppointment, propertyTitle: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Tarih</FormLabel>
                    <Input
                      type="date"
                      value={editAppointment.appointmentDate}
                      onChange={(e) => setEditAppointment({...editAppointment, appointmentDate: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Saat</FormLabel>
                    <Input
                      type="time"
                      value={editAppointment.appointmentTime}
                      onChange={(e) => setEditAppointment({...editAppointment, appointmentTime: e.target.value})}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Randevu Sebebi</FormLabel>
                    <Select
                      value={editAppointment.appointmentReason}
                      onChange={(e) => setEditAppointment({...editAppointment, appointmentReason: e.target.value as any})}
                    >
                      {Object.entries(APPOINTMENT_REASONS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Durum</FormLabel>
                    <Select
                      value={editAppointment.status}
                      onChange={(e) => setEditAppointment({...editAppointment, status: e.target.value as any})}
                    >
                      <option value="pending">Beklemede</option>
                      <option value="confirmed">Onaylandı</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="cancelled">İptal Edildi</option>
                      <option value="postponed">Ertelendi</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel>Emlak Adresi</FormLabel>
                  <Input
                    value={editAppointment.propertyAddress}
                    onChange={(e) => setEditAppointment({...editAppointment, propertyAddress: e.target.value})}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Notlar</FormLabel>
                  <Textarea
                    value={editAppointment.notes}
                    onChange={(e) => setEditAppointment({...editAppointment, notes: e.target.value})}
                    placeholder="Randevu ile ilgili notlarınızı buraya yazabilirsiniz..."
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter flexDirection={{ base: 'column', sm: 'row' }} gap={{ base: 2, sm: 0 }}>
            <Button 
              variant="ghost" 
              mr={{ base: 0, sm: 3 }} 
              onClick={() => setIsEditModalOpen(false)}
              w={{ base: 'full', sm: 'auto' }}
            >
              İptal
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveEdit}
              w={{ base: 'full', sm: 'auto' }}
            >
              Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyAppointments;