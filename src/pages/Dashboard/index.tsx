import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Text, Icon, Heading, Card, CardBody, Stack, Divider, CardFooter, ButtonGroup, Button, useColorModeValue, Spinner } from '@chakra-ui/react';
import { Home, Users, FileText, DollarSign, AlertCircle, Plus } from 'react-feather';

import { useQuery } from '@tanstack/react-query';
import { useAuthApi } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  helpText?: string;
  increase?: boolean;
  decrease?: boolean;
  percentage?: string;
}

const StatCard = (props: StatCardProps) => {
  const { title, stat, icon, helpText, increase, decrease, percentage } = props;
  const borderColor = useColorModeValue('gray.200', 'gray.500');
  const bg = useColorModeValue('white', 'gray.700');
  const iconColor = useColorModeValue('gray.800', 'gray.200');
  
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={borderColor}
      rounded="lg"
      bg={bg}
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText>
              {increase && <StatArrow type="increase" />}
              {decrease && <StatArrow type="decrease" />}
              {percentage}
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

  // Dummy data fallback kaldırıldı; backend verisi kullanılıyor
  const stats = [
    { title: 'Aktif İlanlar', stat: String(data?.activeProperties ?? 0), icon: Home },
    { title: 'Toplam Müşteri', stat: String(data?.totalCustomers ?? 0), icon: Users },
    { title: 'Aylık Gelir', stat: String(data?.monthlyRevenue ?? 0), icon: DollarSign },
    { title: 'Bekleyen Randevular', stat: String(data?.pendingAppointments ?? 0), icon: FileText },
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
      title: 'Belge Oluştur',
      description: 'Kira sözleşmesi veya yer gösterme formu oluşturun.',
      icon: FileText,
      action: 'Belge Oluştur',
      onClick: () => navigate('/documents'),
    },
  ];

  const notifications = (data?.recentActivities ?? []).map((a: any, idx: number) => ({
    id: idx + 1,
    message: a.description,
    date: a.time,
    type: a.type,
  }));

  return (
    <Box pt="5" px={{ base: '4', md: '8' }}>
      <Heading mb="6" size="lg">Ana Sayfa</Heading>
      
      {/* Performance Stats */}
      <Box mb="8">
        <Flex mb="4" justifyContent="space-between" alignItems="center">
          <Heading size="md">Performans Özeti</Heading>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              stat={stat.stat}
              icon={stat.icon}
              helpText="Son 30 gün"
            />
          ))}
        </SimpleGrid>
      </Box>

      {/* Quick Actions */}
      <Box mb="8">
        <Flex mb="4" justifyContent="space-between" alignItems="center">
          <Heading size="md">Hızlı İşlemler</Heading>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              action={action.action}
              onClick={action.onClick}
            />
          ))}
        </SimpleGrid>
      </Box>

      {/* Notifications */}
      <Box mb="8">
        <Flex mb="4" justifyContent="space-between" alignItems="center">
          <Heading size="md">Bildirimler</Heading>
          <Button size="sm" rightIcon={<AlertCircle />} variant="outline">
            Tümünü Gör
          </Button>
        </Flex>
        <Stack spacing="4">
          {notifications.length === 0 ? (
            <Text color="gray.500">Gösterilecek bildiriminiz yok.</Text>
          ) : (
            notifications.map((notification: any) => (
              <Flex
                key={notification.id}
                bg={notifBg}
                p="4"
                boxShadow="md"
                borderRadius="md"
                justifyContent="space-between"
                alignItems="center"
              >
                <Flex alignItems="center">
                  <Icon
                    as={notification.type === 'warning' ? AlertCircle : FileText}
                    color={notification.type === 'warning' ? 'orange.500' : 'blue.500'}
                    w={5}
                    h={5}
                    mr="3"
                  />
                  <Text>{notification.message}</Text>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  {notification.date}
                </Text>
              </Flex>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;