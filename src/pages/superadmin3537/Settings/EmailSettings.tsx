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
    NumberInput,
    NumberInputField,
    useColorModeValue,
    Spinner,
    useToast,
    InputGroup,
    InputRightElement,
    IconButton,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Send, Eye, EyeOff } from 'lucide-react';
import {
    getEmailSettings,
    updateEmailSettings,
    sendTestEmail,
    EmailSettings as EmailSettingsType,
} from '../../../services/superadminSettingsService';

const EmailSettings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [settings, setSettings] = useState<EmailSettingsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getEmailSettings();
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
            await updateEmailSettings(settings);
            toast({
                title: 'Başarılı',
                description: 'Mail ayarları kaydedildi',
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

    const handleSendTest = async () => {
        if (!settings) return;

        try {
            setSendingTest(true);
            await sendTestEmail(settings.fromEmail);
            toast({
                title: 'Başarılı',
                description: 'Test maili gönderildi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Test maili gönderilirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSendingTest(false);
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
                        <Heading size="lg">Mail Ayarları</Heading>
                    </HStack>
                    <HStack>
                        <Button
                            leftIcon={<Send size={18} />}
                            colorScheme="green"
                            variant="outline"
                            onClick={handleSendTest}
                            isLoading={sendingTest}
                        >
                            Test Mail Gönder
                        </Button>
                        <Button leftIcon={<Save size={18} />} colorScheme="blue" onClick={handleSave} isLoading={saving}>
                            Kaydet
                        </Button>
                    </HStack>
                </HStack>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>SMTP Host</FormLabel>
                            <Input
                                value={settings.smtpHost}
                                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                placeholder="smtp.gmail.com"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>SMTP Port</FormLabel>
                            <NumberInput
                                value={settings.smtpPort}
                                onChange={(_, value) => setSettings({ ...settings, smtpPort: value })}
                                min={1}
                                max={65535}
                            >
                                <NumberInputField placeholder="587" />
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>SMTP Kullanıcı Adı</FormLabel>
                            <Input
                                value={settings.smtpUsername}
                                onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                                placeholder="noreply@emlak.com"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>SMTP Şifre</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={settings.smtpPassword}
                                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                                    placeholder="********"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                        icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Gönderen Adı</FormLabel>
                            <Input
                                value={settings.fromName}
                                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                                placeholder="Emlak Yönetim Sistemi"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Gönderen E-posta Adresi</FormLabel>
                            <Input
                                type="email"
                                value={settings.fromEmail}
                                onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                                placeholder="noreply@emlak.com"
                            />
                        </FormControl>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default EmailSettings;
