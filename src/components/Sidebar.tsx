import { Box, Flex, Text, VStack, Icon, Badge, HStack, Circle, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, IconButton } from '@chakra-ui/react';
import { SettingsIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Map, BarChart2, LogOut, Calendar, Bell } from 'react-feather';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface NavItem {
  name: string;
  icon: React.ComponentType;
  path: string;
  roles?: readonly string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  
  const allItems: NavItem[] = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Portföy', icon: Map, path: '/portfolio' },
    { name: 'Müşteriler', icon: Users, path: '/customers' },
    { name: 'Randevularım', icon: Calendar, path: '/my-appointments' },
    { name: 'Belgeler', icon: FileText, path: '/documents' },
    { name: 'Bildirimler', icon: Bell, path: '/notifications' },
    { name: 'Raporlar', icon: BarChart2, path: '/reports', roles: ['admin'] as const },
    { name: 'Ayarlar', icon: SettingsIcon, path: '/settings' },
  ];

  const navItems = allItems.filter((item: NavItem) => !item.roles || item.roles.includes(user?.role ?? 'consultant'));

  const SidebarContent = () => (
    <VStack spacing="0" align="stretch" h="full">
      {/* Logo/Title */}
      <Box p="6" borderBottom="1px" borderColor="#2d2d2d">
        <HStack spacing="3">
          <Circle size="40px" bg="white" color="black" fontWeight="bold" fontSize="lg">
            E
          </Circle>
          <Text fontSize="xl" fontWeight="bold" color="white">
            ADN One Emlak
          </Text>
        </HStack>
      </Box>
      
      {/* Navigation Items */}
      <VStack spacing="1" align="stretch" px="4" py="4" flex="1">
        {navItems.map((item) => (
          <Link to={item.path} key={item.name}>
            <Flex
              align="center"
              p="3"
              borderRadius="lg"
              role="group"
              cursor="pointer"
              bg={location.pathname === item.path ? '#2d7d32' : 'transparent'}
              color={location.pathname === item.path ? 'white' : '#9ca3af'}
              fontWeight={location.pathname === item.path ? '600' : '500'}
              _hover={{
                bg: location.pathname === item.path ? '#2d7d32' : '#2d2d2d',
                color: 'white',
              }}
              transition="all 0.2s"
            >
              <Icon as={item.icon} mr="3" fontSize="18" />
              <Text fontSize="sm">{item.name}</Text>
              {item.name === 'Bildirimler' && unreadCount > 0 && (
                <Badge
                  ml="auto"
                  bg="#ef4444"
                  color="white"
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
      </VStack>
      
      {/* Logout Button */}
      <Box p="4" borderTop="1px" borderColor="#2d2d2d">
        <Flex
          align="center"
          p="3"
          borderRadius="lg"
          cursor="pointer"
          color="#9ca3af"
          _hover={{
            bg: '#2d2d2d',
            color: 'white',
          }}
          transition="all 0.2s"
          onClick={onLogout}
        >
          <Icon as={LogOut} mr="3" fontSize="18" />
          <Text fontSize="sm">Çıkış Yap</Text>
        </Flex>
      </Box>
    </VStack>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="280px"
        bg="#1a1a1a"
        pos="fixed"
        h="100vh"
        left="0"
        top="0"
        zIndex="1000"
      >
        <SidebarContent />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="#1a1a1a" maxW="280px">
          <DrawerHeader borderBottomWidth="1px" borderColor="#2d2d2d" p="0">
            <Flex justify="space-between" align="center" p="4">
              <HStack spacing="3">
                <Circle size="32px" bg="white" color="black" fontWeight="bold" fontSize="md">
                  E
                </Circle>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  ADN One Emlak
                </Text>
              </HStack>
              <IconButton
                aria-label="Menüyü kapat"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: '#2d2d2d' }}
                onClick={onClose}
              />
            </Flex>
          </DrawerHeader>
          <DrawerBody p="0">
            <VStack spacing="1" align="stretch" px="4" py="4" flex="1">
              {navItems.map((item) => (
                <Link to={item.path} key={item.name} onClick={onClose}>
                  <Flex
                    align="center"
                    p="3"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    bg={location.pathname === item.path ? '#2d7d32' : 'transparent'}
                    color={location.pathname === item.path ? 'white' : '#9ca3af'}
                    fontWeight={location.pathname === item.path ? '600' : '500'}
                    _hover={{
                      bg: location.pathname === item.path ? '#2d7d32' : '#2d2d2d',
                      color: 'white',
                    }}
                    transition="all 0.2s"
                  >
                    <Icon as={item.icon} mr="3" fontSize="18" />
                    <Text fontSize="sm">{item.name}</Text>
                    {item.name === 'Bildirimler' && unreadCount > 0 && (
                      <Badge
                        ml="auto"
                        bg="#ef4444"
                        color="white"
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
            </VStack>
            
            {/* Mobile Logout Button */}
            <Box p="4" borderTop="1px" borderColor="#2d2d2d">
              <Flex
                align="center"
                p="3"
                borderRadius="lg"
                cursor="pointer"
                color="#9ca3af"
                _hover={{
                  bg: '#2d2d2d',
                  color: 'white',
                }}
                transition="all 0.2s"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <Icon as={LogOut} mr="3" fontSize="18" />
                <Text fontSize="sm">Çıkış Yap</Text>
              </Flex>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;