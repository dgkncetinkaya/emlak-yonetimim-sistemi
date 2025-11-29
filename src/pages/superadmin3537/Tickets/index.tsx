import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Input,
    Select,
    useColorModeValue,
    Spinner,
    useToast,
    useDisclosure,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getTickets,
    Ticket,
    TicketFilters,
    TicketStatus,
    TicketPriority,
} from '../../../services/ticketService';
import CreateTicketModal from '../../../components/superadmin3537/CreateTicketModal';

const TicketsList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<TicketFilters>({
        search: '',
        status: 'ALL',
        priority: 'ALL',
        dateRange: 'ALL',
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadTickets();
    }, [filters]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await getTickets(filters);
            setTickets(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ticketlar yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTicketCreated = () => {
        loadTickets();
        onClose();
    };

    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'OPEN':
                return 'blue';
            case 'IN_PROGRESS':
                return 'orange';
            case 'RESOLVED':
                return 'green';
            case 'CLOSED':
                return 'gray';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: TicketStatus) => {
        switch (status) {
            case 'OPEN':
                return 'Açık';
            case 'IN_PROGRESS':
                return 'İşlemde';
            case 'RESOLVED':
                return 'Çözüldü';
            case 'CLOSED':
                return 'Kapalı';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority: TicketPriority) => {
        switch (priority) {
            case 'HIGH':
                return 'red';
            case 'MEDIUM':
                return 'orange';
            case 'LOW':
                return 'green';
            default:
                return 'gray';
        }
    };

    const getPriorityText = (priority: TicketPriority) => {
        switch (priority) {
            case 'HIGH':
                return 'Yüksek';
            case 'MEDIUM':
                return 'Orta';
            case 'LOW':
                return 'Düşük';
            default:
                return priority;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Heading size="lg" mb={2}>
                            Destek Ticketları
                        </Heading>
                        <Text color="gray.600">
                            Ofislerin destek taleplerini görüntüleyin ve yönetin
                        </Text>
                    </Box>
                    <Button leftIcon={<Plus size={18} />} colorScheme="blue" onClick={onOpen}>
                        Yeni Ticket Oluştur
                    </Button>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece destek & süreç takibi içindir. Müşteri/portföy/doküman
                        verisi gösterilmez.
                    </Text>
                </Box>

                {/* Filters */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Konu Ara
                            </Text>
                            <Input
                                placeholder="Konu içinde ara..."
                                value={filters.search}
                                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                            />
                        </GridItem>

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Durum
                            </Text>
                            <Select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, status: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="OPEN">Açık</option>
                                <option value="IN_PROGRESS">İşlemde</option>
                                <option value="RESOLVED">Çözüldü</option>
                                <option value="CLOSED">Kapalı</option>
                            </Select>
                        </GridItem>

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Öncelik
                            </Text>
                            <Select
                                value={filters.priority}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, priority: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="HIGH">Yüksek</option>
                                <option value="MEDIUM">Orta</option>
                                <option value="LOW">Düşük</option>
                            </Select>
                        </GridItem>

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Tarih Aralığı
                            </Text>
                            <Select
                                value={filters.dateRange}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, dateRange: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="LAST_7_DAYS">Son 7 Gün</option>
                                <option value="LAST_30_DAYS">Son 30 Gün</option>
                                <option value="THIS_MONTH">Bu Ay</option>
                            </Select>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Table */}
                <Box bg={bg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                    {loading ? (
                        <Box p={8} textAlign="center">
                            <Spinner size="xl" />
                        </Box>
                    ) : tickets.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">Ticket bulunamadı</Text>
                        </Box>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Ticket ID</Th>
                                    <Th>Ofis Adı</Th>
                                    <Th>Konu</Th>
                                    <Th>Durum</Th>
                                    <Th>Öncelik</Th>
                                    <Th>Oluşturulma</Th>
                                    <Th>Atanan</Th>
                                    <Th>İşlemler</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tickets.map((ticket) => (
                                    <Tr
                                        key={ticket.id}
                                        cursor="pointer"
                                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                                        onClick={() => navigate(`/superadmin3537/tickets/${ticket.id}`)}
                                    >
                                        <Td fontFamily="mono">#{ticket.id}</Td>
                                        <Td fontWeight="medium">{ticket.officeName}</Td>
                                        <Td>{ticket.subject}</Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(ticket.status)}>
                                                {getStatusText(ticket.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getPriorityColor(ticket.priority)}>
                                                {getPriorityText(ticket.priority)}
                                            </Badge>
                                        </Td>
                                        <Td>{formatDate(ticket.createdAt)}</Td>
                                        <Td>
                                            {ticket.assignedToName ? (
                                                <Text fontSize="sm">{ticket.assignedToName}</Text>
                                            ) : (
                                                <Text fontSize="sm" color="gray.500">
                                                    Atanmadı
                                                </Text>
                                            )}
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/superadmin3537/tickets/${ticket.id}`);
                                                }}
                                            >
                                                Detay
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>

                {/* Summary */}
                {!loading && tickets.length > 0 && (
                    <Text color="gray.600" fontSize="sm">
                        Toplam {tickets.length} ticket gösteriliyor
                    </Text>
                )}
            </VStack>

            {/* Create Ticket Modal */}
            <CreateTicketModal isOpen={isOpen} onClose={onClose} onSuccess={handleTicketCreated} />
        </Box>
    );
};

export default TicketsList;
