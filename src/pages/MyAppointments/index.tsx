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
  useDisclosure
} from '@chakra-ui/react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Edit, Trash2, Plus } from 'react-feather';
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
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    propertyTitle: '',
    propertyAddress: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentReason: 'viewing' as keyof typeof APPOINTMENT_REASONS,
    notes: ''
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
  }, []);

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
        setCustomers(data);
      }
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err);
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
          propertyTitle: '',
          propertyAddress: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentReason: 'viewing' as keyof typeof APPOINTMENT_REASONS,
          notes: ''
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

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {Array.isArray(appointments) ? appointments.filter(a => a?.status === 'pending').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Beklemede</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {Array.isArray(appointments) ? appointments.filter(a => a?.status === 'confirmed').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Onaylandı</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {Array.isArray(appointments) ? appointments.filter(a => a?.status === 'completed').length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Tamamlandı</Text>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody textAlign="center" py={4}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                {Array.isArray(appointments) ? appointments.length : 0}
              </Text>
              <Text fontSize="sm" color={textColor}>Toplam</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Appointments List */}
        {!Array.isArray(appointments) || appointments.length === 0 ? (
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
            {appointments.map((appointment) => (
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
                    <HStack spacing={2}>
                      <Badge colorScheme={getStatusColor(appointment?.status || 'pending')} variant="subtle">
                        {getStatusText(appointment?.status || 'pending')}
                      </Badge>
                      <Tooltip label="Detayları Görüntüle">
                        <IconButton
                          aria-label="Detayları görüntüle"
                          icon={<Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                        />
                      </Tooltip>
                    </HStack>
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
                  
                  {appointment.status === 'pending' && (
                    <>
                      <Divider my={4} />
                      <HStack spacing={2} justify="flex-end">
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
                      <HStack spacing={2} justify="flex-end">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        >
                          Tamamlandı Olarak İşaretle
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
                    const selectedCustomer = customers.find(c => c.id === e.target.value);
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

              {newAppointment.customerId === 'new' && (
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
              )}

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