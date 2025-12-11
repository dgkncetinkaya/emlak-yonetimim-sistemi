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
    Select,
    VStack,
    useToast,
} from '@chakra-ui/react';
import {
    createTicket,
    CreateTicketInput,
    TicketPriority,
} from '../../services/ticketService';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateTicketInput>({
        officeId: '',
        subject: '',
        priority: 'MEDIUM',
        message: '',
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

        if (!formData.subject.trim()) {
            toast({
                title: 'Hata',
                description: 'Konu gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (!formData.message.trim()) {
            toast({
                title: 'Hata',
                description: 'Açıklama gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            setLoading(true);
            await createTicket(formData);
            toast({
                title: 'Başarılı',
                description: 'Ticket başarıyla oluşturuldu',
                status: 'success',
                duration: 2000,
            });

            // Reset form
            setFormData({
                officeId: '',
                subject: '',
                priority: 'MEDIUM',
                message: '',
            });

            onSuccess();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Ticket oluşturulurken bir hata oluştu',
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
                <ModalHeader>Yeni Ticket Oluştur</ModalHeader>
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
                            <FormLabel>Konu</FormLabel>
                            <Input
                                placeholder="Ticket konusu..."
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Öncelik</FormLabel>
                            <Select
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: e.target.value as TicketPriority })
                                }
                            >
                                <option value="LOW">Düşük</option>
                                <option value="MEDIUM">Orta</option>
                                <option value="HIGH">Yüksek</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Açıklama</FormLabel>
                            <Textarea
                                placeholder="Ticket açıklaması..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        İptal
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        Ticket Oluştur
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateTicketModal;
