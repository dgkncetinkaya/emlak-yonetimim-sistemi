import React, { useState, useMemo } from 'react';
import {
  Box,
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

const Dashboard: React.FC = () => {
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
      icon: Users,
      title: 'Yeni Müşteri',
      description: 'Müşteri bilgilerini kaydet',
      action: 'Ekle',
      onClick: () => console.log('Yeni müşteri')
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
        {/* Header */}
        <Box mb={{ base: 6, md: 8 }}>
          <Heading 
            size={{ base: "lg", md: "xl" }} 
            color={useColorModeValue('gray.800', 'white')}
            mb={6}
          >
            ⚡ Hızlı İşlemler
          </Heading>
        </Box>

        {/* Quick Actions - Now at the top */}
        <Box mb={{ base: 8, md: 12 }}>
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
                      textAlign="center"
                    >
                      {action.description}
                    </Text>
                    <Button 
                      size="sm" 
                      colorScheme="blue" 
                      variant="solid"
                      borderRadius="xl"
                      px={6}
                    >
                      {action.action}
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Personal Goals */}
        <Box mb={{ base: 8, md: 12 }}>
          <Heading 
            size={{ base: "md", md: "lg" }} 
            mb={{ base: 4, md: 6 }} 
            color={useColorModeValue('gray.800', 'white')}
          >
            🎯 Kişisel Hedefler
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
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

        {/* Notifications */}
        <Box mb={{ base: 8, md: 12 }}>
          <Heading 
            size={{ base: "md", md: "lg" }} 
            mb={{ base: 4, md: 6 }} 
            color={useColorModeValue('gray.800', 'white')}
          >
            🔔 Bildirimler
          </Heading>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id || index}
                bg={useColorModeValue('white', 'gray.800')}
                shadow="xl"
                borderRadius="2xl"
                border="1px"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: '2xl'
                }}
              >
                <CardBody p={6}>
                  <Flex align="start" gap={4}>
                    <Box 
                      p={2} 
                      borderRadius="lg" 
                      bg={
                        notification.type === 'error' 
                          ? useColorModeValue('red.50', 'red.900')
                          : notification.type === 'warning'
                          ? useColorModeValue('yellow.50', 'yellow.900')
                          : useColorModeValue('blue.50', 'blue.900')
                      }
                    >
                      <Icon 
                        as={
                          notification.type === 'error' 
                            ? AlertCircle
                            : notification.type === 'warning'
                            ? AlertTriangle
                            : Bell
                        } 
                        w={5} 
                        h={5} 
                        color={
                          notification.type === 'error' 
                            ? 'red.500'
                            : notification.type === 'warning'
                            ? 'yellow.500'
                            : 'blue.500'
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <Text 
                        fontSize="sm" 
                        color={useColorModeValue('gray.800', 'white')}
                        mb={2}
                        fontWeight="medium"
                      >
                        {notification.message}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={useColorModeValue('gray.500', 'gray.400')}
                      >
                        {notification.date}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;