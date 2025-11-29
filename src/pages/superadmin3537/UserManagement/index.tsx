import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useColorModeValue,
    useToast,
    Spinner,
    Alert,
    AlertIcon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    Card,
    CardBody,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Icon
} from '@chakra-ui/react';
import {
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    ShieldOff,
    Ban,
    Users,
    UserCheck,
    UserX
} from 'lucide-react';
import { superadminService } from '../../../services/superadminService';

interface User {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    status?: string;
    created_at: string;
    last_sign_in_at?: string;
    tenant_name?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const toast = useToast();

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'white');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const userStats = await superadminService.getUserStats();

            // Mock data - replace with actual API call
            const mockUsers: User[] = [
                {
                    id: '1',
                    email: 'admin@example.com',
                    full_name: 'Admin User',
                    role: 'admin',
                    status: 'active',
                    created_at: '2024-01-15',
                    last_sign_in_at: '2024-01-20',
                    tenant_name: 'Örnek Emlak'
                },
                {
                    id: '2',
                    email: 'consultant@example.com',
                    full_name: 'Consultant User',
                    role: 'consultant',
                    status: 'active',
                    created_at: '2024-01-16',
                    last_sign_in_at: '2024-01-19',
                    tenant_name: 'Örnek Emlak'
                }
            ];

            setUsers(mockUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            toast({
                title: 'Hata',
                description: 'Kullanıcılar yüklenirken bir hata oluştu',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await superadminService.updateUserRole(userId, newRole);
            toast({
                title: 'Başarılı',
                description: 'Kullanıcı rolü güncellendi',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            loadUsers();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Rol güncellenemedi',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            await superadminService.updateUserStatus(userId, newStatus as any);
            toast({
                title: 'Başarılı',
                description: 'Kullanıcı durumu güncellendi',
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            loadUsers();
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Durum güncellenemedi',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'consultant': return 'blue';
            case 'customer': return 'green';
            default: return 'gray';
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'consultant': return 'Danışman';
            case 'customer': return 'Müşteri';
            default: return role;
        }
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        consultants: users.filter(u => u.role === 'consultant').length,
        customers: users.filter(u => u.role === 'customer').length
    };

    if (loading) {
        return (
            <Box bg={bg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color={textColor}>Kullanıcılar yükleniyor...</Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box bg={bg} minH="100vh" w="100%" p={0}>
            <VStack spacing={8} align="stretch" w="100%">
                {/* Header */}
                <Box>
                    <Heading fontSize="3xl" fontWeight="bold" color={headingColor} mb={2}>
                        Kullanıcı Yönetimi
                    </Heading>
                    <Text fontSize="lg" color={textColor}>
                        Tüm kullanıcıları görüntüleyin ve yönetin
                    </Text>
                </Box>

                {/* Stats */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Toplam Kullanıcı</StatLabel>
                                    <StatNumber fontSize="2xl" color="blue.500">{stats.total}</StatNumber>
                                </Stat>
                                <Box p={3} bg="blue.50" borderRadius="lg">
                                    <Icon as={Users} color="blue.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Admin</StatLabel>
                                    <StatNumber fontSize="2xl" color="red.500">{stats.admins}</StatNumber>
                                </Stat>
                                <Box p={3} bg="red.50" borderRadius="lg">
                                    <Icon as={Shield} color="red.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Danışman</StatLabel>
                                    <StatNumber fontSize="2xl" color="purple.500">{stats.consultants}</StatNumber>
                                </Stat>
                                <Box p={3} bg="purple.50" borderRadius="lg">
                                    <Icon as={UserCheck} color="purple.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>

                    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                        <CardBody>
                            <HStack justify="space-between">
                                <Stat>
                                    <StatLabel fontSize="sm" color="gray.500">Müşteri</StatLabel>
                                    <StatNumber fontSize="2xl" color="green.500">{stats.customers}</StatNumber>
                                </Stat>
                                <Box p={3} bg="green.50" borderRadius="lg">
                                    <Icon as={UserX} color="green.500" boxSize={6} />
                                </Box>
                            </HStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Filters */}
                <HStack spacing={4} flexWrap="wrap">
                    <InputGroup maxW="400px">
                        <InputLeftElement pointerEvents="none">
                            <Search size={18} color="gray" />
                        </InputLeftElement>
                        <Input
                            placeholder="Kullanıcı ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bg={cardBg}
                        />
                    </InputGroup>

                    <Select
                        maxW="200px"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        bg={cardBg}
                    >
                        <option value="all">Tüm Roller</option>
                        <option value="admin">Admin</option>
                        <option value="consultant">Danışman</option>
                        <option value="customer">Müşteri</option>
                    </Select>

                    <Select
                        maxW="200px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        bg={cardBg}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Pasif</option>
                        <option value="banned">Yasaklı</option>
                    </Select>
                </HStack>

                {/* Table */}
                <Card>
                    <CardBody p={0}>
                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                                    <Tr>
                                        <Th>Kullanıcı</Th>
                                        <Th>Tenant</Th>
                                        <Th>Rol</Th>
                                        <Th>Durum</Th>
                                        <Th>Son Giriş</Th>
                                        <Th>Oluşturulma</Th>
                                        <Th textAlign="right">İşlemler</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredUsers.map((user) => (
                                        <Tr key={user.id} _hover={{ bg: hoverBg }}>
                                            <Td>
                                                <HStack spacing={3}>
                                                    <Avatar size="sm" name={user.full_name || user.email} />
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="medium">{user.full_name || 'N/A'}</Text>
                                                        <Text fontSize="xs" color="gray.500">{user.email}</Text>
                                                    </VStack>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm">{user.tenant_name || '-'}</Text>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={getRoleColor(user.role)} variant="subtle">
                                                    {getRoleText(user.role)}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={user.status === 'active' ? 'green' : 'gray'}>
                                                    {user.status === 'active' ? 'Aktif' : 'Pasif'}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {user.last_sign_in_at
                                                        ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR')
                                                        : '-'}
                                                </Text>
                                            </Td>
                                            <Td>
                                                <Text fontSize="sm" color="gray.600">
                                                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                                </Text>
                                            </Td>
                                            <Td textAlign="right">
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<MoreVertical size={18} />}
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label="Actions"
                                                    />
                                                    <MenuList>
                                                        <MenuItem
                                                            icon={<Shield size={16} />}
                                                            onClick={() => handleRoleChange(user.id, 'admin')}
                                                        >
                                                            Admin Yap
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<ShieldOff size={16} />}
                                                            onClick={() => handleRoleChange(user.id, 'consultant')}
                                                        >
                                                            Danışman Yap
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<Ban size={16} />}
                                                            onClick={() => handleStatusChange(user.id, 'banned')}
                                                            color="red.500"
                                                        >
                                                            Yasakla
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>

                {filteredUsers.length === 0 && (
                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        Filtrelere uygun kullanıcı bulunamadı
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};

export default UserManagement;
