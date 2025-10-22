import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  HStack,
  Heading,
  useDisclosure,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Spacer
} from '@chakra-ui/react';
import {
  RefreshCw as RefreshIcon,
  Play as PlayIcon,
  Square as StopIcon,
  RotateCcw as RetryIcon,
  Trash2 as DeleteIcon,
  Settings as SettingsIcon,
  BarChart as AssessmentIcon
} from 'react-feather';
import { supabase } from '../../../lib/supabase';

interface DunningEvent {
  id: string;
  subscription_id: number;
  invoice_id: string;
  status: 'pending' | 'processing' | 'failed' | 'completed' | 'cancelled';
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface DunningStats {
  total_events: number;
  pending_events: number;
  failed_events: number;
  completed_events: number;
  success_rate: number;
  avg_retry_count: number;
}

interface SchedulerStatus {
  isRunning: boolean;
  processingInterval: number;
  cleanupInterval: number;
  lastProcessedAt: string;
  lastCleanupAt: string;
}

const DunningManagement: React.FC = () => {
  const [events, setEvents] = useState<DunningEvent[]>([]);
  const [stats, setStats] = useState<DunningStats | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DunningEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEvents(),
        loadStats(),
        loadSchedulerStatus()
      ]);
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    // Mock data - gerçek implementasyonda Supabase'den veri çekilecek
    const mockEvents: DunningEvent[] = [
      {
        id: '1',
        subscription_id: 123,
        invoice_id: 'INV-001',
        status: 'pending',
        retry_count: 0,
        max_retries: 3,
        next_retry_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setEvents(mockEvents);
  };

  const loadStats = async () => {
    // Mock data
    const mockStats: DunningStats = {
      total_events: 150,
      pending_events: 25,
      failed_events: 10,
      completed_events: 115,
      success_rate: 76.7,
      avg_retry_count: 1.2
    };
    setStats(mockStats);
  };

  const loadSchedulerStatus = async () => {
    // Mock data
    const mockStatus: SchedulerStatus = {
      isRunning: true,
      processingInterval: 300,
      cleanupInterval: 3600,
      lastProcessedAt: new Date().toISOString(),
      lastCleanupAt: new Date().toISOString()
    };
    setSchedulerStatus(mockStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'blue';
      case 'processing': return 'yellow';
      case 'failed': return 'red';
      case 'completed': return 'green';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'processing': return 'İşleniyor';
      case 'failed': return 'Başarısız';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const handleRetryEvent = async (eventId: string) => {
    try {
      // Retry logic burada implement edilecek
      toast({
        title: 'Event yeniden deneniyor',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      await loadEvents();
    } catch (err) {
      toast({
        title: 'Hata',
        description: 'Event yeniden denenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Delete logic burada implement edilecek
      toast({
        title: 'Event silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadEvents();
    } catch (err) {
      toast({
        title: 'Hata',
        description: 'Event silinirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Flex mb={6} align="center">
        <Heading size="lg">Dunning Yönetimi</Heading>
        <Spacer />
        <Button leftIcon={<RefreshIcon size={16} />} onClick={loadData}>
          Yenile
        </Button>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 6 }} spacing={4} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Toplam Event</StatLabel>
                <StatNumber>{stats.total_events}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Bekleyen</StatLabel>
                <StatNumber color="blue.500">{stats.pending_events}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Başarısız</StatLabel>
                <StatNumber color="red.500">{stats.failed_events}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tamamlanan</StatLabel>
                <StatNumber color="green.500">{stats.completed_events}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Başarı Oranı</StatLabel>
                <StatNumber>{stats.success_rate}%</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Ort. Deneme</StatLabel>
                <StatNumber>{stats.avg_retry_count}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Filters */}
      <Card mb={4}>
        <CardBody>
          <HStack spacing={4}>
            <FormControl maxW="200px">
              <FormLabel>Durum Filtresi</FormLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tümü</option>
                <option value="pending">Bekleyen</option>
                <option value="processing">İşleniyor</option>
                <option value="failed">Başarısız</option>
                <option value="completed">Tamamlanan</option>
                <option value="cancelled">İptal Edildi</option>
              </Select>
            </FormControl>
          </HStack>
        </CardBody>
      </Card>

      {/* Events Table */}
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Abonelik ID</Th>
                <Th>Fatura ID</Th>
                <Th>Durum</Th>
                <Th>Deneme Sayısı</Th>
                <Th>Sonraki Deneme</Th>
                <Th>İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.map((event) => (
                <Tr key={event.id}>
                  <Td>{event.id}</Td>
                  <Td>{event.subscription_id}</Td>
                  <Td>{event.invoice_id}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                  </Td>
                  <Td>{event.retry_count}/{event.max_retries}</Td>
                  <Td>{new Date(event.next_retry_at).toLocaleString('tr-TR')}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Yeniden dene"
                        icon={<RetryIcon size={16} />}
                        size="sm"
                        onClick={() => handleRetryEvent(event.id)}
                        isDisabled={event.status === 'completed'}
                      />
                      <IconButton
                        aria-label="Sil"
                        icon={<DeleteIcon size={16} />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteEvent(event.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Event Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Event Detayları</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEvent && (
              <VStack align="stretch" spacing={4}>
                <Text><strong>ID:</strong> {selectedEvent.id}</Text>
                <Text><strong>Abonelik ID:</strong> {selectedEvent.subscription_id}</Text>
                <Text><strong>Fatura ID:</strong> {selectedEvent.invoice_id}</Text>
                <Text><strong>Durum:</strong> {getStatusText(selectedEvent.status)}</Text>
                <Text><strong>Deneme Sayısı:</strong> {selectedEvent.retry_count}/{selectedEvent.max_retries}</Text>
                <Text><strong>Oluşturulma:</strong> {new Date(selectedEvent.created_at).toLocaleString('tr-TR')}</Text>
                <Text><strong>Güncellenme:</strong> {new Date(selectedEvent.updated_at).toLocaleString('tr-TR')}</Text>
                {selectedEvent.error_message && (
                  <Text><strong>Hata Mesajı:</strong> {selectedEvent.error_message}</Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DunningManagement;