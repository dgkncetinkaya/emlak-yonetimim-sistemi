import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    SimpleGrid,
    Card,
    CardBody,
    CardHeader,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Badge,
    Divider,
    useColorModeValue,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Icon,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';
import {
    ArrowLeft,
    Building2,
    Users,
    Home,
    DollarSign,
    Calendar,
    Activity,
    Edit
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { superadminService } from '../../../services/superadminService';

const TenantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<any>(null);

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        if (id) {
            loadTenantDetail();
        }
    }, [id]);

    const loadTenantDetail = async () => {
        try {
            setLoading(true);
            // TODO: Implement getTenantDetail API call
            // const data = await superadminService.getTenantDetail(id!);

            // Mock data for now
            setTenant({
                id: id,
                name: 'Örnek Emlak A.Ş.',
                domain: 'ornek-emlak.com',
                status: 'active',
                created_at: '2024-01-15',
                user_count: 12,
                property_count: 145,
                mrr: 599,
                subscription: {
                    plan_name: 'Enterprise',
                    billing_cycle: 'yearly',
                    next_billing_date: '2024-12-15',
                    status: 'active'
                },
                usage: {
                    properties: { used: 145, limit: 1000 },
                    users: { used: 12, limit: 50 },
                    storage: { used: 2.5, limit: 100 }
                }
            });
        } catch (error) {
            console.error('Error loading tenant detail:', error);
            toast({
                title: 'Hata',
                description: 'Tenant detayları yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color={textColor}>Tenant detayları yükleniyor...</Text>
                </VStack>
            </Box>
        );
    }

    if (!tenant) {
        return (
            <Box bg={bg} minH="100vh" p={8}>
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    Tenant bulunamadı
                </Alert>
            </Box>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'gray';
            case 'suspended': return 'red';
            default: return 'gray';
        }
    };

    return (
        <Box bg={bg} minH="100vh" w="100%" p={0}>
            <VStack spacing={8} align="stretch" w="100%">
                {/* Header */}
                <Box>
                    <Button
                        leftIcon={<ArrowLeft size={18} />}
                        variant="ghost"
                        onClick={() => navigate('/superadmin3537/tenants')}
                        mb={4}
                    >
                        Geri Dön
                    </Button>

                    <HStack justify="space-between">
                        <HStack spacing={4}>
                            <Icon as={Building2} boxSize={10} color="blue.500" />
                            <VStack align="start" spacing={1}>
                                <Heading fontSize="3xl" fontWeight="bold" color={headingColor}>
                                    {tenant.name}
                                </Heading>
                                <HStack spacing={2}>
                                    <Badge colorScheme={getStatusColor(tenant.status)}>
                                        {tenant.status}
                                    </Badge>
                                    <Text fontSize="sm" color={textColor}>
                                        {tenant.domain}
                                    </Text>
                                </HStack>
                            </VStack>
                        </HStack>
                        <Button
                            leftIcon={<Edit size={18} />}
                            colorScheme="blue"
                            onClick={() => navigate(`/superadmin3537/tenants/${id}/edit`)}
                        >
                            Düzenle
                        </Button>
                    </HStack>
                </Box>

                {/* Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Kullanıcılar</StatLabel>
                                    <StatNumber fontSize="2xl" color="purple.500">
                                        {tenant.user_count}
                                    </StatNumber>
                                    <StatHelpText>
                                        {tenant.usage.users.limit} limitten
                                    </StatHelpText>
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
                                    <StatLabel fontSize="sm" color="gray.500">Emlaklar</StatLabel>
                                    <StatNumber fontSize="2xl" color="blue.500">
                                        {tenant.property_count}
                                    </StatNumber>
                                    <StatHelpText>
                                        {tenant.usage.properties.limit} limitten
                                    </StatHelpText>
                                </Stat>
                                <Box p={3} bg="blue.50" borderRadius="lg">
                                    <Icon as={Home} color="blue.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">MRR</StatLabel>
                                    <StatNumber fontSize="2xl" color="green.500">
                                        ₺{tenant.mrr.toLocaleString()}
                                    </StatNumber>
                                    <StatHelpText>Aylık gelir</StatHelpText>
                                </Stat>
                                <Box p={3} bg="green.50" borderRadius="lg">
                                    <Icon as={DollarSign} color="green.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Depolama</StatLabel>
                                    <StatNumber fontSize="2xl" color="orange.500">
                                        {tenant.usage.storage.used} GB
                                    </StatNumber>
                                    <StatHelpText>
                                        {tenant.usage.storage.limit} GB limitten
                                    </StatHelpText>
                                </Stat>
                                <Box p={3} bg="orange.50" borderRadius="lg">
                                    <Icon as={Activity} color="orange.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Tabs */}
                <Tabs colorScheme="blue">
                    <TabList>
                        <Tab>Genel Bilgiler</Tab>
                        <Tab>Abonelik</Tab>
                        <Tab>Kullanım</Tab>
                        <Tab>Faturalar</Tab>
                    </TabList>

                    <TabPanels>
                        {/* General Info */}
                        <TabPanel px={0}>
                            <Card bg={cardBg}>
                                <CardHeader>
                                    <Heading size="md">Genel Bilgiler</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Tenant ID:</Text>
                                            <Text fontWeight="medium">{tenant.id}</Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Domain:</Text>
                                            <Text fontWeight="medium">{tenant.domain}</Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Oluşturulma Tarihi:</Text>
                                            <Text fontWeight="medium">
                                                {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                                            </Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Durum:</Text>
                                            <Badge colorScheme={getStatusColor(tenant.status)}>
                                                {tenant.status}
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Subscription */}
                        <TabPanel px={0}>
                            <Card bg={cardBg}>
                                <CardHeader>
                                    <Heading size="md">Abonelik Bilgileri</Heading>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="stretch" spacing={4}>
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Plan:</Text>
                                            <Text fontWeight="medium">{tenant.subscription.plan_name}</Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Faturalama Döngüsü:</Text>
                                            <Text fontWeight="medium">
                                                {tenant.subscription.billing_cycle === 'yearly' ? 'Yıllık' : 'Aylık'}
                                            </Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Sonraki Ödeme:</Text>
                                            <Text fontWeight="medium">
                                                {new Date(tenant.subscription.next_billing_date).toLocaleDateString('tr-TR')}
                                            </Text>
                                        </HStack>
                                        <Divider />
                                        <HStack justify="space-between">
                                            <Text color={textColor}>Durum:</Text>
                                            <Badge colorScheme="green">{tenant.subscription.status}</Badge>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        </TabPanel>

                        {/* Usage */}
                        <TabPanel px={0}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                <Card bg={cardBg}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <Text fontWeight="bold">Emlak Kullanımı</Text>
                                            <Text fontSize="2xl" color="blue.500">
                                                {tenant.usage.properties.used} / {tenant.usage.properties.limit}
                                            </Text>
                                            <Box
                                                h="8px"
                                                bg="gray.200"
                                                borderRadius="full"
                                                overflow="hidden"
                                            >
                                                <Box
                                                    h="100%"
                                                    bg="blue.500"
                                                    w={`${(tenant.usage.properties.used / tenant.usage.properties.limit) * 100}%`}
                                                />
                                            </Box>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <Text fontWeight="bold">Kullanıcı Kullanımı</Text>
                                            <Text fontSize="2xl" color="purple.500">
                                                {tenant.usage.users.used} / {tenant.usage.users.limit}
                                            </Text>
                                            <Box
                                                h="8px"
                                                bg="gray.200"
                                                borderRadius="full"
                                                overflow="hidden"
                                            >
                                                <Box
                                                    h="100%"
                                                    bg="purple.500"
                                                    w={`${(tenant.usage.users.used / tenant.usage.users.limit) * 100}%`}
                                                />
                                            </Box>
                                        </VStack>
                                    </CardBody>
                                </Card>

                                <Card bg={cardBg}>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <Text fontWeight="bold">Depolama Kullanımı</Text>
                                            <Text fontSize="2xl" color="orange.500">
                                                {tenant.usage.storage.used} / {tenant.usage.storage.limit} GB
                                            </Text>
                                            <Box
                                                h="8px"
                                                bg="gray.200"
                                                borderRadius="full"
                                                overflow="hidden"
                                            >
                                                <Box
                                                    h="100%"
                                                    bg="orange.500"
                                                    w={`${(tenant.usage.storage.used / tenant.usage.storage.limit) * 100}%`}
                                                />
                                            </Box>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>
                        </TabPanel>

                        {/* Invoices */}
                        <TabPanel px={0}>
                            <Card bg={cardBg}>
                                <CardHeader>
                                    <Heading size="md">Fatura Geçmişi</Heading>
                                </CardHeader>
                                <CardBody>
                                    <Text color={textColor}>Fatura geçmişi yakında eklenecek...</Text>
                                </CardBody>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default TenantDetail;
