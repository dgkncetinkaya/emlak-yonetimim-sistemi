import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    Switch,
    useColorModeValue,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import {
    getSecuritySettings,
    updateSecuritySettings,
    SuperAdminSecuritySettings,
} from '../../../services/superadminSettingsService';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [settings, setSettings] = useState<SuperAdminSecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSecuritySettings();
            setSettings(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ayarlar yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        try {
            setSaving(true);
            await updateSecuritySettings(settings);
            toast({
                title: 'Başarılı',
                description: 'Güvenlik ayarları kaydedildi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ayarlar kaydedilirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!settings) {
        return null;
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <HStack>
                        <Button
                            leftIcon={<ArrowLeft size={18} />}
                            variant="ghost"
                            onClick={() => navigate('/superadmin3537/settings')}
                        >
                            Geri
                        </Button>
                        <Heading size="lg">Güvenlik Ayarları</Heading>
                    </HStack>
                    <Button leftIcon={<Save size={18} />} colorScheme="blue" onClick={handleSave} isLoading={saving}>
                        Kaydet
                    </Button>
                </HStack>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Parola Minimum Uzunluk</FormLabel>
                            <NumberInput
                                value={settings.minPasswordLength}
                                onChange={(_, value) => setSettings({ ...settings, minPasswordLength: value })}
                                min={6}
                                max={32}
                            >
                                <NumberInputField placeholder="8" />
                            </NumberInput>
                            <Text fontSize="sm" color="gray.600" mt={2}>
                                Kullanıcıların oluşturacağı parolaların minimum karakter sayısı
                            </Text>
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <Box>
                                    <FormLabel mb={1}>İki Faktörlü Doğrulama (2FA)</FormLabel>
                                    <Text fontSize="sm" color="gray.600">
                                        Tüm kullanıcılar için 2FA zorunlu olsun
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={settings.twoFactorEnabled}
                                    onChange={(e) =>
                                        setSettings({ ...settings, twoFactorEnabled: e.target.checked })
                                    }
                                    colorScheme="green"
                                    size="lg"
                                />
                            </HStack>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Oturum Zaman Aşımı (Dakika)</FormLabel>
                            <NumberInput
                                value={settings.sessionTimeout}
                                onChange={(_, value) => setSettings({ ...settings, sessionTimeout: value })}
                                min={5}
                                max={1440}
                            >
                                <NumberInputField placeholder="60" />
                            </NumberInput>
                            <Text fontSize="sm" color="gray.600" mt={2}>
                                Kullanıcıların otomatik olarak çıkış yapılacağı süre
                            </Text>
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <Box>
                                    <FormLabel mb={1}>Şüpheli Giriş Uyarıları</FormLabel>
                                    <Text fontSize="sm" color="gray.600">
                                        Bilinmeyen cihazlardan giriş yapıldığında e-posta gönder
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={settings.suspiciousLoginAlerts}
                                    onChange={(e) =>
                                        setSettings({ ...settings, suspiciousLoginAlerts: e.target.checked })
                                    }
                                    colorScheme="orange"
                                    size="lg"
                                />
                            </HStack>
                        </FormControl>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default SecuritySettings;
