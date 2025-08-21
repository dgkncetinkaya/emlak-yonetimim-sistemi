import React from 'react';
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
  useColorModeValue
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
  Bell
} from 'react-feather';
const Dashboard: React.FC = () => {
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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="7xl" py={8}>


        <Box px={{ base: '4', md: '8' }} py="8">
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
      </Container>
    </Box>
  );
};

export default Dashboard;