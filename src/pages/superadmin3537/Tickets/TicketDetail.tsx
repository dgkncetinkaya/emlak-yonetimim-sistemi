import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    Select,
    Textarea,
    useColorModeValue,
    Spinner,
    useToast,
    Grid,
    GridItem,
    Divider,
} from '@chakra-ui/react';
import { ArrowLeft, Send } from 'lucide-react';
import {
    getTicketById,
    updateTicket,
    addMessage,
    Ticket,
    TicketStatus,
    TicketPriority,
} from '../../../services/ticketService';

const TicketDetail = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const messageBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        loadTicket();
    }, [ticketId]);

    const loadTicket = async () => {
        if (!ticketId) return;

        try {
            setLoading(true);
            const data = await getTicketById(ticketId);
            if (data) {
                setTicket(data);
            } else {
                toast({
                    title: 'Hata',
                    description: 'Ticket bulunamadı',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/superadmin3537/tickets');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ticket yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (field: 'status' | 'priority' | 'assignedTo', value: any) => {
        if (!ticketId) return;

        try {
            setUpdating(true);
            const updated = await updateTicket({
                id: ticketId,
                [field]: value,
            });
            setTicket(updated);
            toast({
                title: 'Başarılı',
                description: 'Ticket güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ticket güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleSendMessage = async () => {
        if (!ticketId || !newMessage.trim()) return;

        try {
            setSendingMessage(true);
            await addMessage({
                ticketId,
                message: newMessage,
            });
            setNewMessage('');
            await loadTicket(); // Reload to get new message
            toast({
                title: 'Başarılı',
                description: 'Cevap gönderildi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Cevap gönderilirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSendingMessage(false);
        }
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!ticket) {
        return null;
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack>
                    <Button
                        leftIcon={<ArrowLeft size={18} />}
                        variant="ghost"
                        onClick={() => navigate('/superadmin3537/tickets')}
                    >
                        Geri
                    </Button>
                </HStack>

                <Box>
                    <HStack mb={2}>
                        <Heading size="lg">Ticket #{ticket.id}</Heading>
                        <Badge colorScheme={getStatusColor(ticket.status)} fontSize="md">
                            {ticket.status}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(ticket.priority)} fontSize="md">
                            {ticket.priority}
                        </Badge>
                    </HStack>
                    <Text color="gray.600">{ticket.subject}</Text>
                </Box>

                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                    {/* Messages Section */}
                    <GridItem>
                        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                            <Heading size="md" mb={4}>
                                Mesajlar
                            </Heading>

                            <VStack align="stretch" spacing={4}>
                                {ticket.messages.map((message) => (
                                    <Box
                                        key={message.id}
                                        p={4}
                                        bg={messageBg}
                                        borderRadius="md"
                                        borderLeft="4px solid"
                                        borderLeftColor={
                                            message.senderType === 'SUPERADMIN' ? 'blue.500' : 'gray.400'
                                        }
                                    >
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontWeight="bold" fontSize="sm">
                                                {message.senderName}
                                                {message.senderType === 'SUPERADMIN' && (
                                                    <Badge ml={2} colorScheme="blue" fontSize="xs">
                                                        SuperAdmin
                                                    </Badge>
                                                )}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                                {formatDateTime(message.createdAt)}
                                            </Text>
                                        </HStack>
                                        <Text whiteSpace="pre-wrap">{message.message}</Text>
                                    </Box>
                                ))}
                            </VStack>

                            <Divider my={6} />

                            {/* Reply Section */}
                            <VStack align="stretch" spacing={3}>
                                <Text fontWeight="medium">Cevap Yaz</Text>
                                <Textarea
                                    placeholder="Cevabınızı yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows={4}
                                />
                                <Button
                                    leftIcon={<Send size={18} />}
                                    colorScheme="blue"
                                    onClick={handleSendMessage}
                                    isLoading={sendingMessage}
                                    isDisabled={!newMessage.trim()}
                                    alignSelf="flex-end"
                                >
                                    Cevap Gönder
                                </Button>
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* Ticket Info Section */}
                    <GridItem>
                        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                            <Heading size="md" mb={4}>
                                Ticket Bilgileri
                            </Heading>

                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Ofis
                                    </Text>
                                    <Text fontWeight="medium">{ticket.officeName}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={2}>
                                        Durum
                                    </Text>
                                    <Select
                                        value={ticket.status}
                                        onChange={(e) => handleUpdate('status', e.target.value as TicketStatus)}
                                        isDisabled={updating}
                                    >
                                        <option value="OPEN">Açık</option>
                                        <option value="IN_PROGRESS">İşlemde</option>
                                        <option value="RESOLVED">Çözüldü</option>
                                        <option value="CLOSED">Kapalı</option>
                                    </Select>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={2}>
                                        Öncelik
                                    </Text>
                                    <Select
                                        value={ticket.priority}
                                        onChange={(e) => handleUpdate('priority', e.target.value as TicketPriority)}
                                        isDisabled={updating}
                                    >
                                        <option value="LOW">Düşük</option>
                                        <option value="MEDIUM">Orta</option>
                                        <option value="HIGH">Yüksek</option>
                                    </Select>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={2}>
                                        Atanan Admin
                                    </Text>
                                    <Select
                                        value={ticket.assignedTo || ''}
                                        onChange={(e) => handleUpdate('assignedTo', e.target.value || undefined)}
                                        isDisabled={updating}
                                    >
                                        <option value="">Atanmadı</option>
                                        <option value="admin1">Admin User</option>
                                        <option value="admin2">Support Team</option>
                                    </Select>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Oluşturulma
                                    </Text>
                                    <Text fontSize="sm">{formatDateTime(ticket.createdAt)}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Son Güncelleme
                                    </Text>
                                    <Text fontSize="sm">{formatDateTime(ticket.updatedAt)}</Text>
                                </Box>
                            </VStack>
                        </Box>
                    </GridItem>
                </Grid>
            </VStack>
        </Box>
    );
};

export default TicketDetail;
