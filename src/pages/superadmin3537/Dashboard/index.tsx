import React from 'react';
import {
    Box,
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Icon,
    HStack,
    VStack,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import {
    Building2,
    Clock,
    DollarSign
} from 'lucide-react';

const SuperAdminDashboard: React.FC = () => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Placeholder veriler - İleride backend'den gelecek
    const stats = [
        {
            label: 'Aktif Ofis Sayısı',
            value: '12',
            helpText: 'Aktif aboneliği olan ofisler',
            icon: Building2,
            color: 'blue'
        },
        {
            label: 'Trial Ofis Sayısı',
            value: '3',
            helpText: 'Deneme sürecindeki ofisler',
            icon: Clock,
            color: 'orange'
        },
        {
            label: 'Bu Ay Tahsil Edilen',
            value: '₺125,430',
            helpText: 'Toplam aylık gelir',
            icon: DollarSign,
            color: 'green'
        }
    ];

    return (
        <Box>
            <VStack align="stretch" spacing={8}>
                {/* Page Title */}
                <Box>
                    <Text fontSize="3xl" fontWeight="bold" mb={2}>
                        Dashboard
                    </Text>
                    <Text fontSize="md" color="gray.500">
                        Genel sistem durumu ve istatistikler
                    </Text>
                </Box>

                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            bg={cardBg}
                            borderWidth="1px"
                            borderColor={borderColor}
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
                                        <StatNumber fontSize="3xl" fontWeight="bold" color={`${stat.color}.500`} my={2}>
                                            {stat.value}
                                        </StatNumber>
                                        <StatHelpText fontSize="xs" mb={0}>
                                            {stat.helpText}
                                        </StatHelpText>
                                    </Stat>
                                    <Box p={3} bg={`${stat.color}.50`} borderRadius="lg">
                                        <Icon as={stat.icon} color={`${stat.color}.500`} boxSize={8} />
                                    </Box>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>

                {/* Privacy Notice */}
                <Card bg="red.50" borderColor="red.200" borderWidth="1px">
                    <CardBody>
                        <VStack align="start" spacing={2}>
                            <Text fontSize="sm" fontWeight="bold" color="red.700">
                                🔒 Gizlilik Politikası
                            </Text>
                            <Text fontSize="xs" color="red.600">
                                Bu panel sadece ofislerin ticari ve abonelik bilgilerini gösterir.
                                Müşteri verileri, portföy detayları, dokümanlar ve CRM kayıtları
                                gizlilik politikası gereği SuperAdmin panelinde görüntülenemez.
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default SuperAdminDashboard;
