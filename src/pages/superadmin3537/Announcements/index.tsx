import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Select,
    useColorModeValue,
    Spinner,
    useToast,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    getAnnouncements,
    deleteAnnouncement,
    Announcement,
    AnnouncementFilters,
    AnnouncementStatus,
    TargetAudience,
} from '../../../services/announcementService';

const AnnouncementsList = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AnnouncementFilters>({
        status: 'ALL',
        targetAudience: 'ALL',
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        loadAnnouncements();
    }, [filters]);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await getAnnouncements(filters);
            setAnnouncements(data);
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Duyurular yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;

        try {
            await deleteAnnouncement(id);
            toast({
                title: 'Başarılı',
                description: 'Duyuru silindi',
                status: 'success',
                duration: 2000,
            });
            loadAnnouncements();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Silme işlemi başarısız oldu',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const getStatusColor = (status: AnnouncementStatus) => {
        switch (status) {
            case 'SENT':
                return 'green';
            case 'SCHEDULED':
                return 'orange';
            case 'DRAFT':
                return 'gray';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: AnnouncementStatus) => {
        switch (status) {
            case 'SENT':
                return 'Gönderildi';
            case 'SCHEDULED':
                return 'Zamanlandı';
            case 'DRAFT':
                return 'Taslak';
            default:
                return status;
        }
    };

    const getAudienceText = (audience: TargetAudience) => {
        switch (audience) {
            case 'ALL':
                return 'Tüm Ofisler';
            case 'ACTIVE':
                return 'Aktif Ofisler';
            case 'TRIAL':
                return 'Trial Ofisler';
            case 'SELECTED':
                return 'Seçili Ofisler';
            default:
                return audience;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('tr-TR');
    };

    return (
        <Box>
            <VStack align="stretch" spacing={6}>
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Heading size="lg" mb={2}>
                            Duyurular
                        </Heading>
                        <Text color="gray.600">
                            Ofislere gönderilecek sistem duyurularını yönetin
                        </Text>
                    </Box>
                    <Button
                        leftIcon={<Plus size={18} />}
                        colorScheme="blue"
                        onClick={() => navigate('/superadmin3537/announcements/new')}
                    >
                        Yeni Duyuru Oluştur
                    </Button>
                </HStack>

                {/* Privacy Notice */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <Text fontSize="sm" color="blue.900">
                        <strong>Not:</strong> Bu modül sadece sistemsel bilgilendirme içindir. Duyuru metinlerinde
                        kişisel veri veya portföy detayı paylaşmayınız.
                    </Text>
                </Box>

                {/* Filters */}
                <Box bg={bg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <HStack spacing={4}>
                        <Box flex={1}>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Durum
                            </Text>
                            <Select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, status: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="SENT">Gönderildi</option>
                                <option value="SCHEDULED">Zamanlandı</option>
                                <option value="DRAFT">Taslak</option>
                            </Select>
                        </Box>

                        <Box flex={1}>
                            <Text fontSize="sm" mb={2} fontWeight="medium">
                                Hedef Kitle
                            </Text>
                            <Select
                                value={filters.targetAudience}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, targetAudience: e.target.value as any }))
                                }
                            >
                                <option value="ALL">Tümü</option>
                                <option value="ALL">Tüm Ofisler</option>
                                <option value="ACTIVE">Aktif Ofisler</option>
                                <option value="TRIAL">Trial Ofisler</option>
                                <option value="SELECTED">Seçili Ofisler</option>
                            </Select>
                        </Box>
                    </HStack>
                </Box>

                {/* Table */}
                <Box bg={bg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
                    {loading ? (
                        <Box p={8} textAlign="center">
                            <Spinner size="xl" />
                        </Box>
                    ) : announcements.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="gray.500">Duyuru bulunamadı</Text>
                        </Box>
                    ) : (
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Başlık</Th>
                                    <Th>Hedef Kitle</Th>
                                    <Th>Durum</Th>
                                    <Th>Yayın Tarihi</Th>
                                    <Th>Oluşturan</Th>
                                    <Th width="50px"></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {announcements.map((announcement) => (
                                    <Tr key={announcement.id}>
                                        <Td fontWeight="medium">{announcement.title}</Td>
                                        <Td>
                                            <Badge colorScheme="purple" variant="subtle">
                                                {getAudienceText(announcement.targetAudience)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={getStatusColor(announcement.status)}>
                                                {getStatusText(announcement.status)}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {announcement.status === 'SENT'
                                                ? formatDate(announcement.sentDate)
                                                : announcement.status === 'SCHEDULED'
                                                    ? formatDate(announcement.scheduledDate)
                                                    : '-'}
                                        </Td>
                                        <Td>{announcement.createdByName}</Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<MoreVertical size={16} />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        icon={announcement.status === 'SENT' ? <Eye size={16} /> : <Edit size={16} />}
                                                        onClick={() => navigate(`/superadmin3537/announcements/${announcement.id}`)}
                                                    >
                                                        {announcement.status === 'SENT' ? 'Detay' : 'Düzenle'}
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<Trash2 size={16} />}
                                                        color="red.500"
                                                        onClick={() => handleDelete(announcement.id)}
                                                    >
                                                        Sil
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};

export default AnnouncementsList;
