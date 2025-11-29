import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Input,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    HStack,
    VStack,
    InputGroup,
    InputLeftElement,
    useColorModeValue,
    Spinner,
    Text,
    useToast,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOffices, Office, OfficeFilters } from '../../../services/officeService';

const OfficesList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<OfficeFilters>({
        search: '',
        status: 'ALL',
        plan: 'ALL',
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadOffices();
    }, [filters]);

    const loadOffices = async () => {
        try {
            setLoading(true);
            const data = await getOffices(filters);
            setOffices(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ofisler yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: Office['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'TRIAL':
                return 'blue';
            case 'SUSPENDED':
                return 'orange';
            case 'CANCELLED':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: Office['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'Aktif';
            case 'TRIAL':
                return 'Deneme';
            case 'SUSPENDED':
                return 'Askıda';
            case 'CANCELLED':
                return 'İptal';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <Box>
                    <Heading size="lg" mb={2}>
                        Ofisler
                    </Heading>
                    <Text color="gray.600">
                        Sistemi kullanan emlak ofislerinin ticari hesaplarını yönetin
                    </Text>
                </Box>

                {/* Filters */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={4} flexWrap="wrap">
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none">
                                <Search size={18} />
                            </InputLeftElement>
                            <Input
                                placeholder="Ofis adı veya e-posta ara..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                                }
                            />
                        </InputGroup>

                        <Select
                            maxW="200px"
                            value={filters.status}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    status: e.target.value as OfficeFilters['status'],
                                }))
                            }
                        >
                            <option value="ALL">Tüm Durumlar</option>
                            <option value="TRIAL">Deneme</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="SUSPENDED">Askıda</option>
                            <option value="CANCELLED">İptal</option>
                        </Select>

                        <Select
                            maxW="200px"
                            value={filters.plan}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    plan: e.target.value as OfficeFilters['plan'],
                                }))
                            }
                        >
                            <option value="ALL">Tüm Planlar</option>
                            <option value="Starter">Starter</option>
                            <option value="Pro">Pro</option>
                            <option value="Enterprise">Enterprise</option>
                        </Select>
                    </HStack>
                </Box>

                {/* Table */}
                <Box bg={bg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                    {loading ? (
                        <Box p={8} textAlign="center">
                            <Spinner size="xl" />
                        </Box>
                    ) : offices.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">Ofis bulunamadı</Text>
                        </Box>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Ofis Adı</Th>
                                    <Th>Sorumlu Kişi</Th>
                                    <Th>E-posta</Th>
                                    <Th>Durum</Th>
                                    <Th>Plan</Th>
                                    <Th>Abonelik Bitiş</Th>
                                    <Th>İşlemler</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {offices.map((office) => (
                                    <Tr key={office.id}>
                                        <Td fontWeight="medium">{office.name}</Td>
                                        <Td>{office.ownerName}</Td>
                                        <Td>{office.ownerEmail}</Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(office.status)}>
                                                {getStatusText(office.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge variant="outline">{office.planName}</Badge>
                                        </Td>
                                        <Td>{formatDate(office.subscriptionEndDate)}</Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => navigate(`/superadmin3537/offices/${office.id}`)}
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
                {!loading && offices.length > 0 && (
                    <Text color="gray.600" fontSize="sm">
                        Toplam {offices.length} ofis gösteriliyor
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default OfficesList;
