import { useState, useRef, useCallback, memo } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Button, Flex, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input,
  Select, Switch, Textarea, useToast, Avatar, AvatarBadge, IconButton,
  Badge, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { 
  User, Settings as SettingsIcon, Bell, Shield, Database, Key, Upload, Edit, Trash2,
  Plus, Save
} from 'react-feather';

const Settings = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // Profile state
  const [userProfile, setUserProfile] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90 555 123 4567',
    avatar: '',
    bio: 'Deneyimli emlak uzmanı',
    website: 'www.ahmetyilmaz.com',
    address: 'İstanbul, Türkiye',
    specialties: ['Konut', 'Ticari', 'Arsa']
  });

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    name: 'ABC Emlak',
    address: 'Merkez Mahallesi, İstanbul',
    phone: '+90 212 555 0123',
    email: 'info@abcemlak.com',
    website: 'www.abcemlak.com',
    taxNumber: '1234567890',
    logo: ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    newPropertyAlerts: true,
    appointmentReminders: true,
    systemUpdates: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API', key: 'pk_live_...', status: 'active', created: '2024-01-15' },
    { id: 2, name: 'Development API', key: 'pk_test_...', status: 'active', created: '2024-01-10' }
  ]);



  // Backup settings state
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    cloudStorage: true,
    lastBackup: '2024-01-20 14:30'
  });



  // Modal states
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isApiKeyModalOpen, onOpen: onApiKeyModalOpen, onClose: onApiKeyModalClose } = useDisclosure();
  const { isOpen: isDeleteApiKeyAlertOpen, onOpen: onDeleteApiKeyAlertOpen, onClose: onDeleteApiKeyAlertClose } = useDisclosure();

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newApiKey, setNewApiKey] = useState({ name: '', environment: 'production' });
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<number | null>(null);

  // Handlers
  const handleProfileChange = useCallback((field: string, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCompanyChange = useCallback((field: string, value: string) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNotificationToggle = useCallback((field: string) => {
    setNotificationSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  }, []);

  const handleSecurityToggle = useCallback((field: string) => {
    setSecuritySettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  }, []);

  const handleSecurityInputChange = useCallback((field: string, value: string) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBackupToggle = useCallback((field: string) => {
    setBackupSettings(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  }, []);

  const handleBackupInputChange = useCallback((field: string, value: string) => {
    setBackupSettings(prev => ({ ...prev, [field]: value }));
  }, []);



  const handleAvatarUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCreateApiKey = useCallback(() => {
    const newKey = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: `pk_${newApiKey.environment === 'production' ? 'live' : 'test'}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active' as const,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys(prev => [...prev, newKey]);
    setNewApiKey({ name: '', environment: 'production' });
    onApiKeyModalClose();
    toast({
      title: 'API Anahtarı oluşturuldu',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [apiKeys.length, newApiKey, onApiKeyModalClose, toast]);

  const handleDeleteApiKey = useCallback(() => {
    if (selectedApiKeyId) {
      setApiKeys(prev => prev.filter(key => key.id !== selectedApiKeyId));
      setSelectedApiKeyId(null);
      onDeleteApiKeyAlertClose();
      toast({
        title: 'API Anahtarı silindi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedApiKeyId, onDeleteApiKeyAlertClose, toast]);



  const handlePasswordChange = useCallback(() => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Şifreler eşleşmiyor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    toast({
      title: 'Şifre güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setNewPassword('');
    setConfirmPassword('');
    onPasswordModalClose();
  }, [newPassword, confirmPassword, toast, onPasswordModalClose]);

  const handleProfileUpdate = useCallback(() => {
    toast({
      title: 'Profil güncellendi',
      description: 'Profil bilgileriniz başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleCompanyUpdate = useCallback(() => {
    toast({
      title: 'Şirket bilgileri güncellendi',
      description: 'Şirket ayarları başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleNotificationUpdate = useCallback(() => {
    toast({
      title: 'Bildirim ayarları güncellendi',
      description: 'Bildirim tercihleri başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleSecurityUpdate = useCallback(() => {
    toast({
      title: 'Güvenlik ayarları güncellendi',
      description: 'Güvenlik ayarları başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleBackupUpdate = useCallback(() => {
    toast({
      title: 'Yedekleme ayarları güncellendi',
      description: 'Yedekleme ayarları başarıyla güncellendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);



  const handleManualBackup = useCallback(() => {
    toast({
      title: 'Yedekleme başlatıldı',
      description: 'Manuel yedekleme işlemi başlatıldı.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    setTimeout(() => {
      toast({
        title: 'Yedekleme tamamlandı',
        description: 'Verileriniz başarıyla yedeklendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  }, [toast]);

  const handleRestoreBackup = useCallback(() => {
    toast({
      title: 'Geri yükleme başlatıldı',
      description: 'Yedekten geri yükleme işlemi başlatıldı.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box p={4}>
      <Heading mb={6}>Ayarlar</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab><Icon as={User} mr={2} /> Profil</Tab>
          <Tab><Icon as={SettingsIcon} mr={2} /> Şirket</Tab>
          <Tab><Icon as={Bell} mr={2} /> Bildirimler</Tab>
          <Tab><Icon as={Shield} mr={2} /> Güvenlik</Tab>
          <Tab><Icon as={Key} mr={2} /> API Anahtarları</Tab>
          <Tab><Icon as={Database} mr={2} /> Yedekleme</Tab>
        </TabList>

        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Kişisel Profil Ayarları</Heading>
              
              <HStack spacing={6} align="start">
                <VStack>
                  <Avatar size="xl" src={userProfile.avatar} name={userProfile.name}>
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                  <Button size="sm" leftIcon={<Upload size={16} />} onClick={handleAvatarUpload}>
                    Fotoğraf Yükle
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </VStack>
                
                <VStack flex={1} spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input
                        value={userProfile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        bg={inputBg}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>E-posta</FormLabel>
                      <Input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        bg={inputBg}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Telefon</FormLabel>
                      <Input
                        value={userProfile.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        bg={inputBg}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Website</FormLabel>
                      <Input
                        value={userProfile.website}
                        onChange={(e) => handleProfileChange('website', e.target.value)}
                        bg={inputBg}
                      />
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Adres</FormLabel>
                    <Input
                      value={userProfile.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      bg={inputBg}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Biyografi</FormLabel>
                    <Textarea
                      value={userProfile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      bg={inputBg}
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </HStack>
              
              <Flex justify="flex-end">
                <Button colorScheme="blue" leftIcon={<Save size={16} />} onClick={handleProfileUpdate}>
                  Profili Güncelle
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* Company Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Şirket Ayarları</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Şirket Adı</FormLabel>
                  <Input
                    value={companySettings.name}
                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Vergi Numarası</FormLabel>
                  <Input
                    value={companySettings.taxNumber}
                    onChange={(e) => handleCompanyChange('taxNumber', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefon</FormLabel>
                  <Input
                    value={companySettings.phone}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>E-posta</FormLabel>
                  <Input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={companySettings.website}
                    onChange={(e) => handleCompanyChange('website', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Adres</FormLabel>
                <Textarea
                  value={companySettings.address}
                  onChange={(e) => handleCompanyChange('address', e.target.value)}
                  bg={inputBg}
                  rows={3}
                />
              </FormControl>
              
              <Flex justify="flex-end">
                <Button colorScheme="blue" leftIcon={<Save size={16} />} onClick={handleCompanyUpdate}>
                  Şirket Bilgilerini Güncelle
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Bildirim Ayarları</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>E-posta Bildirimleri</Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>Genel bildirimler</Text>
                      <Switch
                        isChecked={notificationSettings.emailNotifications}
                        onChange={() => handleNotificationToggle('emailNotifications')}
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Pazarlama e-postaları</Text>
                      <Switch
                        isChecked={notificationSettings.marketingEmails}
                        onChange={() => handleNotificationToggle('marketingEmails')}
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Yeni emlak bildirimleri</Text>
                      <Switch
                        isChecked={notificationSettings.newPropertyAlerts}
                        onChange={() => handleNotificationToggle('newPropertyAlerts')}
                      />
                    </HStack>
                  </VStack>
                </Box>
                
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>SMS Bildirimleri</Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>SMS bildirimleri</Text>
                      <Switch
                        isChecked={notificationSettings.smsNotifications}
                        onChange={() => handleNotificationToggle('smsNotifications')}
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Randevu hatırlatmaları</Text>
                      <Switch
                        isChecked={notificationSettings.appointmentReminders}
                        onChange={() => handleNotificationToggle('appointmentReminders')}
                      />
                    </HStack>
                  </VStack>
                </Box>
                
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>Push Bildirimleri</Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>Push bildirimleri</Text>
                      <Switch
                        isChecked={notificationSettings.pushNotifications}
                        onChange={() => handleNotificationToggle('pushNotifications')}
                      />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Sistem güncellemeleri</Text>
                      <Switch
                        isChecked={notificationSettings.systemUpdates}
                        onChange={() => handleNotificationToggle('systemUpdates')}
                      />
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
              
              <Flex justify="flex-end">
                <Button colorScheme="blue" leftIcon={<Save size={16} />} onClick={handleNotificationUpdate}>
                  Bildirim Ayarlarını Güncelle
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Güvenlik Ayarları</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>Kimlik Doğrulama</Heading>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">İki Faktörlü Kimlik Doğrulama</Text>
                        <Text fontSize="sm" color={textColor}>Hesabınız için ek güvenlik katmanı</Text>
                      </VStack>
                      <Switch
                        isChecked={securitySettings.twoFactorAuth}
                        onChange={() => handleSecurityToggle('twoFactorAuth')}
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Giriş Bildirimleri</Text>
                        <Text fontSize="sm" color={textColor}>Yeni giriş yapıldığında bildirim al</Text>
                      </VStack>
                      <Switch
                        isChecked={securitySettings.loginAlerts}
                        onChange={() => handleSecurityToggle('loginAlerts')}
                      />
                    </HStack>
                    
                    <Button
                      leftIcon={<Key size={16} />}
                      onClick={onPasswordModalOpen}
                      variant="outline"
                      size="sm"
                      alignSelf="flex-start"
                    >
                      Şifre Değiştir
                    </Button>
                  </VStack>
                </Box>
                
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>Oturum Ayarları</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Oturum Zaman Aşımı (dakika)</FormLabel>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityInputChange('sessionTimeout', e.target.value)}
                        bg={inputBg}
                      >
                        <option value="15">15 dakika</option>
                        <option value="30">30 dakika</option>
                        <option value="60">1 saat</option>
                        <option value="120">2 saat</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Şifre Geçerlilik Süresi (gün)</FormLabel>
                      <Select
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => handleSecurityInputChange('passwordExpiry', e.target.value)}
                        bg={inputBg}
                      >
                        <option value="30">30 gün</option>
                        <option value="60">60 gün</option>
                        <option value="90">90 gün</option>
                        <option value="180">180 gün</option>
                        <option value="365">1 yıl</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              </VStack>
              
              <Flex justify="flex-end">
                <Button colorScheme="blue" leftIcon={<Save size={16} />} onClick={handleSecurityUpdate}>
                  Güvenlik Ayarlarını Güncelle
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* API Keys Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">API Anahtarları</Heading>
                <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={onApiKeyModalOpen}>
                  Yeni API Anahtarı
                </Button>
              </HStack>
              
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Ad</Th>
                      <Th>Anahtar</Th>
                      <Th>Durum</Th>
                      <Th>Oluşturulma</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {apiKeys.map((key) => (
                      <Tr key={key.id}>
                        <Td fontWeight="medium">{key.name}</Td>
                        <Td fontFamily="mono" fontSize="sm">{key.key}</Td>
                        <Td>
                          <Badge colorScheme={key.status === 'active' ? 'green' : 'red'}>
                            {key.status === 'active' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </Td>
                        <Td>{key.created}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Düzenle"
                              icon={<Edit size={16} />}
                              size="sm"
                              variant="ghost"
                            />
                            <IconButton
                              aria-label="Sil"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => {
                                setSelectedApiKeyId(key.id);
                                onDeleteApiKeyAlertOpen();
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </TabPanel>



          {/* Backup Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Yedekleme Ayarları</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>Otomatik Yedekleme</Heading>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Otomatik Yedekleme</Text>
                        <Text fontSize="sm" color={textColor}>Verilerinizi otomatik olarak yedekle</Text>
                      </VStack>
                      <Switch
                        isChecked={backupSettings.autoBackup}
                        onChange={() => handleBackupToggle('autoBackup')}
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Bulut Depolama</Text>
                        <Text fontSize="sm" color={textColor}>Yedekleri bulutta sakla</Text>
                      </VStack>
                      <Switch
                        isChecked={backupSettings.cloudStorage}
                        onChange={() => handleBackupToggle('cloudStorage')}
                      />
                    </HStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Yedekleme Sıklığı</FormLabel>
                        <Select
                          value={backupSettings.backupFrequency}
                          onChange={(e) => handleBackupInputChange('backupFrequency', e.target.value)}
                          bg={inputBg}
                        >
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Saklama Süresi (gün)</FormLabel>
                        <Select
                          value={backupSettings.retentionPeriod}
                          onChange={(e) => handleBackupInputChange('retentionPeriod', e.target.value)}
                          bg={inputBg}
                        >
                          <option value="7">7 gün</option>
                          <option value="30">30 gün</option>
                          <option value="90">90 gün</option>
                          <option value="365">1 yıl</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </VStack>
                </Box>
                
                <Box p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4}>Manuel İşlemler</Heading>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Son Yedekleme</Text>
                        <Text fontSize="sm" color={textColor}>{backupSettings.lastBackup}</Text>
                      </VStack>
                      <HStack>
                        <Button
                          leftIcon={<Database size={16} />}
                          onClick={handleManualBackup}
                          size="sm"
                        >
                          Manuel Yedekle
                        </Button>
                        <Button
                          leftIcon={<Upload size={16} />}
                          onClick={handleRestoreBackup}
                          variant="outline"
                          size="sm"
                        >
                          Geri Yükle
                        </Button>
                      </HStack>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
              
              <Flex justify="flex-end">
                <Button colorScheme="blue" leftIcon={<Save size={16} />} onClick={handleBackupUpdate}>
                  Yedekleme Ayarlarını Güncelle
                </Button>
              </Flex>
            </VStack>
          </TabPanel>




        </TabPanels>
      </Tabs>

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Şifre Değiştir</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Yeni Şifre</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Şifre Tekrarı</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordModalClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordChange}>
              Şifreyi Güncelle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New API Key Modal */}
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
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Production API"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Ortam</FormLabel>
                <Select
                  value={newApiKey.environment}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, environment: e.target.value }))}
                >
                  <option value="production">Production</option>
                  <option value="development">Development</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApiKeyModalClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleCreateApiKey}>
              Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>



      {/* Delete API Key Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteApiKeyAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteApiKeyAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              API Anahtarını Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Bu API anahtarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteApiKeyAlertClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteApiKey} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default memo(Settings);