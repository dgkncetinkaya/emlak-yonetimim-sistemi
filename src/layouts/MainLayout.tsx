import { Box, Flex, Text, useColorModeValue, useDisclosure, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppearance } from '../context/AppearanceContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logout, isAuthenticated, isLoading } = useAuth();
  const { settings } = useAppearance();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Yükleniyor...</Text>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box minH="100vh" bg={settings.background_color || useColorModeValue('gray.50', 'gray.900')} w="100vw">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onClose={onClose} onLogout={handleLogout} />

      {/* Main Content Container */}
      <Box 
        ml={{ base: 0, md: '280px' }}
        w={{ base: '100vw', md: 'calc(100vw - 280px)' }}
        minH="100vh"
        display="flex"
        flexDirection="column"
        overflowX="hidden"
        bg={settings.background_color || useColorModeValue('gray.50', 'gray.900')}
      >
        {/* Mobile Header */}
        <Flex
          display={{ base: 'flex', md: 'none' }}
          align="center"
          justify="space-between"
          p="4"
          bg="#1a1a1a"
          borderBottom="1px"
          borderBottomColor="#2d2d2d"
          position="sticky"
          top="0"
          zIndex="999"
        >
          <IconButton
            aria-label="Menüyü aç"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="white"
            _hover={{ bg: '#2d2d2d' }}
            onClick={onOpen}
          />
          <Text fontSize="lg" fontWeight="bold" color="white">
            Emlak Yönetim
          </Text>
        </Flex>

        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Box 
          flex="1" 
          w="100%"
          overflow="auto"
          px={{ base: 4, md: 6, lg: 8 }}
          py={{ base: 4, md: 6 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;