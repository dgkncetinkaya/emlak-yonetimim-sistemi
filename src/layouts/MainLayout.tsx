import { Box, Flex, useColorModeValue, IconButton, Text, HStack, Menu, MenuButton, Avatar, MenuList, MenuItem, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, VStack, Icon, Button } from '@chakra-ui/react';
import { HamburgerIcon, BellIcon, SettingsIcon } from '@chakra-ui/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, FileText, Map, BarChart2, Search, LogOut } from 'react-feather';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, onLogout }: { isOpen: boolean; onClose: () => void; onLogout: () => void }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const allItems = [
    { name: 'Ana Sayfa', icon: Home, path: '/' },
    { name: 'Portföy Yönetimi', icon: Map, path: '/portfolio' },
    { name: 'Müşteri Yönetimi', icon: Users, path: '/customers' },
    { name: 'Belge Yönetimi', icon: FileText, path: '/documents' },
    { name: 'Tapu Sorgulama', icon: Search, path: '/title-deed' },
    { name: 'Raporlama', icon: BarChart2, path: '/reports', roles: ['admin'] as const },
    { name: 'Ayarlar', icon: SettingsIcon, path: '/settings', roles: ['admin'] as const },
  ];

  const navItems = allItems.filter((item: any) => !item.roles || item.roles.includes(user?.role ?? 'consultant'));

  return (
    <>
      <Box
        display={{ base: 'none', md: 'block' }}
        w="250px"
        bg={useColorModeValue('white', 'gray.800')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        pos="fixed"
        h="full"
        pt="20"
      >
        <VStack spacing="4" align="stretch" px="4">
          {navItems.map((item) => (
            <Link to={item.path} key={item.name}>
              <Flex
                align="center"
                p="4"
                mx="-4"
                borderRadius="lg"
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
                <Icon as={item.icon} mr="4" fontSize="16" />
                <Text>{item.name}</Text>
              </Flex>
            </Link>
          ))}

          {/* Desktop Logout */}
          <Flex
            align="center"
            p="4"
            mx="-4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            _hover={{ bg: 'red.50', color: 'red.600' }}
            color="gray.600"
            onClick={onLogout}
          >
            <Icon as={LogOut} mr="4" fontSize="16" />
            <Text>Çıkış</Text>
          </Flex>
        </VStack>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            Emlak Ofisi Dijital Asistan
          </DrawerHeader>
          <DrawerBody p="0">
            <VStack spacing="0" align="stretch">
              {navItems.map((item) => (
                <Link to={item.path} key={item.name} onClick={onClose}>
                  <Flex
                    align="center"
                    p="4"
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
                    <Icon as={item.icon} mr="4" fontSize="16" />
                    <Text>{item.name}</Text>
                  </Flex>
                </Link>
              ))}

              {/* Mobile/Drawer Logout */}
              <Flex
                align="center"
                p="4"
                role="group"
                cursor="pointer"
                _hover={{ bg: 'red.50', color: 'red.600' }}
                color="gray.600"
                onClick={() => { onLogout(); onClose(); }}
              >
                <Icon as={LogOut} mr="4" fontSize="16" />
                <Text>Çıkış</Text>
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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Navbar */}
      <Flex
        as="header"
        position="fixed"
        top="0"
        left="0"
        w="full"
        bg={useColorModeValue('white', 'gray.800')}
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        boxShadow="md"
        h="20"
        alignItems="center"
        justifyContent="space-between"
        px="4"
        zIndex="9999"
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<HamburgerIcon />}
        />

        <Text
          fontSize="2xl"
          fontWeight="bold"
          display={{ base: 'none', md: 'flex' }}
        >
          Emlak Ofisi Dijital Asistan
        </Text>

        <HStack spacing="2">
          <IconButton
            size="lg"
            variant="ghost"
            aria-label="notifications"
            icon={<BellIcon />}
          />
          {/* Visible logout button with label */}
          <Button
            size="sm"
            colorScheme="red"
            variant="solid"
            leftIcon={<LogOut size={16} />}
            onClick={handleLogout}
          >
            Çıkış
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar size="sm" name="Emlak Danışmanı" />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<SettingsIcon />}>Profil</MenuItem>
              <MenuItem icon={<LogOut />} onClick={handleLogout}>Çıkış</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={onClose} onLogout={handleLogout} />

      {/* Main Content */}
      <Box ml={{ base: 0, md: '250px' }} p="4" pt="24">
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;