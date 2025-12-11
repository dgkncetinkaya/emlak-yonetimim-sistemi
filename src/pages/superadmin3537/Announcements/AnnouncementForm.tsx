import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Select,
    useColorModeValue,
    Spinner,
    useToast,
    Badge,
    Text,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import { ArrowLeft, Save, Send, Calendar } from 'lucide-react';
import {
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    Announcement,
    CreateAnnouncementInput,
    TargetAudience,
    AnnouncementStatus,
} from '../../../services/announcementService';

const AnnouncementForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<CreateAnnouncementInput>({
        title: '',
        content: '',
        targetAudience: 'ALL',
        status: 'DRAFT',
        scheduledDate: '',
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        if (isEditMode && id) {
            loadAnnouncement(id);
        }
    }, [id]);

    const loadAnnouncement = async (announcementId: string) => {
        try {
            setLoading(true);
            const data = await getAnnouncementById(announcementId);
            if (data) {
                setFormData({
                    title: data.title,
                    content: data.content,
                    targetAudience: data.targetAudience,
                    status: data.status,
                    scheduledDate: data.scheduledDate || '',
                    selectedOfficeIds: data.selectedOfficeIds,
                });
            } else {
                toast({
                    title: 'Hata',
                    description: 'Duyuru bulunamadı',
                    status: 'error',
                    duration: 3000,
                });
                navigate('/superadmin3537/announcements');
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Duyuru yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (status: AnnouncementStatus) => {
        // Validation
        if (!formData.title.trim()) {
            toast({
                title: 'Hata',
                description: 'Başlık gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (!formData.content.trim()) {
            toast({
                title: 'Hata',
                description: 'İçerik gereklidir',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        if (status === 'SCHEDULED' && !formData.scheduledDate) {
            toast({
                title: 'Hata',
                description: 'Zamanlama için tarih seçmelisiniz',
                status: 'error',
                duration: 3000,
            });
            return;
        }

        try {
            setSaving(true);
            const dataToSave = { ...formData, status };

            if (isEditMode && id) {
                await updateAnnouncement({ id, ...dataToSave });
                toast({
                    title: 'Başarılı',
                    description: 'Duyuru güncellendi',
                    status: 'success',
                    duration: 2000,
                });
            } else {
                await createAnnouncement(dataToSave);
                toast({
                    title: 'Başarılı',
                    description: 'Duyuru oluşturuldu',
                    status: 'success',
                    duration: 2000,
                });
            }
            navigate('/superadmin3537/announcements');
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'İşlem başarısız oldu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const isReadOnly = formData.status === 'SENT';

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" />
            </Box>
        );
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
                            onClick={() => navigate('/superadmin3537/announcements')}
                        >
                            Geri
                        </Button>
                        <Heading size="lg">
                            {isEditMode ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}
                        </Heading>
                        {isEditMode && (
                            <Badge
                                colorScheme={
                                    formData.status === 'SENT'
                                        ? 'green'
                                        : formData.status === 'SCHEDULED'
                                            ? 'orange'
                                            : 'gray'
                                }
                                fontSize="md"
                            >
                                {formData.status === 'SENT'
                                    ? 'GÖNDERİLDİ'
                                    : formData.status === 'SCHEDULED'
                                        ? 'ZAMANLANDI'
                                        : 'TASLAK'}
                            </Badge>
                        )}
                    </HStack>
                </HStack>

                {isReadOnly && (
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        Bu duyuru gönderildiği için düzenlenemez.
                    </Alert>
                )}

                {/* Form */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <VStack spacing={6} align="stretch">
                        <FormControl isRequired isDisabled={isReadOnly}>
                            <FormLabel>Başlık</FormLabel>
                            <Input
                                placeholder="Örn: Sistem Bakım Çalışması"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </FormControl>

                        <FormControl isRequired isDisabled={isReadOnly}>
                            <FormLabel>Hedef Kitle</FormLabel>
                            <Select
                                value={formData.targetAudience}
                                onChange={(e) =>
                                    setFormData({ ...formData, targetAudience: e.target.value as TargetAudience })
                                }
                            >
                                <option value="ALL">Tüm Ofisler</option>
                                <option value="ACTIVE">Sadece Aktif Ofisler</option>
                                <option value="TRIAL">Sadece Trial Ofisler</option>
                                <option value="SELECTED">Seçili Ofisler</option>
                            </Select>
                        </FormControl>

                        {formData.targetAudience === 'SELECTED' && (
                            <FormControl isDisabled={isReadOnly}>
                                <FormLabel>Ofis ID'leri</FormLabel>
                                <Text fontSize="sm" color="gray.500" mb={2}>
                                    Şimdilik manuel ID girişi (virgülle ayırarak)
                                </Text>
                                <Input
                                    placeholder="1, 2, 3..."
                                    value={formData.selectedOfficeIds?.join(', ') || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            selectedOfficeIds: e.target.value.split(',').map((s) => s.trim()),
                                        })
                                    }
                                />
                            </FormControl>
                        )}

                        <FormControl isRequired isDisabled={isReadOnly}>
                            <FormLabel>İçerik</FormLabel>
                            <Textarea
                                placeholder="Duyuru metnini buraya girin..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={8}
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                HTML etiketleri desteklenir.
                            </Text>
                        </FormControl>

                        <FormControl isDisabled={isReadOnly}>
                            <FormLabel>Zamanlama (Opsiyonel)</FormLabel>
                            <Input
                                type="datetime-local"
                                value={formData.scheduledDate ? formData.scheduledDate.slice(0, 16) : ''}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            />
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Boş bırakılırsa "Hemen Gönder" seçeneği aktiftir. Dolu ise "Zamanla" butonu çıkar.
                            </Text>
                        </FormControl>

                        {/* Actions */}
                        {!isReadOnly && (
                            <HStack justify="flex-end" spacing={4} pt={4}>
                                <Button variant="ghost" onClick={() => handleSave('DRAFT')} isLoading={saving}>
                                    Taslak Olarak Kaydet
                                </Button>

                                {formData.scheduledDate ? (
                                    <Button
                                        leftIcon={<Calendar size={18} />}
                                        colorScheme="orange"
                                        onClick={() => handleSave('SCHEDULED')}
                                        isLoading={saving}
                                    >
                                        Zamanla
                                    </Button>
                                ) : (
                                    <Button
                                        leftIcon={<Send size={18} />}
                                        colorScheme="blue"
                                        onClick={() => handleSave('SENT')}
                                        isLoading={saving}
                                    >
                                        Hemen Gönder
                                    </Button>
                                )}
                            </HStack>
                        )}
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default AnnouncementForm;
