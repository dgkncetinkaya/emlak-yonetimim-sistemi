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
    NumberInput,
    NumberInputField,
    useColorModeValue,
    Spinner,
    useToast,
    useDisclosure,
    Grid,
    GridItem,
    InputGroup,
    InputLeftElement,
} from '@chakra-ui/react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getPayments,
    Payment,
    PaymentFilters,
    PaymentStatus,
    PaymentMethod,
} from '../../../services/paymentService';
import ManualPaymentModal from '../../../components/superadmin3537/ManualPaymentModal';

const PaymentsList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<PaymentFilters>({
        search: '',
        status: 'ALL',
        dateRange: 'ALL',
        paymentMethod: 'ALL',
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadPayments();
    }, [filters]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await getPayments(filters);
            setPayments(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ödemeler yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentCreated = () => {
        loadPayments();
        onClose();
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
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Heading size="lg" mb={2}>
                            Ödemeler
                        </Heading>
                        <Text color="gray.600">
                            Ofislerin ödeme işlemlerini görüntüleyin ve yönetin
                        </Text>
                    </Box>
                    <Button leftIcon={<Plus size={18} />} colorScheme="blue" onClick={onOpen}>
                        Manuel Ödeme Ekle
                    </Button>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece ticari ödeme verilerini içerir. Müşteri sayıları,
                        portföy bilgileri ve kullanım istatistikleri gösterilmez.
                    </Text>
                </Box>

                {/* Filters */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Ofis Ara
                            </Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <Search size={18} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Ofis adı..."
                                    value={filters.search}
                                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                                />
                            </InputGroup>
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
                                <option value="PAID">Ödendi</option>
                                <option value="PENDING">Beklemede</option>
                                <option value="FAILED">Başarısız</option>
                                <option value="REFUNDED">İade Edildi</option>
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

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Min. Tutar
                            </Text>
                            <NumberInput
                                min={0}
                                value={filters.minAmount}
                                onChange={(_, value) => setFilters((prev) => ({ ...prev, minAmount: value }))}
                            >
                                <NumberInputField placeholder="0" />
                            </NumberInput>
                        </GridItem>

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Max. Tutar
                            </Text>
                            <NumberInput
                                min={0}
                                value={filters.maxAmount}
                                onChange={(_, value) => setFilters((prev) => ({ ...prev, maxAmount: value }))}
                            >
                                <NumberInputField placeholder="Sınırsız" />
                            </NumberInput>
                        </GridItem>

                        <GridItem>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Ödeme Metodu
                            </Text>
                            <Select
                                value={filters.paymentMethod}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, paymentMethod: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="CREDIT_CARD">Kredi Kartı</option>
                                <option value="BANK_TRANSFER">Havale</option>
                                <option value="CASH">Nakit</option>
                                <option value="MANUAL">Manuel</option>
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
                    ) : payments.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">Ödeme bulunamadı</Text>
                        </Box>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Ofis Adı</Th>
                                    <Th>Tutar</Th>
                                    <Th>Durum</Th>
                                    <Th>Ödeme Tarihi</Th>
                                    <Th>Ödeme Metodu</Th>
                                    <Th>Transaction ID</Th>
                                    <Th>İşlemler</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {payments.map((payment) => (
                                    <Tr key={payment.id}>
                                        <Td fontWeight="medium">{payment.officeName}</Td>
                                        <Td fontWeight="medium">{formatPrice(payment.amount, payment.currency)}</Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(payment.status)}>
                                                {getStatusText(payment.status)}
                                            </Badge>
                                        </Td>
                                        <Td>{formatDate(payment.paymentDate)}</Td>
                                        <Td>{getMethodText(payment.paymentMethod)}</Td>
                                        <Td>
                                            <Text fontSize="sm" fontFamily="mono">
                                                {payment.transactionId}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => navigate(`/superadmin3537/payments/${payment.id}`)}
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
                {!loading && payments.length > 0 && (
                    <HStack justify="space-between" fontSize="sm" color="gray.600">
                        <Text>Toplam {payments.length} ödeme gösteriliyor</Text>
                        <Text>
                            Toplam Tutar:{' '}
                            {formatPrice(
                                payments.reduce((sum, p) => sum + p.amount, 0),
                                'TRY'
                            )}
                        </Text>
                    </HStack>
                )}
            </VStack>

            {/* Manual Payment Modal */}
            <ManualPaymentModal isOpen={isOpen} onClose={onClose} onSuccess={handlePaymentCreated} />
        </Box>
    );
};

export default PaymentsList;
