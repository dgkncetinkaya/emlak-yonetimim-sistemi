import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Tooltip,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, Clock } from 'react-feather';
import { useBackendHealth } from '../hooks/useBackendHealth';

interface BackendHealthIndicatorProps {
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BackendHealthIndicator: React.FC<BackendHealthIndicatorProps> = ({
  showDetails = false,
  size = 'md'
}) => {
  const { healthStatus, isHealthy, isChecking, lastChecked } = useBackendHealth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return 'green';
      case 'unhealthy':
        return 'red';
      case 'checking':
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return CheckCircle;
      case 'unhealthy':
        return AlertCircle;
      case 'checking':
        return Clock;
      default:
        return AlertCircle;
    }
  };
  
  const getStatusText = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return 'Backend Aktif';
      case 'unhealthy':
        return 'Backend Bağlantı Hatası';
      case 'checking':
        return 'Backend Kontrol Ediliyor';
      default:
        return 'Bilinmeyen Durum';
    }
  };
  
  const formatUptime = (uptime?: number) => {
    if (!uptime) return 'N/A';
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}s ${minutes}d`;
  };
  
  const tooltipContent = (
    <Box>
      <Text fontWeight="bold">{getStatusText()}</Text>
      {healthStatus.timestamp && (
        <Text fontSize="sm">Son Kontrol: {new Date(healthStatus.timestamp).toLocaleTimeString('tr-TR')}</Text>
      )}
      {healthStatus.uptime && (
        <Text fontSize="sm">Çalışma Süresi: {formatUptime(healthStatus.uptime)}</Text>
      )}
      {healthStatus.version && (
        <Text fontSize="sm">Versiyon: {healthStatus.version}</Text>
      )}
    </Box>
  );
  
  if (!showDetails) {
    return (
      <Tooltip label={tooltipContent} placement="bottom">
        <Flex align="center" gap={2}>
          <Icon 
            as={getStatusIcon()} 
            color={`${getStatusColor()}.500`} 
            boxSize={size === 'sm' ? 4 : size === 'md' ? 5 : 6}
          />
          <Badge 
            colorScheme={getStatusColor()} 
            variant="subtle"
            size={size}
          >
            {isChecking ? 'Kontrol Ediliyor' : isHealthy ? 'Aktif' : 'Hata'}
          </Badge>
        </Flex>
      </Tooltip>
    );
  }
  
  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="sm"
    >
      <Flex align="center" justify="space-between" mb={2}>
        <Flex align="center" gap={2}>
          <Icon 
            as={getStatusIcon()} 
            color={`${getStatusColor()}.500`} 
            boxSize={5}
          />
          <Text fontWeight="semibold">{getStatusText()}</Text>
        </Flex>
        <Badge colorScheme={getStatusColor()} variant="subtle">
          {healthStatus.status.toUpperCase()}
        </Badge>
      </Flex>
      
      {healthStatus.timestamp && (
        <Text fontSize="sm" color="gray.600" mb={1}>
          Son Kontrol: {new Date(healthStatus.timestamp).toLocaleString('tr-TR')}
        </Text>
      )}
      
      {healthStatus.uptime && (
        <Text fontSize="sm" color="gray.600" mb={1}>
          Çalışma Süresi: {formatUptime(healthStatus.uptime)}
        </Text>
      )}
      
      {healthStatus.services && (
        <Flex gap={2} mt={2}>
          <Badge 
            colorScheme={healthStatus.services.database === 'connected' ? 'green' : 'red'}
            size="sm"
          >
            DB: {healthStatus.services.database}
          </Badge>
          <Badge 
            colorScheme={healthStatus.services.api === 'operational' ? 'green' : 'red'}
            size="sm"
          >
            API: {healthStatus.services.api}
          </Badge>
        </Flex>
      )}
    </Box>
  );
};

export default BackendHealthIndicator;