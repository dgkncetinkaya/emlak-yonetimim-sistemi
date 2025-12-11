import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Switch,
  Card,
  CardBody,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Image,
  useToast,
  FormHelperText,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FiSave, FiUpload, FiRefreshCw, FiEye } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { appearanceService, type UserAppearanceSettings } from '../../../services/appearanceService';
import { useAppearance } from '../../../context/AppearanceContext';

const AppearanceSettings = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings, isLoading, updateSettings: updateContextSettings, refreshSettings } = useAppearance();
  const [localSettings, setLocalSettings] = useState<Partial<UserAppearanceSettings>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Sync context settings to local state
  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: appearanceService.updateAppearanceSettings,
    onSuccess: async (data) => {
      await updateContextSettings(data);
      await refreshSettings();
      toast({
        title: 'Başarılı',
        description: 'Görünüm ayarları güncellendi ve uygulandı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Görünüm ayarları güncellenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: appearanceService.resetAppearanceSettings,
    onSuccess: async () => {
      await refreshSettings();
      toast({
        title: 'Başarılı',
        description: 'Görünüm ayarları sıfırlandı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const handleChange = (field: keyof UserAppearanceSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(localSettings);
  };

  const handleReset = () => {
    if (window.confirm('Tüm görünüm ayarlarını sıfırlamak istediğinizden emin misiniz?')) {
      resetMutation.mutate();
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Hata',
        description: 'Logo dosyası 2MB\'dan küçük olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    try {
      const logoUrl = await appearanceService.uploadLogo(file);
      handleChange('logo_url', logoUrl);
      toast({
        title: 'Başarılı',
        description: 'Logo yüklendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Logo yüklenirken hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <Text>Yükleniyor...</Text>;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Logo ve Marka */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Logo ve Marka</Heading>
            
            <FormControl>
              <FormLabel>Şirket Logosu</FormLabel>
              <HStack spacing={4}>
                {localSettings.logo_url && (
                  <Box
                    w="100px"
                    h="100px"
                    borderRadius="md"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Image
                      src={localSettings.logo_url}
                      alt="Logo"
                      objectFit="contain"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                )}
                <VStack align="start">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <Button
                    leftIcon={<FiUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    size="sm"
                  >
                    Logo Yükle
                  </Button>
                  <FormHelperText>PNG, JPG veya SVG (Max 2MB)</FormHelperText>
                </VStack>
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Şirket Adı</FormLabel>
              <Input
                value={localSettings.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="Şirket adınızı girin"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Marka Rengi</FormLabel>
              <HStack>
                <Input
                  type="color"
                  value={localSettings.brand_color || '#3182CE'}
                  onChange={(e) => handleChange('brand_color', e.target.value)}
                  w="80px"
                />
                <Input
                  value={localSettings.brand_color || '#3182CE'}
                  onChange={(e) => handleChange('brand_color', e.target.value)}
                  placeholder="#3182CE"
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Tema Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Tema Ayarları</Heading>
            
            <FormControl>
              <FormLabel>Tema Modu</FormLabel>
              <Select
                value={localSettings.theme_mode || 'light'}
                onChange={(e) => handleChange('theme_mode', e.target.value)}
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
                <option value="auto">Otomatik</option>
              </Select>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Ana Renk</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.primary_color || '#3182CE'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.primary_color || '#3182CE'}</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>İkincil Renk</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.secondary_color || '#805AD5'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.secondary_color || '#805AD5'}</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Vurgu Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.accent_color || '#38B2AC'}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.accent_color || '#38B2AC'}</Text>
                </HStack>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Sidebar Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Kenar Çubuğu Ayarları</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Sidebar Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.sidebar_color || '#1A202C'}
                    onChange={(e) => handleChange('sidebar_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.sidebar_color || '#1A202C'}</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Sidebar Metin Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.sidebar_text_color || '#FFFFFF'}
                    onChange={(e) => handleChange('sidebar_text_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.sidebar_text_color || '#FFFFFF'}</Text>
                </HStack>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>Sidebar Varsayılan Kapalı</FormLabel>
                <Switch
                  isChecked={localSettings.sidebar_collapsed || false}
                  onChange={(e) => handleChange('sidebar_collapsed', e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Header Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Üst Çubuk Ayarları</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Header Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.header_color || '#FFFFFF'}
                    onChange={(e) => handleChange('header_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.header_color || '#FFFFFF'}</Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Header Metin Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.header_text_color || '#1A202C'}
                    onChange={(e) => handleChange('header_text_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.header_text_color || '#1A202C'}</Text>
                </HStack>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>Şirket Logosunu Göster</FormLabel>
                <Switch
                  isChecked={localSettings.show_company_logo !== false}
                  onChange={(e) => handleChange('show_company_logo', e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Arka Plan Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Arka Plan Ayarları</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Sayfa Arka Plan Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.background_color || '#F7FAFC'}
                    onChange={(e) => handleChange('background_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.background_color || '#F7FAFC'}</Text>
                </HStack>
                <FormHelperText>Ana sayfa arka plan rengi</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>İçerik Arka Plan Rengi</FormLabel>
                <HStack>
                  <Input
                    type="color"
                    value={localSettings.content_background_color || '#FFFFFF'}
                    onChange={(e) => handleChange('content_background_color', e.target.value)}
                    w="60px"
                  />
                  <Text fontSize="sm">{localSettings.content_background_color || '#FFFFFF'}</Text>
                </HStack>
                <FormHelperText>Kart ve içerik alanlarının arka plan rengi</FormHelperText>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Font ve Stil Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Font ve Stil Ayarları</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Font Ailesi</FormLabel>
                <Select
                  value={localSettings.font_family || 'Inter'}
                  onChange={(e) => handleChange('font_family', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Font Boyutu</FormLabel>
                <Select
                  value={localSettings.font_size || 'medium'}
                  onChange={(e) => handleChange('font_size', e.target.value)}
                >
                  <option value="small">Küçük</option>
                  <option value="medium">Orta</option>
                  <option value="large">Büyük</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Kart Köşe Yuvarlaklığı</FormLabel>
                <Select
                  value={localSettings.card_border_radius || 'md'}
                  onChange={(e) => handleChange('card_border_radius', e.target.value)}
                >
                  <option value="none">Yok</option>
                  <option value="sm">Küçük</option>
                  <option value="md">Orta</option>
                  <option value="lg">Büyük</option>
                  <option value="xl">Çok Büyük</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Buton Stili</FormLabel>
                <Select
                  value={localSettings.button_style || 'solid'}
                  onChange={(e) => handleChange('button_style', e.target.value)}
                >
                  <option value="solid">Dolu</option>
                  <option value="outline">Çerçeveli</option>
                  <option value="ghost">Hayalet</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Dashboard Ayarları */}
      <Card>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Dashboard Ayarları</Heading>
            
            <FormControl>
              <FormLabel>Dashboard Düzeni</FormLabel>
              <Select
                value={localSettings.dashboard_layout || 'grid'}
                onChange={(e) => handleChange('dashboard_layout', e.target.value)}
              >
                <option value="grid">Grid</option>
                <option value="list">Liste</option>
                <option value="compact">Kompakt</option>
              </Select>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>İstatistikleri Göster</FormLabel>
                <Switch
                  isChecked={localSettings.show_statistics !== false}
                  onChange={(e) => handleChange('show_statistics', e.target.checked)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>Grafikleri Göster</FormLabel>
                <Switch
                  isChecked={localSettings.show_charts !== false}
                  onChange={(e) => handleChange('show_charts', e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Kaydet ve Sıfırla Butonları */}
      <HStack justify="space-between">
        <Button
          leftIcon={<FiRefreshCw />}
          variant="outline"
          colorScheme="red"
          onClick={handleReset}
          isLoading={resetMutation.isPending}
        >
          Varsayılana Sıfırla
        </Button>
        <Button
          leftIcon={<FiSave />}
          colorScheme="blue"
          onClick={handleSave}
          isLoading={updateMutation.isPending}
        >
          Kaydet
        </Button>
      </HStack>
    </VStack>
  );
};

export default AppearanceSettings;
