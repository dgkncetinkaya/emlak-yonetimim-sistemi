import { Box, Heading, Text, VStack, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { Settings, Mail, FileText, Palette, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingCard {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
    color: string;
}

const SettingsMain = () => {
    const navigate = useNavigate();
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const settingCards: SettingCard[] = [
        {
            title: 'Genel Ayarlar',
            description: 'Sistem adı, destek e-posta, para birimi ve bakım modu ayarları',
            icon: Settings,
            path: '/superadmin3537/settings/general',
            color: 'blue.500',
        },
        {
            title: 'Mail Ayarları',
            description: 'SMTP yapılandırması ve e-posta gönderim ayarları',
            icon: Mail,
            path: '/superadmin3537/settings/email',
            color: 'green.500',
        },
        {
            title: 'Fatura & Vergi Ayarları',
            description: 'Vergi oranı, fatura bilgileri ve ödeme sağlayıcı ayarları',
            icon: FileText,
            path: '/superadmin3537/settings/billing',
            color: 'purple.500',
        },
        {
            title: 'Marka / Tema Ayarları',
            description: 'Logo, renk paleti ve tema yapılandırması',
            icon: Palette,
            path: '/superadmin3537/settings/branding',
            color: 'pink.500',
        },
        {
            title: 'Güvenlik Ayarları',
            description: 'Parola politikaları, 2FA ve oturum güvenliği ayarları',
            icon: Shield,
            path: '/superadmin3537/settings/security',
            color: 'red.500',
        },
    ];

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <Box>
                    <Heading size="lg" mb={2}>
                        Sistem Ayarları
                    </Heading>
                    <Text color="gray.600">
                        Sistem genelindeki yapılandırma ayarlarını yönetin
                    </Text>
                </Box>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece sistem konfigürasyon ayarlarını içerir. Müşteri
                        sayısı, portföy bilgileri ve kullanım istatistikleri gösterilmez.
                    </Text>
                </Box>

                {/* Settings Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {settingCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Box
                                key={card.path}
                                bg={bg}
                                p={6}
                                borderRadius="lg"
                                borderWidth="1px"
                                borderColor={borderColor}
                                cursor="pointer"
                                transition="all 0.2s"
                                _hover={{
                                    bg: hoverBg,
                                    transform: 'translateY(-2px)',
                                    shadow: 'md',
                                }}
                                onClick={() => navigate(card.path)}
                            >
                                <VStack align="start" spacing={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg={`${card.color.split('.')[0]}.50`}
                                        color={card.color}
                                    >
                                        <Icon size={24} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" mb={2}>
                                            {card.title}
                                        </Heading>
                                        <Text fontSize="sm" color="gray.600">
                                            {card.description}
                                        </Text>
                                    </Box>
                                </VStack>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default SettingsMain;
