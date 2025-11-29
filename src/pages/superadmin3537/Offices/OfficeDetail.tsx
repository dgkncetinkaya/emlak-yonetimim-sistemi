import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    useColorModeValue,
    Spinner,
    useToast,
    Grid,
    GridItem,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Switch,
    Divider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from '@chakra-ui/react';
import { ArrowLeft, Building2, CreditCard, Settings } from 'lucide-react';
import {
    getOfficeById,
    updateOfficeStatus,
    extendSubscription,
    updateUserLimit,
    updateModuleStatus,
    OfficeDetail as OfficeDetailType,
} from '../../../services/officeService';

const OfficeDetail = () => {
    const { officeId } = useParams<{ officeId: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const [office, setOffice] = useState<OfficeDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadOffice();
    }, [officeId]);

    const loadOffice = async () => {
        if (!officeId) return;

        try {
            setLoading(true);
            const data = await getOfficeById(officeId);
            if (data) {
                setOffice(data);
            } else {
                toast({
                    title: 'Hata',
                    description: 'Ofis bulunamadı',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/superadmin3537/offices');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ofis bilgileri yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status: OfficeDetailType['status']) => {
        if (!officeId) return;

        try {
            setUpdating(true);
            const updated = await updateOfficeStatus(officeId, status);
            setOffice(updated);
            toast({
                title: 'Başarılı',
                description: 'Hesap durumu güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Durum güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleExtendSubscription = async () => {
        if (!officeId) return;

        try {
            setUpdating(true);
            const updated = await extendSubscription(officeId);
            setOffice(updated);
            toast({
                title: 'Başarılı',
                description: 'Abonelik 1 ay uzatıldı',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Abonelik uzatılırken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleUserLimitChange = async (value: number) => {
        if (!officeId || !office) return;

        try {
            const updated = await updateUserLimit(officeId, value);
            setOffice(updated);
            toast({
                title: 'Başarılı',
                description: 'Kullanıcı limiti güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Limit güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleModuleToggle = async (
        moduleName: keyof OfficeDetailType['activeModules'],
        enabled: boolean
    ) => {
        if (!officeId) return;

        try {
            const updated = await updateModuleStatus(officeId, moduleName, enabled);
            setOffice(updated);
            toast({
                title: 'Başarılı',
                description: 'Modül durumu güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Modül güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const getStatusColor = (status: OfficeDetailType['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'TRIAL':
                return 'blue';
            case 'SUSPENDED':
                return 'orange';
            case 'CANCELLED':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: OfficeDetailType['status']) => {
        switch (status) {
            case 'ACTIVE':
                return 'Aktif';
            case 'TRIAL':
                return 'Deneme';
            case 'SUSPENDED':
                return 'Askıda';
            case 'CANCELLED':
                return 'İptal';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!office) {
        return null;
    }

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack>
                    <Button
                        leftIcon={<ArrowLeft size={18} />}
                        variant="ghost"
                        onClick={() => navigate('/superadmin3537/offices')}
                    >
                        Geri
                    </Button>
                </HStack>

                <Box>
                    <Heading size="lg" mb={2}>
                        {office.name}
                    </Heading>
                    <Text color="gray.600">Ofis detayları ve yönetim</Text>
                </Box>

                {/* Privacy Notice */}
                <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                        <AlertTitle>Gizlilik Bildirimi</AlertTitle>
                        <AlertDescription>
                            Bu panelde sadece ticari bilgiler gösterilmektedir. Müşteri bilgileri, portföy
                            detayları ve kullanım verileri gizlilik politikası gereği gösterilmemektedir.
                        </AlertDescription>
                    </Box>
                </Alert>

                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                    {/* A) Ofis Bilgileri Kartı */}
                    <GridItem>
                        <Box
                            bg={bg}
                            p={6}
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor={borderColor}
                            h="full"
                        >
                            <HStack mb={4}>
                                <Building2 size={20} />
                                <Heading size="md">Ofis Bilgileri</Heading>
                            </HStack>

                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Ofis Adı
                                    </Text>
                                    <Text fontWeight="medium">{office.name}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Sorumlu Kişi
                                    </Text>
                                    <Text fontWeight="medium">{office.ownerName}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        E-posta
                                    </Text>
                                    <Text fontWeight="medium">{office.ownerEmail}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Hesap Durumu
                                    </Text>
                                    <Badge colorScheme={getStatusColor(office.status)} fontSize="md" px={3} py={1}>
                                        {getStatusText(office.status)}
                                    </Badge>
                                </Box>

                                <Divider />

                                <VStack align="stretch" spacing={2}>
                                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                                        Hesap İşlemleri
                                    </Text>
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        isDisabled={office.status === 'ACTIVE' || updating}
                                        onClick={() => handleStatusChange('ACTIVE')}
                                    >
                                        Hesabı Aktif Et
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="orange"
                                        isDisabled={office.status === 'SUSPENDED' || updating}
                                        onClick={() => handleStatusChange('SUSPENDED')}
                                    >
                                        Hesabı Askıya Al
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        isDisabled={office.status === 'CANCELLED' || updating}
                                        onClick={() => handleStatusChange('CANCELLED')}
                                    >
                                        Hesabı İptal Et
                                    </Button>
                                </VStack>
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* B) Abonelik & Plan Kartı */}
                    <GridItem>
                        <Box
                            bg={bg}
                            p={6}
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor={borderColor}
                            h="full"
                        >
                            <HStack mb={4}>
                                <CreditCard size={20} />
                                <Heading size="md">Abonelik & Plan</Heading>
                            </HStack>

                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Mevcut Plan
                                    </Text>
                                    <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                                        {office.planName}
                                    </Badge>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Faturalama Tipi
                                    </Text>
                                    <Text fontWeight="medium">
                                        {office.billingType === 'MONTHLY' ? 'Aylık' : 'Yıllık'}
                                    </Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Abonelik Başlangıç
                                    </Text>
                                    <Text fontWeight="medium">{formatDate(office.subscriptionStartDate)}</Text>
                                </Box>

                                <Box>
                                    <Text fontSize="sm" color="gray.600" mb={1}>
                                        Abonelik Bitiş
                                    </Text>
                                    <Text fontWeight="medium">{formatDate(office.subscriptionEndDate)}</Text>
                                </Box>

                                {office.trialEndDate && (
                                    <Box>
                                        <Text fontSize="sm" color="gray.600" mb={1}>
                                            Trial Bitiş Tarihi
                                        </Text>
                                        <Text fontWeight="medium" color="blue.500">
                                            {formatDate(office.trialEndDate)}
                                        </Text>
                                    </Box>
                                )}

                                <Divider />

                                <VStack align="stretch" spacing={2}>
                                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                                        Abonelik İşlemleri
                                    </Text>
                                    <Button size="sm" colorScheme="purple" variant="outline">
                                        Planı Değiştir
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        isDisabled={updating}
                                        onClick={handleExtendSubscription}
                                    >
                                        Aboneliği 1 Ay Uzat
                                    </Button>
                                    <Button size="sm" colorScheme="red" variant="outline">
                                        Aboneliği İptal Et
                                    </Button>
                                </VStack>
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* C) Limitler & Modüller Kartı */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                            <HStack mb={4}>
                                <Settings size={20} />
                                <Heading size="md">Limitler & Modüller</Heading>
                            </HStack>

                            <Alert status="warning" mb={6} borderRadius="md">
                                <AlertIcon />
                                <AlertDescription fontSize="sm">
                                    Bu kartta sadece limitler ve modül durumları gösterilir. Kullanım verileri
                                    (kaç kullanıcı var, kaç portföy var vb.) gizlilik politikası gereği
                                    gösterilmemektedir.
                                </AlertDescription>
                            </Alert>

                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                                <GridItem>
                                    <FormControl>
                                        <FormLabel>Maksimum Kullanıcı Limiti</FormLabel>
                                        <NumberInput
                                            value={office.maxUsers}
                                            min={1}
                                            max={100}
                                            onChange={(_, value) => handleUserLimitChange(value)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                </GridItem>

                                <GridItem>
                                    <FormLabel mb={3}>Aktif Modüller</FormLabel>
                                    <VStack align="stretch" spacing={3}>
                                        <HStack justify="space-between">
                                            <Text>CRM Modülü</Text>
                                            <Switch
                                                isChecked={office.activeModules.crm}
                                                onChange={(e) => handleModuleToggle('crm', e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>Randevu Modülü</Text>
                                            <Switch
                                                isChecked={office.activeModules.appointments}
                                                onChange={(e) => handleModuleToggle('appointments', e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>Doküman Modülü</Text>
                                            <Switch
                                                isChecked={office.activeModules.documents}
                                                onChange={(e) => handleModuleToggle('documents', e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text>AI Modülü</Text>
                                            <Switch
                                                isChecked={office.activeModules.ai}
                                                onChange={(e) => handleModuleToggle('ai', e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </HStack>
                                    </VStack>
                                </GridItem>
                            </Grid>
                        </Box>
                    </GridItem>
                </Grid>
            </VStack>
        </Box>
    );
};

export default OfficeDetail;
