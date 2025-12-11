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
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Textarea,
    VStack,
    useToast,
} from '@chakra-ui/react';
import {
    createManualPayment,
    CreatePaymentInput,
    Currency,
    PaymentMethod,
    PaymentStatus,
} from '../../services/paymentService';

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreatePaymentInput>({
        officeId: '',
        amount: 0,
        currency: 'TRY',
        paymentMethod: 'BANK_TRANSFER',
        status: 'PAID',
        description: '',
    });

    const handleSubmit = async () => {
        // Validation
        if (!formData.officeId) {
            toast({
                title: 'Hata',
                description: 'Lütfen bir ofis seçin',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (formData.amount <= 0) {
            toast({
                title: 'Hata',
                description: 'Tutar 0\'dan büyük olmalıdır',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            setLoading(true);
            await createManualPayment(formData);
            toast({
                title: 'Başarılı',
                description: 'Manuel ödeme başarıyla eklendi',
                status: 'success',
                duration: 2000,
            });

            // Reset form
            setFormData({
                officeId: '',
                amount: 0,
                currency: 'TRY',
                paymentMethod: 'BANK_TRANSFER',
                status: 'PAID',
                description: '',
            });

            onSuccess();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ödeme eklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Manuel Ödeme Ekle</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Ofis Seç</FormLabel>
                            <Select
                                placeholder="Ofis seçin..."
                                value={formData.officeId}
                                onChange={(e) => setFormData({ ...formData, officeId: e.target.value })}
                            >
                                <option value="1">Emlak Dünyası</option>
                                <option value="2">Gayrimenkul Pro</option>
                                <option value="3">Premium Emlak</option>
                                <option value="4">Konut Merkezi</option>
                                <option value="5">Ev Buldum</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Tutar</FormLabel>
                            <NumberInput
                                min={0}
                                value={formData.amount}
                                onChange={(_, value) => setFormData({ ...formData, amount: value })}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Para Birimi</FormLabel>
                            <Select
                                value={formData.currency}
                                onChange={(e) =>
                                    setFormData({ ...formData, currency: e.target.value as Currency })
                                }
                            >
                                <option value="TRY">TRY (₺)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Ödeme Tipi</FormLabel>
                            <Select
                                value={formData.paymentMethod}
                                onChange={(e) =>
                                    setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                                }
                            >
                                <option value="BANK_TRANSFER">Havale</option>
                                <option value="CASH">Elden / Nakit</option>
                                <option value="MANUAL">Manuel Giriş</option>
                                <option value="CREDIT_CARD">Kredi Kartı</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Durum</FormLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as PaymentStatus })
                                }
                            >
                                <option value="PAID">Ödendi</option>
                                <option value="PENDING">Beklemede</option>
                                <option value="FAILED">Başarısız</option>
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Açıklama (İsteğe Bağlı)</FormLabel>
                            <Textarea
                                placeholder="Ödeme ile ilgili notlar..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        İptal
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Ödemeyi Kaydet
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ManualPaymentModal;
