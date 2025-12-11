import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Select,
  Textarea,
  useToast,
  Card,
  CardBody,
  Text,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Image,
  Icon,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Stack,
  RadioGroup,
  Radio,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  FiUser,
  FiBell,
  FiShield,
  FiKey,
  FiHardDrive,
  FiCreditCard,
  FiPackage,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiDownload,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiRefreshCw,
  FiSave,
  FiSettings,
  FiCamera,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiHome,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiSmartphone,
  FiMonitor,
  FiVolume2,
  FiVolumeX,
  FiWifi,
  FiWifiOff,
  FiDatabase,
  FiCloud,
  FiFolder,
  FiArchive,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiLayout
} from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppearanceSettings from './AppearanceSettings';
import {
  companySettingsService,
  notificationSettingsService,
  securitySettingsService,
  apiKeysService,
  backupSettingsService,
  type CompanySettings,
  type UserNotificationSettings,
  type SecuritySettings,
  type ApiKey,
  type BackupSettings
} from '../../../services/settingsService';
import { useAuth } from '../../../context/AuthContext';

const Settings = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Modal states
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isApiKeyModalOpen, onOpen: onApiKeyModalOpen, onClose: onApiKeyModalClose } = useDisclosure();
  const { isOpen: isDeleteApiKeyModalOpen, onOpen: onDeleteApiKeyModalOpen, onClose: onDeleteApiKeyModalClose } = useDisclosure();

  // Local states
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: [] as string[] });
  const [showApiKey, setShowApiKey] = useState<string>('');
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  
  // Local form states
  const [localCompanySettings, setLocalCompanySettings] = useState<Partial<CompanySettings>>({});
  const [localNotificationSettings, setLocalNotificationSettings] = useState<Partial<UserNotificationSettings>>({});
  const [localSecuritySettings, setLocalSecuritySettings] = useState<Partial<SecuritySettings>>({});
  const [localBackupSettings, setLocalBackupSettings] = useState<Partial<BackupSettings>>({});

  // Fetch data with React Query
  const { data: companySettings, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: companySettingsService.getCompanySettings
  });

  const { data: notificationSettings, isLoading: isNotificationLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: notificationSettingsService.getNotificationSettings
  });

  const { data: securitySettings, isLoading: isSecurityLoading } = useQuery({
    queryKey: ['securitySettings'],
    queryFn: securitySettingsService.getSecuritySettings
  });

  const { data: apiKeys = [], isLoading: isApiKeysLoading } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: apiKeysService.getApiKeys
  });

  const { data: backupSettings, isLoading: isBackupLoading } = useQuery({
    queryKey: ['backupSettings'],
    queryFn: backupSettingsService.getBackupSettings
  });

  // Sync server data to local state
  React.useEffect(() => {
    if (companySettings) {
      setLocalCompanySettings(companySettings);
    }
  }, [companySettings]);

  React.useEffect(() => {
    if (notificationSettings) {
      setLocalNotificationSettings(notificationSettings);
    }
  }, [notificationSettings]);

  React.useEffect(() => {
    if (securitySettings) {
      setLocalSecuritySettings(securitySettings);
    }
  }, [securitySettings]);

  React.useEffect(() => {
    if (backupSettings) {
      setLocalBackupSettings(backupSettings);
    }
  }, [backupSettings]);

  // Mutations
  const updateCompanyMutation = useMutation({
    mutationFn: companySettingsService.updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      toast({
        title: 'Başarılı',
        description: 'Şirket ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Şirket ayarları güncellenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const updateNotificationMutation = useMutation({
    mutationFn: notificationSettingsService.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      toast({
        title: 'Başarılı',
        description: 'Bildirim ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Bildirim ayarları güncellenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const updateSecurityMutation = useMutation({
    mutationFn: securitySettingsService.updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      toast({
        title: 'Başarılı',
        description: 'Güvenlik ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Güvenlik ayarları güncellenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: apiKeysService.createApiKey,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowApiKey(data.key || '');
      setNewApiKey({ name: '', permissions: [] });
      onApiKeyModalClose();
      toast({
        title: 'Başarılı',
        description: 'API anahtarı oluşturuldu',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'API anahtarı oluşturulurken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: apiKeysService.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      onDeleteApiKeyModalClose();
      toast({
        title: 'Başarılı',
        description: 'API anahtarı silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'API anahtarı silinirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const updateBackupMutation = useMutation({
    mutationFn: backupSettingsService.updateBackupSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backupSettings'] });
      toast({
        title: 'Başarılı',
        description: 'Yedekleme ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Yedekleme ayarları güncellenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Handler functions - sadece local state'i güncelle
  const handleCompanyChange = (field: keyof CompanySettings, value: any) => {
    setLocalCompanySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof UserNotificationSettings, value: any) => {
    setLocalNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: any) => {
    setLocalSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBackupChange = (field: keyof BackupSettings, value: any) => {
    setLocalBackupSettings(prev => ({ ...prev, [field]: value }));
  };

  // Kaydet fonksiyonları
  const handleSaveCompanySettings = () => {
    updateCompanyMutation.mutate(localCompanySettings);
  };

  const handleSaveNotificationSettings = () => {
    updateNotificationMutation.mutate(localNotificationSettings);
  };

  const handleSaveSecuritySettings = () => {
    updateSecurityMutation.mutate(localSecuritySettings);
  };

  const handleSaveBackupSettings = () => {
    updateBackupMutation.mutate(localBackupSettings);
  };

  const handleCreateApiKey = () => {
    if (!newApiKey.name.trim()) {
      toast({
        title: 'Hata',
        description: 'API anahtarı adı gereklidir',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createApiKeyMutation.mutate(newApiKey);
  };

  const handleDeleteApiKey = (id: string) => {
    setSelectedApiKeyId(id);
    onDeleteApiKeyModalOpen();
  };

  const confirmDeleteApiKey = () => {
    deleteApiKeyMutation.mutate(selectedApiKeyId);
  };

  const handleBackup = async () => {
    setIsBackupInProgress(true);
    try {
      const result = await backupSettingsService.createBackup();
      toast({
        title: result.success ? 'Başarılı' : 'Hata',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      });
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['backupSettings'] });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Yedekleme sırasında hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsBackupInProgress(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Kopyalandı',
      description: 'API anahtarı panoya kopyalandı',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (isCompanyLoading || isNotificationLoading || isSecurityLoading || isApiKeysLoading || isBackupLoading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Ayarlar</Heading>
          <Text color="gray.600">Sistem ayarlarınızı yönetin</Text>
        </Box>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><FiUser /> Profil</Tab>
            <Tab><FiLayout /> Görünüm</Tab>
            <Tab><FiBell /> Bildirimler</Tab>
            <Tab><FiShield /> Güvenlik</Tab>
            <Tab><FiKey /> API Anahtarları</Tab>
            <Tab><FiHardDrive /> Yedekleme</Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Profil Kartı */}
                <Card>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md">Profil Bilgileri</Heading>
                      
                      {/* Profil Fotoğrafı Bölümü */}
                      <Box>
                        <FormLabel mb={3}>Profil Fotoğrafı</FormLabel>
                        <HStack spacing={6} align="start">
                          <Box position="relative">
                            <Box
                              w="120px"
                              h="120px"
                              borderRadius="full"
                              overflow="hidden"
                              border="4px solid"
                              borderColor="blue.500"
                              bg="gray.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {user?.avatar_url ? (
                                <Image
                                  src={user.avatar_url}
                                  alt="Profil"
                                  w="100%"
                                  h="100%"
                                  objectFit="cover"
                                />
                              ) : (
                                <Icon as={FiUser} boxSize={12} color="gray.400" />
                              )}
                            </Box>
                            <IconButton
                              aria-label="Fotoğraf değiştir"
                              icon={<FiCamera />}
                              size="sm"
                              colorScheme="blue"
                              borderRadius="full"
                              position="absolute"
                              bottom="0"
                              right="0"
                              onClick={() => {
                                toast({
                                  title: 'Yakında',
                                  description: 'Profil fotoğrafı yükleme özelliği yakında eklenecek',
                                  status: 'info',
                                  duration: 3000,
                                });
                              }}
                            />
                          </Box>
                          <VStack align="start" spacing={2} flex={1}>
                            <Text fontWeight="bold" fontSize="xl">
                              {user?.full_name || user?.email || 'Kullanıcı'}
                            </Text>
                            <Badge colorScheme={user?.role === 'admin' ? 'purple' : 'blue'} fontSize="sm">
                              {user?.role === 'admin' ? 'Yönetici' : 'Danışman'}
                            </Badge>
                            <Text fontSize="sm" color="gray.600">
                              <Icon as={FiMail} display="inline" mr={2} />
                              {user?.email}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Üyelik: {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      <Divider />

                      {/* Kişisel Bilgiler */}
                      <Box>
                        <Heading size="sm" mb={4}>Kişisel Bilgiler</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiUser} display="inline" mr={2} />
                              Ad Soyad
                            </FormLabel>
                            <Input
                              value={user?.full_name || ''}
                              placeholder="Adınız ve soyadınız"
                              isReadOnly
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiMail} display="inline" mr={2} />
                              E-posta
                            </FormLabel>
                            <Input
                              type="email"
                              value={user?.email || ''}
                              placeholder="email@example.com"
                              isReadOnly
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiPhone} display="inline" mr={2} />
                              Telefon
                            </FormLabel>
                            <Input
                              value={user?.phone || ''}
                              placeholder="+90 555 123 4567"
                              onChange={(e) => {
                                // Telefon güncelleme fonksiyonu eklenebilir
                              }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiMapPin} display="inline" mr={2} />
                              Şehir
                            </FormLabel>
                            <Input
                              value={localCompanySettings?.city || ''}
                              onChange={(e) => handleCompanyChange('city', e.target.value)}
                              placeholder="İstanbul"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </Box>

                      <Divider />

                      {/* Şirket Bilgileri */}
                      <Box>
                        <Heading size="sm" mb={4}>Şirket Bilgileri</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiHome} display="inline" mr={2} />
                              Şirket Adı
                            </FormLabel>
                            <Input
                              value={localCompanySettings?.company_name || ''}
                              onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                              placeholder="Şirket adınızı girin"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiMail} display="inline" mr={2} />
                              Şirket E-posta
                            </FormLabel>
                            <Input
                              type="email"
                              value={localCompanySettings?.email || ''}
                              onChange={(e) => handleCompanyChange('email', e.target.value)}
                              placeholder="info@sirket.com"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiPhone} display="inline" mr={2} />
                              Şirket Telefon
                            </FormLabel>
                            <Input
                              value={localCompanySettings?.phone || ''}
                              onChange={(e) => handleCompanyChange('phone', e.target.value)}
                              placeholder="+90 555 123 4567"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiGlobe} display="inline" mr={2} />
                              Web Sitesi
                            </FormLabel>
                            <Input
                              value={localCompanySettings?.website || ''}
                              onChange={(e) => handleCompanyChange('website', e.target.value)}
                              placeholder="www.sirket.com"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>
                              <Icon as={FiMapPin} display="inline" mr={2} />
                              Ülke
                            </FormLabel>
                            <Select
                              value={localCompanySettings?.country || 'TR'}
                              onChange={(e) => handleCompanyChange('country', e.target.value)}
                            >
                              <option value="TR">Türkiye</option>
                              <option value="US">Amerika Birleşik Devletleri</option>
                              <option value="DE">Almanya</option>
                              <option value="FR">Fransa</option>
                              <option value="GB">İngiltere</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                        <FormControl mt={4}>
                          <FormLabel>
                            <Icon as={FiMapPin} display="inline" mr={2} />
                            Adres
                          </FormLabel>
                          <Textarea
                            value={localCompanySettings?.address_line1 || ''}
                            onChange={(e) => handleCompanyChange('address_line1', e.target.value)}
                            placeholder="Şirket adresinizi girin"
                            rows={3}
                          />
                        </FormControl>
                      </Box>

                      <Divider />

                      {/* Hesap İstatistikleri */}
                      <Box>
                        <Heading size="sm" mb={4}>Hesap İstatistikleri</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                            <CardBody>
                              <Stat>
                                <StatLabel>Toplam İlan</StatLabel>
                                <StatNumber>-</StatNumber>
                                <StatHelpText>Aktif ilanlarınız</StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                          <Card bg="green.50" borderColor="green.200" borderWidth="1px">
                            <CardBody>
                              <Stat>
                                <StatLabel>Toplam Müşteri</StatLabel>
                                <StatNumber>-</StatNumber>
                                <StatHelpText>Kayıtlı müşteriler</StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                          <Card bg="purple.50" borderColor="purple.200" borderWidth="1px">
                            <CardBody>
                              <Stat>
                                <StatLabel>Toplam Randevu</StatLabel>
                                <StatNumber>-</StatNumber>
                                <StatHelpText>Bu ay</StatHelpText>
                              </Stat>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>

                      <HStack justify="flex-end" pt={4}>
                        <Button
                          variant="outline"
                          leftIcon={<FiRefreshCw />}
                          onClick={() => {
                            setLocalCompanySettings(companySettings || {});
                            toast({
                              title: 'Sıfırlandı',
                              description: 'Değişiklikler geri alındı',
                              status: 'info',
                              duration: 2000,
                            });
                          }}
                        >
                          Sıfırla
                        </Button>
                        <Button
                          leftIcon={<FiSave />}
                          colorScheme="blue"
                          onClick={handleSaveCompanySettings}
                          isLoading={updateCompanyMutation.isPending}
                        >
                          Değişiklikleri Kaydet
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Appearance Tab */}
            <TabPanel>
              <AppearanceSettings />
            </TabPanel>

            {/* Notifications Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">E-posta Bildirimleri</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>E-posta bildirimleri</Text>
                          <Switch
                            isChecked={localNotificationSettings?.email_notifications || false}
                            onChange={(e) => handleNotificationChange('email_notifications', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Yeni mülk bildirimleri</Text>
                          <Switch
                            isChecked={localNotificationSettings?.email_new_properties || false}
                            onChange={(e) => handleNotificationChange('email_new_properties', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Müşteri sorguları</Text>
                          <Switch
                            isChecked={localNotificationSettings?.email_customer_inquiries || false}
                            onChange={(e) => handleNotificationChange('email_customer_inquiries', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Randevu hatırlatmaları</Text>
                          <Switch
                            isChecked={localNotificationSettings?.email_appointment_reminders || false}
                            onChange={(e) => handleNotificationChange('email_appointment_reminders', e.target.checked)}
                          />
                        </HStack>
                      </VStack>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="blue"
                        onClick={handleSaveNotificationSettings}
                        isLoading={updateNotificationMutation.isPending}
                        mt={4}
                      >
                        Kaydet
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">SMS Bildirimleri</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>SMS bildirimleri</Text>
                          <Switch
                            isChecked={localNotificationSettings?.sms_notifications || false}
                            onChange={(e) => handleNotificationChange('sms_notifications', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Sadece acil durumlar</Text>
                          <Switch
                            isChecked={localNotificationSettings?.sms_urgent_only || false}
                            onChange={(e) => handleNotificationChange('sms_urgent_only', e.target.checked)}
                          />
                        </HStack>
                      </VStack>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="blue"
                        onClick={handleSaveNotificationSettings}
                        isLoading={updateNotificationMutation.isPending}
                        mt={4}
                      >
                        Kaydet
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">Şifre Ayarları</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Şifre geçerlilik süresi (gün)</FormLabel>
                          <NumberInput
                            value={localSecuritySettings?.password_expiry_days || 90}
                            onChange={(_, value) => handleSecurityChange('password_expiry_days', value)}
                            min={30}
                            max={365}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Oturum zaman aşımı (dakika)</FormLabel>
                          <NumberInput
                            value={localSecuritySettings?.session_timeout_minutes || 30}
                            onChange={(_, value) => handleSecurityChange('session_timeout_minutes', value)}
                            min={5}
                            max={480}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>İki faktörlü kimlik doğrulama</Text>
                          <Switch
                            isChecked={localSecuritySettings?.two_factor_enabled || false}
                            onChange={(e) => handleSecurityChange('two_factor_enabled', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Giriş bildirimleri</Text>
                          <Switch
                            isChecked={localSecuritySettings?.login_notifications || false}
                            onChange={(e) => handleSecurityChange('login_notifications', e.target.checked)}
                          />
                        </HStack>
                      </VStack>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="blue"
                        onClick={handleSaveSecuritySettings}
                        isLoading={updateSecurityMutation.isPending}
                        mt={4}
                      >
                        Kaydet
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* API Keys Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">API Anahtarları</Heading>
                  <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onApiKeyModalOpen}>
                    Yeni Anahtar
                  </Button>
                </HStack>

                {showApiKey && (
                  <Alert status="success">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>API Anahtarı Oluşturuldu!</AlertTitle>
                      <AlertDescription>
                        <HStack>
                          <Text fontFamily="mono" fontSize="sm">{showApiKey}</Text>
                          <IconButton
                            aria-label="Kopyala"
                            icon={<FiCopy />}
                            size="sm"
                            onClick={() => copyToClipboard(showApiKey)}
                          />
                        </HStack>
                        <Text fontSize="sm" mt={2}>
                          Bu anahtarı güvenli bir yerde saklayın. Tekrar gösterilmeyecektir.
                        </Text>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <Card>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Ad</Th>
                            <Th>Anahtar</Th>
                            <Th>Durum</Th>
                            <Th>Son Kullanım</Th>
                            <Th>İşlemler</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {apiKeys.map((key) => (
                            <Tr key={key.id}>
                              <Td>{key.name}</Td>
                              <Td fontFamily="mono">{key.key_prefix}</Td>
                              <Td>
                                <Badge colorScheme={key.is_active ? 'green' : 'red'}>
                                  {key.is_active ? 'Aktif' : 'Pasif'}
                                </Badge>
                              </Td>
                              <Td>{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('tr-TR') : 'Hiç'}</Td>
                              <Td>
                                <IconButton
                                  aria-label="Sil"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteApiKey(key.id!)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Backup Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">Yedekleme Ayarları</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>Otomatik yedekleme</Text>
                          <Switch
                            isChecked={localBackupSettings?.auto_backup_enabled || false}
                            onChange={(e) => handleBackupChange('auto_backup_enabled', e.target.checked)}
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Bulut depolama</Text>
                          <Switch
                            isChecked={localBackupSettings?.cloud_storage_enabled || false}
                            onChange={(e) => handleBackupChange('cloud_storage_enabled', e.target.checked)}
                          />
                        </HStack>
                      </VStack>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Yedekleme sıklığı</FormLabel>
                          <Select
                            value={localBackupSettings?.backup_frequency || 'daily'}
                            onChange={(e) => handleBackupChange('backup_frequency', e.target.value)}
                          >
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Saklama süresi (gün)</FormLabel>
                          <NumberInput
                            value={localBackupSettings?.backup_retention_days || 30}
                            onChange={(_, value) => handleBackupChange('backup_retention_days', value)}
                            min={1}
                            max={365}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="blue"
                        onClick={handleSaveBackupSettings}
                        isLoading={updateBackupMutation.isPending}
                        mt={4}
                      >
                        Kaydet
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">Manuel Yedekleme</Heading>
                      <HStack>
                        <Button
                          leftIcon={<FiDownload />}
                          colorScheme="blue"
                          onClick={handleBackup}
                          isLoading={isBackupInProgress}
                          loadingText="Yedekleniyor..."
                        >
                          Şimdi Yedekle
                        </Button>
                      </HStack>
                      {backupSettings?.last_backup_at && (
                        <Text fontSize="sm" color="gray.600">
                          Son yedekleme: {new Date(backupSettings.last_backup_at).toLocaleString('tr-TR')}
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* API Key Creation Modal */}
      <Modal isOpen={isApiKeyModalOpen} onClose={onApiKeyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni API Anahtarı</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Anahtar Adı</FormLabel>
                <Input
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  placeholder="API anahtarı adını girin"
                />
              </FormControl>
              <FormControl>
                <FormLabel>İzinler</FormLabel>
                <CheckboxGroup
                  value={newApiKey.permissions}
                  onChange={(value) => setNewApiKey({ ...newApiKey, permissions: value as string[] })}
                >
                  <Stack>
                    <Checkbox value="read">Okuma</Checkbox>
                    <Checkbox value="write">Yazma</Checkbox>
                    <Checkbox value="delete">Silme</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApiKeyModalClose}>
              İptal
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateApiKey}
              isLoading={createApiKeyMutation.isPending}
            >
              Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* API Key Deletion Modal */}
      <Modal isOpen={isDeleteApiKeyModalOpen} onClose={onDeleteApiKeyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>API Anahtarını Sil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Bu API anahtarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteApiKeyModalClose}>
              İptal
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteApiKey}
              isLoading={deleteApiKeyMutation.isPending}
            >
              Sil
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Settings;