import { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Button, Flex, SimpleGrid, Divider,
  Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input,
  Select, Switch, Textarea, useToast, Avatar, AvatarBadge, IconButton,
  Badge, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Tooltip
} from '@chakra-ui/react';
import { 
  User, Settings as SettingsIcon, Bell, Shield, Database, Key, Upload, X, Edit, Trash2,
  Plus, Save, Mail, Phone, Globe, MapPin, FileText, Users, DollarSign, AlertTriangle, Calendar
} from 'react-feather';
import { useRef } from 'react';

const Settings = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 555 123 4567',
    position: 'Emlak Danışmanı',
    bio: 'İstanbul bölgesinde 5 yıllık deneyime sahip emlak danışmanı. Konut ve ticari gayrimenkul satış ve kiralama konusunda uzman.',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  });
  
  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    name: 'ABC Emlak',
    email: 'info@abcemlak.com',
    phone: '+90 212 456 7890',
    address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
    website: 'www.abcemlak.com',
    taxId: '1234567890',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik02MCA2MEg5MFY5MEg2MFY2MFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    newPropertyAlerts: true,
    customerInquiries: true,
    appointmentReminders: true,
    marketingUpdates: false,
    systemUpdates: true,
  });
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
  });
  
  // API keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Web Sitesi Entegrasyonu', key: 'demo_key_abcdefghijklmnopqrstuvwxyz123456', status: 'active', created: '15.06.2023' },
    { id: 2, name: 'Mobil Uygulama', key: 'demo_key_zyxwvutsrqponmlkjihgfedcba654321', status: 'active', created: '20.07.2023' },
    { id: 3, name: 'Sahibinden.com API', key: 'demo_key_123456abcdefghijklmnopqrstuvwxyz', status: 'inactive', created: '10.08.2023' },
  ]);
  
  // User management state
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@example.com', role: 'admin', status: 'active', lastLogin: '25.11.2023 14:30' },
    { id: 2, name: 'Ayşe Demir', email: 'ayse.demir@example.com', role: 'agent', status: 'active', lastLogin: '25.11.2023 10:15' },
    { id: 3, name: 'Mehmet Kaya', email: 'mehmet.kaya@example.com', role: 'agent', status: 'active', lastLogin: '24.11.2023 16:45' },
    { id: 4, name: 'Zeynep Aydın', email: 'zeynep.aydin@example.com', role: 'agent', status: 'inactive', lastLogin: '20.11.2023 09:20' },
  ]);
  
  // Backup settings state
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionPeriod: '30',
    lastBackup: '25.11.2023 02:00',
    backupLocation: 'cloud',
  });
  
  // Commission settings state
  const [commissionSettings, setCommissionSettings] = useState({
    saleCommissionRate: '3',
    rentalCommissionRate: '1',
    minimumCommission: '1000',
    splitCommission: true,
    referralCommission: '10',
  });
  
  // Modal states
  const { isOpen: isNewApiKeyOpen, onOpen: onNewApiKeyOpen, onClose: onNewApiKeyClose } = useDisclosure();
  const { isOpen: isNewUserOpen, onOpen: onNewUserOpen, onClose: onNewUserClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  
  // Alert dialog states
  const { isOpen: isDeleteUserOpen, onOpen: onDeleteUserOpen, onClose: onDeleteUserClose } = useDisclosure();
  const { isOpen: isDeleteApiKeyOpen, onOpen: onDeleteApiKeyOpen, onClose: onDeleteApiKeyClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // Selected item for deletion
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Form states
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'agent', password: '' });
  const [passwordChange, setPasswordChange] = useState({ current: '', new: '', confirm: '' });
  
  // Handle profile update
  const handleProfileUpdate = () => {
    toast({
      title: 'Profil güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle company settings update
  const handleCompanyUpdate = () => {
    toast({
      title: 'Şirket bilgileri güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = () => {
    toast({
      title: 'Bildirim ayarları güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle security settings update
  const handleSecurityUpdate = () => {
    toast({
      title: 'Güvenlik ayarları güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle backup settings update
  const handleBackupUpdate = () => {
    toast({
      title: 'Yedekleme ayarları güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle commission settings update
  const handleCommissionUpdate = () => {
    toast({
      title: 'Komisyon ayarları güncellendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onload = () => {
        setUserProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle new API key creation
  const handleCreateApiKey = () => {
    // In a real app, you would call an API to generate a key
    const newKeyObj = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: `demo_key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      status: 'active',
      created: new Date().toLocaleDateString('tr-TR'),
    };
    
    setApiKeys([...apiKeys, newKeyObj]);
    setNewApiKey({ name: '', description: '' });
    onNewApiKeyClose();
    
    toast({
      title: 'API anahtarı oluşturuldu',
      description: 'Yeni API anahtarı başarıyla oluşturuldu.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle API key deletion
  const handleDeleteApiKey = () => {
    if (selectedItemId) {
      setApiKeys(apiKeys.filter(key => key.id !== selectedItemId));
      setSelectedItemId(null);
      onDeleteApiKeyClose();
      
      toast({
        title: 'API anahtarı silindi',
        description: 'API anahtarı başarıyla silindi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle new user creation
  const handleCreateUser = () => {
    // In a real app, you would call an API to create a user
    const newUserObj = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: '-',
    };
    
    setUsers([...users, newUserObj]);
    setNewUser({ name: '', email: '', role: 'agent', password: '' });
    onNewUserClose();
    
    toast({
      title: 'Kullanıcı oluşturuldu',
      description: 'Yeni kullanıcı başarıyla oluşturuldu.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle user deletion
  const handleDeleteUser = () => {
    if (selectedItemId) {
      setUsers(users.filter(user => user.id !== selectedItemId));
      setSelectedItemId(null);
      onDeleteUserClose();
      
      toast({
        title: 'Kullanıcı silindi',
        description: 'Kullanıcı başarıyla silindi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle password change
  const handlePasswordChange = () => {
    // Validate password
    if (passwordChange.new !== passwordChange.confirm) {
      toast({
        title: 'Şifreler eşleşmiyor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // In a real app, you would call an API to change the password
    setPasswordChange({ current: '', new: '', confirm: '' });
    onPasswordClose();
    
    toast({
      title: 'Şifre değiştirildi',
      description: 'Şifreniz başarıyla değiştirildi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (field: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };
  
  // Handle security toggle
  const handleSecurityToggle = (field: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };
  
  // Handle backup toggle
  const handleBackupToggle = (field: string) => {
    setBackupSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };
  
  // Handle commission toggle
  const handleCommissionToggle = (field: string) => {
    setCommissionSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };
  
  // Handle input change for profile
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for company settings
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for security settings
  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for backup settings
  const handleBackupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBackupSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for commission settings
  const handleCommissionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCommissionSettings(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for new API key
  const handleNewApiKeyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewApiKey(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for new user
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for password change
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle manual backup
  const handleManualBackup = () => {
    toast({
      title: 'Yedekleme başlatıldı',
      description: 'Manuel yedekleme işlemi başlatıldı.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Simulate backup process
    setTimeout(() => {
      setBackupSettings(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      }));
      
      toast({
        title: 'Yedekleme tamamlandı',
        description: 'Manuel yedekleme işlemi başarıyla tamamlandı.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };
  
  // Handle restore backup
  const handleRestoreBackup = () => {
    toast({
      title: 'Geri yükleme başlatıldı',
      description: 'Yedekten geri yükleme işlemi başlatıldı.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // Simulate restore process
    setTimeout(() => {
      toast({
        title: 'Geri yükleme tamamlandı',
        description: 'Yedekten geri yükleme işlemi başarıyla tamamlandı.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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
          <Tab><Icon as={Users} mr={2} /> Kullanıcılar</Tab>
          <Tab><Icon as={Database} mr={2} /> Yedekleme</Tab>
          <Tab><Icon as={DollarSign} mr={2} /> Komisyon</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <Flex direction={{ base: 'column', md: 'row' }} mb={6}>
                <Box mr={{ base: 0, md: 8 }} mb={{ base: 6, md: 0 }} textAlign="center">
                  <Avatar size="2xl" src={userProfile.avatar} mb={4}>
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                  
                  <Button leftIcon={<Icon as={Upload} />} onClick={handleAvatarUpload}>
                    Fotoğraf Yükle
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Box>
                
                <VStack flex="1" spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Ad Soyad</FormLabel>
                      <Input name="name" value={userProfile.name} onChange={handleProfileChange} />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>E-posta</FormLabel>
                      <Input name="email" value={userProfile.email} onChange={handleProfileChange} />
                    </FormControl>
                  </SimpleGrid>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Telefon</FormLabel>
                      <Input name="phone" value={userProfile.phone} onChange={handleProfileChange} />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Pozisyon</FormLabel>
                      <Input name="position" value={userProfile.position} onChange={handleProfileChange} />
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl>
                    <FormLabel>Hakkımda</FormLabel>
                    <Textarea name="bio" value={userProfile.bio} onChange={handleProfileChange} rows={4} />
                  </FormControl>
                  
                  <HStack spacing={4}>
                    <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleProfileUpdate}>
                      Kaydet
                    </Button>
                    <Button variant="outline" onClick={onPasswordOpen}>
                      Şifre Değiştir
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          </TabPanel>
          
          {/* Company Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Şirket Adı</FormLabel>
                    <Input name="name" value={companySettings.name} onChange={handleCompanyChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>E-posta</FormLabel>
                    <Input name="email" value={companySettings.email} onChange={handleCompanyChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Telefon</FormLabel>
                    <Input name="phone" value={companySettings.phone} onChange={handleCompanyChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Adres</FormLabel>
                    <Textarea name="address" value={companySettings.address} onChange={handleCompanyChange} rows={3} />
                  </FormControl>
                </VStack>
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Web Sitesi</FormLabel>
                    <Input name="website" value={companySettings.website} onChange={handleCompanyChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Vergi No</FormLabel>
                    <Input name="taxId" value={companySettings.taxId} onChange={handleCompanyChange} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Logo</FormLabel>
                    <Flex align="center">
                      <Avatar size="md" src={companySettings.logo} mr={4} />
                      <Button size="sm">Logo Yükle</Button>
                    </Flex>
                  </FormControl>
                  
                  <Box pt={8}>
                    <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleCompanyUpdate}>
                      Kaydet
                    </Button>
                  </Box>
                </VStack>
              </SimpleGrid>
            </Box>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Mail} />
                    <Text fontWeight="medium">E-posta Bildirimleri</Text>
                  </HStack>
                  <Switch
                    isChecked={notificationSettings.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Divider />
                
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Phone} />
                    <Text fontWeight="medium">SMS Bildirimleri</Text>
                  </HStack>
                  <Switch
                    isChecked={notificationSettings.smsNotifications}
                    onChange={() => handleNotificationToggle('smsNotifications')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Divider />
                
                <Heading size="sm" mt={2}>Bildirim Türleri</Heading>
                
                <Flex justify="space-between" align="center">
                  <Text>Yeni Emlak Uyarıları</Text>
                  <Switch
                    isChecked={notificationSettings.newPropertyAlerts}
                    onChange={() => handleNotificationToggle('newPropertyAlerts')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text>Müşteri Talepleri</Text>
                  <Switch
                    isChecked={notificationSettings.customerInquiries}
                    onChange={() => handleNotificationToggle('customerInquiries')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text>Randevu Hatırlatmaları</Text>
                  <Switch
                    isChecked={notificationSettings.appointmentReminders}
                    onChange={() => handleNotificationToggle('appointmentReminders')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text>Pazarlama Güncellemeleri</Text>
                  <Switch
                    isChecked={notificationSettings.marketingUpdates}
                    onChange={() => handleNotificationToggle('marketingUpdates')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text>Sistem Güncellemeleri</Text>
                  <Switch
                    isChecked={notificationSettings.systemUpdates}
                    onChange={() => handleNotificationToggle('systemUpdates')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Box pt={4}>
                  <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleNotificationUpdate}>
                    Kaydet
                  </Button>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Shield} />
                    <Text fontWeight="medium">İki Faktörlü Kimlik Doğrulama</Text>
                  </HStack>
                  <Switch
                    isChecked={securitySettings.twoFactorAuth}
                    onChange={() => handleSecurityToggle('twoFactorAuth')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Oturum Zaman Aşımı (dakika)</FormLabel>
                    <Input
                      name="sessionTimeout"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityInputChange}
                      type="number"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Şifre Geçerlilik Süresi (gün)</FormLabel>
                    <Input
                      name="passwordExpiry"
                      value={securitySettings.passwordExpiry}
                      onChange={handleSecurityInputChange}
                      type="number"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Maksimum Başarısız Giriş Denemesi</FormLabel>
                  <Input
                    name="loginAttempts"
                    value={securitySettings.loginAttempts}
                    onChange={handleSecurityInputChange}
                    type="number"
                  />
                </FormControl>
                
                <Box pt={4}>
                  <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleSecurityUpdate}>
                    Kaydet
                  </Button>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* API Keys Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">API Anahtarları</Heading>
                <Button colorScheme="blue" leftIcon={<Icon as={Plus} />} onClick={onNewApiKeyOpen}>
                  Yeni API Anahtarı
                </Button>
              </Flex>
              
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th>İsim</Th>
                      <Th>API Anahtarı</Th>
                      <Th>Durum</Th>
                      <Th>Oluşturulma Tarihi</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {apiKeys.map((key) => (
                      <Tr key={key.id}>
                        <Td>{key.name}</Td>
                        <Td>
                          <HStack>
                            <Text>{key.key.substring(0, 10)}...{key.key.substring(key.key.length - 5)}</Text>
                            <Tooltip label="Kopyala">
                              <IconButton
                                aria-label="Copy API key"
                                icon={<Icon as={FileText} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(key.key);
                                  toast({
                                    title: 'Kopyalandı',
                                    status: 'success',
                                    duration: 2000,
                                    isClosable: true,
                                  });
                                }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={key.status === 'active' ? 'green' : 'red'}>
                            {key.status === 'active' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </Td>
                        <Td>{key.created}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Toggle API key status"
                              icon={<Icon as={key.status === 'active' ? X : Plus} />}
                              size="sm"
                              colorScheme={key.status === 'active' ? 'red' : 'green'}
                              variant="ghost"
                              onClick={() => {
                                setApiKeys(apiKeys.map(k => {
                                  if (k.id === key.id) {
                                    return { ...k, status: k.status === 'active' ? 'inactive' : 'active' };
                                  }
                                  return k;
                                }));
                              }}
                            />
                            <IconButton
                              aria-label="Delete API key"
                              icon={<Icon as={Trash2} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => {
                                setSelectedItemId(key.id);
                                onDeleteApiKeyOpen();
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Users Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md">Kullanıcı Yönetimi</Heading>
                <Button colorScheme="blue" leftIcon={<Icon as={Plus} />} onClick={onNewUserOpen}>
                  Yeni Kullanıcı
                </Button>
              </Flex>
              
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th>Ad Soyad</Th>
                      <Th>E-posta</Th>
                      <Th>Rol</Th>
                      <Th>Durum</Th>
                      <Th>Son Giriş</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <HStack>
                            <Avatar size="sm" name={user.name} />
                            <Text>{user.name}</Text>
                          </HStack>
                        </Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge colorScheme={user.role === 'admin' ? 'purple' : 'blue'}>
                            {user.role === 'admin' ? 'Yönetici' : 'Danışman'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={user.status === 'active' ? 'green' : 'red'}>
                            {user.status === 'active' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </Td>
                        <Td>{user.lastLogin}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit user"
                              icon={<Icon as={Edit} />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                            />
                            <IconButton
                              aria-label="Toggle user status"
                              icon={<Icon as={user.status === 'active' ? X : Plus} />}
                              size="sm"
                              colorScheme={user.status === 'active' ? 'red' : 'green'}
                              variant="ghost"
                              onClick={() => {
                                setUsers(users.map(u => {
                                  if (u.id === user.id) {
                                    return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
                                  }
                                  return u;
                                }));
                              }}
                            />
                            {user.id !== 1 && (
                              <IconButton
                                aria-label="Delete user"
                                icon={<Icon as={Trash2} />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedItemId(user.id);
                                  onDeleteUserOpen();
                                }}
                              />
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Backup Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Database} />
                    <Text fontWeight="medium">Otomatik Yedekleme</Text>
                  </HStack>
                  <Switch
                    isChecked={backupSettings.autoBackup}
                    onChange={() => handleBackupToggle('autoBackup')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Yedekleme Sıklığı</FormLabel>
                    <Select
                      name="backupFrequency"
                      value={backupSettings.backupFrequency}
                      onChange={handleBackupInputChange}
                      isDisabled={!backupSettings.autoBackup}
                    >
                      <option value="daily">Günlük</option>
                      <option value="weekly">Haftalık</option>
                      <option value="monthly">Aylık</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Yedekleme Saati</FormLabel>
                    <Input
                      name="backupTime"
                      value={backupSettings.backupTime}
                      onChange={handleBackupInputChange}
                      type="time"
                      isDisabled={!backupSettings.autoBackup}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Saklama Süresi (gün)</FormLabel>
                    <Input
                      name="retentionPeriod"
                      value={backupSettings.retentionPeriod}
                      onChange={handleBackupInputChange}
                      type="number"
                      isDisabled={!backupSettings.autoBackup}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Yedekleme Konumu</FormLabel>
                    <Select
                      name="backupLocation"
                      value={backupSettings.backupLocation}
                      onChange={handleBackupInputChange}
                    >
                      <option value="local">Yerel Disk</option>
                      <option value="cloud">Bulut Depolama</option>
                      <option value="both">Her İkisi</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <Box bg={useColorModeValue('blue.50', 'blue.900')} p={4} borderRadius="md">
                  <HStack>
                    <Icon as={Calendar} />
                    <Text>Son Yedekleme: {backupSettings.lastBackup}</Text>
                  </HStack>
                </Box>
                
                <HStack spacing={4}>
                  <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleBackupUpdate}>
                    Ayarları Kaydet
                  </Button>
                  <Button leftIcon={<Icon as={Database} />} onClick={handleManualBackup}>
                    Manuel Yedekle
                  </Button>
                  <Button variant="outline" leftIcon={<Icon as={Upload} />} onClick={handleRestoreBackup}>
                    Yedekten Geri Yükle
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Commission Tab */}
          <TabPanel>
            <Box
              bg={bgColor}
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              rounded="lg"
              boxShadow="sm"
            >
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Satış Komisyon Oranı (%)</FormLabel>
                    <Input
                      name="saleCommissionRate"
                      value={commissionSettings.saleCommissionRate}
                      onChange={handleCommissionInputChange}
                      type="number"
                      step="0.1"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Kiralama Komisyon Oranı (%)</FormLabel>
                    <Input
                      name="rentalCommissionRate"
                      value={commissionSettings.rentalCommissionRate}
                      onChange={handleCommissionInputChange}
                      type="number"
                      step="0.1"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Minimum Komisyon Tutarı (TL)</FormLabel>
                  <Input
                    name="minimumCommission"
                    value={commissionSettings.minimumCommission}
                    onChange={handleCommissionInputChange}
                    type="number"
                  />
                </FormControl>
                
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={Users} />
                    <Text fontWeight="medium">Komisyon Bölüşümü</Text>
                  </HStack>
                  <Switch
                    isChecked={commissionSettings.splitCommission}
                    onChange={() => handleCommissionToggle('splitCommission')}
                    colorScheme="blue"
                  />
                </Flex>
                
                <FormControl>
                  <FormLabel>Referans Komisyon Oranı (%)</FormLabel>
                  <Input
                    name="referralCommission"
                    value={commissionSettings.referralCommission}
                    onChange={handleCommissionInputChange}
                    type="number"
                    step="0.1"
                  />
                </FormControl>
                
                <Box pt={4}>
                  <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleCommissionUpdate}>
                    Kaydet
                  </Button>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Password Change Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Şifre Değiştir</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Mevcut Şifre</FormLabel>
                <Input
                  name="current"
                  value={passwordChange.current}
                  onChange={handlePasswordInputChange}
                  type="password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Yeni Şifre</FormLabel>
                <Input
                  name="new"
                  value={passwordChange.new}
                  onChange={handlePasswordInputChange}
                  type="password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Yeni Şifre (Tekrar)</FormLabel>
                <Input
                  name="confirm"
                  value={passwordChange.confirm}
                  onChange={handlePasswordInputChange}
                  type="password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onPasswordClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordChange}>
              Şifre Değiştir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* New API Key Modal */}
      <Modal isOpen={isNewApiKeyOpen} onClose={onNewApiKeyClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni API Anahtarı</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>API Anahtarı Adı</FormLabel>
                <Input
                  name="name"
                  value={newApiKey.name}
                  onChange={handleNewApiKeyChange}
                  placeholder="Örn: Web Sitesi Entegrasyonu"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Açıklama</FormLabel>
                <Textarea
                  name="description"
                  value={newApiKey.description}
                  onChange={handleNewApiKeyChange}
                  placeholder="Bu API anahtarının kullanım amacı"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onNewApiKeyClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleCreateApiKey}>
              Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* New User Modal */}
      <Modal isOpen={isNewUserOpen} onClose={onNewUserClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Kullanıcı</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ad Soyad</FormLabel>
                <Input
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>E-posta</FormLabel>
                <Input
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  type="email"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Rol</FormLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                >
                  <option value="admin">Yönetici</option>
                  <option value="agent">Danışman</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Şifre</FormLabel>
                <Input
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  type="password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onNewUserClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleCreateUser}>
              Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete User Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteUserOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteUserClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Kullanıcıyı Sil
            </AlertDialogHeader>
            
            <AlertDialogBody>
              <HStack>
                <Icon as={AlertTriangle} color="red.500" />
                <Text>Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Text>
              </HStack>
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteUserClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      
      {/* Delete API Key Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteApiKeyOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteApiKeyClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              API Anahtarını Sil
            </AlertDialogHeader>
            
            <AlertDialogBody>
              <HStack>
                <Icon as={AlertTriangle} color="red.500" />
                <Text>Bu API anahtarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bu anahtarı kullanan tüm entegrasyonlar çalışmayı durduracaktır.</Text>
              </HStack>
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteApiKeyClose}>
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

export default Settings;