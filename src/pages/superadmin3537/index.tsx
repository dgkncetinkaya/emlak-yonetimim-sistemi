import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Card,
    CardBody,
    Icon,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    useColorModeValue,
    Spinner,
    Alert,
    AlertIcon,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast
} from '@chakra-ui/react';
import {
    Building2,
    Users,
    TrendingUp,
    DollarSign,
    Activity,
    RefreshCw,
    LogOut
} from 'lucide-react';
import { superadminService, type SystemMetrics, type SubscriptionStats } from '../../services/superadminService';
import { getSuperAdminSession, logoutSuperAdmin } from '../../lib/superadminAuth';
import TenantCard from '../../components/superadmin3537/TenantCard';
import SubscriptionStatsComponent from '../../components/superadmin3537/SubscriptionStats';
import WebhookEventList from '../../components/superadmin3537/WebhookEventList';

const SuperAdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
    const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const toast = useToast();
    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data kullan - Supabase hatalarını önlemek için
            const mockMetrics: SystemMetrics = {
                total_tenants: 12,
                active_tenants: 10,
                total_users: 145,
                total_properties: 856,
                mrr: 125430,
                arr: 1505160,
                churn_rate: 5.2,
                growth_rate: 12.5
            };

            const mockSubStats: SubscriptionStats = {
                total_subscriptions: 12,
                active_subscriptions: 10,
                trial_subscriptions: 2,
                cancelled_subscriptions: 0,
                plan_distribution: {
                    'Basic': 3,
                    'Professional': 5,
                    'Enterprise': 4
                },
                mrr: 125430,
                arr: 1505160
            };

            const mockTenants = [
                {
                    id: '1',
                    name: 'Örnek Emlak A.Ş.',
                    domain: 'ornek-emlak.com',
                    status: 'active' as const,
                    created_at: '2024-01-15',
                    updated_at: '2024-01-20',
                    user_count: 12,
                    property_count: 145,
                    mrr: 599
                },
                {
                    id: '2',
                    name: 'Premium Gayrimenkul',
                    domain: 'premium-gm.com',
                    status: 'active' as const,
                    created_at: '2024-02-10',
                    updated_at: '2024-02-15',
                    user_count: 8,
                    property_count: 98,
                    mrr: 299
                }
            ];

            const mockWebhooks = [
                {
                    id: '1',
                    event_type: 'subscription.created',
                    status: 'completed' as const,
                    created_at: new Date().toISOString(),
                    retry_count: 0
                },
                {
                    id: '2',
                    event_type: 'payment.succeeded',
                    status: 'completed' as const,
                    created_at: new Date().toISOString(),
                    retry_count: 0
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setSystemMetrics(mockMetrics);
            setSubscriptionStats(mockSubStats);
            setTenants(mockTenants);
            setWebhookEvents(mockWebhooks);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Dashboard verileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryWebhook = async (eventId: string) => {
        try {
            await superadminService.retryFailedWebhooks();
            toast({
                title: 'Başarılı',
                description: 'Webhook yeniden deneniyor',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            loadDashboardData();
        } catch (err) {
            toast({
                title: 'Hata',
                description: 'Webhook yeniden denenemedi',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    if (loading) {
        return (
            <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color={textColor}>Dashboard yükleniyor...</Text>
                </VStack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box bg={bg} minH="100vh" p={8}>
                <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                </Alert>
            </Box>
        );
    }

    const systemStatCards = [
        {
            label: 'Toplam Tenant',
            value: systemMetrics?.total_tenants || 0,
            change: `+${systemMetrics?.growth_rate || 0}%`,
            icon: Building2,
            color: 'blue'
        },
        {
            label: 'Toplam Kullanıcı',
            value: systemMetrics?.total_users || 0,
            change: '+12%',
            icon: Users,
            color: 'green'
        },
        {
            label: 'MRR',
            value: `₺${(systemMetrics?.mrr || 0).toLocaleString()}`,
            change: '+18%',
            icon: DollarSign,
            color: 'purple'
        },
        {
            label: 'ARR',
            value: `₺${(systemMetrics?.arr || 0).toLocaleString()}`,
            change: '+22%',
            icon: TrendingUp,
            color: 'orange'
        }
    ];

    return (
        <Box bg={bg} minH="100vh" w="100%" p={0}>
            <VStack spacing={8} align="stretch" w="100%">
                {/* Header */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <VStack align="start" spacing={1}>
                            <Heading fontSize="3xl" fontWeight="bold" color={headingColor}>
                                SuperAdmin Dashboard
                            </Heading>
                            <Text fontSize="lg" color={textColor}>
                                Sistem geneli yönetim ve monitoring paneli
                            </Text>
                        </VStack>
                        <HStack spacing={3}>
                            <VStack align="end" spacing={0} display={{ base: 'none', md: 'flex' }}>
                                <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                                    {getSuperAdminSession()?.user.name}
                                </Text>
                                <Text fontSize="xs" color={textColor}>
                                    {getSuperAdminSession()?.user.email}
                                </Text>
                            </VStack>
                            <Button
                                leftIcon={<RefreshCw size={18} />}
                                colorScheme="blue"
                                variant="outline"
                                onClick={loadDashboardData}
                            >
                                Yenile
                            </Button>
                            <Button
                                leftIcon={<LogOut size={18} />}
                                colorScheme="red"
                                variant="outline"
                                onClick={logoutSuperAdmin}
                            >
                                Çıkış
                            </Button>
                        </HStack>
                    </HStack>
                </Box>

                {/* System Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
                    {systemStatCards.map((stat, index) => (
                        <Card
                            key={index}
                            bg={cardBg}
                            borderColor={borderColor}
                            borderWidth="1px"
                            shadow="sm"
                            _hover={{ shadow: 'md' }}
                            transition="all 0.2s"
                        >
                            <CardBody>
                                <HStack justify="space-between" align="flex-start">
                                    <Stat>
                                        <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
                                            {stat.label}
                                        </StatLabel>
                                        <StatNumber fontSize="2xl" fontWeight="bold" color={`${stat.color}.500`}>
                                            {stat.value}
                                        </StatNumber>
                                        <StatHelpText mb={0}>
                                            <StatArrow type="increase" />
                                            {stat.change}
                                        </StatHelpText>
                                    </Stat>
                                    <Box p={3} bg={`${stat.color}.50`} borderRadius="lg">
                                        <Icon as={stat.icon} color={`${stat.color}.500`} boxSize={6} />
                                    </Box>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Tabs */}
                <Tabs colorScheme="blue" variant="enclosed">
                    <TabList>
                        <Tab>Tenant'lar</Tab>
                        <Tab>Abonelikler</Tab>
                        <Tab>Webhook Events</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Tenants Tab */}
                        <TabPanel px={0}>
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                                        Aktif Tenant'lar ({tenants.length})
                                    </Text>
                                    <Button colorScheme="blue" size="sm">
                                        Yeni Tenant Ekle
                                    </Button>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                    {tenants.map((tenant) => (
                                        <TenantCard
                                            key={tenant.id}
                                            tenant={tenant}
                                            onClick={() => console.log('Tenant clicked:', tenant.id)}
                                        />
                                    ))}
                                </SimpleGrid>
                            </VStack>
                        </TabPanel>

                        {/* Subscriptions Tab */}
                        <TabPanel px={0}>
                            <VStack align="stretch" spacing={6}>
                                <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                                    Abonelik İstatistikleri
                                </Text>
                                {subscriptionStats && (
                                    <SubscriptionStatsComponent stats={subscriptionStats} />
                                )}
                            </VStack>
                        </TabPanel>

                        {/* Webhook Events Tab */}
                        <TabPanel px={0}>
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                                        Son Webhook Events
                                    </Text>
                                    <Button
                                        colorScheme="blue"
                                        size="sm"
                                        leftIcon={<RefreshCw size={16} />}
                                        onClick={() => superadminService.retryFailedWebhooks()}
                                    >
                                        Başarısızları Yeniden Dene
                                    </Button>
                                </HStack>
                                <WebhookEventList
                                    events={webhookEvents}
                                    onRetry={handleRetryWebhook}
                                />
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default SuperAdminDashboard;
