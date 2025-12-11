import { Box, Flex, Text, VStack, HStack, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuList, MenuItem, Avatar, Button, IconButton, Badge, Icon, MenuDivider } from '@chakra-ui/react';
import { SettingsIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, CreditCard } from 'react-feather';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'İyi sabahlar';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="#e6e6e6"
      px="6"
      py="4"
      position="sticky"
      top="0"
      zIndex="999"
      w="100%"
    >
      <Flex 
        align="center" 
        justify="space-between" 
        direction={{ base: "column", md: "row" }}
        gap={{ base: "4", md: "0" }}
      >
        {/* Welcome Message */}
        <VStack 
          align={{ base: "center", md: "flex-start" }} 
          spacing="1"
          textAlign={{ base: "center", md: "left" }}
          w={{ base: "100%", md: "auto" }}
        >
          <Text 
            fontSize={{ base: "xl", md: "2xl" }} 
            fontWeight="600" 
            color="#161616"
          >
            {getGreeting()}, {user?.name || 'Kullanıcı'}!
          </Text>
          <Text 
            fontSize={{ base: "sm", md: "md" }} 
            color="#a3a3a3"
          >
            Hoş geldiniz, şimdi keşfedelim!
          </Text>
        </VStack>

        {/* Right Side Controls */}
        <HStack 
          spacing={{ base: "3", md: "6" }}
          w={{ base: "100%", md: "auto" }}
          justify={{ base: "center", md: "flex-end" }}
        >
          {/* Search Bar */}
          <InputGroup 
            maxW={{ base: "100%", md: "300px", lg: "400px" }}
            w={{ base: "100%", md: "auto" }}
            display={{ base: "none", md: "block" }}
          >
            <InputLeftElement pointerEvents="none">
              <Icon as={Search} color="#a3a3a3" />
            </InputLeftElement>
            <Input
              placeholder="Buradan arayın"
              bg="white"
              border="1px solid #e6e6e6"
              borderRadius="16px"
              h={{ base: "40px", md: "50px" }}
              fontSize={{ base: "sm", md: "md" }}
              _placeholder={{ color: '#a3a3a3' }}
              _focus={{
                borderColor: '#3182CE',
                boxShadow: '0 0 0 1px #3182CE'
              }}
            />
          </InputGroup>

          {/* Profile Menu */}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Profil"
              icon={
                <Avatar 
                  size="sm" 
                  name={user?.name || 'Kullanıcı'} 
                  bg="#3182CE"
                  color="white"
                />
              }
              variant="ghost"
              borderRadius="full"
              h={{ base: "40px", md: "50px" }}
              w={{ base: "40px", md: "50px" }}
              _hover={{ bg: '#f7f7f7' }}
              _active={{ bg: '#f7f7f7' }}
            />
            <MenuList>
              <Box px="3" py="2">
                <Text fontWeight="600" fontSize="sm">{user?.name || 'Kullanıcı'}</Text>
                <Text fontSize="xs" color="gray.500">{user?.email}</Text>
              </Box>
              <MenuDivider />
              <MenuItem 
                icon={<Icon as={User} boxSize={4} />}
                onClick={() => {
                  const tenantName = window.location.pathname.split('/')[1];
                  navigate(`/${tenantName}/profil`);
                }}
              >
                Profilim
              </MenuItem>
              <MenuItem 
                icon={<Icon as={CreditCard} boxSize={4} />}
                onClick={() => {
                  const tenantName = window.location.pathname.split('/')[1];
                  navigate(`/${tenantName}/abonelik`);
                }}
              >
                Abonelik Yönetimi
              </MenuItem>
              <MenuItem 
                icon={<Icon as={SettingsIcon} boxSize={4} />}
                onClick={() => {
                  const tenantName = window.location.pathname.split('/')[1];
                  navigate(`/${tenantName}/ayarlar`);
                }}
              >
                Ayarlar
              </MenuItem>
              <MenuDivider />
              <MenuItem 
                icon={<Icon as={LogOut} boxSize={4} />}
                onClick={handleSignOut}
                color="red.500"
              >
                Çıkış Yap
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Notifications */}
          <Box position="relative">
            <IconButton
              aria-label="Bildirimler"
              icon={<Bell size={18} />}
              variant="outline"
              borderColor="#e6e6e6"
              borderRadius="16px"
              h={{ base: "40px", md: "50px" }}
              w={{ base: "40px", md: "50px" }}
              bg="white"
              _hover={{ bg: '#f7f7f7' }}
              onClick={() => {
                const tenantName = window.location.pathname.split('/')[1];
                navigate(`/${tenantName}/bildirimler`);
              }}
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
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
          </Box>

          {/* Settings */}
          <IconButton
            aria-label="Ayarlar"
            icon={<SettingsIcon />}
            variant="outline"
            borderColor="#e6e6e6"
            borderRadius="16px"
            h={{ base: "40px", md: "50px" }}
            w={{ base: "40px", md: "50px" }}
            bg="white"
            _hover={{ bg: '#f7f7f7' }}
            onClick={() => {
              const tenantName = window.location.pathname.split('/')[1];
              navigate(`/${tenantName}/ayarlar`);
            }}
          />

          {/* Language Selector */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="outline"
              borderColor="#e6e6e6"
              borderRadius="16px"
              h={{ base: "40px", md: "50px" }}
              px={{ base: "2", md: "4" }}
              bg="white"
              _hover={{ bg: '#f7f7f7' }}
              _active={{ bg: '#f7f7f7' }}
            >
              <HStack spacing="2">
                <Text fontSize="lg">🇹🇷</Text>
                <Text fontSize={{ base: "sm", md: "md" }} color="#a3a3a3">
                  TR
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem>
                <HStack spacing="2">
                  <Text fontSize="lg">🇹🇷</Text>
                  <Text>Türkçe</Text>
                </HStack>
              </MenuItem>
              <MenuItem>
                <HStack spacing="2">
                  <Text fontSize="lg">🇺🇸</Text>
                  <Text>English</Text>
                </HStack>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;