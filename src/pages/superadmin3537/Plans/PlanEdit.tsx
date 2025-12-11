import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Textarea,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Switch,
    useColorModeValue,
    Spinner,
    useToast,
    Divider,
    Badge,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import {
    getPlanById,
    updatePlan,
    togglePlanStatus,
    deletePlan,
    isPlanInUse,
    Plan,
    UpdatePlanInput,
} from '../../../services/planService';
import { useRef } from 'react';

const PlanEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [planInUse, setPlanInUse] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadPlan();
    }, [id]);

    const loadPlan = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await getPlanById(id);
            if (data) {
                setPlan(data);
                // Check if plan is in use
                const inUse = await isPlanInUse(id);
                setPlanInUse(inUse);
            } else {
                toast({
                    title: 'Hata',
                    description: 'Plan bulunamadı',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/superadmin3537/plans');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Plan yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!plan || !id) return;

        // Validation
        if (!plan.name.trim()) {
            toast({
                title: 'Hata',
                description: 'Plan adı gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (plan.monthlyPrice <= 0) {
            toast({
                title: 'Hata',
                description: 'Aylık fiyat 0\'dan büyük olmalıdır',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            setSaving(true);
            const updateData: UpdatePlanInput = {
                id,
                name: plan.name,
                description: plan.description,
                monthlyPrice: plan.monthlyPrice,
                yearlyPrice: plan.yearlyPrice,
                maxUsers: plan.maxUsers,
                isActive: plan.isActive,
                modules: plan.modules,
            };
            const updated = await updatePlan(updateData);
            setPlan(updated);
            toast({
                title: 'Başarılı',
                description: 'Plan güncellendi',
                status: 'success',
                duration: 2000,
            });
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Plan güncellenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!plan || !id) return;

        try {
            const updated = await togglePlanStatus(id, !plan.isActive);
            setPlan(updated);
            toast({
                title: 'Başarılı',
                description: `Plan ${updated.isActive ? 'aktif' : 'pasif'} yapıldı`,
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
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        if (planInUse) {
            toast({
                title: 'Uyarı',
                description: 'Bu plan aktif olarak kullanılıyor ve silinemez',
                status: 'warning',
                duration: 4000,
            });
            onClose();
            return;
        }

        try {
            setDeleting(true);
            await deletePlan(id);
            toast({
                title: 'Başarılı',
                description: 'Plan silindi',
                status: 'success',
                duration: 2000,
            });
            navigate('/superadmin3537/plans');
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Plan silinirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setDeleting(false);
            onClose();
        }
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!plan) {
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
                            onClick={() => navigate('/superadmin3537/plans')}
                        >
                            Geri
                        </Button>
                        <Heading size="lg">{plan.name}</Heading>
                        <Badge colorScheme={plan.isActive ? 'green' : 'gray'} fontSize="md">
                            {plan.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                    </HStack>
                    <HStack>
                        <Button
                            leftIcon={<Save size={18} />}
                            colorScheme="blue"
                            onClick={handleSave}
                            isLoading={saving}
                        >
                            Kaydet
                        </Button>
                        <Button
                            leftIcon={<Trash2 size={18} />}
                            colorScheme="red"
                            variant="outline"
                            onClick={onOpen}
                        >
                            Sil
                        </Button>
                    </HStack>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece paket yapılandırması içindir. Müşteri verisi,
                        portföy verisi ve kullanım istatistikleri gösterilmez.
                    </Text>
                </Box>

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Plan Adı</FormLabel>
                            <Input
                                value={plan.name}
                                onChange={(e) => setPlan({ ...plan, name: e.target.value })}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Açıklama</FormLabel>
                            <Textarea
                                value={plan.description}
                                onChange={(e) => setPlan({ ...plan, description: e.target.value })}
                                rows={3}
                            />
                        </FormControl>

                        <HStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Aylık Fiyat (₺)</FormLabel>
                                <NumberInput
                                    min={0}
                                    value={plan.monthlyPrice}
                                    onChange={(_, value) => setPlan({ ...plan, monthlyPrice: value })}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Yıllık Fiyat (₺)</FormLabel>
                                <NumberInput
                                    min={0}
                                    value={plan.yearlyPrice}
                                    onChange={(_, value) => setPlan({ ...plan, yearlyPrice: value })}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </HStack>

                        <FormControl isRequired>
                            <FormLabel>Maksimum Kullanıcı Limiti</FormLabel>
                            <NumberInput
                                min={1}
                                max={100}
                                value={plan.maxUsers}
                                onChange={(_, value) => setPlan({ ...plan, maxUsers: value })}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <Divider />

                        <FormLabel mb={2}>Planın İçerdiği Modüller</FormLabel>

                        <VStack align="stretch" spacing={3} pl={2}>
                            <HStack justify="space-between">
                                <Text>CRM Modülü</Text>
                                <Switch
                                    isChecked={plan.modules.crm}
                                    onChange={(e) =>
                                        setPlan({
                                            ...plan,
                                            modules: { ...plan.modules, crm: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>Randevu Modülü</Text>
                                <Switch
                                    isChecked={plan.modules.appointments}
                                    onChange={(e) =>
                                        setPlan({
                                            ...plan,
                                            modules: { ...plan.modules, appointments: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>Doküman Yükleme Modülü</Text>
                                <Switch
                                    isChecked={plan.modules.documents}
                                    onChange={(e) =>
                                        setPlan({
                                            ...plan,
                                            modules: { ...plan.modules, documents: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>AI / Otomasyon Modülü</Text>
                                <Switch
                                    isChecked={plan.modules.ai}
                                    onChange={(e) =>
                                        setPlan({
                                            ...plan,
                                            modules: { ...plan.modules, ai: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>
                        </VStack>

                        <Divider />

                        <FormControl>
                            <HStack justify="space-between">
                                <Box>
                                    <FormLabel mb={1}>Plan Durumu</FormLabel>
                                    <Text fontSize="sm" color="gray.600">
                                        Pasif planlar yeni aboneliklerde görünmez
                                    </Text>
                                </Box>
                                <Button
                                    colorScheme={plan.isActive ? 'orange' : 'green'}
                                    onClick={handleToggleStatus}
                                >
                                    {plan.isActive ? 'Pasife Al' : 'Aktif Et'}
                                </Button>
                            </HStack>
                        </FormControl>
                    </VStack>
                </Box>

                {/* Metadata */}
                <Box bg={bg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={8} fontSize="sm" color="gray.600">
                        <Text>
                            <strong>Oluşturulma:</strong> {new Date(plan.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                        <Text>
                            <strong>Son Güncelleme:</strong>{' '}
                            {new Date(plan.updatedAt).toLocaleDateString('tr-TR')}
                        </Text>
                    </HStack>
                </Box>
            </VStack>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Planı Sil
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {planInUse ? (
                                <Text>
                                    Bu plan şu anda aktif olarak kullanılıyor ve silinemez. Önce bu planı kullanan
                                    tüm ofislerin planlarını değiştirmeniz gerekiyor.
                                </Text>
                            ) : (
                                <Text>
                                    <strong>{plan.name}</strong> planını silmek istediğinizden emin misiniz? Bu işlem
                                    geri alınamaz.
                                </Text>
                            )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                İptal
                            </Button>
                            {!planInUse && (
                                <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={deleting}>
                                    Sil
                                </Button>
                            )}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default PlanEdit;
