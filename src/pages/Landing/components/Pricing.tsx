import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    Button,
    SimpleGrid,
    Icon,
    List,
    ListItem,
    ListIcon,
    useColorModeValue,
    Badge,
} from '@chakra-ui/react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        name: 'Starter',
        price: '299',
        description: 'Bireysel danışmanlar ve küçük ofisler için.',
        features: [
            'Tek Kullanıcı',
            'Sınırsız Portföy',
            'Temel CRM',
            'Mobil Uygulama',
            'E-posta Desteği',
        ],
        color: 'blue',
        popular: false,
    },
    {
        name: 'Pro',
        price: '599',
        description: 'Büyüyen ofisler ve ekipler için ideal.',
        features: [
            '5 Kullanıcıya Kadar',
            'Gelişmiş CRM & Talep Eşleşmesi',
            'Sözleşme Yönetimi',
            'Finansal Raporlar',
            'Öncelikli Destek',
            'Kendi Logonuzu Ekleyin',
        ],
        color: 'purple',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '999',
        description: 'Büyük acenteler ve zincir ofisler için.',
        features: [
            'Sınırsız Kullanıcı',
            'Tüm Pro Özellikleri',
            'API Erişimi',
            'Özel Eğitim & Onboarding',
            '7/24 Canlı Destek',
            'Özel Domain Desteği',
        ],
        color: 'orange',
        popular: false,
    },
];

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <Box py={24} bg="gray.900" id="pricing">
            <Container maxW="container.xl">
                <Stack spacing={16}>
                    <Stack spacing={4} textAlign="center" maxW="3xl" mx="auto">
                        <Text color="blue.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            Fiyatlandırma
                        </Text>
                        <Heading size="2xl" fontWeight="bold" color="white">
                            Size Uygun Planı Seçin
                        </Heading>
                        <Text color="gray.400" fontSize="xl">
                            Gizli ücret yok. İstediğiniz zaman iptal edebilirsiniz.
                            Yıllık ödemelerde %20 indirim!
                        </Text>
                    </Stack>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} alignItems="center">
                        {plans.map((plan, index) => (
                            <Box
                                key={index}
                                bg="gray.800"
                                p={8}
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor={plan.popular ? 'purple.500' : 'gray.700'}
                                boxShadow={plan.popular ? 'xl' : 'sm'}
                                position="relative"
                                transform={plan.popular ? { lg: 'scale(1.05)' } : undefined}
                                zIndex={plan.popular ? 1 : 0}
                            >
                                {plan.popular && (
                                    <Badge
                                        position="absolute"
                                        top="-3"
                                        right="50%"
                                        transform="translateX(50%)"
                                        colorScheme="purple"
                                        variant="solid"
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                    >
                                        En Popüler
                                    </Badge>
                                )}

                                <Stack spacing={6}>
                                    <Box>
                                        <Heading size="lg" mb={2} color="white">
                                            {plan.name}
                                        </Heading>
                                        <Text color="gray.400" fontSize="sm">
                                            {plan.description}
                                        </Text>
                                    </Box>

                                    <Box>
                                        <Text fontSize="4xl" fontWeight="bold" color="white">
                                            ₺{plan.price}
                                            <Text as="span" fontSize="lg" color="gray.500" fontWeight="normal">
                                                /ay
                                            </Text>
                                        </Text>
                                    </Box>

                                    <Button
                                        size="lg"
                                        colorScheme="purple"
                                        variant="solid"
                                        w="full"
                                        _hover={{
                                            bg: 'purple.600',
                                        }}
                                        onClick={() => navigate('/register')}
                                    >
                                        Hemen Başla
                                    </Button>

                                    <List spacing={4}>
                                        {plan.features.map((feature, idx) => (
                                            <ListItem key={idx} display="flex" alignItems="center" color="gray.400">
                                                <ListIcon as={Check} color="green.500" mr={3} />
                                                {feature}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Stack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        </Box>
    );
};

export default Pricing;
