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
    Input,
    Select,
    Switch,
    useColorModeValue,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import {
    getGeneralSettings,
    updateGeneralSettings,
    GeneralSettings as GeneralSettingsType,
} from '../../../services/superadminSettingsService';

const GeneralSettings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [settings, setSettings] = useState<GeneralSettingsType | null>(null);
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
            const data = await getGeneralSettings();
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
            await updateGeneralSettings(settings);
            toast({
                title: 'Başarılı',
                description: 'Genel ayarlar kaydedildi',
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
                        <Heading size="lg">Genel Ayarlar</Heading>
                    </HStack>
                    <Button leftIcon={<Save size={18} />} colorScheme="blue" onClick={handleSave} isLoading={saving}>
                        Kaydet
                    </Button>
                </HStack>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Sistem Adı</FormLabel>
                            <Input
                                value={settings.systemName}
                                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                placeholder="Emlak Yönetim Sistemi"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Destek E-posta Adresi</FormLabel>
                            <Input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                placeholder="destek@emlak.com"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Varsayılan Para Birimi</FormLabel>
                            <Select
                                value={settings.defaultCurrency}
                                onChange={(e) =>
                                    setSettings({ ...settings, defaultCurrency: e.target.value as any })
                                }
                            >
                                <option value="TRY">TRY (₺)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Zaman Dilimi</FormLabel>
                            <Select
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            >
                                <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                <option value="Europe/London">Europe/London (GMT+0)</option>
                                <option value="America/New_York">America/New_York (GMT-5)</option>
                                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <Box>
                                    <FormLabel mb={1}>Bakım Modu</FormLabel>
                                    <Text fontSize="sm" color="gray.600">
                                        Aktif olduğunda sistem kullanıcılara kapalı olur
                                    </Text>
                                </Box>
                                <Switch
                                    isChecked={settings.maintenanceMode}
                                    onChange={(e) =>
                                        setSettings({ ...settings, maintenanceMode: e.target.checked })
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

export default GeneralSettings;
