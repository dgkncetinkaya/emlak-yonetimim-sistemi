import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    useColorModeValue,
    useToast,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Card,
    CardBody,
    Icon
} from '@chakra-ui/react';
import {
    Search,
    Plus,
    Building2,
    Users,
    TrendingUp,
    Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { superadminService, type Tenant } from '../../../services/superadminService';
import TenantTable from '../../../components/superadmin3537/TenantTable';

const TenantManagement: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const navigate = useNavigate();
    const toast = useToast();

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        loadTenants();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tenants, searchTerm, statusFilter]);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const data = await superadminService.getTenants();
            setTenants(data);
        } catch (error) {
            console.error('Error loading tenants:', error);
            toast({
                title: 'Hata',
                description: 'Tenant\'lar yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tenants];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(tenant =>
                tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(tenant => tenant.status === statusFilter);
        }

        setFilteredTenants(filtered);
    };

    const handleStatusChange = async (
        tenant: Tenant,
        status: 'active' | 'inactive' | 'suspended'
    ) => {
        try {
            // TODO: Implement status change API call
            toast({
                title: 'Başarılı',
                description: `Tenant durumu "${status}" olarak güncellendi`,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            loadTenants();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Durum güncellenemedi',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleDelete = async (tenant: Tenant) => {
        if (!confirm(`"${tenant.name}" tenant'ını silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            // TODO: Implement delete API call
            toast({
                title: 'Başarılı',
                description: 'Tenant silindi',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            loadTenants();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Tenant silinemedi',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        totalUsers: tenants.reduce((sum, t) => sum + (t.user_count || 0), 0),
        totalMRR: tenants.reduce((sum, t) => sum + (t.mrr || 0), 0)
    };

    return (
        <Box bg={bg} minH="100vh" w="100%" p={0}>
            <VStack spacing={8} align="stretch" w="100%">
                {/* Header */}
                <Box>
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                            <Heading fontSize="3xl" fontWeight="bold" color={headingColor}>
                                Tenant Yönetimi
                            </Heading>
                            <Text fontSize="lg" color={textColor}>
                                Tüm organizasyonları görüntüleyin ve yönetin
                            </Text>
                        </VStack>
                        <Button
                            leftIcon={<Plus size={18} />}
                            colorScheme="blue"
                            onClick={() => navigate('/superadmin3537/tenants/new')}
                        >
                            Yeni Tenant
                        </Button>
                    </HStack>
                </Box>

                {/* Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">
                                        Toplam Tenant
                                    </StatLabel>
                                    <StatNumber fontSize="2xl" color="blue.500">
                                        {stats.total}
                                    </StatNumber>
                                </Stat>
                                <Box p={3} bg="blue.50" borderRadius="lg">
                                    <Icon as={Building2} color="blue.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">
                                        Aktif Tenant
                                    </StatLabel>
                                    <StatNumber fontSize="2xl" color="green.500">
                                        {stats.active}
                                    </StatNumber>
                                </Stat>
                                <Box p={3} bg="green.50" borderRadius="lg">
                                    <Icon as={Activity} color="green.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">
                                        Toplam Kullanıcı
                                    </StatLabel>
                                    <StatNumber fontSize="2xl" color="purple.500">
                                        {stats.totalUsers}
                                    </StatNumber>
                                </Stat>
                                <Box p={3} bg="purple.50" borderRadius="lg">
                                    <Icon as={Users} color="purple.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">
                                        Toplam MRR
                                    </StatLabel>
                                    <StatNumber fontSize="2xl" color="orange.500">
                                        ₺{stats.totalMRR.toLocaleString()}
                                    </StatNumber>
                                </Stat>
                                <Box p={3} bg="orange.50" borderRadius="lg">
                                    <Icon as={TrendingUp} color="orange.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Filters */}
                <HStack spacing={4}>
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none">
                            <Search size={18} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Tenant ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bg={cardBg}
                        />
                    </InputGroup>

                    <Select
                        maxW="200px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        bg={cardBg}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                        <option value="suspended">Askıda</option>
                    </Select>
                </HStack>

                {/* Table */}
                <TenantTable
                    tenants={filteredTenants}
                    loading={loading}
                    onView={(tenant) => navigate(`/superadmin3537/tenants/${tenant.id}`)}
                    onEdit={(tenant) => navigate(`/superadmin3537/tenants/${tenant.id}/edit`)}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
            </VStack>
        </Box>
    );
};

export default TenantManagement;
