import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Input,
  Button,
  useToast,
  SimpleGrid,
  Heading,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { Settings, Mail, MessageSquare, Bell, Clock, Save } from 'react-feather';
import {
  NotificationSettingsUI,
  NotificationType,
  NOTIFICATION_TYPE_LABELS
} from '../types/notificationTypes';
import { useNotifications } from '../context/NotificationContext';

interface NotificationSettingsProps {
  showHeader?: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  showHeader = true
}) => {
  const { settings, loading, updateSettings } = useNotifications();
  const [localSettings, setLocalSettings] = useState<NotificationSettingsUI | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleToggleNotificationType = (type: NotificationType) => {
    if (!localSettings) return;
    
    setLocalSettings(prev => prev ? ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type]
      }
    }) : null);
  };

  const handleToggleMainSetting = (key: keyof Pick<NotificationSettingsUI, 'emailNotifications' | 'smsNotifications' | 'pushNotifications'>) => {
    if (!localSettings) return;
    
    setLocalSettings(prev => prev ? ({
      ...prev,
      [key]: !prev[key]
    }) : null);
  };

  const handleQuietHoursChange = (field: 'enabled' | 'start' | 'end', value: boolean | string) => {
    if (!localSettings) return;
    
    setLocalSettings(prev => prev ? ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }) : null);
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    setSaving(true);
    try {
      await updateSettings(localSettings);
      toast({
        title: 'Bildirim ayarları güncellendi',
        description: 'Ayarlarınız başarıyla kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: NotificationSettingsUI = {
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
    };
    setLocalSettings(defaultSettings);
  };

  if (loading || !localSettings) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4} color="gray.500">
          Ayarlar yükleniyor...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack mb={4}>
          <Icon as={Settings} boxSize={5} />
          <Heading size="md">Bildirim Ayarları</Heading>
        </HStack>

        {/* Main Notification Settings */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Genel Bildirim Ayarları</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <HStack flex={1}>
                  <Icon as={Mail} boxSize={4} />
                  <FormLabel mb={0}>E-posta Bildirimleri</FormLabel>
                </HStack>
                <Switch
                  isChecked={localSettings.emailNotifications}
                  onChange={() => handleToggleMainSetting('emailNotifications')}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <HStack flex={1}>
                  <Icon as={MessageSquare} boxSize={4} />
                  <FormLabel mb={0}>SMS Bildirimleri</FormLabel>
                </HStack>
                <Switch
                  isChecked={localSettings.smsNotifications}
                  onChange={() => handleToggleMainSetting('smsNotifications')}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <HStack flex={1}>
                  <Icon as={Bell} boxSize={4} />
                  <FormLabel mb={0}>Tarayıcı Bildirimleri</FormLabel>
                </HStack>
                <Switch
                  isChecked={localSettings.pushNotifications}
                  onChange={() => handleToggleMainSetting('pushNotifications')}
                  colorScheme="blue"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Notification Types */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="sm">Bildirim Türleri</Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Hangi tür bildirimler almak istediğinizi seçin
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
                <FormControl key={type} display="flex" alignItems="center">
                  <FormLabel mb={0} flex={1}>
                    {label}
                  </FormLabel>
                  <Switch
                    isChecked={localSettings.notificationTypes[type as NotificationType]}
                    onChange={() => handleToggleNotificationType(type as NotificationType)}
                    colorScheme="blue"
                  />
                </FormControl>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Quiet Hours */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <Icon as={Clock} boxSize={4} />
              <Heading size="sm">Sessiz Saatler</Heading>
            </HStack>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Belirtilen saatler arasında bildirim almayın
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0} flex={1}>
                  Sessiz saatleri etkinleştir
                </FormLabel>
                <Switch
                  isChecked={localSettings.quietHours.enabled}
                  onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>

              {localSettings.quietHours.enabled && (
                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">Başlangıç</FormLabel>
                    <Input
                      type="time"
                      value={localSettings.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      size="sm"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Bitiş</FormLabel>
                    <Input
                      type="time"
                      value={localSettings.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      size="sm"
                    />
                  </FormControl>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack justify="flex-end" spacing={3}>
          <Button variant="outline" onClick={handleResetSettings} isDisabled={saving}>
            Varsayılana Sıfırla
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSaveSettings}
            isLoading={saving}
            loadingText="Kaydediliyor..."
            leftIcon={<Icon as={Save} />}
          >
            Ayarları Kaydet
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default NotificationSettings;