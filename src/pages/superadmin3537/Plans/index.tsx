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
    useColorModeValue,
    Spinner,
    useToast,
    useDisclosure,
} from '@chakra-ui/react';
import { Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlans, Plan } from '../../../services/planService';
import PlanFormModal from '../../../components/superadmin3537/PlanFormModal';

const PlansList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await getPlans();
            setPlans(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Planlar yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePlanCreated = () => {
        loadPlans();
        onClose();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Heading size="lg" mb={2}>
                            Planlar
                        </Heading>
                        <Text color="gray.600">
                            Abonelik planlarını yönetin ve yapılandırın
                        </Text>
                    </Box>
                    <Button leftIcon={<Plus size={18} />} colorScheme="blue" onClick={onOpen}>
                        Yeni Plan Oluştur
                    </Button>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece paket yapılandırması içindir. Müşteri verisi,
                        portföy verisi ve kullanım istatistikleri gösterilmez.
                    </Text>
                </Box>

                {/* Table */}
                <Box bg={bg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                    {loading ? (
                        <Box p={8} textAlign="center">
                            <Spinner size="xl" />
                        </Box>
                    ) : plans.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">Plan bulunamadı</Text>
                        </Box>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Plan Adı</Th>
                                    <Th>Aylık Fiyat</Th>
                                    <Th>Yıllık Fiyat</Th>
                                    <Th>Maks. Kullanıcı</Th>
                                    <Th>Durum</Th>
                                    <Th>İşlemler</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {plans.map((plan) => (
                                    <Tr key={plan.id}>
                                        <Td>
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium">{plan.name}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {plan.description}
                                                </Text>
                                            </VStack>
                                        </Td>
                                        <Td fontWeight="medium">{formatPrice(plan.monthlyPrice)}</Td>
                                        <Td fontWeight="medium">{formatPrice(plan.yearlyPrice)}</Td>
                                        <Td>{plan.maxUsers} kullanıcı</Td>
                                        <Td>
                                            <Badge colorScheme={plan.isActive ? 'green' : 'gray'}>
                                                {plan.isActive ? 'Aktif' : 'Pasif'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                leftIcon={<Edit size={16} />}
                                                colorScheme="blue"
                                                variant="outline"
                                                onClick={() => navigate(`/superadmin3537/plans/${plan.id}`)}
                                            >
                                                Düzenle
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>

                {/* Summary */}
                {!loading && plans.length > 0 && (
                    <Text color="gray.600" fontSize="sm">
                        Toplam {plans.length} plan • {plans.filter((p) => p.isActive).length} aktif
                    </Text>
                )}
            </VStack>

            {/* Create Plan Modal */}
            <PlanFormModal isOpen={isOpen} onClose={onClose} onSuccess={handlePlanCreated} />
        </Box>
    );
};

export default PlansList;
