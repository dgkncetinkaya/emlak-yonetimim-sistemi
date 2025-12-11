import React from 'react';
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Text,
    VStack,
    HStack,
    Icon,
    useColorModeValue,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    SimpleGrid
} from '@chakra-ui/react';
import { Crown, TrendingUp, Users, DollarSign } from 'lucide-react';
import type { SubscriptionStats } from '../../services/superadminService';

interface SubscriptionStatsProps {
    stats: SubscriptionStats;
}

const SubscriptionStatsComponent: React.FC<SubscriptionStatsProps> = ({ stats }) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const statCards = [
        {
            label: 'Toplam Abonelik',
            value: stats.total_subscriptions,
            icon: Crown,
            color: 'purple',
            change: '+12%'
        },
        {
            label: 'Aktif Abonelik',
            value: stats.active_subscriptions,
            icon: TrendingUp,
            color: 'green',
            change: '+8%'
        },
        {
            label: 'Deneme Sürümü',
            value: stats.trial_subscriptions,
            icon: Users,
            color: 'blue',
            change: '+15%'
        },
        {
            label: 'MRR',
            value: `₺${stats.mrr.toLocaleString()}`,
            icon: DollarSign,
            color: 'orange',
            change: '+18%'
        }
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {statCards.map((stat, index) => (
                <Card
                    key={index}
                    bg={bg}
                    borderColor={borderColor}
                    borderWidth="1px"
                    shadow="sm"
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                >
                    <CardBody>
                        <HStack justify="space-between" align="flex-start">
                            <Stat>
                                <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
                                    {stat.label}
                                </StatLabel>
                                <StatNumber fontSize="2xl" fontWeight="bold" color={`${stat.color}.500`}>
                                    {stat.value}
                                </StatNumber>
                                <StatHelpText mb={0}>
                                    <StatArrow type="increase" />
                                    {stat.change}
                                </StatHelpText>
                            </Stat>
                            <Box p={3} bg={`${stat.color}.50`} borderRadius="lg">
                                <Icon as={stat.icon} color={`${stat.color}.500`} boxSize={6} />
                            </Box>
                        </HStack>
                    </CardBody>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default SubscriptionStatsComponent;
