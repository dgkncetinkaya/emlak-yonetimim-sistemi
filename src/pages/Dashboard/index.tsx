import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Text, Icon, Heading, Card, CardBody, Stack, Divider, CardFooter, ButtonGroup, Button, useColorModeValue, Spinner, Badge, Container } from '@chakra-ui/react';
import { Home, Users, FileText, DollarSign, AlertCircle, Plus, AlertTriangle, Calendar, Send } from 'react-feather';


import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { getOverdueCustomersCount, getWarningCustomersCount, getContactWarningLevel, getDaysSinceLastContact } from '../../utils/customerUtils';



// Kişisel hedefler verisi
const personalGoals = {
  consultant: 'Ahmet Yılmaz',
  monthlyGoals: [
    {
      title: 'Aylık Satış Hedefi',
      current: 8,
      target: 12,
      unit: 'satış',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Yeni Müşteri Hedefi',
      current: 15,
      target: 20,
      unit: 'müşteri',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'İlan Ekleme Hedefi',
      current: 25,
      target: 30,
      unit: 'ilan',
      icon: Home,
      color: 'purple'
    }
  ]
};

// Dummy müşteri verileri - gerçek uygulamada API'den gelecek
const dummyCustomers = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    phone: '+90 532 123 4567',
    email: 'ahmet@email.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '₺2.500.000 - ₺3.000.000',
    preferences: '3+1, Merkezi konum, Asansörlü',
    lastContact: '15.05.2023',
    notes: 'Acil ev arıyor, bütçesi esnek'
  },
  {
    id: 2,
    name: 'Fatma Demir',
    phone: '+90 533 987 6543',
    email: 'fatma@email.com',
    status: 'Aktif',
    type: 'Satıcı',
    budget: '₺4.200.000',
    preferences: 'Bahçeli villa, Deniz manzaralı',
    lastContact: '28.05.2023',
    notes: 'Villa satışı için acele etmiyor'
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    phone: '+90 534 456 7890',
    email: 'mehmet@email.com',
    status: 'Pasif',
    type: 'Kiracı',
    budget: '₺8.000/ay',
    preferences: '2+1, Metro yakını, Eşyalı',
    lastContact: '10.04.2023',
    notes: 'Uzun dönem kiralama istiyor'
  }
];

interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  helpText?: string;
  increase?: boolean;
  decrease?: boolean;
  percentage?: string;
  isWarning?: boolean;
}

const StatCard = (props: StatCardProps) => {
  const { title, stat, icon, helpText, increase, decrease, percentage, isWarning } = props;
  const borderColor = useColorModeValue(
    isWarning ? 'orange.300' : 'gray.200', 
    isWarning ? 'orange.600' : 'gray.500'
  );
  const bg = useColorModeValue(
    isWarning ? 'orange.50' : 'white', 
    isWarning ? 'orange.900' : 'gray.700'
  );
  const iconColor = useColorModeValue(
    isWarning ? 'orange.600' : 'gray.800', 
    isWarning ? 'orange.300' : 'gray.200'
  );
  
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={borderColor}
      rounded="lg"
      bg={bg}
      position="relative"
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <Flex align="center" gap={2}>
            <StatLabel fontWeight="medium" isTruncated>
              {title}
            </StatLabel>
            {isWarning && stat !== '0' && (
              <Badge colorScheme="orange" size="sm">
                Dikkat!
              </Badge>
            )}
          </Flex>
          <StatNumber fontSize="2xl" fontWeight="medium" color={isWarning ? 'orange.600' : undefined}>
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText color={isWarning ? 'orange.600' : undefined}>
              {increase && <StatArrow type="increase" />}
              {decrease && <StatArrow type="decrease" />}
              {percentage || helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={iconColor}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  onClick: () => void;
}

const QuickActionCard = (props: QuickActionCardProps) => {
  const { title, description, icon, action, onClick } = props;
  const bg = useColorModeValue('white', 'gray.700');
  
  return (
    <Card maxW="sm" bg={bg}>
      <CardBody>
        <Flex mb="3">
          <Icon as={icon} w={8} h={8} color="blue.500" />
        </Flex>
        <Stack mt="6" spacing="3">
          <Heading size="md">{title}</Heading>
          <Text>{description}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue" onClick={onClick}>
            {action}
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};

const Dashboard = () => {
  // Backend'den istatistikleri çek
  const api = useAuthApi();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/api/dashboard/stats') as Promise<any>,
  });
  const notifBg = useColorModeValue('white', 'gray.700');

  if (isLoading) {
    return (
      <Flex pt="10" justify="center" align="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex pt="10" justify="center" align="center">
        <Text color="red.500">Veriler yüklenirken bir hata oluştu.</Text>
      </Flex>
    );
  }

  // Müşteri uyarı sayılarını hesapla
  const overdueCount = getOverdueCustomersCount(dummyCustomers);
  const warningCount = getWarningCustomersCount(dummyCustomers);
  const totalWarningCount = overdueCount + warningCount;

  // Dummy data fallback kaldırıldı; backend verisi kullanılıyor
  const stats = [
    { title: 'Aktif İlanlar', stat: String(data?.activeProperties ?? 0), icon: Home },
    { title: 'Toplam Müşteri', stat: String(data?.totalCustomers ?? 0), icon: Users },
    { title: 'Aylık Gelir', stat: String(data?.monthlyRevenue ?? 0), icon: DollarSign },
    { title: 'Bekleyen Randevular', stat: String(data?.pendingAppointments ?? 0), icon: FileText },
    { 
      title: 'Takip Gereken Müşteri', 
      stat: String(totalWarningCount), 
      icon: AlertTriangle,
      helpText: `${overdueCount} kritik, ${warningCount} uyarı`,
      isWarning: totalWarningCount > 0
    },
  ];

  const quickActions = [
    {
      title: 'Yeni İlan Ekle',
      description: 'Portföyünüze yeni bir gayrimenkul ilanı ekleyin.',
      icon: Home,
      action: 'İlan Ekle',
      onClick: () => navigate('/portfolio'),
    },
    {
      title: 'Müşteri Kaydet',
      description: 'Yeni bir müşteri kaydı oluşturun veya mevcut müşteriyi güncelleyin.',
      icon: Users,
      action: 'Müşteri Ekle',
      onClick: () => navigate('/customers'),
    },
    {
      title: 'Randevu Planla',
      description: 'Müşterilerinizle yer gösterme veya görüşme randevusu planlayın.',
      icon: Calendar,
      action: 'Randevu Oluştur',
      onClick: () => navigate('/appointments'),
    },
    {
      title: 'Toplu Mesaj Gönder',
      description: 'Seçili müşteri grubuna toplu SMS veya e-posta gönderin.',
      icon: Send,
      action: 'Mesaj Gönder',
      onClick: () => navigate('/messaging'),
    },
    {
      title: 'Belge Oluştur',
      description: 'Kira sözleşmesi veya yer gösterme formu oluşturun.',
      icon: FileText,
      action: 'Belge Oluştur',
      onClick: () => navigate('/documents'),
    },
  ];

  // Müşteri takip uyarılarını bildirimler listesine ekle
  const customerWarnings = dummyCustomers
    .filter(customer => {
      const warningLevel = getContactWarningLevel(customer.lastContact);
      return warningLevel === 'error' || warningLevel === 'warning';
    })
    .slice(0, 3) // En fazla 3 uyarı göster
    .map((customer, idx) => {
      const daysSince = getDaysSinceLastContact(customer.lastContact);
      const warningLevel = getContactWarningLevel(customer.lastContact);
      return {
        id: `customer-${idx}`,
        message: `${customer.name} ile ${daysSince} gündür iletişim kurulmadı`,
        date: customer.lastContact,
        type: warningLevel === 'error' ? 'error' : 'warning',
        isCustomerWarning: true
      };
    });

  const systemNotifications = (data?.recentActivities ?? []).map((a: any, idx: number) => ({
    id: `system-${idx}`,
    message: a.description,
    date: a.time,
    type: a.type,
    isCustomerWarning: false
  }));

  const notifications = [...customerWarnings, ...systemNotifications];

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="7xl" py={8}>
        {/* Hero Section */}
      <Box 
        mb="12" 
        p={8} 
        bg={useColorModeValue(
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
        )}
        borderRadius="3xl"
         position="relative"
         overflow="hidden"
      >
        <Box 
          position="absolute" 
          top={0} 
          right={0} 
          w="200px" 
          h="200px" 
          bg={useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')}
          borderRadius="full"
          transform="translate(50px, -50px)"
        />
        <Box 
          position="absolute" 
          bottom={0} 
          left={0} 
          w="150px" 
          h="150px" 
          bg={useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')}
          borderRadius="full"
          transform="translate(-50px, 50px)"
        />
        
        <Flex justify="space-between" align="center" position="relative" zIndex={1}>
          <Box>
            <Heading 
              size="2xl" 
              color="white"
              mb={3}
              fontWeight="bold"
            >
              Hoş Geldiniz! 👋
            </Heading>
            <Text 
              color="whiteAlpha.900" 
              fontSize="lg"
              fontWeight="medium"
            >
              Bugün harika bir gün olacak! Hedeflerinize ulaşmak için hazır mısınız?
            </Text>
          </Box>
          <Box 
            textAlign="right" 
            bg={useColorModeValue('whiteAlpha.200', 'whiteAlpha.100')}
            p={4}
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <Text 
              fontSize="md" 
              color="white"
              fontWeight="semibold"
              mb={1}
            >
              Bugün
            </Text>
            <Text 
              fontSize="sm" 
              color="whiteAlpha.800"
              fontWeight="medium"
            >
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box px={{ base: '4', md: '8' }} py="8">
        {/* Performance Stats */}
        <Box mb="12">
          <Heading size="lg" mb="6" color={useColorModeValue('gray.800', 'white')}>
            📊 Performans İstatistikleri
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
              <Card 
                key={index}
                bg={useColorModeValue('white', 'gray.800')}
                shadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-4px)',
                  shadow: '2xl'
                }}
              >
                <CardBody p={6}>
                  <Flex justify="space-between" align="start" mb={4}>
                    <Box>
                      <Text 
                        fontSize="sm" 
                        fontWeight="medium" 
                        color={useColorModeValue('gray.600', 'gray.300')}
                        mb={2}
                      >
                        {stat.title}
                      </Text>
                      <Text 
                        fontSize="3xl" 
                        fontWeight="bold" 
                        color={useColorModeValue('gray.800', 'white')}
                        lineHeight="1"
                      >
                        {stat.stat}
                      </Text>
                    </Box>
                    <Box 
                      p={3} 
                      borderRadius="xl" 
                      bg={useColorModeValue('blue.50', 'blue.900')}
                    >
                      <Icon as={stat.icon} w={6} h={6} color="blue.500" />
                    </Box>
                  </Flex>
                  
                  {stat.helpText && (
                    <Flex align="center" mt={4}>
                      <Box 
                        w={2} 
                        h={2} 
                        borderRadius="full" 
                        bg="green.400" 
                        mr={2}
                      />
                      <Text 
                        fontSize="sm" 
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="medium"
                      >
                        {stat.helpText}
                      </Text>
                    </Flex>
                  )}
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>



        {/* Personal Goals */}
        <Box mb="12">
          <Flex mb="6" justify="space-between" align="center">
            <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
              🎯 Kişisel Hedeflerim
            </Heading>
            <Badge 
              colorScheme="blue" 
              px={4} 
              py={2} 
              borderRadius="full" 
              fontSize="sm"
              fontWeight="semibold"
            >
              {personalGoals.consultant}
            </Badge>
          </Flex>
          
          <Card 
            bg={useColorModeValue('white', 'gray.800')} 
            shadow="xl" 
            borderRadius="2xl"
            border="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <CardBody p={8}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                {personalGoals.monthlyGoals.map((goal, index) => {
                  const percentage = Math.round((goal.current / goal.target) * 100);
                  const isCompleted = percentage >= 100;
                  const isNearTarget = percentage >= 80;
                  
                  return (
                    <Box 
                      key={index} 
                      p={6} 
                      borderRadius="xl" 
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="1px"
                      borderColor={useColorModeValue('gray.100', 'gray.600')}
                      transition="all 0.3s ease"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'lg'
                      }}
                    >
                      <Flex align="center" mb={4}>
                        <Box 
                          p={2} 
                          borderRadius="lg" 
                          bg={`${goal.color}.100`}
                          mr={3}
                        >
                          <Icon 
                            as={goal.icon} 
                            w={5} 
                            h={5} 
                            color={`${goal.color}.600`}
                          />
                        </Box>
                        <Text fontWeight="bold" fontSize="md" color={useColorModeValue('gray.800', 'white')}>
                          {goal.title}
                        </Text>
                      </Flex>
                      
                      <Flex align="baseline" mb={4}>
                        <Text fontSize="3xl" fontWeight="bold" color={`${goal.color}.500`}>
                          {goal.current}
                        </Text>
                        <Text fontSize="md" color={useColorModeValue('gray.500', 'gray.400')} ml={2}>
                          / {goal.target} {goal.unit}
                        </Text>
                      </Flex>
                      
                      <Box mb={4}>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} fontWeight="medium">
                            İlerleme
                          </Text>
                          <Text 
                            fontSize="sm" 
                            fontWeight="bold" 
                            color={isCompleted ? 'green.500' : isNearTarget ? 'orange.500' : useColorModeValue('gray.600', 'gray.300')}
                          >
                            %{percentage}
                          </Text>
                        </Flex>
                        <Box bg={useColorModeValue('gray.200', 'gray.600')} borderRadius="full" h={3}>
                          <Box 
                            bg={isCompleted ? 'green.400' : isNearTarget ? 'orange.400' : `${goal.color}.400`}
                            h={3} 
                            borderRadius="full" 
                            width={`${Math.min(percentage, 100)}%`}
                            transition="width 0.5s ease"
                          />
                        </Box>
                      </Box>
                      
                      {isCompleted && (
                        <Badge colorScheme="green" size="md" borderRadius="full">
                          ✓ Hedef Tamamlandı!
                        </Badge>
                      )}
                      {!isCompleted && isNearTarget && (
                        <Badge colorScheme="orange" size="md" borderRadius="full">
                          🔥 Hedefe Yakın!
                        </Badge>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
              
              <Divider my={6} />
              
              <Flex justify="space-between" align="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="xl">
                <Text fontSize="md" color={useColorModeValue('blue.700', 'blue.200')} fontWeight="medium">
                  Bu ay toplam ilerleme durumunuz
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  %{Math.round(
                    personalGoals.monthlyGoals.reduce((acc, goal) => 
                      acc + (goal.current / goal.target), 0
                    ) / personalGoals.monthlyGoals.length * 100
                  )}
                </Text>
              </Flex>
            </CardBody>
          </Card>
        </Box>

      {/* Quick Actions */}
      <Box mb="12">
        <Heading size="lg" mb="6" color={useColorModeValue('gray.800', 'white')}>
          ⚡ Hızlı İşlemler
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              bg={useColorModeValue('white', 'gray.800')}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: '2xl',
                borderColor: 'blue.300'
              }}
              cursor="pointer"
              onClick={action.onClick}
            >
              <CardBody p={6}>
                <Flex direction="column" align="center" textAlign="center">
                  <Box 
                    p={4} 
                    borderRadius="2xl" 
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    mb={4}
                  >
                    <Icon 
                      as={action.icon} 
                      w={8} 
                      h={8} 
                      color="blue.500"
                    />
                  </Box>
                  <Heading size="md" mb={2} color={useColorModeValue('gray.800', 'white')}>
                    {action.title}
                  </Heading>
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.600', 'gray.300')}
                    mb={4}
                    lineHeight="1.5"
                  >
                    {action.description}
                  </Text>
                  <Badge 
                    colorScheme="blue" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="semibold"
                  >
                    {action.action}
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Notifications */}
      <Box mb="8">
        <Flex mb="6" justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
            🔔 Bildirimler
          </Heading>
          <Button 
            size="md" 
            rightIcon={<AlertCircle />} 
            variant="outline"
            colorScheme="blue"
            borderRadius="xl"
          >
            Tümünü Gör
          </Button>
        </Flex>
        <Stack spacing="6">
          {notifications.length === 0 ? (
            <Card 
              bg={useColorModeValue('white', 'gray.800')}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
            >
              <CardBody p={8} textAlign="center">
                <Icon as={AlertCircle} w={12} h={12} color="gray.400" mb={4} />
                <Text color="gray.500" fontSize="lg" fontWeight="medium">
                  Gösterilecek bildiriminiz yok.
                </Text>
              </CardBody>
            </Card>
          ) : (
            notifications.map((notification: any) => (
              <Card
                key={notification.id}
                bg={useColorModeValue('white', 'gray.800')}
                shadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: '2xl',
                  borderColor: notification.isCustomerWarning 
                    ? (notification.type === 'error' ? 'red.300' : 'orange.300')
                    : 'blue.300'
                }}
              >
                <CardBody p={6}>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Flex alignItems="center" flex={1}>
                      <Box 
                        p={3} 
                        borderRadius="xl" 
                        bg={
                          notification.isCustomerWarning
                            ? (notification.type === 'error' ? useColorModeValue('red.50', 'red.900') : useColorModeValue('orange.50', 'orange.900'))
                            : useColorModeValue('blue.50', 'blue.900')
                        }
                        mr={4}
                      >
                        <Icon
                          as={
                            notification.isCustomerWarning 
                              ? (notification.type === 'error' ? AlertTriangle : AlertCircle)
                              : (notification.type === 'warning' ? AlertCircle : FileText)
                          }
                          color={
                            notification.isCustomerWarning
                              ? (notification.type === 'error' ? 'red.500' : 'orange.500')
                              : (notification.type === 'warning' ? 'orange.500' : 'blue.500')
                          }
                          w={6}
                          h={6}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text 
                          fontSize="md" 
                          fontWeight="semibold" 
                          color={useColorModeValue('gray.800', 'white')}
                          mb={1}
                        >
                          {notification.message}
                        </Text>
                        <Flex align="center" gap={2}>
                          {notification.isCustomerWarning && (
                            <Badge 
                              colorScheme={notification.type === 'error' ? 'red' : 'orange'}
                              size="sm"
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              Müşteri Takip
                            </Badge>
                          )}
                          <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                            {notification.date}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Flex>
                </CardBody>
              </Card>
            ))
          )}
        </Stack>
      </Box>
    </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;