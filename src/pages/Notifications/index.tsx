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
import { useNotifications } from '../../context/NotificationContext';

const Notifications = () => {
  const toast = useToast();
  const { notifications, unreadCount, markAsRead: contextMarkAsRead, markAllAsRead: contextMarkAllAsRead, deleteNotification: contextDeleteNotification, addNotification } = useNotifications();

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
    contextMarkAsRead(id);
    toast({
      title: 'Bildirim okundu olarak işaretlendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const addTestNotification = () => {
    const testNotifications = [
      {
        type: 'warning' as const,
        title: 'Yeni Müşteri Talebi',
        message: 'Yeni bir müşteri emlak görüntüleme talebi gönderdi.',
        time: 'Şimdi',
        isRead: false,
        priority: 'high' as const
      },
      {
        type: 'info' as const,
        title: 'Sistem Bildirimi',
        message: 'Yeni bir güncelleme mevcut.',
        time: 'Şimdi',
        isRead: false,
        priority: 'medium' as const
      },
      {
        type: 'success' as const,
        title: 'Başarılı İşlem',
        message: 'Yeni bir satış gerçekleştirildi.',
        time: 'Şimdi',
        isRead: false,
        priority: 'high' as const
      }
    ];
    
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    addNotification(randomNotification);
    
    toast({
      title: 'Yeni bildirim eklendi',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const deleteNotification = (id: string) => {
    contextDeleteNotification(id);
    toast({
      title: 'Bildirim silindi',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const markAllAsRead = () => {
    contextMarkAllAsRead();
    toast({
      title: 'Tüm bildirimler okundu olarak işaretlendi',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

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
          <Button
            colorScheme="green"
            size="sm"
            onClick={addTestNotification}
            leftIcon={<Bell size={16} />}
          >
            Test Bildirimi Ekle
          </Button>
          {unreadCount > 0 && (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<CheckCircle size={16} />}
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