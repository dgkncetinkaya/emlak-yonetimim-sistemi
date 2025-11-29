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
    useColorModeValue,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import {
    getBrandingSettings,
    updateBrandingSettings,
    resetToDefaultTheme,
    BrandingSettings as BrandingSettingsType,
} from '../../../services/superadminSettingsService';

const BrandingSettings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [settings, setSettings] = useState<BrandingSettingsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getBrandingSettings();
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
            await updateBrandingSettings(settings);
            toast({
                title: 'Başarılı',
                description: 'Marka ayarları kaydedildi',
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

    const handleReset = async () => {
        try {
            setResetting(true);
            const defaultSettings = await resetToDefaultTheme();
            setSettings(defaultSettings);
            toast({
                title: 'Başarılı',
                description: 'Varsayılan temaya dönüldü',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Tema sıfırlanırken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setResetting(false);
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
                        <Heading size="lg">Marka / Tema Ayarları</Heading>
                    </HStack>
                    <HStack>
                        <Button
                            leftIcon={<RotateCcw size={18} />}
                            colorScheme="orange"
                            variant="outline"
                            onClick={handleReset}
                            isLoading={resetting}
                        >
                            Varsayılan Temaya Dön
                        </Button>
                        <Button leftIcon={<Save size={18} />} colorScheme="blue" onClick={handleSave} isLoading={saving}>
                            Kaydet
                        </Button>
                    </HStack>
                </HStack>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl>
                            <FormLabel>Logo URL</FormLabel>
                            <Input
                                value={settings.logoUrl}
                                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                placeholder="/logo.png"
                            />
                            <Text fontSize="sm" color="gray.600" mt={2}>
                                Logo dosyasının URL'sini girin veya yükleyin
                            </Text>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Tema</FormLabel>
                            <Select
                                value={settings.theme}
                                onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                            >
                                <option value="light">Açık Tema</option>
                                <option value="dark">Koyu Tema</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Ana Renk (Primary Color)</FormLabel>
                            <HStack>
                                <Input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    w="100px"
                                    h="50px"
                                />
                                <Input
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                    placeholder="#3182CE"
                                    fontFamily="mono"
                                />
                            </HStack>
                            <Text fontSize="sm" color="gray.600" mt={2}>
                                Sistemin ana rengini seçin (HEX formatında)
                            </Text>
                        </FormControl>

                        {/* Preview */}
                        <Box
                            p={6}
                            borderRadius="lg"
                            borderWidth="2px"
                            borderColor={settings.primaryColor}
                            bg={settings.theme === 'dark' ? 'gray.800' : 'white'}
                        >
                            <Text fontWeight="bold" color={settings.primaryColor} mb={2}>
                                Önizleme
                            </Text>
                            <Text color={settings.theme === 'dark' ? 'white' : 'gray.800'}>
                                Bu, seçtiğiniz tema ve renk paletinin önizlemesidir.
                            </Text>
                            <Button colorScheme="blue" mt={4} size="sm" style={{ backgroundColor: settings.primaryColor }}>
                                Örnek Buton
                            </Button>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default BrandingSettings;
