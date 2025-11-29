import { Box, Container, SimpleGrid, Heading, Text, Stack, Icon, Flex } from '@chakra-ui/react';
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,

    Smartphone,
} from 'lucide-react';

const features = [
    {
        title: 'Portföy Yönetimi',
        description:
            'İlanlarınızı tek bir yerden yönetin, detaylı özellikler ekleyin ve otomatik eşleştirme yapın.',
        icon: Building2,
        color: 'blue.500',
    },
    {
        title: 'Müşteri İlişkileri (CRM)',
        description:
            'Alıcı ve satıcı taleplerini takip edin, görüşme geçmişini kaydedin ve hatırlatmalar oluşturun.',
        icon: Users,
        color: 'purple.500',
    },

    {
        title: 'Sözleşme Yönetimi',
        description:
            'Hazır şablonlarla kira ve satış sözleşmeleri oluşturun, dijital olarak arşivleyin.',
        icon: FileText,
        color: 'orange.500',
    },
    {
        title: 'Gelişmiş Raporlama',
        description:
            'Ofis performansını, danışman başarılarını ve finansal durumunuzu grafiklerle analiz edin.',
        icon: LayoutDashboard,
        color: 'pink.500',
    },
    {
        title: 'Mobil Uyumlu',
        description:
            'Ofiste, sahada veya evde. Tüm verilerinize her cihazdan güvenle erişin.',
        icon: Smartphone,
        color: 'cyan.500',
    },
];

const Features = () => {
    return (
        <Box py={24} bg="gray.900" id="features">
            <Container maxW="container.xl">
                <Stack spacing={16}>
                    <Stack spacing={4} textAlign="center" maxW="3xl" mx="auto">
                        <Text color="blue.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            Özellikler
                        </Text>
                        <Heading size="2xl" fontWeight="bold" color="white">
                            İhtiyacınız Olan Tüm Araçlar
                        </Heading>
                        <Text color="gray.400" fontSize="xl">
                            Emlak ofisinizi büyütmek için gereken tüm profesyonel araçları tek bir platformda topladık.
                        </Text>
                    </Stack>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                        {features.map((feature, index) => (
                            <Box
                                key={index}
                                bg="gray.800"
                                p={8}
                                borderRadius="xl"
                                boxShadow="sm"
                                transition="all 0.3s"
                                _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl', bg: 'gray.700' }}
                                border="1px solid"
                                borderColor="gray.700"
                            >
                                <Flex
                                    w={12}
                                    h={12}
                                    align="center"
                                    justify="center"
                                    borderRadius="lg"
                                    bg="whiteAlpha.100"
                                    color={feature.color}
                                    mb={6}
                                >
                                    <Icon as={feature.icon} size={24} />
                                </Flex>
                                <Heading size="md" mb={4} color="white">
                                    {feature.title}
                                </Heading>
                                <Text color="gray.400" lineHeight="relaxed">
                                    {feature.description}
                                </Text>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        </Box>
    );
};

export default Features;
