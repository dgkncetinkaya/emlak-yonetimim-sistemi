import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Button,
  Icon,
  useColorModeValue,
  Flex,
  Divider,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import { Bell, AlertTriangle, Info, CheckCircle, X, MoreVertical, Trash2, Eye } from 'react-feather';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Müşteri Takibi Gerekli',
      message: 'Ahmet Yılmaz ile 3 gündür iletişim kurulmadı. Takip edilmesi öneriliyor.',
      time: '2 saat önce',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'error',
      title: 'Randevu İptali',
      message: 'Bugün saat 14:00\'daki randevu müşteri tarafından iptal edildi.',
      time: '4 saat önce',
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'Yeni Müşteri Kaydı',
      message: 'Zeynep Kaya sisteme yeni müşteri olarak kaydedildi.',
      time: '6 saat önce',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'success',
      title: 'Satış Tamamlandı',
      message: 'Beşiktaş\'taki 3+1 daire başarıyla satıldı. Komisyon: ₺15.000',
      time: '1 gün önce',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Belge Eksikliği',
      message: 'Kadıköy\'deki emlak için tapu belgesi henüz yüklenmedi.',
      time: '1 gün önce',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '6',
      type: 'info',
      title: 'Sistem Güncellemesi',
      message: 'Sistem bakımı yarın saat 02:00-04:00 arasında gerçekleştirilecek.',
      time: '2 gün önce',
      isRead: true,
      priority: 'low'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return X;
      case 'info': return Info;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'info': return 'blue';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    toast({
      title: 'Bildirim okundu olarak işaretlendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: 'Bildirim silindi',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: 'Tüm bildirimler okundu olarak işaretlendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={3}>
          <Icon as={Bell} fontSize="24" color="blue.500" />
          <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
            Bildirimler
          </Heading>
          {unreadCount > 0 && (
            <Badge colorScheme="red" borderRadius="full" px={2}>
              {unreadCount} okunmamış
            </Badge>
          )}
        </HStack>
        
        <HStack spacing={2}>
          {unreadCount > 0 && (
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={markAllAsRead}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Notifications Grid */}
      {notifications.length === 0 ? (
        <Card>
          <CardBody>
            <VStack spacing={4} py={8}>
              <Icon as={Bell} fontSize="48" color="gray.300" />
              <Text color="gray.500" fontSize="lg">
                Henüz bildiriminiz bulunmuyor
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Yeni bildirimler burada görünecektir
              </Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              bg={notification.isRead ? useColorModeValue('white', 'gray.800') : useColorModeValue('blue.50', 'blue.900')}
              borderLeft="4px solid"
              borderLeftColor={`${getNotificationColor(notification.type)}.400`}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'lg',
                transition: 'all 0.2s'
              }}
            >
              <CardBody>
                <Flex justify="space-between" align="flex-start">
                  <HStack spacing={4} flex={1}>
                    <Box
                      p={2}
                      borderRadius="full"
                      bg={`${getNotificationColor(notification.type)}.100`}
                      color={`${getNotificationColor(notification.type)}.600`}
                    >
                      <Icon as={getNotificationIcon(notification.type)} fontSize="20" />
                    </Box>
                    
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Text
                          fontWeight={notification.isRead ? 'normal' : 'bold'}
                          fontSize="md"
                          color={useColorModeValue('gray.800', 'white')}
                        >
                          {notification.title}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={getPriorityColor(notification.priority)}
                          variant="subtle"
                        >
                          {notification.priority === 'high' ? 'Yüksek' : 
                           notification.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </HStack>
                      
                      <Text
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontSize="sm"
                        lineHeight="1.4"
                      >
                        {notification.message}
                      </Text>
                      
                      <Text
                        color={useColorModeValue('gray.500', 'gray.400')}
                        fontSize="xs"
                        mt={1}
                      >
                        {notification.time}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<MoreVertical size={16} />}
                      variant="ghost"
                      size="sm"
                      color={useColorModeValue('gray.500', 'gray.400')}
                    />
                    <MenuList>
                      {!notification.isRead && (
                        <MenuItem
                          icon={<Eye size={16} />}
                          onClick={() => markAsRead(notification.id)}
                        >
                          Okundu İşaretle
                        </MenuItem>
                      )}
                      <MenuItem
                        icon={<Trash2 size={16} />}
                        onClick={() => deleteNotification(notification.id)}
                        color="red.500"
                      >
                        Sil
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Notifications;