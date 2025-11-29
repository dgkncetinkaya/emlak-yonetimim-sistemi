import React from 'react';
import {
    Box,
    Card,
    CardBody,
    Text,
    VStack,
    HStack,
    Badge,
    Icon,
    useColorModeValue,
    Progress
} from '@chakra-ui/react';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import type { Tenant } from '../../services/superadminService';

interface TenantCardProps {
    tenant: Tenant;
    onClick?: () => void;
}

const TenantCard: React.FC<TenantCardProps> = ({ tenant, onClick }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'gray';
            case 'suspended':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Aktif';
            case 'inactive':
                return 'Pasif';
            case 'suspended':
                return 'Askıda';
            default:
                return status;
        }
    };

    return (
        <Card
            bg={bg}
            borderColor={borderColor}
            borderWidth="1px"
            shadow="sm"
            _hover={{ shadow: 'md', bg: hoverBg, transform: 'translateY(-2px)' }}
            transition="all 0.2s"
            cursor="pointer"
            onClick={onClick}
        >
            <CardBody>
                <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <Box p={2} bg="blue.50" borderRadius="lg">
                                <Icon as={Building2} color="blue.500" boxSize={5} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="md">
                                    {tenant.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    {tenant.domain}
                                </Text>
                            </VStack>
                        </HStack>
                        <Badge colorScheme={getStatusColor(tenant.status)} variant="subtle">
                            {getStatusText(tenant.status)}
                        </Badge>
                    </HStack>

                    {/* Stats */}
                    <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Icon as={Users} boxSize={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                    Kullanıcılar
                                </Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium">
                                {tenant.user_count || 0}
                            </Text>
                        </HStack>

                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Icon as={Building2} boxSize={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                    Emlaklar
                                </Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="medium">
                                {tenant.property_count || 0}
                            </Text>
                        </HStack>

                        {tenant.mrr !== undefined && (
                            <HStack justify="space-between">
                                <HStack spacing={2}>
                                    <Icon as={TrendingUp} boxSize={4} color="gray.500" />
                                    <Text fontSize="sm" color="gray.600">
                                        MRR
                                    </Text>
                                </HStack>
                                <Text fontSize="sm" fontWeight="medium" color="green.500">
                                    ₺{tenant.mrr.toLocaleString()}
                                </Text>
                            </HStack>
                        )}
                    </VStack>

                    {/* Footer */}
                    <Text fontSize="xs" color="gray.500">
                        Oluşturulma: {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                </VStack>
            </CardBody>
        </Card>
    );
};

export default TenantCard;
