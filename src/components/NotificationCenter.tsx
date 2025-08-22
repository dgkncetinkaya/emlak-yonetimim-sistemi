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
  AvatarBadge
} from '@chakra-ui/react';
import { Bell, Check, X, Filter, MoreVertical, Eye, EyeOff } from 'react-feather';
import {
  Notification,
  NotificationFilter,
  NotificationPriority,
  NotificationType,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_TYPE_COLORS
} from '../types/notificationTypes';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}) => {
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(notifications);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const unreadBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    let filtered = notifications;

    if (filter.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    if (filter.priority) {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    if (filter.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filter.isRead);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(n => {
        const notificationDate = new Date(n.createdAt);
        return notificationDate >= filter.dateRange!.start && notificationDate <= filter.dateRange!.end;
      });
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (date: Date) => {
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

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
      toast({
        title: 'Bildirim okundu olarak işaretlendi',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNotification = (id: string) => {
    onDeleteNotification(id);
    toast({
      title: 'Bildirim silindi',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      {/* Header */}
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
          <Menu>
            <MenuButton as={IconButton} icon={<Filter size={16} />} size="sm" variant="ghost" />
            <MenuList>
              <MenuItem onClick={() => setFilter({})}>
                Tüm Bildirimler
              </MenuItem>
              <MenuItem onClick={() => setFilter({ isRead: false })}>
                Okunmamış
              </MenuItem>
              <MenuItem onClick={() => setFilter({ isRead: true })}>
                Okunmuş
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setFilter({ priority: 'urgent' })}>
                Acil
              </MenuItem>
              <MenuItem onClick={() => setFilter({ priority: 'high' })}>
                Yüksek Öncelik
              </MenuItem>
            </MenuList>
          </Menu>
          {unreadCount > 0 && (
            <Button size="sm" onClick={onMarkAllAsRead}>
              Tümünü Okundu İşaretle
            </Button>
          )}
          <Menu>
            <MenuButton as={IconButton} icon={<MoreVertical size={16} />} size="sm" variant="ghost" />
            <MenuList>
              <MenuItem onClick={onClearAll} color="red.500">
                Tümünü Temizle
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Notifications List */}
      <VStack spacing={2} align="stretch">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                Bildirim bulunamadı
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
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {notification.message}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </Box>
                  <VStack spacing={1}>
                    <Tooltip label={notification.isRead ? 'Okunmamış işaretle' : 'Okundu işaretle'}>
                      <IconButton
                        icon={notification.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Sil">
                      <IconButton
                        icon={<X size={14} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
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