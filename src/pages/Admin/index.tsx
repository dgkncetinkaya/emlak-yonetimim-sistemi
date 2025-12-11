import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Badge,
  Button,
  VStack,
  HStack,
  Heading
} from '@chakra-ui/react';
import {
  FaUsers,
  FaHome,
  FaDollarSign,
  FaFile,
  FaCog,
  FaChartBar,
  FaLock,
  FaDatabase,
  FaEnvelope,
  FaCalendar,
  FaArrowUp,
  FaHeartbeat
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Dashboard istatistik kartları için veri
const dashboardStats = [
  {
    label: 'Toplam Kullanıcı',
    value: '1,247',
    change: '+12%',
    changeType: 'increase' as const,
    icon: FaUsers,
    color: 'blue'
  },
  {
    label: 'Aktif Emlaklar',
    value: '856',
    change: '+8%',
    changeType: 'increase' as const,
    icon: FaHome,
    color: 'green'
  },
  {
    label: 'Aylık Gelir',
    value: '₺125,430',
    change: '+15%',
    changeType: 'increase' as const,
    icon: FaDollarSign,
    color: 'purple'
  },
  {
    label: 'Sistem Durumu',
    value: '99.9%',
    change: 'Çevrimiçi',
    changeType: 'increase' as const,
    icon: FaHeartbeat,
    color: 'teal'
  }
];

// Admin menü öğeleri
const adminMenuItems = [
  {
    title: 'Kullanıcı Yönetimi',
    description: 'Kullanıcıları görüntüle, düzenle ve yönet',
    icon: FaUsers,
    path: '/admin/users',
    color: 'blue',
    stats: '1,247 kullanıcı'
  },
  {
    title: 'Emlak Yönetimi',
    description: 'Emlak ilanlarını ve özelliklerini yönet',
    icon: FaHome,
    path: '/admin/properties',
    color: 'green',
    stats: '856 emlak'
  },
  {
    title: 'Finansal Raporlar',
    description: 'Gelir, gider ve finansal analizler',
    icon: FaChartBar,
    path: '/admin/reports',
    color: 'purple',
    stats: '₺125,430 aylık'
  },
  {
    title: 'Sistem Ayarları',
    description: 'Genel sistem konfigürasyonları',
    icon: FaCog,
    path: '/admin/settings',
    color: 'gray',
    stats: '12 ayar'
  },
  {
    title: 'Güvenlik & Yetkilendirme',
    description: 'Kullanıcı rolleri ve güvenlik ayarları',
    icon: FaLock,
    path: '/admin/security',
    color: 'red',
    stats: '5 rol'
  },
  {
    title: 'Veritabanı Yönetimi',
    description: 'Veritabanı bakımı ve optimizasyon',
    icon: FaDatabase,
    path: '/admin/database',
    color: 'orange',
    stats: '2.1GB veri'
  },
  {
    title: 'İletişim & Bildirimler',
    description: 'E-posta şablonları ve bildirim ayarları',
    icon: FaEnvelope,
    path: '/admin/communications',
    color: 'cyan',
    stats: '45 şablon'
  },
  {
    title: 'Etkinlik Takvimi',
    description: 'Sistem etkinlikleri ve bakım planları',
    icon: FaCalendar,
    path: '/admin/calendar',
    color: 'pink',
    stats: '8 etkinlik'
  }
];

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, changeType, icon, color }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card bg={bg} borderColor={borderColor} borderWidth="1px" shadow="sm" _hover={{ shadow: 'md' }}>
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
                {label}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color={`${color}.500`}>
                {value}
              </StatNumber>
              <StatHelpText mb={0}>
                <StatArrow type={changeType} />
                {change}
              </StatHelpText>
            </Stat>
          </Box>
          <Box
            p={3}
            bg={`${color}.50`}
            borderRadius="lg"
            color={`${color}.500`}
          >
            <Icon as={icon} boxSize={6} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

interface AdminMenuCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  stats: string;
}

const AdminMenuCard: React.FC<AdminMenuCardProps> = ({ title, description, icon, path, color, stats }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Card 
      bg={bg} 
      borderColor={borderColor} 
      borderWidth="1px" 
      shadow="sm" 
      _hover={{ shadow: 'lg', bg: hoverBg, transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(path)}
      h="full"
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4} h="full">
          <HStack justify="space-between">
            <Box
              p={3}
              bg={`${color}.50`}
              borderRadius="lg"
              color={`${color}.500`}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
            <Badge colorScheme={color} variant="subtle">
              {stats}
            </Badge>
          </HStack>
          
          <Box flex="1">
            <Text fontSize="lg" fontWeight="bold" mb={2} color={`${color}.600`}>
              {title}
            </Text>
            <Text fontSize="sm" color="gray.600" lineHeight="1.5">
              {description}
            </Text>
          </Box>
          
          <Button
            size="sm"
            colorScheme={color}
            variant="ghost"
            rightIcon={<FaArrowUp />}
            justifyContent="flex-start"
            fontWeight="medium"
          >
            Yönet
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box bg={bg} minH="100vh" w="100%" p={0}>
      {/* Dashboard Header */}
      <VStack spacing={8} align="stretch" w="100%">
        <Box>
          <Heading fontSize="3xl" fontWeight="bold" color="gray.800" mb={2}>
            Admin Dashboard
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Sistem yönetimi ve operasyonel işlemler için merkezi kontrol paneli
          </Text>
        </Box>
        
        {/* İstatistik Kartları */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
          {dashboardStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </SimpleGrid>
        
        {/* Admin Menü Başlığı */}
        <Box pt={4}>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Yönetim Modülleri
          </Heading>
          <Text fontSize="md" color="gray.600">
            Sistem bileşenlerini yönetmek için aşağıdaki modülleri kullanın
          </Text>
        </Box>
        
        {/* Admin Menü Kartları */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6} w="100%">
          {adminMenuItems.map((item, index) => (
            <AdminMenuCard key={index} {...item} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;