import { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Button, Flex, SimpleGrid, Divider,
  Tabs, TabList, TabPanels, Tab, TabPanel, FormControl, FormLabel, Input,
  Select, Switch, Textarea, useToast, Avatar, AvatarBadge, IconButton,
  Badge, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Tooltip, Checkbox, CheckboxGroup
} from '@chakra-ui/react';
import { 
  User, Settings as SettingsIcon, Bell, Shield, Database, Key, Upload, X, Edit, Trash2,
  Plus, Save, Mail, Phone, Globe, MapPin, FileText, Users, DollarSign, AlertTriangle, Calendar,
  Smartphone, Monitor, Tablet, CheckCircle, XCircle, Building, Award
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
    loginAttempts: '5'
  });

  // Advanced Security Settings
  const [twoFactorSettings, setTwoFactorSettings] = useState({
    isEnabled: false,
    method: 'app', // 'app', 'sms', 'email'
    backupCodes: [],
    trustedDevices: [],
    requireForAllUsers: false,
    gracePeriodDays: 7
  });

  const [registeredDevices, setRegisteredDevices] = useState([
    {
      id: '1',
      deviceName: 'iPhone 13 Pro',
      deviceType: 'mobile',
      browser: 'Safari',
      location: 'İstanbul, Türkiye',
      lastAccess: '2024-01-15 14:30',
      ipAddress: '192.168.1.100',
      isTrusted: true,
      isCurrentDevice: true
    },
    {
      id: '2',
      deviceName: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome',
      location: 'İstanbul, Türkiye',
      lastAccess: '2024-01-14 09:15',
      ipAddress: '192.168.1.101',
      isTrusted: true,
      isCurrentDevice: false
    },
    {
      id: '3',
      deviceName: 'Windows PC',
      deviceType: 'desktop',
      browser: 'Edge',
      location: 'Ankara, Türkiye',
      lastAccess: '2024-01-10 16:45',
      ipAddress: '10.0.0.50',
      isTrusted: false,
      isCurrentDevice: false
    }
  ]);

  const [loginLogs, setLoginLogs] = useState([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      userEmail: 'admin@emlak.com',
      ipAddress: '192.168.1.100',
      location: 'İstanbul, Türkiye',
      device: 'iPhone 13 Pro',
      browser: 'Safari',
      status: 'success',
      riskLevel: 'low',
      twoFactorUsed: true
    },
    {
      id: '2',
      timestamp: '2024-01-15 09:15:10',
      userEmail: 'agent@emlak.com',
      ipAddress: '192.168.1.101',
      location: 'İstanbul, Türkiye',
      device: 'MacBook Pro',
      browser: 'Chrome',
      status: 'success',
      riskLevel: 'low',
      twoFactorUsed: true
    },
    {
      id: '3',
      timestamp: '2024-01-14 22:30:45',
      userEmail: 'unknown@test.com',
      ipAddress: '45.123.45.67',
      location: 'Bilinmeyen Konum',
      device: 'Unknown Device',
      browser: 'Chrome',
      status: 'failed',
      riskLevel: 'high',
      twoFactorUsed: false,
      failureReason: 'Geçersiz şifre'
    },
    {
      id: '4',
      timestamp: '2024-01-14 18:20:15',
      userEmail: 'consultant@emlak.com',
      ipAddress: '10.0.0.50',
      location: 'Ankara, Türkiye',
      device: 'Windows PC',
      browser: 'Edge',
      status: 'success',
      riskLevel: 'medium',
      twoFactorUsed: false
    }
  ]);
  
  // API keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Web Sitesi Entegrasyonu', key: 'demo_key_abcdefghijklmnopqrstuvwxyz123456', status: 'active', created: '15.06.2023' },
    { id: 2, name: 'Mobil Uygulama', key: 'demo_key_zyxwvutsrqponmlkjihgfedcba654321', status: 'active', created: '20.07.2023' },
    { id: 3, name: 'Sahibinden.com API', key: 'demo_key_123456abcdefghijklmnopqrstuvwxyz', status: 'inactive', created: '10.08.2023' },
  ]);
  
  // User management state
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@example.com', role: 'broker', status: 'active', lastLogin: '25.11.2023 14:30', permissions: ['all'] },
    { id: 2, name: 'Ayşe Demir', email: 'ayse.demir@example.com', role: 'senior_agent', status: 'active', lastLogin: '25.11.2023 10:15', permissions: ['properties', 'customers', 'reports', 'appointments'] },
    { id: 3, name: 'Mehmet Kaya', email: 'mehmet.kaya@example.com', role: 'agent', status: 'active', lastLogin: '24.11.2023 16:45', permissions: ['properties', 'customers', 'appointments'] },
    { id: 4, name: 'Zeynep Aydın', email: 'zeynep.aydin@example.com', role: 'junior_agent', status: 'inactive', lastLogin: '20.11.2023 09:20', permissions: ['properties', 'customers'] },
  ]);

  // Role definitions with detailed permissions
  const [roleDefinitions, setRoleDefinitions] = useState({
    broker: {
      name: 'Broker',
      description: 'Tam yetki sahibi, tüm sistem ayarlarını yönetebilir',
      permissions: ['all'],
      color: 'purple'
    },
    senior_agent: {
      name: 'Kıdemli Danışman',
      description: 'Gelişmiş yetkilere sahip deneyimli danışman',
      permissions: ['properties', 'customers', 'reports', 'appointments', 'documents'],
      color: 'blue'
    },
    agent: {
      name: 'Danışman',
      description: 'Standart danışman yetkileri',
      permissions: ['properties', 'customers', 'appointments'],
      color: 'green'
    },
    junior_agent: {
      name: 'Stajyer Danışman',
      description: 'Sınırlı yetkilere sahip yeni danışman',
      permissions: ['properties', 'customers'],
      color: 'orange'
    }
  });

  // Permission definitions
  const [permissionDefinitions] = useState({
    properties: { name: 'Emlak Yönetimi', description: 'İlan ekleme, düzenleme ve görüntüleme' },
    customers: { name: 'Müşteri Yönetimi', description: 'Müşteri bilgileri ve iletişim' },
    reports: { name: 'Raporlama', description: 'Satış ve performans raporları' },
    appointments: { name: 'Randevu Yönetimi', description: 'Randevu planlama ve takip' },
    documents: { name: 'Belge Yönetimi', description: 'Sözleşme ve belge işlemleri' },
    settings: { name: 'Sistem Ayarları', description: 'Genel sistem konfigürasyonu' },
    users: { name: 'Kullanıcı Yönetimi', description: 'Kullanıcı ekleme ve yetkilendirme' },
    commission: { name: 'Komisyon Ayarları', description: 'Komisyon oranları ve dağılım' }
  });
  
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
    saleCommissionRate: '2.5',
    rentalCommissionRate: '8.0',
    minimumCommission: '5000',
    splitCommission: true,
    referralCommission: '0.5'
  });

  // Advanced Commission Management
  const [commissionTiers, setCommissionTiers] = useState([
    {
      id: '1',
      name: 'Başlangıç Seviyesi',
      minSales: 0,
      maxSales: 10,
      saleCommissionRate: 2.0,
      rentalCommissionRate: 7.0,
      bonusRate: 0,
      isActive: true
    },
    {
      id: '2',
      name: 'Orta Seviye',
      minSales: 11,
      maxSales: 25,
      saleCommissionRate: 2.5,
      rentalCommissionRate: 8.0,
      bonusRate: 0.2,
      isActive: true
    },
    {
      id: '3',
      name: 'Uzman Seviye',
      minSales: 26,
      maxSales: 50,
      saleCommissionRate: 3.0,
      rentalCommissionRate: 9.0,
      bonusRate: 0.5,
      isActive: true
    },
    {
      id: '4',
      name: 'Elit Seviye',
      minSales: 51,
      maxSales: 999,
      saleCommissionRate: 3.5,
      rentalCommissionRate: 10.0,
      bonusRate: 1.0,
      isActive: true
    }
  ]);

  const [commissionSplitRules, setCommissionSplitRules] = useState([
    {
      id: '1',
      name: 'Standart Bölüşüm',
      agentShare: 60,
      companyShare: 40,
      isDefault: true,
      conditions: 'Tüm işlemler için geçerli'
    },
    {
      id: '2',
      name: 'Yüksek Performans Bölüşümü',
      agentShare: 70,
      companyShare: 30,
      isDefault: false,
      conditions: 'Aylık 10+ satış yapan danışmanlar için'
    },
    {
      id: '3',
      name: 'Yeni Danışman Bölüşümü',
      agentShare: 50,
      companyShare: 50,
      isDefault: false,
      conditions: 'İlk 6 ay için geçerli'
    }
  ]);

  const [teamCommissionSettings, setTeamCommissionSettings] = useState({
    enableTeamCommission: true,
    teamLeaderBonus: 0.5,
    teamMemberBonus: 0.2,
    minimumTeamSize: 3,
    teamPerformanceThreshold: 50
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

  // Advanced Security Handlers
  const handleTwoFactorSettingsChange = (field, value) => {
    setTwoFactorSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateBackupCodes = () => {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
    setTwoFactorSettings(prev => ({ ...prev, backupCodes: codes }));
    toast({
      title: 'Yedek kodlar oluşturuldu',
      description: 'Yedek kodlarınızı güvenli bir yerde saklayın.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleRemoveDevice = (deviceId) => {
    setRegisteredDevices(prev => prev.filter(device => device.id !== deviceId));
    toast({
      title: 'Cihaz kaldırıldı',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleTrustDevice = (deviceId) => {
    setRegisteredDevices(prev => prev.map(device => 
      device.id === deviceId ? { ...device, isTrusted: !device.isTrusted } : device
    ));
  };

  const handleClearLoginLogs = () => {
    setLoginLogs([]);
    toast({
      title: 'Giriş logları temizlendi',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
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

  // Advanced Commission Handlers
  const handleCommissionTierChange = (tierId, field, value) => {
    setCommissionTiers(prev => prev.map(tier => 
      tier.id === tierId ? { ...tier, [field]: value } : tier
    ));
  };

  const handleAddCommissionTier = () => {
    const newTier = {
      id: Date.now().toString(),
      name: 'Yeni Seviye',
      minSales: 0,
      maxSales: 0,
      saleCommissionRate: 2.0,
      rentalCommissionRate: 7.0,
      bonusRate: 0,
      isActive: true
    };
    setCommissionTiers(prev => [...prev, newTier]);
  };

  const handleDeleteCommissionTier = (tierId) => {
    setCommissionTiers(prev => prev.filter(tier => tier.id !== tierId));
  };

  const handleCommissionSplitChange = (ruleId, field, value) => {
    setCommissionSplitRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const handleAddCommissionSplitRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: 'Yeni Bölüşüm Kuralı',
      agentShare: 60,
      companyShare: 40,
      isDefault: false,
      conditions: 'Koşul belirtiniz'
    };
    setCommissionSplitRules(prev => [...prev, newRule]);
  };

  const handleDeleteCommissionSplitRule = (ruleId) => {
    setCommissionSplitRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const handleTeamCommissionChange = (field, value) => {
    setTeamCommissionSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSetDefaultSplitRule = (ruleId) => {
    setCommissionSplitRules(prev => prev.map(rule => ({
      ...rule,
      isDefault: rule.id === ruleId
    })));
  };

  const handleAdvancedCommissionUpdate = () => {
    toast({
      title: 'Gelişmiş komisyon ayarları güncellendi',
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
          <Tab><Icon as={Shield} mr={2} /> Rol ve Yetki</Tab>
          <Tab><Icon as={Database} mr={2} /> Yedekleme</Tab>
          <Tab><Icon as={DollarSign} mr={2} /> Komisyon</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Heading size="md">Kişisel Profil Ayarları</Heading>
              
              {/* Personal Information Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={6} align="stretch">
                  <Heading size="sm">Kişisel Bilgiler</Heading>
                  
                  <Flex direction={{ base: 'column', md: 'row' }} align="start">
                    <Box mr={{ base: 0, md: 8 }} mb={{ base: 6, md: 0 }} textAlign="center">
                      <Avatar size="2xl" src={userProfile.avatar} mb={4}>
                        <AvatarBadge boxSize="1.25em" bg="green.500" />
                      </Avatar>
                      
                      <Button size="sm" leftIcon={<Icon as={Upload} />} onClick={handleAvatarUpload}>
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
                    </VStack>
                  </Flex>
                </VStack>
              </Box>
              
              {/* Account Settings Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Hesap Ayarları</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Dil Tercihi</FormLabel>
                      <Select defaultValue="tr">
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Zaman Dilimi</FormLabel>
                      <Select defaultValue="Europe/Istanbul">
                        <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                        <option value="Europe/London">Londra (GMT+0)</option>
                        <option value="America/New_York">New York (GMT-5)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Tarih Formatı</FormLabel>
                      <Select defaultValue="dd/mm/yyyy">
                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Para Birimi</FormLabel>
                      <Select defaultValue="TRY">
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>
              
              {/* Privacy Settings Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Gizlilik Ayarları</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Profil Görünürlüğü</Text>
                        <Text fontSize="sm" color="gray.500">Profilinizin diğer kullanıcılar tarafından görülmesini sağlar</Text>
                      </VStack>
                      <Switch defaultChecked />
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">İletişim Bilgilerini Paylaş</Text>
                        <Text fontSize="sm" color="gray.500">Telefon ve e-posta bilgilerinizin paylaşılmasını kontrol eder</Text>
                      </VStack>
                      <Switch defaultChecked />
                    </Flex>
                    
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Aktivite Durumu</Text>
                        <Text fontSize="sm" color="gray.500">Son görülme durumunuzun gösterilmesini kontrol eder</Text>
                      </VStack>
                      <Switch defaultChecked />
                    </Flex>
                  </VStack>
                </VStack>
              </Box>
              
              <HStack spacing={4}>
                <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleProfileUpdate}>
                  Profil Ayarlarını Kaydet
                </Button>
                <Button variant="outline" onClick={onPasswordOpen}>
                  Şifre Değiştir
                </Button>
              </HStack>
            </VStack>
          </TabPanel>
          
          {/* Company Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Şirket Bilgileri */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4} color="blue.600">
                  <Icon as={Building} mr={2} />
                  Şirket Bilgileri
                </Heading>
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
                    
                    <FormControl>
                      <FormLabel>Şirket Türü</FormLabel>
                      <Select placeholder="Şirket türünü seçin">
                        <option value="limited">Limited Şirket</option>
                        <option value="anonim">Anonim Şirket</option>
                        <option value="kollektif">Kollektif Şirket</option>
                        <option value="komandit">Komandit Şirket</option>
                        <option value="sahis">Şahıs Şirketi</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </SimpleGrid>
              </Box>

              {/* Lisans ve Sertifikalar */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4} color="green.600">
                  <Icon as={Award} mr={2} />
                  Lisans ve Sertifikalar
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Emlak Lisans No</FormLabel>
                      <Input placeholder="Emlak lisans numaranızı girin" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Lisans Geçerlilik Tarihi</FormLabel>
                      <Input type="date" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Ticaret Sicil No</FormLabel>
                      <Input placeholder="Ticaret sicil numaranızı girin" />
                    </FormControl>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Vergi Dairesi</FormLabel>
                      <Input placeholder="Bağlı olduğunuz vergi dairesi" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>MERSIS No</FormLabel>
                      <Input placeholder="MERSIS numaranızı girin" />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Sertifikalar</FormLabel>
                      <Button size="sm" variant="outline">
                        <Icon as={Upload} mr={2} />
                        Sertifika Yükle
                      </Button>
                    </FormControl>
                  </VStack>
                </SimpleGrid>
              </Box>

              {/* Yasal Uyumluluk */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4} color="purple.600">
                  <Icon as={Shield} mr={2} />
                  Yasal Uyumluluk
                </Heading>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">KVKK Uyumluluğu</Text>
                      <Text fontSize="sm" color="gray.600">Kişisel verilerin korunması kanunu uyumluluğu</Text>
                    </VStack>
                    <Switch colorScheme="purple" />
                  </Flex>
                  
                  <Divider />
                  
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Emlak Sektörü Düzenlemeleri</Text>
                      <Text fontSize="sm" color="gray.600">Emlak sektörüne özel yasal düzenlemeler</Text>
                    </VStack>
                    <Switch colorScheme="purple" />
                  </Flex>
                  
                  <Divider />
                  
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">Vergi Uyumluluğu</Text>
                      <Text fontSize="sm" color="gray.600">Vergi mevzuatına uygunluk</Text>
                    </VStack>
                    <Switch colorScheme="purple" />
                  </Flex>
                </VStack>
              </Box>

              {/* Kurumsal Ayarlar */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4} color="orange.600">
                  <Icon as={Settings} mr={2} />
                  Kurumsal Ayarlar
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Çalışma Saatleri</FormLabel>
                      <HStack>
                        <Input type="time" defaultValue="09:00" />
                        <Text>-</Text>
                        <Input type="time" defaultValue="18:00" />
                      </HStack>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Çalışma Günleri</FormLabel>
                      <CheckboxGroup defaultValue={['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma']}>
                        <SimpleGrid columns={2} spacing={2}>
                          <Checkbox value="pazartesi">Pazartesi</Checkbox>
                          <Checkbox value="sali">Salı</Checkbox>
                          <Checkbox value="carsamba">Çarşamba</Checkbox>
                          <Checkbox value="persembe">Perşembe</Checkbox>
                          <Checkbox value="cuma">Cuma</Checkbox>
                          <Checkbox value="cumartesi">Cumartesi</Checkbox>
                          <Checkbox value="pazar">Pazar</Checkbox>
                        </SimpleGrid>
                      </CheckboxGroup>
                    </FormControl>
                  </VStack>
                  
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Varsayılan Para Birimi</FormLabel>
                      <Select defaultValue="TRY">
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">İngiliz Sterlini (£)</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Zaman Dilimi</FormLabel>
                      <Select defaultValue="Europe/Istanbul">
                        <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
                        <option value="Europe/London">Londra (UTC+0)</option>
                        <option value="America/New_York">New York (UTC-5)</option>
                        <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </SimpleGrid>
              </Box>

              {/* Kurumsal Yetkilendirme */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4} color="red.600">
                  <Icon as={Users} mr={2} />
                  Kurumsal Yetkilendirme Sistemi
                </Heading>
                
                {/* Organizasyon Yapısı */}
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Organizasyon Yapısı</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Box p={4} borderWidth={1} borderRadius="md" bg="blue.50">
                      <VStack spacing={2}>
                        <Icon as={User} size={24} color="blue.600" />
                        <Text fontWeight="bold" fontSize="sm">Genel Müdür</Text>
                        <Text fontSize="xs" color="gray.600">Tüm yetkiler</Text>
                        <Badge colorScheme="blue">1 Kişi</Badge>
                      </VStack>
                    </Box>
                    
                    <Box p={4} borderWidth={1} borderRadius="md" bg="green.50">
                      <VStack spacing={2}>
                        <Icon as={Users} size={24} color="green.600" />
                        <Text fontWeight="bold" fontSize="sm">Bölge Müdürleri</Text>
                        <Text fontSize="xs" color="gray.600">Bölgesel yetkiler</Text>
                        <Badge colorScheme="green">3 Kişi</Badge>
                      </VStack>
                    </Box>
                    
                    <Box p={4} borderWidth={1} borderRadius="md" bg="orange.50">
                      <VStack spacing={2}>
                        <Icon as={User} size={24} color="orange.600" />
                        <Text fontWeight="bold" fontSize="sm">Emlak Danışmanları</Text>
                        <Text fontSize="xs" color="gray.600">Operasyonel yetkiler</Text>
                        <Badge colorScheme="orange">12 Kişi</Badge>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </Box>
                
                {/* Departman Yönetimi */}
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Departman Yönetimi</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <VStack spacing={3} align="stretch">
                      <Box p={3} borderWidth={1} borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">Satış Departmanı</Text>
                            <Text fontSize="sm" color="gray.600">8 Emlak Danışmanı</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Switch size="sm" defaultChecked />
                            <Button size="xs" variant="outline">Düzenle</Button>
                          </VStack>
                        </HStack>
                      </Box>
                      
                      <Box p={3} borderWidth={1} borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">Kiralama Departmanı</Text>
                            <Text fontSize="sm" color="gray.600">4 Emlak Danışmanı</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Switch size="sm" defaultChecked />
                            <Button size="xs" variant="outline">Düzenle</Button>
                          </VStack>
                        </HStack>
                      </Box>
                      
                      <Box p={3} borderWidth={1} borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">Pazarlama Departmanı</Text>
                            <Text fontSize="sm" color="gray.600">2 Pazarlama Uzmanı</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Switch size="sm" defaultChecked />
                            <Button size="xs" variant="outline">Düzenle</Button>
                          </VStack>
                        </HStack>
                      </Box>
                    </VStack>
                    
                    <VStack spacing={3} align="stretch">
                      <FormControl>
                        <FormLabel fontSize="sm">Yeni Departman Ekle</FormLabel>
                        <HStack>
                          <Input placeholder="Departman adı" size="sm" />
                          <Button size="sm" colorScheme="blue">
                            <Icon as={Plus} />
                          </Button>
                        </HStack>
                      </FormControl>
                      
                      <Box p={3} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Departman İstatistikleri</Text>
                        <VStack spacing={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="xs">Toplam Departman:</Text>
                            <Text fontSize="xs" fontWeight="bold">3</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs">Toplam Çalışan:</Text>
                            <Text fontSize="xs" fontWeight="bold">16</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="xs">Aktif Departman:</Text>
                            <Text fontSize="xs" fontWeight="bold">3</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </SimpleGrid>
                </Box>
                
                {/* Yetki Matrisi */}
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Yetki Matrisi</Heading>
                  <Box overflowX="auto">
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Yetki</Th>
                          <Th>Genel Müdür</Th>
                          <Th>Bölge Müdürü</Th>
                          <Th>Emlak Danışmanı</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td fontSize="sm">İlan Oluşturma</Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                        </Tr>
                        <Tr>
                          <Td fontSize="sm">İlan Silme</Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><XCircle color="red" size={16} /></Td>
                        </Tr>
                        <Tr>
                          <Td fontSize="sm">Fiyat Değişikliği</Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><XCircle color="red" size={16} /></Td>
                        </Tr>
                        <Tr>
                          <Td fontSize="sm">Rapor Görüntüleme</Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><XCircle color="red" size={16} /></Td>
                        </Tr>
                        <Tr>
                          <Td fontSize="sm">Kullanıcı Yönetimi</Td>
                          <Td><CheckCircle color="green" size={16} /></Td>
                          <Td><XCircle color="red" size={16} /></Td>
                          <Td><XCircle color="red" size={16} /></Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
                
                {/* Kurumsal Politikalar */}
                <Box mb={6}>
                  <Heading size="sm" mb={3}>Kurumsal Politikalar</Heading>
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Çoklu Onay Sistemi</Text>
                        <Text fontSize="sm" color="gray.600">Kritik işlemler için çoklu onay gereksinimi</Text>
                      </VStack>
                      <Switch colorScheme="blue" defaultChecked />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Otomatik Yetki Devri</Text>
                        <Text fontSize="sm" color="gray.600">Tatil/izin durumlarında otomatik yetki devri</Text>
                      </VStack>
                      <Switch colorScheme="blue" />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Zaman Bazlı Yetkiler</Text>
                        <Text fontSize="sm" color="gray.600">Belirli saatlerde geçerli olan yetkiler</Text>
                      </VStack>
                      <Switch colorScheme="blue" defaultChecked />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">Coğrafi Kısıtlamalar</Text>
                        <Text fontSize="sm" color="gray.600">Bölgesel yetki sınırlamaları</Text>
                      </VStack>
                      <Switch colorScheme="blue" defaultChecked />
                    </Flex>
                  </VStack>
                </Box>
                
                {/* Yetki Geçmişi */}
                <Box>
                  <Heading size="sm" mb={3}>Son Yetki Değişiklikleri</Heading>
                  <VStack spacing={2} align="stretch">
                    <Box p={3} borderWidth={1} borderRadius="md" bg="blue.50">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">Ahmet Yılmaz - Bölge Müdürü yetkisi verildi</Text>
                          <Text fontSize="xs" color="gray.600">2 gün önce • Genel Müdür tarafından</Text>
                        </VStack>
                        <Badge colorScheme="blue">Yetki Artırıldı</Badge>
                      </HStack>
                    </Box>
                    
                    <Box p={3} borderWidth={1} borderRadius="md" bg="orange.50">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">Fatma Demir - Fiyat değiştirme yetkisi kaldırıldı</Text>
                          <Text fontSize="xs" color="gray.600">1 hafta önce • Bölge Müdürü tarafından</Text>
                        </VStack>
                        <Badge colorScheme="orange">Yetki Azaltıldı</Badge>
                      </HStack>
                    </Box>
                    
                    <Box p={3} borderWidth={1} borderRadius="md" bg="green.50">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">Mehmet Kaya - Yeni kullanıcı eklendi</Text>
                          <Text fontSize="xs" color="gray.600">2 hafta önce • Genel Müdür tarafından</Text>
                        </VStack>
                        <Badge colorScheme="green">Yeni Kullanıcı</Badge>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              </Box>

              {/* Kaydet Butonu */}
              <Box>
                <Button colorScheme="blue" size="lg" leftIcon={<Icon as={Save} />} onClick={handleCompanyUpdate}>
                  Şirket Ayarlarını Kaydet
                </Button>
              </Box>
            </VStack>
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
            <VStack spacing={8} align="stretch">
              <Heading size="md">Güvenlik Ayarları</Heading>
              
              {/* Two-Factor Authentication Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="sm">İki Faktörlü Kimlik Doğrulama (2FA)</Heading>
                    <Switch 
                      size="lg" 
                      isChecked={twoFactorSettings.isEnabled}
                      onChange={(e) => handleTwoFactorSettingsChange('isEnabled', e.target.checked)}
                    />
                  </HStack>
                  
                  {twoFactorSettings.isEnabled && (
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>2FA Yöntemi</FormLabel>
                          <Select 
                            value={twoFactorSettings.method}
                            onChange={(e) => handleTwoFactorSettingsChange('method', e.target.value)}
                          >
                            <option value="app">Authenticator Uygulaması</option>
                            <option value="sms">SMS</option>
                            <option value="email">E-posta</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Geçiş Süresi (gün)</FormLabel>
                          <Input 
                            type="number" 
                            value={twoFactorSettings.gracePeriodDays}
                            onChange={(e) => handleTwoFactorSettingsChange('gracePeriodDays', parseInt(e.target.value))}
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <HStack justify="space-between">
                          <FormLabel>Tüm kullanıcılar için zorunlu</FormLabel>
                          <Switch 
                            isChecked={twoFactorSettings.requireForAllUsers}
                            onChange={(e) => handleTwoFactorSettingsChange('requireForAllUsers', e.target.checked)}
                          />
                        </HStack>
                      </FormControl>
                      
                      <Box>
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="medium">Yedek Kodlar</Text>
                          <Button size="sm" onClick={handleGenerateBackupCodes}>
                            Yeni Kodlar Oluştur
                          </Button>
                        </HStack>
                        {twoFactorSettings.backupCodes.length > 0 && (
                          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={2}>
                            {twoFactorSettings.backupCodes.map((code, index) => (
                              <Text key={index} fontSize="sm" fontFamily="mono" p={2} bg="gray.100" borderRadius="md">
                                {code}
                              </Text>
                            ))}
                          </SimpleGrid>
                        )}
                      </Box>
                    </VStack>
                  )}
                </VStack>
              </Box>
              
              {/* Registered Devices Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Kayıtlı Cihazlar</Heading>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Cihaz</Th>
                        <Th>Son Giriş</Th>
                        <Th>Konum</Th>
                        <Th>Güvenilir</Th>
                        <Th>İşlemler</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {registeredDevices.map((device) => {
                        const DeviceIcon = getDeviceIcon(device.deviceType);
                        return (
                          <Tr key={device.id}>
                            <Td>
                              <HStack>
                                <Icon as={DeviceIcon} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{device.deviceName}</Text>
                                  <Text fontSize="sm" color="gray.500">{device.browser}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>{device.lastLogin}</Td>
                            <Td>{device.location}</Td>
                            <Td>
                              <Switch 
                                size="sm"
                                isChecked={device.isTrusted}
                                onChange={() => handleTrustDevice(device.id)}
                              />
                            </Td>
                            <Td>
                              <IconButton
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                icon={<Trash2 size={16} />}
                                onClick={() => handleRemoveDevice(device.id)}
                                aria-label="Cihazı Kaldır"
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </VStack>
              </Box>
              
              {/* Login Logs Section */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="sm">Giriş Logları</Heading>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={handleClearLoginLogs}>
                      Logları Temizle
                    </Button>
                  </HStack>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Tarih/Saat</Th>
                        <Th>IP Adresi</Th>
                        <Th>Cihaz</Th>
                        <Th>Durum</Th>
                        <Th>Risk Seviyesi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loginLogs.map((log) => (
                        <Tr key={log.id}>
                          <Td>{log.timestamp}</Td>
                          <Td>{log.ipAddress}</Td>
                          <Td>{log.device}</Td>
                          <Td>
                            <HStack>
                              <Icon 
                                as={log.status === 'success' ? CheckCircle : XCircle} 
                                color={log.status === 'success' ? 'green.500' : 'red.500'}
                              />
                              <Text>{log.status === 'success' ? 'Başarılı' : 'Başarısız'}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={getRiskLevelColor(log.riskLevel)}>
                              {log.riskLevel === 'low' ? 'Düşük' : 
                               log.riskLevel === 'medium' ? 'Orta' : 'Yüksek'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </VStack>
              </Box>
              
              {/* Basic Security Settings */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Temel Güvenlik Ayarları</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
                    
                    <FormControl>
                      <FormLabel>Maksimum Başarısız Giriş Denemesi</FormLabel>
                      <Input
                        name="loginAttempts"
                        value={securitySettings.loginAttempts}
                        onChange={handleSecurityInputChange}
                        type="number"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </Box>

              {/* Advanced Security Controls */}
              <Box p={6} borderWidth={1} borderRadius="lg">
                <VStack spacing={6} align="stretch">
                  <Heading size="sm" color="red.600">
                    <Icon as={AlertTriangle} mr={2} />
                    Gelişmiş Güvenlik Kontrolleri
                  </Heading>
                  
                  {/* Suspicious Activity Monitoring */}
                  <Box>
                    <Heading size="xs" mb={3}>Şüpheli Aktivite İzleme</Heading>
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Anormal Giriş Saatleri</Text>
                          <Text fontSize="sm" color="gray.600">Mesai saatleri dışındaki girişleri izle</Text>
                        </VStack>
                        <Switch colorScheme="red" defaultChecked />
                      </Flex>
                      
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Çoklu Cihaz Girişi</Text>
                          <Text fontSize="sm" color="gray.600">Aynı anda birden fazla cihazdan giriş uyarısı</Text>
                        </VStack>
                        <Switch colorScheme="red" defaultChecked />
                      </Flex>
                      
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Coğrafi Konum Değişimi</Text>
                          <Text fontSize="sm" color="gray.600">Farklı şehir/ülkeden giriş uyarısı</Text>
                        </VStack>
                        <Switch colorScheme="red" defaultChecked />
                      </Flex>
                    </VStack>
                  </Box>
                  
                  <Divider />
                  
                  {/* IP Restrictions */}
                  <Box>
                    <Heading size="xs" mb={3}>IP Kısıtlamaları</Heading>
                    <VStack spacing={3} align="stretch">
                      <FormControl>
                        <FormLabel>İzin Verilen IP Adresleri</FormLabel>
                        <Textarea 
                          placeholder="192.168.1.1&#10;10.0.0.0/24&#10;Satır başına bir IP adresi veya CIDR bloğu"
                          rows={4}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Yasaklı IP Adresleri</FormLabel>
                        <Textarea 
                          placeholder="Yasaklı IP adreslerini girin"
                          rows={3}
                        />
                      </FormControl>
                      
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="medium">IP Kısıtlamalarını Etkinleştir</Text>
                        <Switch colorScheme="orange" />
                      </Flex>
                    </VStack>
                  </Box>
                  
                  <Divider />
                  
                  {/* Security Policies */}
                  <Box>
                    <Heading size="xs" mb={3}>Güvenlik Politikaları</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack spacing={3} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Güçlü Şifre Zorunluluğu</Text>
                          <Switch colorScheme="blue" defaultChecked />
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Şifre Geçmişi Kontrolü</Text>
                          <Switch colorScheme="blue" defaultChecked />
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Otomatik Hesap Kilitleme</Text>
                          <Switch colorScheme="blue" defaultChecked />
                        </Flex>
                      </VStack>
                      
                      <VStack spacing={3} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">E-posta Doğrulama</Text>
                          <Switch colorScheme="blue" defaultChecked />
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Telefon Doğrulama</Text>
                          <Switch colorScheme="blue" />
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm">Düzenli Güvenlik Taraması</Text>
                          <Switch colorScheme="blue" defaultChecked />
                        </Flex>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                  
                  <Divider />
                  
                  {/* Automated Security Checks */}
                  <Box>
                    <Heading size="xs" mb={3}>Otomatik Güvenlik Kontrolleri</Heading>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Son Güvenlik Taraması</Text>
                          <Text fontSize="sm" color="gray.600">15 Ocak 2024, 14:30</Text>
                        </VStack>
                        <Button size="sm" colorScheme="green">
                          Şimdi Tara
                        </Button>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Güvenlik Durumu</Text>
                          <HStack>
                            <Icon as={CheckCircle} color="green.500" />
                            <Text fontSize="sm" color="green.600">Güvenli</Text>
                          </HStack>
                        </VStack>
                        <Badge colorScheme="green">Aktif</Badge>
                      </HStack>
                      
                      <FormControl>
                        <FormLabel>Otomatik Tarama Sıklığı</FormLabel>
                        <Select defaultValue="daily">
                          <option value="hourly">Saatlik</option>
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              </Box>

              {/* Security Alerts */}
              <Box p={6} borderWidth={1} borderRadius="lg" bg="red.50">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm" color="red.600">
                    <Icon as={AlertTriangle} mr={2} />
                    Güvenlik Uyarıları
                  </Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="white" borderRadius="md" borderLeft="4px" borderLeftColor="orange.400">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">Şüpheli Giriş Denemesi</Text>
                          <Text fontSize="xs" color="gray.600">IP: 192.168.1.100 - 2 saat önce</Text>
                        </VStack>
                        <Button size="xs" colorScheme="orange">İncele</Button>
                      </HStack>
                    </Box>
                    
                    <Box p={3} bg="white" borderRadius="md" borderLeft="4px" borderLeftColor="red.400">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">Çoklu Başarısız Giriş</Text>
                          <Text fontSize="xs" color="gray.600">Kullanıcı: admin@example.com - 1 gün önce</Text>
                        </VStack>
                        <Button size="xs" colorScheme="red">Engelle</Button>
                      </HStack>
                    </Box>
                    
                    <Box p={3} bg="white" borderRadius="md" borderLeft="4px" borderLeftColor="yellow.400">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">Yeni Cihaz Girişi</Text>
                          <Text fontSize="xs" color="gray.600">Chrome/Windows - 3 gün önce</Text>
                        </VStack>
                        <Button size="xs" colorScheme="yellow">Onayla</Button>
                      </HStack>
                    </Box>
                  </VStack>
                  
                  <Button size="sm" variant="outline" colorScheme="red">
                    Tüm Uyarıları Görüntüle
                  </Button>
                </VStack>
              </Box>
              
              {/* Advanced Activity Analytics */}
              <Box p={6} borderWidth={1} borderRadius="lg" bg="blue.50">
                <VStack spacing={6} align="stretch">
                  <Heading size="sm" color="blue.600">
                    <Icon as={Database} mr={2} />
                    Detaylı Aktivite Analizi
                  </Heading>
                  
                  {/* Activity Statistics */}
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Box p={4} bg="white" borderRadius="md" textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">1,247</Text>
                      <Text fontSize="sm" color="gray.600">Başarılı Giriş</Text>
                      <Text fontSize="xs" color="green.500">+12% bu ay</Text>
                    </Box>
                    
                    <Box p={4} bg="white" borderRadius="md" textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">23</Text>
                      <Text fontSize="sm" color="gray.600">Başarısız Giriş</Text>
                      <Text fontSize="xs" color="red.500">-8% bu ay</Text>
                    </Box>
                    
                    <Box p={4} bg="white" borderRadius="md" textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">5</Text>
                      <Text fontSize="sm" color="gray.600">Şüpheli Aktivite</Text>
                      <Text fontSize="xs" color="orange.500">+2 bu hafta</Text>
                    </Box>
                    
                    <Box p={4} bg="white" borderRadius="md" textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">18</Text>
                      <Text fontSize="sm" color="gray.600">Aktif Cihaz</Text>
                      <Text fontSize="xs" color="purple.500">+3 bu ay</Text>
                    </Box>
                  </SimpleGrid>
                  
                  {/* Activity Filters */}
                  <Box p={4} bg="white" borderRadius="md">
                    <Heading size="xs" mb={3}>Aktivite Filtreleri</Heading>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Tarih Aralığı</FormLabel>
                        <Select size="sm" defaultValue="7days">
                          <option value="today">Bugün</option>
                          <option value="7days">Son 7 Gün</option>
                          <option value="30days">Son 30 Gün</option>
                          <option value="90days">Son 90 Gün</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Aktivite Türü</FormLabel>
                        <Select size="sm" defaultValue="all">
                          <option value="all">Tümü</option>
                          <option value="login">Giriş</option>
                          <option value="logout">Çıkış</option>
                          <option value="failed">Başarısız</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Risk Seviyesi</FormLabel>
                        <Select size="sm" defaultValue="all">
                          <option value="all">Tümü</option>
                          <option value="low">Düşük</option>
                          <option value="medium">Orta</option>
                          <option value="high">Yüksek</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Kullanıcı</FormLabel>
                        <Select size="sm" defaultValue="all">
                          <option value="all">Tüm Kullanıcılar</option>
                          <option value="admin">Yöneticiler</option>
                          <option value="agent">Emlak Danışmanları</option>
                          <option value="client">Müşteriler</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                  
                  {/* Suspicious Activity Reports */}
                  <Box p={4} bg="white" borderRadius="md">
                    <Heading size="xs" mb={3}>Şüpheli Aktivite Raporları</Heading>
                    <VStack spacing={3} align="stretch">
                      <Box p={3} borderLeft="4px" borderLeftColor="red.400" bg="red.50">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">Yüksek Risk: Çoklu Lokasyon Girişi</Text>
                            <Text fontSize="xs" color="gray.600">Kullanıcı: john.doe@example.com</Text>
                            <Text fontSize="xs" color="gray.600">İstanbul → Ankara (2 saat içinde)</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Badge colorScheme="red">Yüksek Risk</Badge>
                            <Button size="xs" colorScheme="red">Hesabı Kilitle</Button>
                          </VStack>
                        </HStack>
                      </Box>
                      
                      <Box p={3} borderLeft="4px" borderLeftColor="orange.400" bg="orange.50">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">Orta Risk: Bilinmeyen Cihaz</Text>
                            <Text fontSize="xs" color="gray.600">IP: 185.123.45.67</Text>
                            <Text fontSize="xs" color="gray.600">Firefox/Linux - İlk kez görüldü</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Badge colorScheme="orange">Orta Risk</Badge>
                            <Button size="xs" colorScheme="orange">2FA İste</Button>
                          </VStack>
                        </HStack>
                      </Box>
                      
                      <Box p={3} borderLeft="4px" borderLeftColor="yellow.400" bg="yellow.50">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">Düşük Risk: Gece Saati Girişi</Text>
                            <Text fontSize="xs" color="gray.600">Saat: 03:45</Text>
                            <Text fontSize="xs" color="gray.600">Kullanıcı: admin@company.com</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Badge colorScheme="yellow">Düşük Risk</Badge>
                            <Button size="xs" colorScheme="yellow">İzle</Button>
                          </VStack>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                  
                  {/* Real-time Monitoring */}
                  <Box p={4} bg="white" borderRadius="md">
                    <HStack justify="space-between" mb={3}>
                      <Heading size="xs">Gerçek Zamanlı İzleme</Heading>
                      <HStack>
                        <Icon as={CheckCircle} color="green.500" />
                        <Text fontSize="sm" color="green.600">Aktif</Text>
                      </HStack>
                    </HStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <VStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">Aktif Oturumlar</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">12</Text>
                        <Text fontSize="xs" color="gray.600">Şu anda çevrimiçi</Text>
                      </VStack>
                      
                      <VStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">Son 1 Saatte</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="green.600">47</Text>
                        <Text fontSize="xs" color="gray.600">Başarılı giriş</Text>
                      </VStack>
                      
                      <VStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">Uyarı Sayısı</Text>
                        <Text fontSize="2xl" fontWeight="bold" color="orange.600">3</Text>
                        <Text fontSize="xs" color="gray.600">İnceleme bekliyor</Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                  
                  {/* Export and Actions */}
                  <HStack spacing={4}>
                    <Button size="sm" leftIcon={<Icon as={FileText} />} variant="outline">
                      Rapor İndir
                    </Button>
                    <Button size="sm" leftIcon={<Icon as={Mail} />} variant="outline">
                      E-posta Gönder
                    </Button>
                    <Button size="sm" leftIcon={<Icon as={Calendar} />} variant="outline">
                      Otomatik Rapor Ayarla
                    </Button>
                  </HStack>
                </VStack>
              </Box>

              <Button colorScheme="blue" onClick={handleSecurityUpdate}>
                <Save size={16} style={{ marginRight: '8px' }} />
                Güvenlik Ayarlarını Kaydet
              </Button>
            </VStack>
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
                          <Badge colorScheme={roleDefinitions[user.role]?.color || 'gray'}>
                            {roleDefinitions[user.role]?.name || user.role}
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
          
          {/* Role and Permission Management Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Role Definitions */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Rol Tanımları</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <Box
                      key={key}
                      p={4}
                      borderWidth="1px"
                      borderColor={borderColor}
                      rounded="md"
                      bg={useColorModeValue('white', 'gray.800')}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Badge colorScheme={role.color} size="lg">
                          {role.name}
                        </Badge>
                        <IconButton
                          aria-label="Edit role"
                          icon={<Icon as={Edit} />}
                          size="sm"
                          variant="ghost"
                        />
                      </HStack>
                      <Text fontSize="sm" color="gray.600" mb={3}>
                        {role.description}
                      </Text>
                      <Text fontSize="xs" fontWeight="semibold" mb={2}>İzinler:</Text>
                      <Flex wrap="wrap" gap={1}>
                        {role.permissions.includes('all') ? (
                          <Badge colorScheme="purple" size="sm">Tüm İzinler</Badge>
                        ) : (
                          role.permissions.map((permission) => (
                            <Badge key={permission} colorScheme="blue" size="sm">
                              {permissionDefinitions[permission]?.name || permission}
                            </Badge>
                          ))
                        )}
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Permission Matrix */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>İzin Matrisi</Heading>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>İzin</Th>
                        <Th>Açıklama</Th>
                        {Object.entries(roleDefinitions).map(([key, role]) => (
                          <Th key={key} textAlign="center">
                            <Badge colorScheme={role.color} size="sm">
                              {role.name}
                            </Badge>
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(permissionDefinitions).map(([permKey, permission]) => (
                        <Tr key={permKey}>
                          <Td fontWeight="semibold">{permission.name}</Td>
                          <Td fontSize="sm" color="gray.600">{permission.description}</Td>
                          {Object.entries(roleDefinitions).map(([roleKey, role]) => (
                            <Td key={roleKey} textAlign="center">
                              {role.permissions.includes('all') || role.permissions.includes(permKey) ? (
                                <Icon as={Shield} color="green.500" />
                              ) : (
                                <Icon as={X} color="red.500" />
                              )}
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>

              {/* User Permission Override */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>Kullanıcı Bazlı İzin Yönetimi</Heading>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Belirli kullanıcılar için rol tanımlarının dışında özel izinler tanımlayabilirsiniz.
                </Text>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Kullanıcı</Th>
                        <Th>Varsayılan Rol</Th>
                        <Th>Özel İzinler</Th>
                        <Th>İşlemler</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <HStack>
                              <Avatar size="xs" name={user.name} />
                              <Text fontSize="sm">{user.name}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={roleDefinitions[user.role]?.color || 'gray'} size="sm">
                              {roleDefinitions[user.role]?.name || user.role}
                            </Badge>
                          </Td>
                          <Td>
                            <Flex wrap="wrap" gap={1}>
                              {user.permissions.includes('all') ? (
                                <Badge colorScheme="purple" size="sm">Tüm İzinler</Badge>
                              ) : (
                                user.permissions.map((permission) => (
                                  <Badge key={permission} colorScheme="green" size="sm">
                                    {permissionDefinitions[permission]?.name || permission}
                                  </Badge>
                                ))
                              )}
                            </Flex>
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Edit permissions"
                              icon={<Icon as={Edit} />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </VStack>
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
            <VStack spacing={8} align="stretch">
              {/* Basic Commission Settings */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color={textColor}>Temel Komisyon Ayarları</Heading>
                  
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
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl>
                      <FormLabel>Minimum Komisyon Tutarı (TL)</FormLabel>
                      <Input
                        name="minimumCommission"
                        value={commissionSettings.minimumCommission}
                        onChange={handleCommissionInputChange}
                        type="number"
                      />
                    </FormControl>
                    
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
                  </SimpleGrid>
                  
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
                  
                  <Box pt={4}>
                    <Button colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleCommissionUpdate}>
                      Temel Ayarları Kaydet
                    </Button>
                  </Box>
                </VStack>
              </Box>

              {/* Commission Tiers */}
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
                    <Heading size="md" color={textColor}>Komisyon Seviyeleri</Heading>
                    <Button size="sm" colorScheme="green" leftIcon={<Icon as={Plus} />} onClick={handleAddCommissionTier}>
                      Yeni Seviye Ekle
                    </Button>
                  </Flex>
                  
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    Danışmanların satış performansına göre farklı komisyon oranları tanımlayın.
                  </Text>
                  
                  <VStack spacing={4}>
                    {commissionTiers.map((tier) => (
                      <Box key={tier.id} p={4} borderWidth="1px" borderColor={borderColor} rounded="md" w="full">
                        <VStack spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">Seviye Adı</FormLabel>
                              <Input
                                value={tier.name}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'name', e.target.value)}
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Min Satış</FormLabel>
                              <Input
                                value={tier.minSales}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'minSales', parseInt(e.target.value))}
                                type="number"
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Max Satış</FormLabel>
                              <Input
                                value={tier.maxSales}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'maxSales', parseInt(e.target.value))}
                                type="number"
                                size="sm"
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">Satış Komisyon (%)</FormLabel>
                              <Input
                                value={tier.saleCommissionRate}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'saleCommissionRate', parseFloat(e.target.value))}
                                type="number"
                                step="0.1"
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Kiralama Komisyon (%)</FormLabel>
                              <Input
                                value={tier.rentalCommissionRate}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'rentalCommissionRate', parseFloat(e.target.value))}
                                type="number"
                                step="0.1"
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Bonus Oranı (%)</FormLabel>
                              <Input
                                value={tier.bonusRate}
                                onChange={(e) => handleCommissionTierChange(tier.id, 'bonusRate', parseFloat(e.target.value))}
                                type="number"
                                step="0.1"
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Durum</FormLabel>
                              <HStack>
                                <Switch
                                  isChecked={tier.isActive}
                                  onChange={(e) => handleCommissionTierChange(tier.id, 'isActive', e.target.checked)}
                                  colorScheme="blue"
                                  size="sm"
                                />
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteCommissionTier(tier.id)}
                                >
                                  <Icon as={Trash2} />
                                </Button>
                              </HStack>
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </Box>

              {/* Commission Split Rules */}
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
                    <Heading size="md" color={textColor}>Komisyon Bölüşüm Kuralları</Heading>
                    <Button size="sm" colorScheme="green" leftIcon={<Icon as={Plus} />} onClick={handleAddCommissionSplitRule}>
                      Yeni Kural Ekle
                    </Button>
                  </Flex>
                  
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    Farklı koşullara göre komisyon bölüşüm oranlarını belirleyin.
                  </Text>
                  
                  <VStack spacing={4}>
                    {commissionSplitRules.map((rule) => (
                      <Box key={rule.id} p={4} borderWidth="1px" borderColor={borderColor} rounded="md" w="full"
                           bg={rule.isDefault ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}>
                        <VStack spacing={4}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">Kural Adı</FormLabel>
                              <Input
                                value={rule.name}
                                onChange={(e) => handleCommissionSplitChange(rule.id, 'name', e.target.value)}
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Koşullar</FormLabel>
                              <Input
                                value={rule.conditions}
                                onChange={(e) => handleCommissionSplitChange(rule.id, 'conditions', e.target.value)}
                                size="sm"
                              />
                            </FormControl>
                          </SimpleGrid>
                          
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                            <FormControl>
                              <FormLabel fontSize="sm">Danışman Payı (%)</FormLabel>
                              <Input
                                value={rule.agentShare}
                                onChange={(e) => {
                                  const agentShare = parseInt(e.target.value);
                                  handleCommissionSplitChange(rule.id, 'agentShare', agentShare);
                                  handleCommissionSplitChange(rule.id, 'companyShare', 100 - agentShare);
                                }}
                                type="number"
                                min="0"
                                max="100"
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">Şirket Payı (%)</FormLabel>
                              <Input
                                value={rule.companyShare}
                                isReadOnly
                                bg={useColorModeValue('gray.100', 'gray.700')}
                                size="sm"
                              />
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel fontSize="sm">İşlemler</FormLabel>
                              <HStack>
                                <Button
                                  size="sm"
                                  colorScheme={rule.isDefault ? 'blue' : 'gray'}
                                  variant={rule.isDefault ? 'solid' : 'outline'}
                                  onClick={() => handleSetDefaultSplitRule(rule.id)}
                                  isDisabled={rule.isDefault}
                                >
                                  {rule.isDefault ? 'Varsayılan' : 'Varsayılan Yap'}
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleDeleteCommissionSplitRule(rule.id)}
                                  isDisabled={rule.isDefault}
                                >
                                  <Icon as={Trash2} />
                                </Button>
                              </HStack>
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              </Box>

              {/* Team Commission Settings */}
              <Box
                bg={bgColor}
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                rounded="lg"
                boxShadow="sm"
              >
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color={textColor}>Takım Komisyon Ayarları</Heading>
                  
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                    Takım liderleri ve üyeleri için ek komisyon bonusları tanımlayın.
                  </Text>
                  
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Icon as={Users} />
                      <Text fontWeight="medium">Takım Komisyonu Aktif</Text>
                    </HStack>
                    <Switch
                      isChecked={teamCommissionSettings.enableTeamCommission}
                      onChange={(e) => handleTeamCommissionChange('enableTeamCommission', e.target.checked)}
                      colorScheme="blue"
                    />
                  </Flex>
                  
                  {teamCommissionSettings.enableTeamCommission && (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Takım Lideri Bonus Oranı (%)</FormLabel>
                        <Input
                          value={teamCommissionSettings.teamLeaderBonus}
                          onChange={(e) => handleTeamCommissionChange('teamLeaderBonus', parseFloat(e.target.value))}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Takım Üyesi Bonus Oranı (%)</FormLabel>
                        <Input
                          value={teamCommissionSettings.teamMemberBonus}
                          onChange={(e) => handleTeamCommissionChange('teamMemberBonus', parseFloat(e.target.value))}
                          type="number"
                          step="0.1"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Minimum Takım Büyüklüğü</FormLabel>
                        <Input
                          value={teamCommissionSettings.minimumTeamSize}
                          onChange={(e) => handleTeamCommissionChange('minimumTeamSize', parseInt(e.target.value))}
                          type="number"
                          min="2"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Takım Performans Eşiği (Aylık Satış)</FormLabel>
                        <Input
                          value={teamCommissionSettings.teamPerformanceThreshold}
                          onChange={(e) => handleTeamCommissionChange('teamPerformanceThreshold', parseInt(e.target.value))}
                          type="number"
                          min="1"
                        />
                      </FormControl>
                    </SimpleGrid>
                  )}
                </VStack>
              </Box>

              {/* Save All Settings */}
              <Box pt={4}>
                <Button size="lg" colorScheme="blue" leftIcon={<Icon as={Save} />} onClick={handleAdvancedCommissionUpdate}>
                  Tüm Komisyon Ayarlarını Kaydet
                </Button>
              </Box>
            </VStack>
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
                  {Object.entries(roleDefinitions).map(([key, role]) => (
                    <option key={key} value={key}>{role.name}</option>
                  ))}
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