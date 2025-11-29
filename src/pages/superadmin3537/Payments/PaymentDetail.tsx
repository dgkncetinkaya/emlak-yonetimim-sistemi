import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    useColorModeValue,
    Spinner,
    useToast,
    Grid,
    GridItem,
    Divider,
    Textarea,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, MessageSquare } from 'lucide-react';
import {
    getPaymentById,
    updatePaymentStatus,
    addPaymentNote,
    Payment,
    PaymentStatus,
    PaymentMethod,
} from '../../../services/paymentService';

const PaymentDetail = () => {
    const { paymentId } = useParams<{ paymentId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newNote, setNewNote] = useState('');
    const cancelRef = useRef<HTMLButtonElement>(null);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadPayment();
    }, [paymentId]);

    const loadPayment = async () => {
        if (!paymentId) return;

        try {
            setLoading(true);
            const data = await getPaymentById(paymentId);
            if (data) {
                setPayment(data);
            } else {
                toast({
                    title: 'Hata',
                    description: 'Ödeme bulunamadı',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/superadmin3537/payments');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ödeme yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (status: PaymentStatus) => {
        if (!paymentId) return;

        try {
            setUpdating(true);
            const updated = await updatePaymentStatus(paymentId, status);
            setPayment(updated);
            toast({
                title: 'Başarılı',
                description: 'Ödeme durumu güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Durum güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!paymentId || !newNote.trim()) return;

        try {
            const updated = await addPaymentNote(paymentId, newNote);
            setPayment(updated);
            setNewNote('');
            onClose();
            toast({
                title: 'Başarılı',
                description: 'Not eklendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Not eklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'PAID':
                return 'green';
            case 'FAILED':
                return 'red';
            case 'PENDING':
                return 'orange';
            case 'REFUNDED':
                return 'purple';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: PaymentStatus) => {
        switch (status) {
            case 'PAID':
                return 'Ödendi';
            case 'FAILED':
                return 'Başarısız';
            case 'PENDING':
                return 'Beklemede';
            case 'REFUNDED':
                return 'İade Edildi';
            default:
                return status;
        }
    };

    const getMethodText = (method: PaymentMethod) => {
        switch (method) {
            case 'CREDIT_CARD':
                return 'Kredi Kartı';
            case 'BANK_TRANSFER':
                return 'Havale';
            case 'CASH':
                return 'Nakit';
            case 'MANUAL':
                return 'Manuel';
            default:
                return method;
        }
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!payment) {
        return null;
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <HStack>
                        <Button
                            leftIcon={<ArrowLeft size={18} />}
                            variant="ghost"
                            onClick={() => navigate('/superadmin3537/payments')}
                        >
                            Geri
                        </Button>
                        <Heading size="lg">Ödeme Detayı</Heading>
                        <Badge colorScheme={getStatusColor(payment.status)} fontSize="md">
                            {getStatusText(payment.status)}
                        </Badge>
                    </HStack>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu sayfa sadece ticari ödeme bilgilerini gösterir. Müşteri
                        bilgileri, portföy detayları ve kullanım verileri gösterilmez.
                    </Text>
                </Box>

                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                    {/* Payment Information */}
                    <GridItem>
                        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                            <Heading size="md" mb={4}>
                                Ödeme Bilgileri
                            </Heading>

                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Ofis Adı
                                    </Text>
                                    <Text fontWeight="medium" fontSize="lg">
                                        {payment.officeName}
                                    </Text>
                                </Box>

                                <Divider />

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Tutar
                                    </Text>
                                    <Text fontWeight="bold" fontSize="2xl" color="blue.600">
                                        {formatPrice(payment.amount, payment.currency)}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Para Birimi
                                    </Text>
                                    <Text fontWeight="medium">{payment.currency}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Ödeme Tarihi
                                    </Text>
                                    <Text fontWeight="medium">{formatDate(payment.paymentDate)}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Ödeme Yöntemi
                                    </Text>
                                    <Text fontWeight="medium">{getMethodText(payment.paymentMethod)}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Transaction ID
                                    </Text>
                                    <Text fontFamily="mono" fontSize="sm">
                                        {payment.transactionId}
                                    </Text>
                                </Box>

                                {payment.subscriptionId && (
                                    <Box>
                                        <Text fontSize="sm" color="gray.600" mb={1}>
                                            Abonelik ID
                                        </Text>
                                        <Text fontFamily="mono" fontSize="sm">
                                            {payment.subscriptionId}
                                        </Text>
                                    </Box>
                                )}

                                {payment.invoiceNumber && (
                                    <Box>
                                        <Text fontSize="sm" color="gray.600" mb={1}>
                                            Fatura Numarası
                                        </Text>
                                        <Text fontFamily="mono" fontSize="sm">
                                            {payment.invoiceNumber}
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* Actions & Notes */}
                    <GridItem>
                        <VStack align="stretch" spacing={6}>
                            {/* Action Buttons */}
                            <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                                <Heading size="md" mb={4}>
                                    İşlemler
                                </Heading>

                                <VStack align="stretch" spacing={3}>
                                    <Button
                                        leftIcon={<CheckCircle size={18} />}
                                        colorScheme="green"
                                        isDisabled={payment.status === 'PAID' || updating}
                                        onClick={() => handleStatusUpdate('PAID')}
                                    >
                                        PAID Olarak İşaretle
                                    </Button>

                                    <Button
                                        leftIcon={<XCircle size={18} />}
                                        colorScheme="red"
                                        variant="outline"
                                        isDisabled={payment.status === 'FAILED' || updating}
                                        onClick={() => handleStatusUpdate('FAILED')}
                                    >
                                        FAILED Olarak İşaretle
                                    </Button>

                                    <Button
                                        leftIcon={<RefreshCw size={18} />}
                                        colorScheme="purple"
                                        variant="outline"
                                        isDisabled={payment.status === 'REFUNDED' || updating}
                                        onClick={() => handleStatusUpdate('REFUNDED')}
                                    >
                                        REFUND Et
                                    </Button>

                                    <Divider />

                                    <Button
                                        leftIcon={<MessageSquare size={18} />}
                                        colorScheme="blue"
                                        variant="outline"
                                        onClick={onOpen}
                                    >
                                        Not Ekle
                                    </Button>
                                </VStack>
                            </Box>

                            {/* Notes */}
                            <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                                <Heading size="md" mb={4}>
                                    Notlar
                                </Heading>

                                {payment.notes ? (
                                    <Box
                                        bg="gray.50"
                                        p={4}
                                        borderRadius="md"
                                        whiteSpace="pre-wrap"
                                        fontSize="sm"
                                    >
                                        {payment.notes}
                                    </Box>
                                ) : (
                                    <Text color="gray.500" fontSize="sm">
                                        Henüz not eklenmemiş
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </GridItem>
                </Grid>

                {/* Metadata */}
                <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={8} fontSize="sm" color="gray.600">
                        <Text>
                            <strong>Oluşturulma:</strong> {formatDate(payment.createdAt)}
                        </Text>
                        <Text>
                            <strong>Son Güncelleme:</strong> {formatDate(payment.updatedAt)}
                        </Text>
                    </HStack>
                </Box>
            </VStack>

            {/* Add Note Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Not Ekle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            placeholder="Ödeme ile ilgili notunuzu yazın..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={5}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            İptal
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleAddNote}
                            isDisabled={!newNote.trim()}
                        >
                            Notu Kaydet
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PaymentDetail;
