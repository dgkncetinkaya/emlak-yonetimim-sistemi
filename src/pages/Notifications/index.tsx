import React, { useState, useEffect } from 'react';
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
import NotificationCenter from '../../components/NotificationCenter';
import NotificationSettings from '../../components/NotificationSettings';
import {
  Notification,
  NotificationSettings as NotificationSettingsType,
  NotificationType,
  NotificationPriority
} from '../../types/notificationTypes';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationTypes: {
      document_created: true,
      document_signed: true,
      document_expired: true,
      appointment_reminder: true,
      contract_renewal: true,
      payment_due: true,
      system_update: false,
      user_action: false
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize with sample notifications
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: 'notif-1',
        title: 'Yeni Kira Sözleşmesi Oluşturuldu',
        message: 'Ahmet Yılmaz için yeni bir kira sözleşmesi oluşturuldu ve imzaya gönderildi.',
        type: 'document_created',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        relatedDocumentId: 'doc-1',
        actionUrl: '/document-management'
      },
      {
        id: 'notif-2',
        title: 'Yer Gösterme Formu İmzalandı',
        message: 'Mehmet Demir tarafından yer gösterme formu başarıyla imzalandı.',
        type: 'document_signed',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        relatedDocumentId: 'doc-2'
      },
      {
        id: 'notif-3',
        title: 'Randevu Hatırlatması',
        message: 'Yarın saat 14:00\'da Ayşe Kaya ile randevunuz bulunmaktadır.',
        type: 'appointment_reminder',
        priority: 'urgent',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: 'notif-4',
        title: 'Sözleşme Yenileme Zamanı',
        message: 'Fatma Özkan\'ın kira sözleşmesi 15 gün içinde sona erecek.',
        type: 'contract_renewal',
        priority: 'high',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'notif-5',
        title: 'Ödeme Vadesi Yaklaşıyor',
        message: 'Ali Veli\'nin kira ödemesi 3 gün içinde vadesi dolacak.',
        type: 'payment_due',
        priority: 'medium',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'notif-6',
        title: 'Sistem Güncellemesi',
        message: 'Sistem başarıyla güncellendi. Yeni özellikler kullanıma hazır.',
        type: 'system_update',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ];

    setNotifications(sampleNotifications);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: !notification.isRead }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast({
      title: 'Tüm bildirimler okundu olarak işaretlendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: 'Tüm bildirimler temizlendi',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleUpdateSettings = (settings: NotificationSettingsType) => {
    setNotificationSettings(settings);
    // Here you would typically save to backend
  };

  const createTestNotification = () => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir.',
      type: 'user_action',
      priority: 'medium',
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [testNotification, ...prev]);
    toast({
      title: 'Test bildirimi oluşturuldu',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
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

        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
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
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
                onClearAll={handleClearAll}
              />
            </TabPanel>
            <TabPanel px={0}>
              <NotificationSettings
                settings={notificationSettings}
                onUpdateSettings={handleUpdateSettings}
              />
            </TabPanel>
          </TabPanels>
      </Tabs>
      </Box>
    </Box>
  );
};

export default NotificationsPage;