import { Box, Flex, Text, useColorModeValue, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, VStack, Icon, IconButton, Badge, HStack } from '@chakra-ui/react';
import { SettingsIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Map, BarChart2, LogOut, Calendar, Bell, Briefcase, UserCheck } from 'react-feather';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { BackendHealthIndicator } from '../components/BackendHealthIndicator';

interface NavItem {
  name: string;
  icon: React.ComponentType;
  path: string;
  roles?: readonly string[];
}

const Sidebar = ({ isOpen, onClose, onLogout }: { isOpen: boolean; onClose: () => void; onLogout: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  const allItems: NavItem[] = [
    { name: 'Ana Sayfa', icon: Home, path: '/' },
    { name: 'Portföy', icon: Map, path: '/portfolio' },
    { name: 'Müşteriler', icon: Users, path: '/customers' },
    { name: 'Randevularım', icon: Calendar, path: '/my-appointments' },
    { name: 'Belgeler', icon: FileText, path: '/documents' },
    { name: 'Bildirimler', icon: Bell, path: '/notifications' },

    { name: 'Raporlar', icon: BarChart2, path: '/reports', roles: ['admin'] as const },
    { name: 'Ayarlar', icon: SettingsIcon, path: '/settings' },
  ];

  const navItems = allItems.filter((item: NavItem) => !item.roles || item.roles.includes(user?.role ?? 'consultant'));

  return (
    <>
      <Box
        display={{ base: 'none', md: 'block' }}
        w="200px"
        bg={useColorModeValue('white', 'gray.800')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        pos="fixed"
        h="full"
        left="0"
        top="0"
        zIndex="1000"
      >
        <VStack spacing="2" align="stretch" px="3" py="4">
          {/* Logo/Title */}
          <Box mb="3">
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'white')} textAlign="center">
              Emlak Yönetim Sistemi
            </Text>
            <HStack mt="2" justify="center" spacing={2}>
              <BackendHealthIndicator size="sm" />
            </HStack>
          </Box>
          {navItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <Flex
                align="center"
                p="3"
                mx="-3"
                borderRadius="md"
                role="group"
                cursor="pointer"
                bg={location.pathname === item.path ? 'blue.50' : 'transparent'}
                color={location.pathname === item.path ? 'blue.600' : 'gray.600'}
                fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
                _hover={{
                  bg: 'blue.50',
                  color: 'blue.600',
                }}
              >
                <Icon as={item.icon} mr="3" fontSize="16" />
                <Text fontSize="sm">{item.name}</Text>
                {item.name === 'Bildirimler' && unreadCount > 0 && (
                  <Badge
                    ml="auto"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Flex>
            </Link>
          ))}

          {/* Desktop Logout */}
          <Flex
            align="center"
            p="3"
            mx="-3"
            borderRadius="md"
            role="group"
            cursor="pointer"
            _hover={{ bg: 'red.50', color: 'red.600' }}
            color="gray.600"
            onClick={onLogout}
          >
            <Icon as={LogOut} mr="3" fontSize="16" />
            <Text fontSize="sm">Çıkış</Text>
          </Flex>
        </VStack>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW="200px">
          <DrawerHeader borderBottomWidth="1px" py="3">
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="bold">
                Emlak Yönetim Sistemi
              </Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p="0">
            <VStack spacing="0" align="stretch">
              {navItems.map((item) => (
                <Link to={item.path} key={item.name} onClick={onClose}>
                  <Flex
                    align="center"
                    p="3"
                    role="group"
                    cursor="pointer"
                    bg={location.pathname === item.path ? 'blue.50' : 'transparent'}
                    color={location.pathname === item.path ? 'blue.600' : 'gray.600'}
                    fontWeight={location.pathname === item.path ? 'bold' : 'normal'}
                    _hover={{
                      bg: 'blue.50',
                      color: 'blue.600',
                    }}
                  >
                    <Icon as={item.icon} mr="3" fontSize="16" />
                    <Text fontSize="sm">{item.name}</Text>
                    {item.name === 'Bildirimler' && unreadCount > 0 && (
                      <Badge
                        ml="auto"
                        colorScheme="red"
                        borderRadius="full"
                        fontSize="xs"
                        minW="20px"
                        h="20px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Flex>
                </Link>
              ))}

              {/* Mobile/Drawer Logout */}
              <Flex
                align="center"
                p="3"
                role="group"
                cursor="pointer"
                _hover={{ bg: 'red.50', color: 'red.600' }}
                color="gray.600"
                onClick={() => { onLogout(); onClose(); }}
              >
                <Icon as={LogOut} mr="3" fontSize="16" />
                <Text fontSize="sm">Çıkış</Text>
              </Flex>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} position="relative">
      {/* Mobile Header */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        align="center"
        justify="space-between"
        p="4"
        bg={useColorModeValue('white', 'gray.800')}
        borderBottom="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        position="sticky"
        top="0"
        zIndex="999"
      >
        <IconButton
          aria-label="Menüyü aç"
          icon={<HamburgerIcon />}
          variant="ghost"
          onClick={onOpen}
        />
        <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'white')}>
          Emlak Yönetim Sistemi
        </Text>
        <BackendHealthIndicator size="sm" />
      </Flex>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={onClose} onLogout={handleLogout} />

      {/* Main Content */}
      <Box 
        ml={{ base: 0, md: '200px' }} 
        p={{ base: '4', md: '6' }} 
        w="full"
        pt={{ base: '4', md: '6' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;