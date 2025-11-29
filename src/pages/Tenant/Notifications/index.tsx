import React from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Flex,
  Spacer,
  Button,
  HStack,
  Text,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { Bell, Settings, Plus } from 'react-feather';
import NotificationCenter from '../../../components/NotificationCenter';
import NotificationSettings from '../../../components/NotificationSettings';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const NotificationsPage: React.FC = () => {
  const toast = useToast();
  const { unreadCount, addNotification } = useNotifications();
  const { user } = useAuth();

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const createTestNotification = async () => {
    if (!user?.id) {
      toast({
        title: 'Hata',
        description: 'Kullanıcı oturumu bulunamadı',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addNotification({
        user_id: user.id,
        title: 'Test Bildirimi',
        message: 'Bu bir test bildirimidir. Sistem düzgün çalışıyor.',
        type: 'user_action',
        priority: 'medium',
      });

      toast({
        title: 'Test bildirimi oluşturuldu',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Test bildirimi oluşturulamadı',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Box w="100%" px={4}>
        <Flex align="center" mb={6}>
          <HStack>
            <Bell size={24} />
            <Text fontSize="2xl" fontWeight="bold">
              Bildirimler
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full" px={2}>
                {unreadCount} okunmamış
              </Badge>
            )}
          </HStack>
          <Spacer />
          <Button
            leftIcon={<Plus size={16} />}
            size="sm"
            onClick={createTestNotification}
            variant="outline"
          >
            Test Bildirimi
          </Button>
        </Flex>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>
              <HStack>
                <Bell size={16} />
                <Text>Bildirimler</Text>
                {unreadCount > 0 && (
                  <Badge colorScheme="red" size="sm" borderRadius="full">
                    {unreadCount}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Settings size={16} />
                <Text>Ayarlar</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <NotificationCenter />
            </TabPanel>
            <TabPanel px={0}>
              <NotificationSettings />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default NotificationsPage;