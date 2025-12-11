import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Button,
  Divider,
  useColorModeValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Card,
  CardBody,
  Tooltip,
  Avatar,
  AvatarBadge,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Bell, Check, X, Filter, MoreVertical, Eye, EyeOff, RefreshCw } from 'react-feather';
import {
  NotificationUI,
  NotificationFilter,
  NotificationPriority,
  NotificationType,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_TYPE_COLORS
} from '../types/notificationTypes';
import { useNotifications } from '../context/NotificationContext';

interface NotificationCenterProps {
  showHeader?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  showHeader = true
}) => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  const [filter, setFilter] = useState<NotificationFilter>({
    type: undefined,
    priority: undefined,
    isRead: undefined
  });
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');

  // Filter notifications based on current filter settings
  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.isRead) return false;
    
    if (filter.type && notification.type !== filter.type) return false;
    if (filter.priority && notification.priority !== filter.priority) return false;
    if (filter.isRead !== undefined && notification.isRead !== filter.isRead) return false;
    
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const handleMarkAsRead = async (notification: NotificationUI) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        toast({
          title: 'Bildirim okundu olarak işaretlendi',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Hata',
          description: 'Bildirim güncellenirken bir hata oluştu',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      toast({
        title: 'Bildirim silindi',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bildirim silinirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'Tüm bildirimler okundu olarak işaretlendi',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bildirimler güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
      toast({
        title: 'Bildirimler yenilendi',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bildirimler yenilenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4} color={mutedTextColor}>
          Bildirimler yükleniyor...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      {showHeader && (
        <Flex align="center" mb={4}>
          <HStack>
            <Bell size={20} />
            <Text fontSize="lg" fontWeight="bold">
              Bildirimler
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full">
                {unreadCount}
              </Badge>
            )}
          </HStack>
          <Spacer />
          <HStack>
            <Tooltip label="Yenile">
              <IconButton
                icon={<RefreshCw size={16} />}
                size="sm"
                variant="ghost"
                aria-label="Yenile"
                onClick={handleRefresh}
              />
            </Tooltip>
            <Menu>
              <MenuButton as={IconButton} icon={<Filter size={16} />} size="sm" variant="ghost" aria-label="Filtrele" />
              <MenuList>
                <MenuItem onClick={() => setFilter({ type: undefined, priority: undefined, isRead: undefined })}>
                  Tüm Bildirimler
                </MenuItem>
                <MenuItem onClick={() => setFilter({ ...filter, isRead: false })}>
                  Okunmamış
                </MenuItem>
                <MenuItem onClick={() => setFilter({ ...filter, isRead: true })}>
                  Okunmuş
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setFilter({ ...filter, priority: 'urgent' })}>
                  Acil
                </MenuItem>
                <MenuItem onClick={() => setFilter({ ...filter, priority: 'high' })}>
                  Yüksek Öncelik
                </MenuItem>
                <MenuItem onClick={() => setFilter({ ...filter, priority: 'medium' })}>
                  Orta Öncelik
                </MenuItem>
                <MenuItem onClick={() => setFilter({ ...filter, priority: 'low' })}>
                  Düşük Öncelik
                </MenuItem>
              </MenuList>
            </Menu>
            {unreadCount > 0 && (
              <Button size="sm" onClick={handleMarkAllAsRead}>
                Tümünü Okundu İşaretle
              </Button>
            )}
          </HStack>
        </Flex>
      )}

      {/* Notifications List */}
      <VStack spacing={2} align="stretch">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color={mutedTextColor}>
                {notifications.length === 0 ? 'Henüz bildirim yok' : 'Filtre kriterlerine uygun bildirim bulunamadı'}
              </Text>
            </CardBody>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              bg={!notification.isRead ? unreadBg : bgColor}
              borderLeft={`4px solid`}
              borderLeftColor={`${NOTIFICATION_TYPE_COLORS[notification.type]}.500`}
              cursor="pointer"
              onClick={() => handleMarkAsRead(notification)}
              _hover={{ shadow: 'md' }}
            >
              <CardBody>
                <Flex>
                  <Box flex={1}>
                    <HStack mb={2}>
                      <Badge
                        colorScheme={NOTIFICATION_TYPE_COLORS[notification.type]}
                        size="sm"
                      >
                        {NOTIFICATION_TYPE_LABELS[notification.type]}
                      </Badge>
                      <Badge
                        colorScheme={NOTIFICATION_PRIORITY_COLORS[notification.priority]}
                        size="sm"
                        variant={notification.priority === 'urgent' ? 'solid' : 'subtle'}
                      >
                        {NOTIFICATION_PRIORITY_LABELS[notification.priority]}
                      </Badge>
                      {!notification.isRead && (
                        <Badge colorScheme="blue" size="sm">
                          Yeni
                        </Badge>
                      )}
                    </HStack>
                    <Text fontWeight={!notification.isRead ? 'bold' : 'normal'} mb={1}>
                      {notification.title}
                    </Text>
                    <Text fontSize="sm" color={mutedTextColor} mb={2}>
                      {notification.message}
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor}>
                       {formatDate(notification.createdAt.toISOString())}
                     </Text>
                  </Box>
                  <VStack spacing={1}>
                    <Tooltip label={notification.isRead ? 'Okunmamış işaretle' : 'Okundu işaretle'}>
                      <IconButton
                        icon={notification.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                        size="xs"
                        variant="ghost"
                        aria-label={notification.isRead ? 'Okunmamış işaretle' : 'Okundu işaretle'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification);
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Sil">
                      <IconButton
                        icon={<X size={14} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Bildirimi sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      />
                    </Tooltip>
                  </VStack>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default NotificationCenter;