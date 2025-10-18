import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  HStack,
  VStack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FileText, Calendar, CheckCircle, Edit3 } from 'react-feather';
import { RentalContract, ContractStatus } from '../../types/rentalContract';

interface ContractStatsProps {
  contracts: RentalContract[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  helpText?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  helpText,
  trend
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color={color}>
            {value.toLocaleString('tr-TR')}
          </Text>
          {helpText && (
            <Text fontSize="xs" color="gray.500">
              {helpText}
            </Text>
          )}
          {trend && (
            <Stat>
              <StatHelpText>
                <StatArrow type={trend.isPositive ? 'increase' : 'decrease'} />
                {Math.abs(trend.value)}% geçen aya göre
              </StatHelpText>
            </Stat>
          )}
        </VStack>
        <Box
          p={3}
          borderRadius="full"
          bg={`${color.split('.')[0]}.50`}
        >
          <Icon as={icon} boxSize={6} color={color} />
        </Box>
      </HStack>
    </Box>
  );
};

const ContractStats: React.FC<ContractStatsProps> = ({ contracts }) => {
  // İstatistikleri hesapla
  const totalContracts = contracts.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthContracts = contracts.filter(contract => {
    const contractDate = new Date(contract.createdAt);
    return contractDate.getMonth() === currentMonth && contractDate.getFullYear() === currentYear;
  }).length;
  
  const completedContracts = contracts.filter(
    contract => contract.status === ContractStatus.COMPLETED
  ).length;
  
  const draftContracts = contracts.filter(
    contract => contract.status === ContractStatus.DRAFT
  ).length;
  
  const activeContracts = contracts.filter(
    contract => contract.status === ContractStatus.ACTIVE
  ).length;

  // Geçen ay karşılaştırması için
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthContracts = contracts.filter(contract => {
    const contractDate = new Date(contract.createdAt);
    return contractDate.getMonth() === lastMonth && contractDate.getFullYear() === lastMonthYear;
  }).length;
  
  const monthlyTrend = lastMonthContracts > 0 
    ? ((thisMonthContracts - lastMonthContracts) / lastMonthContracts) * 100
    : thisMonthContracts > 0 ? 100 : 0;

  // Toplam kira geliri hesaplama
  const totalRentAmount = contracts
    .filter(contract => contract.status === ContractStatus.ACTIVE)
    .reduce((total, contract) => {
      // TL'ye çevir (basit bir yaklaşım)
      let amount = contract.contractDetails.rentAmount;
      if (contract.contractDetails.currency === 'USD') {
        amount *= 30; // Yaklaşık USD/TL kuru
      } else if (contract.contractDetails.currency === 'EUR') {
        amount *= 32; // Yaklaşık EUR/TL kuru
      }
      return total + amount;
    }, 0);

  const stats = [
    {
      title: 'Toplam Sözleşme',
      value: totalContracts,
      icon: FileText,
      color: 'blue.500',
      helpText: 'Tüm sözleşmeler'
    },
    {
      title: 'Bu Ay Oluşturulan',
      value: thisMonthContracts,
      icon: Calendar,
      color: 'green.500',
      helpText: new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
      trend: {
        value: Math.round(Math.abs(monthlyTrend)),
        isPositive: monthlyTrend >= 0
      }
    },
    {
      title: 'Tamamlanan',
      value: completedContracts,
      icon: CheckCircle,
      color: 'purple.500',
      helpText: 'İmzalanmış sözleşmeler'
    },
    {
      title: 'Taslak Belgeler',
      value: draftContracts,
      icon: Edit3,
      color: 'orange.500',
      helpText: 'Düzenleme bekleyen'
    }
  ];

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} mb={8}>
        {stats.map((stat, index) => (
          <GridItem key={index}>
            <StatCard {...stat} />
          </GridItem>
        ))}
      </Grid>
      
      {/* Ek İstatistikler */}
      {totalContracts > 0 && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem>
            <Box
              bg={useColorModeValue('white', 'gray.800')}
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              borderRadius="lg"
              p={6}
              shadow="sm"
            >
              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="teal.600">
                  Aktif Sözleşmeler
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {activeContracts}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Toplam aylık kira geliri: {totalRentAmount.toLocaleString('tr-TR')} ₺
                </Text>
              </VStack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box
              bg={useColorModeValue('white', 'gray.800')}
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              borderRadius="lg"
              p={6}
              shadow="sm"
            >
              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="bold" color="indigo.600">
                  Ortalama Kira
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {activeContracts > 0 
                    ? Math.round(totalRentAmount / activeContracts).toLocaleString('tr-TR')
                    : '0'
                  } ₺
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Aktif sözleşmeler ortalaması
                </Text>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      )}
    </Box>
  );
};

export default ContractStats;