import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    VStack,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    NumberInput,
    NumberInputField,
    useColorModeValue,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { ArrowLeft, Save } from 'lucide-react';
import {
    getBillingSettings,
    updateBillingSettings,
    BillingSettings as BillingSettingsType,
} from '../../../services/superadminSettingsService';

const BillingSettings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [settings, setSettings] = useState<BillingSettingsType | null>(null);
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
            const data = await getBillingSettings();
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
            await updateBillingSettings(settings);
            toast({
                title: 'Başarılı',
                description: 'Fatura ayarları kaydedildi',
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
                        <Heading size="lg">Fatura & Vergi Ayarları</Heading>
                    </HStack>
                    <Button leftIcon={<Save size={18} />} colorScheme="blue" onClick={handleSave} isLoading={saving}>
                        Kaydet
                    </Button>
                </HStack>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Vergi Oranı (%)</FormLabel>
                            <NumberInput
                                value={settings.taxRate}
                                onChange={(_, value) => setSettings({ ...settings, taxRate: value })}
                                min={0}
                                max={100}
                            >
                                <NumberInputField placeholder="20" />
                            </NumberInput>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Fatura Dipnot Metni</FormLabel>
                            <Textarea
                                value={settings.invoiceFooter}
                                onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
                                placeholder="Faturanızı incelediğiniz için teşekkür ederiz."
                                rows={3}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Varsayılan Fatura Başlığı</FormLabel>
                            <Input
                                value={settings.defaultInvoiceTitle}
                                onChange={(e) =>
                                    setSettings({ ...settings, defaultInvoiceTitle: e.target.value })
                                }
                                placeholder="Abonelik Faturası"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Şirket Ünvanı</FormLabel>
                            <Input
                                value={settings.companyName}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                placeholder="Emlak Yazılım A.Ş."
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Vergi Numarası</FormLabel>
                            <Input
                                value={settings.taxNumber}
                                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                                placeholder="1234567890"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Ödeme Sağlayıcı API Anahtarı</FormLabel>
                            <Input
                                type="password"
                                value={settings.paymentProviderApiKey}
                                onChange={(e) =>
                                    setSettings({ ...settings, paymentProviderApiKey: e.target.value })
                                }
                                placeholder="pk_test_*********************"
                            />
                        </FormControl>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default BillingSettings;
