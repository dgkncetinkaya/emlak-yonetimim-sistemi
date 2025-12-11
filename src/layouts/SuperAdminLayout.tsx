import React from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Button,
    Icon,
    useColorModeValue,
    Divider,
    Avatar
} from '@chakra-ui/react';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Package,
    Settings,
    LogOut,
    MessageSquare,
    Megaphone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSuperAdminSession, logoutSuperAdmin } from '../lib/superadminAuth';

interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const session = getSuperAdminSession();

    const bg = useColorModeValue('gray.50', 'gray.900');
    const sidebarBg = useColorModeValue('white', 'gray.800');
    const headerBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const activeColor = useColorModeValue('blue.50', 'blue.900');
    const activeBorderColor = 'blue.500';

    const menuItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/superadmin3537/dashboard'
        },
        {
            label: 'Ofisler',
            icon: Building2,
            path: '/superadmin3537/offices'
        },
        {
            label: 'Planlar',
            icon: Package,
            path: '/superadmin3537/plans'
        },
        {
            label: 'Ödemeler',
            icon: CreditCard,
            path: '/superadmin3537/payments'
        },
        {
            label: 'Destek',
            icon: MessageSquare,
            path: '/superadmin3537/tickets'
        },
        {
            label: 'Duyurular',
            icon: Megaphone,
            path: '/superadmin3537/announcements'
        },
        {
            label: 'Sistem Ayarları',
            icon: Settings,
            path: '/superadmin3537/settings'
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <Flex h="100vh" bg={bg}>
            {/* Sidebar */}
            <Box
                w="250px"
                bg={sidebarBg}
                borderRight="1px"
                borderColor={borderColor}
                display="flex"
                flexDirection="column"
            >
                {/* Logo/Title */}
                <Box p={6} borderBottom="1px" borderColor={borderColor}>
                    <Text fontSize="xl" fontWeight="bold" color="red.500">
                        SuperAdmin Panel
                    </Text>
                </Box>

                {/* Menu Items */}
                <VStack spacing={1} align="stretch" p={4} flex={1}>
                    {menuItems.map((item) => (
                        <Button
                            key={item.path}
                            leftIcon={<Icon as={item.icon} boxSize={5} />}
                            justifyContent="flex-start"
                            variant="ghost"
                            size="lg"
                            onClick={() => navigate(item.path)}
                            bg={isActive(item.path) ? activeColor : 'transparent'}
                            borderLeft="3px solid"
                            borderLeftColor={isActive(item.path) ? activeBorderColor : 'transparent'}
                            borderRadius="md"
                            _hover={{
                                bg: activeColor
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}

                    <Divider my={4} />

                    {/* Logout */}
                    <Button
                        leftIcon={<Icon as={LogOut} boxSize={5} />}
                        justifyContent="flex-start"
                        variant="ghost"
                        size="lg"
                        colorScheme="red"
                        onClick={logoutSuperAdmin}
                    >
                        Çıkış
                    </Button>
                </VStack>
            </Box>

            {/* Main Content */}
            <Flex direction="column" flex={1} overflow="hidden">
                {/* Header */}
                <Box
                    h="70px"
                    bg={headerBg}
                    borderBottom="1px"
                    borderColor={borderColor}
                    px={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Text fontSize="2xl" fontWeight="bold">
                        SuperAdmin Yönetim Paneli
                    </Text>

                    <HStack spacing={4}>
                        <VStack align="end" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                                {session?.user.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {session?.user.email}
                            </Text>
                        </VStack>
                        <Avatar size="sm" name={session?.user.name} bg="red.500" />
                    </HStack>
                </Box>

                {/* Content Area */}
                <Box flex={1} overflow="auto" p={8}>
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
};

export default SuperAdminLayout;
