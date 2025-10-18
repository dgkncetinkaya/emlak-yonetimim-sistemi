import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Flex,
  Icon,
  Badge,
  Progress,
  Stack,
  Button,
  useColorModeValue,
  Select,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  Calendar,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  BarChart,
  Clock,
  CheckCircle,
  ArrowRight,
  Bell,
  TrendingUp,
  TrendingDown,
  Filter
} from 'react-feather';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
const Dashboard: React.FC = () => {
  // Filter states
  const [timeFilter, setTimeFilter] = useState('month');
  const [chartType, setChartType] = useState('sales');

  // Chart colors
  const chartColors = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5'];

  // Sales performance data
  const salesData = [
    { month: 'Oca', sales: 2400000, commission: 120000, properties: 18 },
    { month: 'Şub', sales: 1800000, commission: 90000, properties: 14 },
    { month: 'Mar', sales: 3200000, commission: 160000, properties: 24 },
    { month: 'Nis', sales: 2800000, commission: 140000, properties: 21 },
    { month: 'May', sales: 3600000, commission: 180000, properties: 28 },
    { month: 'Haz', sales: 4200000, commission: 210000, properties: 32 }
  ];

  // Commission analysis data
  const commissionData = [
    { name: 'Satış Komisyonu', value: 65, amount: 195000 },
    { name: 'Kiralama Komisyonu', value: 25, amount: 75000 },
    { name: 'Danışmanlık', value: 10, amount: 30000 }
  ];

  // Property type distribution
  const propertyTypeData = [
    { name: 'Daire', value: 45, count: 108 },
    { name: 'Villa', value: 20, count: 48 },
    { name: 'İşyeri', value: 15, count: 36 },
    { name: 'Arsa', value: 12, count: 29 },
    { name: 'Diğer', value: 8, count: 19 }
  ];

  // Performance metrics
  const performanceMetrics = {
    totalRevenue: 4200000,
    monthlyGrowth: 16.7,
    totalCommission: 210000,
    commissionGrowth: 12.3,
    activeListings: 240,
    listingGrowth: -2.1,
    customerSatisfaction: 4.8,
    satisfactionGrowth: 8.9
  };

  // Mock customer warnings data
  const customerWarnings = [
    {
      id: 'cw1',
      type: 'warning',
      message: 'Ahmet Yılmaz ile 5 gündür iletişim kurulmadı',
      date: '5 gün önce',
      isCustomerWarning: true
    },
    {
      id: 'cw2', 
      type: 'error',
      message: 'Fatma Demir ile 10 gündür iletişim kurulmadı',
      date: '10 gün önce',
      isCustomerWarning: true
    }
  ];

  // Performance stats data
  const performanceStats = [
    {
      icon: Home,
      value: '24',
      label: 'Aktif İlanlar',
      description: 'Bu ay eklenen yeni ilanlar'
    },
    {
      icon: Users,
      value: '156',
      label: 'Toplam Müşteri',
      description: 'Kayıtlı müşteri sayısı'
    },
    {
      icon: DollarSign,
      value: '₺2.4M',
      label: 'Aylık Satış',
      description: 'Bu ayki toplam satış tutarı'
    },
    {
       icon: BarChart,
       value: '%85',
       label: 'Başarı Oranı',
       description: 'Müşteri memnuniyet oranı'
     }
  ];

  // Quick actions data
  const quickActions = [
    {
      icon: Calendar,
      title: 'Randevu Planla',
      description: 'Yeni müşteri randevusu oluştur',
      action: 'Planla',
      onClick: () => console.log('Randevu planla')
    },
    {
      icon: Users,
      title: 'Toplu Mesaj Gönder',
      description: 'Müşterilere toplu bilgilendirme',
      action: 'Gönder',
      onClick: () => console.log('Toplu mesaj gönder')
    },
    {
      icon: FileText,
      title: 'Yeni İlan',
      description: 'Emlak ilanı ekle',
      action: 'Ekle',
      onClick: () => console.log('Yeni ilan')
    },
    {
       icon: BarChart,
       title: 'Rapor Oluştur',
       description: 'Performans raporu hazırla',
       action: 'Oluştur',
       onClick: () => console.log('Rapor oluştur')
     }
  ];

  // Personal goals data
  const personalGoals = {
    monthlyGoals: [
      {
        title: 'Aylık Satış Hedefi',
        current: 18,
        target: 25,
        unit: 'adet',
        color: 'blue'
      },
      {
        title: 'Yeni Müşteri Kazanımı',
        current: 12,
        target: 15,
        unit: 'kişi',
        color: 'green'
      },
      {
        title: 'Randevu Tamamlama',
        current: 28,
        target: 30,
        unit: 'adet',
        color: 'purple'
      }
    ]
  };

  // System notifications
  const systemNotifications = [
    {
      id: 1,
      type: 'info',
      message: 'Sistem bakımı 15 Ocak tarihinde yapılacaktır.',
      date: '2 saat önce',
      isCustomerWarning: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Yeni güncelleme mevcut, lütfen sistemi güncelleyin.',
      date: '1 gün önce',
      isCustomerWarning: false
    }
  ];

  const notifications = [...customerWarnings, ...systemNotifications];

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} w="100%">
      <Box w="100%">
        {/* Header with Filters */}
        <Box mb={{ base: 6, md: 8 }}>
          <Flex 
            justify="space-between" 
            align={{ base: "flex-start", md: "center" }} 
            mb={6}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 0 }}
          >
            <Heading 
              size={{ base: "lg", md: "xl" }} 
              color={useColorModeValue('gray.800', 'white')}
            >
              📊 Dashboard & Raporlama
            </Heading>
            <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                size={{ base: "xs", md: "sm" }}
                w={{ base: "120px", md: "150px" }}
                bg={useColorModeValue('white', 'gray.800')}
              >
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
                <option value="quarter">Bu Çeyrek</option>
                <option value="year">Bu Yıl</option>
              </Select>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                size={{ base: "xs", md: "sm" }}
                w={{ base: "120px", md: "150px" }}
                bg={useColorModeValue('white', 'gray.800')}
              >
                <option value="sales">Satış Analizi</option>
                <option value="commission">Komisyon Analizi</option>
                <option value="properties">Emlak Dağılımı</option>
              </Select>
            </HStack>
          </Flex>
        </Box>

        {/* Performance Metrics */}
        <Box mb={{ base: 6, md: 8 }}>
          <Heading 
            size={{ base: "md", md: "lg" }} 
            mb={{ base: 4, md: 6 }} 
            color={useColorModeValue('gray.800', 'white')}
          >
            📈 Performans Metrikleri
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Toplam Gelir</StatLabel>
                  <StatNumber color={useColorModeValue('gray.800', 'white')}>
                    ₺{(performanceMetrics.totalRevenue / 1000000).toFixed(1)}M
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={performanceMetrics.monthlyGrowth > 0 ? 'increase' : 'decrease'} />
                    %{Math.abs(performanceMetrics.monthlyGrowth)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Toplam Komisyon</StatLabel>
                  <StatNumber color={useColorModeValue('gray.800', 'white')}>
                    ₺{(performanceMetrics.totalCommission / 1000).toFixed(0)}K
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={performanceMetrics.commissionGrowth > 0 ? 'increase' : 'decrease'} />
                    %{Math.abs(performanceMetrics.commissionGrowth)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Aktif İlanlar</StatLabel>
                  <StatNumber color={useColorModeValue('gray.800', 'white')}>
                    {performanceMetrics.activeListings}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={performanceMetrics.listingGrowth > 0 ? 'increase' : 'decrease'} />
                    %{Math.abs(performanceMetrics.listingGrowth)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Stat>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.300')}>Müşteri Memnuniyeti</StatLabel>
                  <StatNumber color={useColorModeValue('gray.800', 'white')}>
                    {performanceMetrics.customerSatisfaction}/5
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type={performanceMetrics.satisfactionGrowth > 0 ? 'increase' : 'decrease'} />
                    %{Math.abs(performanceMetrics.satisfactionGrowth)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Charts Section */}
        <Box mb={8}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Sales Performance Chart */}
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Heading size="md" mb={4} color={useColorModeValue('gray.800', 'white')}>
                  📊 Satış Performansı
                </Heading>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#4A5568')} />
                      <XAxis dataKey="month" stroke={useColorModeValue('#4A5568', '#A0AEC0')} />
                      <YAxis stroke={useColorModeValue('#4A5568', '#A0AEC0')} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: useColorModeValue('#FFFFFF', '#2D3748'),
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3182CE" 
                        fill="#3182CE" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            {/* Commission Analysis Chart */}
            <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
              <CardBody p={6}>
                <Heading size="md" mb={4} color={useColorModeValue('gray.800', 'white')}>
                  💰 Komisyon Analizi
                </Heading>
                <Box h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: %${value}`}
                      >
                        {commissionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: useColorModeValue('#FFFFFF', '#2D3748'),
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Property Distribution Chart */}
        <Box mb={8}>
          <Card bg={useColorModeValue('white', 'gray.800')} shadow="xl" borderRadius="2xl">
            <CardBody p={6}>
              <Heading size="md" mb={4} color={useColorModeValue('gray.800', 'white')}>
                🏠 Emlak Türü Dağılımı
              </Heading>
              <Box h="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={propertyTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#E2E8F0', '#4A5568')} />
                    <XAxis dataKey="name" stroke={useColorModeValue('#4A5568', '#A0AEC0')} />
                    <YAxis stroke={useColorModeValue('#4A5568', '#A0AEC0')} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: useColorModeValue('#FFFFFF', '#2D3748'),
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#38A169" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </Box>

        <Box py={{ base: 4, md: 8 }}>
          {/* Quick Actions */}
          <Box mb={{ base: 8, md: 12 }}>
            <Heading 
              size={{ base: "md", md: "lg" }} 
              mb={{ base: 4, md: 6 }} 
              color={useColorModeValue('gray.800', 'white')}
            >
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
          <Box mb="12">
            <Flex mb="6" justifyContent="space-between" alignItems="center">
              <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
                🔔 Son Bildirimler
              </Heading>
              <Button 
                as={Link}
                to="/notifications"
                size="sm" 
                variant="ghost"
                colorScheme="blue"
                rightIcon={<ArrowRight />}
              >
                Tümünü Gör
              </Button>
            </Flex>
            
            {notifications.length === 0 ? (
              <Box 
                bg={useColorModeValue('gray.50', 'gray.800')}
                borderRadius="xl"
                p={8}
                textAlign="center"
                border="2px dashed"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
              >
                <Icon as={Bell} w={8} h={8} color="gray.400" mb={3} />
                <Text color="gray.500" fontSize="md">
                  Henüz bildiriminiz bulunmuyor
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {notifications.slice(0, 4).map((notification: any) => (
                  <Box
                    key={notification.id}
                    bg={useColorModeValue('white', 'gray.800')}
                    p={4}
                    borderRadius="lg"
                    border="1px"
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: notification.isCustomerWarning 
                        ? (notification.type === 'error' ? 'red.400' : 'orange.400')
                        : 'blue.400',
                      shadow: 'md'
                    }}
                    position="relative"
                  >
                    <Flex align="start" gap={3}>
                      <Box
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={
                          notification.isCustomerWarning
                            ? (notification.type === 'error' ? 'red.500' : 'orange.500')
                            : 'blue.500'
                        }
                        mt={2}
                        flexShrink={0}
                      />
                      <Box flex={1}>
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium" 
                          color={useColorModeValue('gray.800', 'white')}
                          mb={1}
                          noOfLines={2}
                        >
                          {notification.message}
                        </Text>
                        <Flex align="center" justify="space-between">
                          <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                            {notification.date}
                          </Text>
                          {notification.isCustomerWarning && (
                            <Badge 
                              colorScheme={notification.type === 'error' ? 'red' : 'orange'}
                              size="sm"
                              fontSize="xs"
                            >
                              Müşteri
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* Performance Stats */}
          <Box mb="12">
            <Heading size="lg" mb="6" color={useColorModeValue('gray.800', 'white')}>
              📊 Performans İstatistikleri
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {performanceStats.map((stat, index) => (
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
                >
                  <CardBody p={6}>
                    <Flex align="center" mb={4}>
                      <Box 
                        p={3} 
                        borderRadius="xl" 
                        bg={useColorModeValue('blue.50', 'blue.900')}
                        mr={4}
                      >
                        <Icon 
                          as={stat.icon} 
                          w={6} 
                          h={6} 
                          color="blue.500"
                        />
                      </Box>
                      <Box>
                        <Text 
                          fontSize="2xl" 
                          fontWeight="bold" 
                          color={useColorModeValue('gray.800', 'white')}
                        >
                          {stat.value}
                        </Text>
                        <Text 
                          fontSize="sm" 
                          color={useColorModeValue('gray.600', 'gray.300')}
                          fontWeight="medium"
                        >
                          {stat.label}
                        </Text>
                      </Box>
                    </Flex>
                    <Text 
                      fontSize="xs" 
                      color={useColorModeValue('gray.500', 'gray.400')}
                    >
                      {stat.description}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Personal Goals */}
          <Box mb="12">
            <Heading size="lg" mb="6" color={useColorModeValue('gray.800', 'white')}>
              🎯 Kişisel Hedefler
            </Heading>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {personalGoals.monthlyGoals.map((goal, index) => (
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
                    borderColor: `${goal.color}.300`
                  }}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Box>
                        <Text 
                          fontSize="md" 
                          fontWeight="semibold" 
                          color={useColorModeValue('gray.800', 'white')}
                          mb={1}
                        >
                          {goal.title}
                        </Text>
                        <Text 
                          fontSize="sm" 
                          color={useColorModeValue('gray.600', 'gray.300')}
                        >
                          {goal.current}/{goal.target} {goal.unit}
                        </Text>
                      </Box>
                      <Badge 
                        colorScheme={goal.color} 
                        px={3} 
                        py={1} 
                        borderRadius="full"
                        fontSize="xs"
                      >
                        %{Math.round((goal.current / goal.target) * 100)}
                      </Badge>
                    </Flex>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      colorScheme={goal.color} 
                      size="lg" 
                      borderRadius="full"
                      bg={useColorModeValue('gray.100', 'gray.700')}
                    />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
            <Card 
              mt={6}
              bg={useColorModeValue('white', 'gray.800')}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor={useColorModeValue('gray.100', 'gray.700')}
            >
              <CardBody p={6}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;