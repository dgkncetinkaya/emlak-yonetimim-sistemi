import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  Button,
  Avatar,
  Flex,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast
} from '@chakra-ui/react';
import {
  FiTrendingUp,
  FiUsers,
  FiHome,
  FiDollarSign,
  FiPlus,
  FiUser,
  FiCalendar,
  FiBarChart,
  FiSettings,
  FiTarget,
  FiBell,
  FiEye,
  FiArrowRight
} from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { dashboardService } from '../../../services/dashboardService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tenantName } = useParams<{ tenantName: string }>();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Theme colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Queries
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats()
  });

  const { data: recentProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['dashboardRecentProperties'],
    queryFn: () => dashboardService.getRecentProperties(5)
  });

  const { data: recentCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['dashboardRecentCustomers'],
    queryFn: () => dashboardService.getRecentCustomers(5)
  });

  const { data: performers, isLoading: performersLoading } = useQuery({
    queryKey: ['dashboardPerformers'],
    queryFn: () => dashboardService.getTopPerformers(5)
  });



  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      // Mock API call
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardNotifications'] });
    }
  });

  const quickActions = [
    { id: 1, title: 'İlan Ekle', description: 'Yeni bir portföy ekle', icon: 'FiPlus', url: '/portfolio', color: 'blue' },
    { id: 2, title: 'Müşteri Ekle', description: 'Yeni müşteri kaydı', icon: 'FiUser', url: '/customers', color: 'green' },
    { id: 3, title: 'Randevu', description: 'Randevu oluştur', icon: 'FiCalendar', url: '/my-appointments', color: 'purple' },
  ];

  const personalGoals = [
    { id: 1, title: 'Aylık Satış Hedefi', current: 8, target: 10, unit: 'Adet', color: 'green' },
    { id: 2, title: 'Portföy Büyümesi', current: 15, target: 20, unit: 'İlan', color: 'blue' },
  ];

  interface NotificationData {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    priority: string;
    action_url?: string;
  }

  const handleQuickAction = (url: string) => {
    // Map English paths to Turkish paths if necessary
    const pathMap: Record<string, string> = {
      '/portfolio': '/portfoy',
      '/customers': '/musteriler',
      '/documents': '/belgeler',
      '/reports': '/raporlar',
      '/settings': '/ayarlar',
      '/my-appointments': '/randevularim',
      '/notifications': '/bildirimler',
      '/activities': '/aktiviteler',
    };

    const targetPath = pathMap[url] || url;
    // If url starts with /, append to tenant path
    if (targetPath.startsWith('/')) {
      navigate(`/${tenantName}${targetPath}`);
    } else {
      navigate(targetPath);
    }
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      // Apply same mapping logic
      const pathMap: Record<string, string> = {
        '/portfolio': '/portfoy',
        '/customers': '/musteriler',
        '/documents': '/belgeler',
        '/reports': '/raporlar',
        '/settings': '/ayarlar',
        '/my-appointments': '/randevularim',
        '/notifications': '/bildirimler',
        '/activities': '/aktiviteler',
      };
      const targetPath = pathMap[notification.action_url] || notification.action_url;
      if (targetPath.startsWith('/')) {
        navigate(`/${tenantName}${targetPath}`);
      } else {
        navigate(targetPath);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (statsError) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Veri Yükleme Hatası!</AlertTitle>
          <AlertDescription>
            Dashboard verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Başlık */}
        <Box>
          <Heading size="lg" mb={2}>Dashboard</Heading>
          <Text color="gray.600">Emlak yönetim sisteminizin genel durumu</Text>
        </Box>

        {/* İstatistik Kartları */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Toplam Emlak</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : stats?.totalProperties || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Aktif: {stats?.activeListings || 0}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Toplam Müşteri</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : stats?.totalCustomers || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Bu ay
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Danışman Sayısı</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : stats?.totalConsultants || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Aktif
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Dönüşüm Oranı</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : `%${stats?.conversionRate || 0}`}
                </StatNumber>
                <StatHelpText>
                  Satılan/Kiralanan: {stats?.soldProperties || 0} + {stats?.rentedProperties || 0}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Sol Kolon */}
          <VStack spacing={6} align="stretch">
            {/* Hızlı Aksiyonlar */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Hızlı Aksiyonlar</Heading>
              </CardHeader>
              <CardBody>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      h="auto"
                      p={4}
                      onClick={() => handleQuickAction(action.url)}
                      colorScheme={action.color}
                    >
                      <VStack spacing={2}>
                        <Icon as={getIconComponent(action.icon)} boxSize={6} />
                        <Text fontSize="sm" fontWeight="medium" textAlign="center">
                          {action.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          {action.description}
                        </Text>
                      </VStack>
                    </Button>
                  ))}
                </Grid>
              </CardBody>
            </Card>

            {/* Kişisel Hedefler */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Kişisel Hedefler</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {personalGoals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <Box key={goal.id} w="100%">
                        <Flex justify="space-between" mb={2}>
                          <Text fontWeight="medium">{goal.title}</Text>
                          <Badge colorScheme={goal.color}>
                            {goal.current}/{goal.target} {goal.unit}
                          </Badge>
                        </Flex>
                        <Progress
                          value={progress}
                          colorScheme={goal.color}
                          size="sm"
                          borderRadius="md"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          %{progress.toFixed(1)} tamamlandı
                        </Text>
                      </Box>
                    );
                  })}
                </VStack>
              </CardBody>
            </Card>

            {/* Son Eklenen İlanlar */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Son Eklenen İlanlar</Heading>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/${tenantName}/portfoy`)}>
                    Tümünü Gör <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {propertiesLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {recentProperties?.map((property) => (
                      <Flex 
                        key={property.id} 
                        align="center" 
                        p={3} 
                        borderRadius="md" 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        cursor="pointer"
                        onClick={() => navigate(`/${tenantName}/portfoy/ilan/${property.id}`)}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Icon
                          as={FiHome}
                          boxSize={5}
                          color="blue.500"
                          mr={3}
                        />
                        <Box flex="1">
                          <Text fontWeight="medium" fontSize="sm">{property.title}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {property.district}, {property.city}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {formatDate(property.created_at)} • {property.created_by_profile?.full_name}
                          </Text>
                        </Box>
                        <Badge colorScheme={property.status === 'active' ? 'green' : 'gray'}>
                          {property.status === 'active' ? 'Aktif' : property.status}
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Son Eklenen Müşteriler */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Son Eklenen Müşteriler</Heading>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/${tenantName}/musteriler`)}>
                    Tümünü Gör <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {customersLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {recentCustomers?.map((customer) => (
                      <Flex 
                        key={customer.id} 
                        align="center" 
                        p={3} 
                        borderRadius="md" 
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        cursor="pointer"
                        onClick={() => navigate(`/${tenantName}/musteriler/${customer.id}`)}
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                      >
                        <Icon
                          as={FiUser}
                          boxSize={5}
                          color="green.500"
                          mr={3}
                        />
                        <Box flex="1">
                          <Text fontWeight="medium" fontSize="sm">{customer.full_name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {customer.email || customer.phone}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {formatDate(customer.created_at)}
                          </Text>
                        </Box>
                        <Badge colorScheme={customer.status === 'active' ? 'green' : 'gray'}>
                          {customer.status || 'Aktif'}
                        </Badge>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </VStack>

          {/* Sağ Kolon */}
          <VStack spacing={6} align="stretch">
            {/* En İyi Performans Gösterenler */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">En İyi Performans</Heading>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/${tenantName}/raporlar/performans`)}>
                    Detay <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {performersLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <VStack spacing={3}>
                    {performers?.slice(0, 5).map((performer, index) => (
                      <Flex key={performer.id} align="center" w="100%" p={2}>
                        <Text fontWeight="bold" color="gray.400" mr={3} minW="20px">
                          #{index + 1}
                        </Text>
                        <Avatar
                          size="sm"
                          name={performer.name}
                          src={performer.avatar_url}
                          mr={3}
                        />
                        <Box flex="1">
                          <Text fontWeight="medium" fontSize="sm">{performer.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {performer.total_sales} satış • %{performer.conversion_rate} dönüşüm
                          </Text>
                        </Box>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm" color="green.500">
                            {performer.total_sales} satış
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {performer.total_properties} ilan
                          </Text>
                        </VStack>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>


          </VStack>
        </Grid>
      </VStack>
    </Box>
  );
};

// Yardımcı fonksiyonlar
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    FiPlus,
    FiUser,
    FiCalendar,
    FiBarChart,
    FiDollarSign,
    FiSettings,
  };
  return iconMap[iconName] || FiSettings;
};

const getActivityIcon = (type: string) => {
  const iconMap: { [key: string]: any } = {
    property_added: FiHome,
    customer_added: FiUser,
    contract_signed: FiTarget,
    payment_received: FiDollarSign,
  };
  return iconMap[type] || FiBell;
};

const getActivityColor = (type: string) => {
  const colorMap: { [key: string]: string } = {
    property_added: 'blue.500',
    customer_added: 'green.500',
    contract_signed: 'purple.500',
    payment_received: 'orange.500',
  };
  return colorMap[type] || 'gray.500';
};

const getPriorityColor = (priority: string) => {
  const colorMap: { [key: string]: string } = {
    low: 'gray.500',
    medium: 'blue.500',
    high: 'orange.500',
    urgent: 'red.500',
  };
  return colorMap[priority] || 'gray.500';
};

export default Dashboard;