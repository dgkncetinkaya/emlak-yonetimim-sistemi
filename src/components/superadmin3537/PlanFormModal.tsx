import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
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
    VStack,
    HStack,
    Text,
    useToast,
    Divider,
} from '@chakra-ui/react';
import { createPlan, CreatePlanInput } from '../../services/planService';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreatePlanInput>({
        name: '',
        description: '',
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxUsers: 1,
        isActive: true,
        modules: {
            crm: true,
            appointments: false,
            documents: false,
            ai: false,
        },
    });

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            toast({
                title: 'Hata',
                description: 'Plan adı gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (formData.monthlyPrice <= 0) {
            toast({
                title: 'Hata',
                description: 'Aylık fiyat 0\'dan büyük olmalıdır',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            setLoading(true);
            await createPlan(formData);
            toast({
                title: 'Başarılı',
                description: 'Plan başarıyla oluşturuldu',
                status: 'success',
                duration: 2000,
            });

            // Reset form
            setFormData({
                name: '',
                description: '',
                monthlyPrice: 0,
                yearlyPrice: 0,
                maxUsers: 1,
                isActive: true,
                modules: {
                    crm: true,
                    appointments: false,
                    documents: false,
                    ai: false,
                },
            });

            onSuccess();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Plan oluşturulurken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Yeni Plan Oluştur</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Plan Adı</FormLabel>
                            <Input
                                placeholder="örn: Premium"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Açıklama</FormLabel>
                            <Textarea
                                placeholder="Plan açıklaması..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </FormControl>

                        <HStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Aylık Fiyat (₺)</FormLabel>
                                <NumberInput
                                    min={0}
                                    value={formData.monthlyPrice}
                                    onChange={(_, value) => setFormData({ ...formData, monthlyPrice: value })}
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
                                    value={formData.yearlyPrice}
                                    onChange={(_, value) => setFormData({ ...formData, yearlyPrice: value })}
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
                                value={formData.maxUsers}
                                onChange={(_, value) => setFormData({ ...formData, maxUsers: value })}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl>
                            <HStack justify="space-between">
                                <FormLabel mb={0}>Plan Aktif Mi?</FormLabel>
                                <Switch
                                    isChecked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    colorScheme="green"
                                />
                            </HStack>
                        </FormControl>

                        <Divider />

                        <FormLabel mb={2}>Planın İçerdiği Modüller</FormLabel>

                        <VStack align="stretch" spacing={3} pl={2}>
                            <HStack justify="space-between">
                                <Text>CRM Modülü</Text>
                                <Switch
                                    isChecked={formData.modules.crm}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            modules: { ...formData.modules, crm: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>Randevu Modülü</Text>
                                <Switch
                                    isChecked={formData.modules.appointments}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            modules: { ...formData.modules, appointments: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>Doküman Yükleme Modülü</Text>
                                <Switch
                                    isChecked={formData.modules.documents}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            modules: { ...formData.modules, documents: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>

                            <HStack justify="space-between">
                                <Text>AI / Otomasyon Modülü</Text>
                                <Switch
                                    isChecked={formData.modules.ai}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            modules: { ...formData.modules, ai: e.target.checked },
                                        })
                                    }
                                    colorScheme="green"
                                />
                            </HStack>
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        İptal
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Kaydet
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PlanFormModal;
