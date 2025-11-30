import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    SimpleGrid,
    Flex,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { UserPlus, Building, Rocket } from 'lucide-react';

const steps = [
    {
        title: 'Hesabınızı Oluşturun',
        description:
            'Sadece e-posta adresinizle saniyeler içinde ücretsiz hesabınızı oluşturun.',
        icon: UserPlus,
    },
    {
        title: 'Ofisinizi Yapılandırın',
        description:
            'Ofis bilgilerinizi girin, ekibinizi davet edin ve marka ayarlarınızı yaparak sistemi kişiselleştirin.',
        icon: Building,
    },
    {
        title: 'Kazanmaya Başlayın',
        description:
            'Portföylerinizi yükleyin, müşterilerinizi yönetin ve işinizi büyütmeye hemen başlayın.',
        icon: Rocket,
    },
];

const HowItWorks = () => {
    return (
        <Box py={24} bg="gray.800" id="how-it-works">
            <Container maxW="container.xl">
                <Stack spacing={16}>
                    <Stack spacing={4} textAlign="center" maxW="3xl" mx="auto">
                        <Text color="blue.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            Nasıl Çalışır?
                        </Text>
                        <Heading size="2xl" fontWeight="bold" color="white">
                            3 Adımda Dijital Dönüşüm
                        </Heading>
                        <Text color="gray.400" fontSize="xl">
                            Karmaşık kurulum süreçleri yok. Emlak Yönetim Sistemi ile işinizi dijitale taşımak çok kolay.
                        </Text>
                    </Stack>

                    <Box position="relative">
                        {/* Connecting Line (Desktop only) */}
                        <Box
                            display={{ base: 'none', lg: 'block' }}
                            position="absolute"
                            top="40px"
                            left="10%"
                            right="10%"
                            height="2px"
                            bg="gray.700"
                            zIndex={0}
                        />

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                            {steps.map((step, index) => (
                                <Stack key={index} spacing={6} alignItems="center" textAlign="center" zIndex={1} position="relative">
                                    <Flex
                                        w={20}
                                        h={20}
                                        align="center"
                                        justify="center"
                                        borderRadius="full"
                                        bg="gray.900"
                                        border="4px solid"
                                        borderColor="blue.500"
                                        color="blue.400"
                                        boxShadow="lg"
                                    >
                                        <Icon as={step.icon} size={32} />
                                    </Flex>
                                    <Stack spacing={2}>
                                        <Heading size="md" color="white">{step.title}</Heading>
                                        <Text color="gray.400">{step.description}</Text>
                                    </Stack>
                                </Stack>
                            ))}
                        </SimpleGrid>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default HowItWorks;
