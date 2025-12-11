import React, { useState } from 'react';
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
    Tooltip,
    Card,
    CardBody
} from '@chakra-ui/react';
import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Power,
    PowerOff,
    Pause
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tenant } from '../../services/superadminService';

interface TenantTableProps {
    tenants: Tenant[];
    loading?: boolean;
    onEdit?: (tenant: Tenant) => void;
    onDelete?: (tenant: Tenant) => void;
    onView?: (tenant: Tenant) => void;
    onStatusChange?: (tenant: Tenant, status: 'active' | 'inactive' | 'suspended') => void;
}

const TenantTable: React.FC<TenantTableProps> = ({
    tenants,
    loading = false,
    onEdit,
    onDelete,
    onView,
    onStatusChange
}) => {
    const navigate = useNavigate();
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'gray';
            case 'suspended':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Aktif';
            case 'inactive':
                return 'Pasif';
            case 'suspended':
                return 'Askıda';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text mt={4} color="gray.500">Tenant'lar yükleniyor...</Text>
            </Box>
        );
    }

    if (tenants.length === 0) {
        return (
            <Alert status="info" borderRadius="lg">
                <AlertIcon />
                Henüz tenant bulunmuyor. Yeni tenant eklemek için "Yeni Tenant" butonuna tıklayın.
            </Alert>
        );
    }

    return (
        <Card>
            <CardBody p={0}>
                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                            <Tr>
                                <Th>Tenant</Th>
                                <Th>Domain</Th>
                                <Th isNumeric>Kullanıcılar</Th>
                                <Th isNumeric>Emlaklar</Th>
                                <Th isNumeric>MRR</Th>
                                <Th>Durum</Th>
                                <Th>Oluşturulma</Th>
                                <Th textAlign="right">İşlemler</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {tenants.map((tenant) => (
                                <Tr
                                    key={tenant.id}
                                    _hover={{ bg: hoverBg }}
                                    cursor="pointer"
                                    onClick={() => onView?.(tenant)}
                                >
                                    <Td>
                                        <HStack spacing={3}>
                                            <Avatar
                                                size="sm"
                                                name={tenant.name}
                                                bg="blue.500"
                                            />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium">{tenant.name}</Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    ID: {tenant.id.substring(0, 8)}...
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.600">
                                            {tenant.domain || '-'}
                                        </Text>
                                    </Td>
                                    <Td isNumeric>
                                        <Badge colorScheme="purple" variant="subtle">
                                            {tenant.user_count || 0}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Badge colorScheme="blue" variant="subtle">
                                            {tenant.property_count || 0}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Text fontWeight="medium" color="green.500">
                                            ₺{(tenant.mrr || 0).toLocaleString()}
                                        </Text>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={getStatusColor(tenant.status)}
                                            variant="subtle"
                                        >
                                            {getStatusText(tenant.status)}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Text fontSize="sm" color="gray.600">
                                            {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                                        </Text>
                                    </Td>
                                    <Td textAlign="right" onClick={(e) => e.stopPropagation()}>
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
                                                    icon={<Eye size={16} />}
                                                    onClick={() => navigate(`/superadmin3537/tenants/${tenant.id}`)}
                                                >
                                                    Detayları Görüntüle
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<Edit size={16} />}
                                                    onClick={() => onEdit?.(tenant)}
                                                >
                                                    Düzenle
                                                </MenuItem>
                                                {tenant.status === 'active' && (
                                                    <>
                                                        <MenuItem
                                                            icon={<Pause size={16} />}
                                                            onClick={() => onStatusChange?.(tenant, 'suspended')}
                                                        >
                                                            Askıya Al
                                                        </MenuItem>
                                                        <MenuItem
                                                            icon={<PowerOff size={16} />}
                                                            onClick={() => onStatusChange?.(tenant, 'inactive')}
                                                        >
                                                            Pasif Yap
                                                        </MenuItem>
                                                    </>
                                                )}
                                                {tenant.status !== 'active' && (
                                                    <MenuItem
                                                        icon={<Power size={16} />}
                                                        onClick={() => onStatusChange?.(tenant, 'active')}
                                                        color="green.500"
                                                    >
                                                        Aktif Yap
                                                    </MenuItem>
                                                )}
                                                <MenuItem
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => onDelete?.(tenant)}
                                                    color="red.500"
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
                </Box>
            </CardBody>
        </Card>
    );
};

export default TenantTable;
