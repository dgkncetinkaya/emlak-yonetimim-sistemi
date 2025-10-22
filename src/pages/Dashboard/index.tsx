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
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats,
  getRecentActivities,
  getTopPerformers,
  getNotifications,
  markNotificationAsRead,
  getQuickActions,
  getPersonalGoals,
  type DashboardStats,
  type RecentActivity,
  type TopPerformer,
  type NotificationData
} from '../../services/dashboardService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Dashboard verilerini çek
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir güncelle
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ['recentActivities'],
    queryFn: getRecentActivities,
    refetchInterval: 2 * 60 * 1000, // 2 dakikada bir güncelle
  });

  const { data: performers, isLoading: performersLoading } = useQuery<TopPerformer[]>({
    queryKey: ['topPerformers'],
    queryFn: getTopPerformers,
    refetchInterval: 10 * 60 * 1000, // 10 dakikada bir güncelle
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<NotificationData[]>({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(5),
    refetchInterval: 1 * 60 * 1000, // 1 dakikada bir güncelle
  });

  // Bildirimi okundu olarak işaretle
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Hata',
        description: 'Bildirim güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const quickActions = getQuickActions();
  const personalGoals = getPersonalGoals();

  const handleQuickAction = (url: string) => {
    navigate(url);
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
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
                <StatLabel>Toplam Agent</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : stats?.totalAgents || 0}
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
                <StatLabel>Aylık Komisyon</StatLabel>
                <StatNumber>
                  {statsLoading ? <Spinner size="sm" /> : formatCurrency(stats?.totalCommissions || 0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Dönüşüm: %{stats?.conversionRate || 0}
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

            {/* Son Aktiviteler */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Son Aktiviteler</Heading>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/activities')}>
                    Tümünü Gör <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {activitiesLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {activities?.slice(0, 5).map((activity) => (
                      <Flex key={activity.id} align="center" p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Icon 
                          as={getActivityIcon(activity.type)} 
                          boxSize={5} 
                          color={getActivityColor(activity.type)}
                          mr={3}
                        />
                        <Box flex="1">
                          <Text fontWeight="medium" fontSize="sm">{activity.title}</Text>
                          <Text fontSize="xs" color="gray.500">{activity.description}</Text>
                          <Text fontSize="xs" color="gray.400">
                            {formatDate(activity.timestamp)} {activity.user_name && `• ${activity.user_name}`}
                          </Text>
                        </Box>
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
                  <Button size="sm" variant="ghost" onClick={() => navigate('/reports/performance')}>
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
                        <Text fontWeight="bold" fontSize="sm" color="green.500">
                          {formatCurrency(performer.total_commission)}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Bildirimler */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Bildirimler</Heading>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/notifications')}>
                    Tümünü Gör <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {notificationsLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {notifications?.slice(0, 5).map((notification) => (
                      <Box
                        key={notification.id}
                        p={3}
                        borderRadius="md"
                        bg={notification.is_read ? 'transparent' : useColorModeValue('blue.50', 'blue.900')}
                        border="1px"
                        borderColor={notification.is_read ? 'transparent' : 'blue.200'}
                        cursor="pointer"
                        onClick={() => handleNotificationClick(notification)}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      >
                        <Flex align="start">
                          <Icon 
                            as={FiBell} 
                            boxSize={4} 
                            color={getPriorityColor(notification.priority)}
                            mr={2}
                            mt={0.5}
                          />
                          <Box flex="1">
                            <Text fontWeight="medium" fontSize="sm">{notification.title}</Text>
                            <Text fontSize="xs" color="gray.500" noOfLines={2}>
                              {notification.message}
                            </Text>
                            <Text fontSize="xs" color="gray.400" mt={1}>
                              {formatDate(notification.created_at)}
                            </Text>
                          </Box>
                          {!notification.is_read && (
                            <Box w={2} h={2} bg="blue.500" borderRadius="full" />
                          )}
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

export default Dashboard;