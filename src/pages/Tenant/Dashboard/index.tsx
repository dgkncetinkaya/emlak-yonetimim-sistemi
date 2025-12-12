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
  useToast,
  Container,
  SimpleGrid
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
import { modernGradients, modernShadows, cardStyles } from '../../../styles/modernTheme';

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
    <Box 
      minH="100vh" 
      bg={useColorModeValue(
        'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
      )}
    >
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Başlık - Modern */}
          <Box>
            <Heading 
              size="2xl" 
              mb={2}
              bgGradient={modernGradients.primary}
              bgClip="text"
              fontWeight="extrabold"
            >
              Dashboard
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Emlak yönetim sisteminizin genel durumu
            </Text>
          </Box>

          {/* İstatistik Kartları - Modern Gradient */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card 
              {...cardStyles.modern}
              bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
            >
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Icon as={FiHome} boxSize={10} opacity={0.8} />
                  <Box 
                    bg="whiteAlpha.300" 
                    p={2} 
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiTrendingUp} boxSize={5} />
                  </Box>
                </Flex>
                <Stat>
                  <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                    Toplam Emlak
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" mt={2}>
                    {statsLoading ? <Spinner size="sm" color="white" /> : stats?.totalProperties || 0}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.800" mt={2}>
                    <StatArrow type="increase" />
                    Aktif: {stats?.activeListings || 0}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              {...cardStyles.modern}
              bgGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              color="white"
            >
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Icon as={FiUsers} boxSize={10} opacity={0.8} />
                  <Box 
                    bg="whiteAlpha.300" 
                    p={2} 
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiTrendingUp} boxSize={5} />
                  </Box>
                </Flex>
                <Stat>
                  <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                    Toplam Müşteri
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" mt={2}>
                    {statsLoading ? <Spinner size="sm" color="white" /> : stats?.totalCustomers || 0}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.800" mt={2}>
                    <StatArrow type="increase" />
                    Bu ay
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              {...cardStyles.modern}
              bgGradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              color="white"
            >
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Icon as={FiUser} boxSize={10} opacity={0.8} />
                  <Box 
                    bg="whiteAlpha.300" 
                    p={2} 
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiTrendingUp} boxSize={5} />
                  </Box>
                </Flex>
                <Stat>
                  <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                    Danışman Sayısı
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" mt={2}>
                    {statsLoading ? <Spinner size="sm" color="white" /> : stats?.totalConsultants || 0}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.800" mt={2}>
                    <StatArrow type="increase" />
                    Aktif
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card 
              {...cardStyles.modern}
              bgGradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              color="white"
            >
              <CardBody>
                <Flex align="center" justify="space-between" mb={4}>
                  <Icon as={FiTarget} boxSize={10} opacity={0.8} />
                  <Box 
                    bg="whiteAlpha.300" 
                    p={2} 
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Icon as={FiTrendingUp} boxSize={5} />
                  </Box>
                </Flex>
                <Stat>
                  <StatLabel color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                    Dönüşüm Oranı
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" mt={2}>
                    {statsLoading ? <Spinner size="sm" color="white" /> : `%${stats?.conversionRate || 0}`}
                  </StatNumber>
                  <StatHelpText color="whiteAlpha.800" mt={2}>
                    Satılan: {stats?.soldProperties || 0} + {stats?.rentedProperties || 0}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Sol Kolon */}
          <VStack spacing={6} align="stretch">
            {/* Hızlı Aksiyonlar - Modern */}
            <Card {...cardStyles.modern}>
              <CardHeader pb={2}>
                <Heading size="md" fontWeight="bold">Hızlı Aksiyonlar</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {quickActions.map((action) => (
                    <Box
                      key={action.id}
                      as="button"
                      onClick={() => handleQuickAction(action.url)}
                      p={6}
                      borderRadius="xl"
                      bg={useColorModeValue('white', 'gray.700')}
                      border="2px solid"
                      borderColor={useColorModeValue('gray.100', 'gray.600')}
                      transition="all 0.3s ease"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: modernShadows.lg,
                        borderColor: `${action.color}.400`,
                        bgGradient: `linear-gradient(135deg, ${action.color}.50 0%, ${action.color}.100 100%)`,
                      }}
                    >
                      <VStack spacing={3}>
                        <Box
                          p={3}
                          borderRadius="lg"
                          bg={`${action.color}.100`}
                          color={`${action.color}.600`}
                        >
                          <Icon as={getIconComponent(action.icon)} boxSize={6} />
                        </Box>
                        <Text fontSize="sm" fontWeight="bold" textAlign="center">
                          {action.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          {action.description}
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Kişisel Hedefler - Modern */}
            <Card {...cardStyles.modern}>
              <CardHeader pb={2}>
                <Heading size="md" fontWeight="bold">Kişisel Hedefler</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={5}>
                  {personalGoals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <Box 
                        key={goal.id} 
                        w="100%" 
                        p={4} 
                        borderRadius="lg"
                        bg={useColorModeValue(`${goal.color}.50`, `${goal.color}.900`)}
                        border="1px solid"
                        borderColor={useColorModeValue(`${goal.color}.100`, `${goal.color}.700`)}
                      >
                        <Flex justify="space-between" align="center" mb={3}>
                          <Text fontWeight="bold" fontSize="sm">{goal.title}</Text>
                          <Badge 
                            colorScheme={goal.color}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {goal.current}/{goal.target} {goal.unit}
                          </Badge>
                        </Flex>
                        <Progress
                          value={progress}
                          colorScheme={goal.color}
                          size="md"
                          borderRadius="full"
                          hasStripe
                          isAnimated
                        />
                        <Flex justify="space-between" mt={2}>
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            %{progress.toFixed(1)} tamamlandı
                          </Text>
                          <Text fontSize="xs" color={`${goal.color}.600`} fontWeight="bold">
                            {goal.target - goal.current} kaldı
                          </Text>
                        </Flex>
                      </Box>
                    );
                  })}
                </VStack>
              </CardBody>
            </Card>

            {/* Son Eklenen İlanlar - Modern */}
            <Card {...cardStyles.modern}>
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" fontWeight="bold">Son Eklenen İlanlar</Heading>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate(`/${tenantName}/portfoy`)}
                    rightIcon={<Icon as={FiArrowRight} />}
                    colorScheme="blue"
                    fontWeight="semibold"
                  >
                    Tümünü Gör
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {propertiesLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : recentProperties && recentProperties.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {recentProperties?.map((property) => (
                      <Box
                        key={property.id}
                        p={4}
                        borderRadius="lg"
                        bg={useColorModeValue('white', 'gray.700')}
                        border="1px solid"
                        borderColor={useColorModeValue('gray.100', 'gray.600')}
                        cursor="pointer"
                        onClick={() => navigate(`/${tenantName}/portfoy/ilan/${property.id}`)}
                        transition="all 0.3s ease"
                        _hover={{ 
                          transform: 'translateX(4px)',
                          boxShadow: modernShadows.md,
                          borderColor: 'blue.400'
                        }}
                      >
                        <Flex align="center">
                          <Box
                            p={3}
                            borderRadius="lg"
                            bg="blue.50"
                            color="blue.600"
                            mr={3}
                          >
                            <Icon as={FiHome} boxSize={5} />
                          </Box>
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="sm" mb={1}>{property.title}</Text>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              {property.district}, {property.city} • {formatCurrency(property.price)}
                            </Text>
                            <HStack spacing={2}>
                              <Badge size="sm" colorScheme="gray" fontSize="xs">
                                {formatDate(property.created_at)}
                              </Badge>
                              <Badge size="sm" colorScheme="blue" fontSize="xs">
                                {getListingTypeLabel(property.listing_type)}
                              </Badge>
                            </HStack>
                          </Box>
                          <Badge 
                            colorScheme={getPropertyStatusColorScheme(property.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {getPropertyStatusLabel(property.status)}
                          </Badge>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Flex direction="column" align="center" justify="center" p={8} color="gray.500">
                    <Icon as={FiHome} boxSize={12} mb={3} />
                    <Text fontSize="sm">Henüz ilan eklenmemiş</Text>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      mt={3}
                      onClick={() => navigate(`/${tenantName}/portfoy`)}
                    >
                      İlk İlanı Ekle
                    </Button>
                  </Flex>
                )}
              </CardBody>
            </Card>

            {/* Son Eklenen Müşteriler - Modern */}
            <Card {...cardStyles.modern}>
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" fontWeight="bold">Son Eklenen Müşteriler</Heading>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate(`/${tenantName}/musteriler`)}
                    rightIcon={<Icon as={FiArrowRight} />}
                    colorScheme="green"
                    fontWeight="semibold"
                  >
                    Tümünü Gör
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {customersLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : recentCustomers && recentCustomers.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {recentCustomers?.map((customer) => (
                      <Box
                        key={customer.id}
                        p={4}
                        borderRadius="lg"
                        bg={useColorModeValue('white', 'gray.700')}
                        border="1px solid"
                        borderColor={useColorModeValue('gray.100', 'gray.600')}
                        cursor="pointer"
                        onClick={() => navigate(`/${tenantName}/musteriler/${customer.id}`)}
                        transition="all 0.3s ease"
                        _hover={{ 
                          transform: 'translateX(4px)',
                          boxShadow: modernShadows.md,
                          borderColor: 'green.400'
                        }}
                      >
                        <Flex align="center">
                          <Box
                            p={3}
                            borderRadius="lg"
                            bg="green.50"
                            color="green.600"
                            mr={3}
                          >
                            <Icon as={FiUser} boxSize={5} />
                          </Box>
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="sm" mb={1}>{customer.name}</Text>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              {customer.email || customer.phone}
                            </Text>
                            <HStack spacing={2}>
                              <Badge size="sm" colorScheme="gray" fontSize="xs">
                                {formatDate(customer.created_at)}
                              </Badge>
                              <Badge size="sm" colorScheme="green" fontSize="xs">
                                {getCustomerTypeLabel(customer.customer_type)}
                              </Badge>
                            </HStack>
                          </Box>
                          <Badge 
                            colorScheme={getStatusColorScheme(customer.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {getStatusLabel(customer.status)}
                          </Badge>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Flex direction="column" align="center" justify="center" p={8} color="gray.500">
                    <Icon as={FiUser} boxSize={12} mb={3} />
                    <Text fontSize="sm">Henüz müşteri eklenmemiş</Text>
                    <Button 
                      size="sm" 
                      colorScheme="green" 
                      mt={3}
                      onClick={() => navigate(`/${tenantName}/musteriler`)}
                    >
                      İlk Müşteriyi Ekle
                    </Button>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </VStack>

          {/* Sağ Kolon */}
          <VStack spacing={6} align="stretch">
            {/* En İyi Performans Gösterenler - Modern */}
            <Card {...cardStyles.modern}>
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" fontWeight="bold">En İyi Performans</Heading>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate(`/${tenantName}/raporlar/performans`)}
                    rightIcon={<Icon as={FiArrowRight} />}
                    colorScheme="purple"
                    fontWeight="semibold"
                  >
                    Detay
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
                      <Box
                        key={performer.id}
                        p={4}
                        borderRadius="lg"
                        bg={useColorModeValue(
                          index === 0 ? 'yellow.50' : index === 1 ? 'gray.50' : index === 2 ? 'orange.50' : 'white',
                          'gray.700'
                        )}
                        border="1px solid"
                        borderColor={useColorModeValue(
                          index === 0 ? 'yellow.200' : index === 1 ? 'gray.200' : index === 2 ? 'orange.200' : 'gray.100',
                          'gray.600'
                        )}
                        transition="all 0.3s ease"
                        _hover={{ 
                          transform: 'translateY(-2px)',
                          boxShadow: modernShadows.md
                        }}
                      >
                        <Flex align="center">
                          <Box
                            minW="32px"
                            h="32px"
                            borderRadius="full"
                            bg={index === 0 ? 'yellow.400' : index === 1 ? 'gray.400' : index === 2 ? 'orange.400' : 'purple.400'}
                            color="white"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            fontSize="sm"
                            mr={3}
                          >
                            #{index + 1}
                          </Box>
                          <Avatar
                            size="sm"
                            name={performer.name}
                            mr={3}
                            bg="purple.500"
                          />
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="sm" mb={1}>{performer.name}</Text>
                            <HStack spacing={2}>
                              <Badge colorScheme="green" fontSize="xs">
                                {performer.total_sales} satış
                              </Badge>
                              <Badge colorScheme="blue" fontSize="xs">
                                %{performer.conversion_rate}
                              </Badge>
                            </HStack>
                          </Box>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" fontSize="lg" color="green.500">
                              {performer.total_sales}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {performer.total_properties} ilan
                            </Text>
                          </VStack>
                        </Flex>
                      </Box>
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

const getCustomerTypeLabel = (type: string) => {
  const typeMap: { [key: string]: string } = {
    buyer: 'Alıcı',
    seller: 'Satıcı',
    tenant: 'Kiracı',
    landlord: 'Ev Sahibi',
  };
  return typeMap[type] || type;
};

const getStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: 'Aktif',
    inactive: 'Pasif',
    potential: 'Potansiyel',
    converted: 'Dönüştürüldü',
  };
  return statusMap[status] || status;
};

const getStatusColorScheme = (status: string) => {
  const colorMap: { [key: string]: string } = {
    active: 'green',
    inactive: 'gray',
    potential: 'blue',
    converted: 'purple',
  };
  return colorMap[status] || 'gray';
};

const getListingTypeLabel = (type: string) => {
  const typeMap: { [key: string]: string } = {
    sale: 'Satılık',
    rent: 'Kiralık',
  };
  return typeMap[type] || type;
};

const getPropertyStatusLabel = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: 'Aktif',
    inactive: 'Pasif',
    sold: 'Satıldı',
    rented: 'Kiralandı',
    pending: 'Beklemede',
  };
  return statusMap[status] || status;
};

const getPropertyStatusColorScheme = (status: string) => {
  const colorMap: { [key: string]: string } = {
    active: 'green',
    inactive: 'gray',
    sold: 'purple',
    rented: 'blue',
    pending: 'yellow',
  };
  return colorMap[status] || 'gray';
};

export default Dashboard;