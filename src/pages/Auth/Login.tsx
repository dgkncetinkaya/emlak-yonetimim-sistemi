import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Container,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { Mail, Lock, Eye, EyeOff, Shield, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { login, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/demo-emlak';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [selectedRole, setSelectedRole] = useState<'admin' | 'consultant'>('admin');
  const [showDemoInfo, setShowDemoInfo] = useState(true);

  // Demo kullanıcı bilgileri
  const demoUsers = {
    admin: {
      email: 'admin@emlak.com',
      password: 'admin123',
      name: 'Sistem Yöneticisi',
      description: 'Tam yetkili yönetim paneli'
    },
    consultant: {
      email: 'danisman@emlak.com',
      password: 'danisman123',
      name: 'Emlak Danışmanı',
      description: 'Portföy ve müşteri yönetimi'
    }
  };

  const validate = () => {
    const errs: typeof errors = {};

    if (!email) {
      errs.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!password) {
      errs.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      errs.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) {
      return;
    }

    setErrors({});

    try {
      await login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: selectedRole
      });

      toast({
        title: 'Giriş Başarılı',
        description: `Hoş geldiniz! ${selectedRole === 'admin' ? 'Yönetici' : 'Danışman'} paneline yönlendiriliyorsunuz.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      // Slug oluşturma fonksiyonu
      const createSlug = (text: string) => {
        return text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-')     // Boşlukları tire ile değiştir
          .replace(/[^\w\-]+/g, '') // Alfanümerik olmayan karakterleri kaldır
          .replace(/\-\-+/g, '-')   // Birden fazla tireyi tek tireye indir
          .replace(/^-+/, '')       // Baştaki tireleri kaldır
          .replace(/-+$/, '');      // Sondaki tireleri kaldır
      };

      // Tenant adını belirle (companyName yoksa 'app' kullan)
      // Not: Gerçek senaryoda bu bilgi backend'den gelmeli
      const tenantName = selectedRole === 'admin' ? 'demo-emlak' : 'demo-danisman';
      const targetPath = `/${tenantName}`;

      setTimeout(() => {
        navigate(from === '/app' ? targetPath : from, { replace: true });
      }, 500);

    } catch (error: any) {
      let errorMessage = 'Giriş işlemi başarısız oldu';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre hatalı';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme yapıldı. Lütfen biraz bekleyiniz';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });

      toast({
        title: 'Giriş Başarısız',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fillDemoData = (role: 'admin' | 'consultant') => {
    const user = demoUsers[role];
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(role);
    setErrors({});

    toast({
      title: 'Demo Bilgileri Dolduruldu',
      description: `${user.name} bilgileri form alanlarına dolduruldu`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    });
  };

  return (
    <Box minH="100vh" bg="gray.900" display="flex" position="relative" overflow="hidden">
      {/* Background Elements - Optimized */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="800px"
        h="800px"
        bg="blue.900"
        opacity="0.1"
        borderRadius="full"
        filter="blur(80px)"
        zIndex="0"
        pointerEvents="none"
        willChange="transform"
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-10%"
        w="600px"
        h="600px"
        bg="purple.900"
        opacity="0.1"
        borderRadius="full"
        filter="blur(80px)"
        zIndex="0"
        pointerEvents="none"
        willChange="transform"
      />

      <Container maxW="container.xl" display="flex" alignItems="center" justifyContent="center" position="relative" zIndex="1">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={20} w="full" alignItems="center">

          {/* Left Side - Hero Text (Hidden on Mobile) */}
          <VStack spacing={8} align="start" display={{ base: 'none', lg: 'flex' }}>
            <Box>
              <Badge colorScheme="blue" mb={4} fontSize="md" px={3} py={1} borderRadius="full">
                Emlak Yönetim Sistemi
              </Badge>
              <Heading size="3xl" color="white" lineHeight="1.2">
                İşinizi Dijitalin <br />
                <Text as="span" bgGradient="linear(to-r, blue.400, purple.400)" bgClip="text">
                  Gücüyle Yönetin
                </Text>
              </Heading>
            </Box>

            <Text color="gray.400" fontSize="xl" maxW="lg">
              Portföy yönetiminden müşteri takibine, finansal raporlardan sözleşmelere kadar her şey tek bir platformda.
            </Text>

            <VStack spacing={4} align="start">
              {[
                'Sınırsız Portföy Yönetimi',
                'Gelişmiş CRM Araçları',
                'Detaylı Finansal Raporlar',
                'Mobil Uyumlu Arayüz'
              ].map((item, index) => (
                <HStack key={index} spacing={3}>
                  <Icon as={CheckCircle} color="blue.400" boxSize={6} />
                  <Text color="gray.300" fontSize="lg">{item}</Text>
                </HStack>
              ))}
            </VStack>
          </VStack>

          {/* Right Side - Login Form */}
          <Box>
            <Box
              bg="gray.800"
              p={{ base: 8, md: 10 }}
              borderRadius="2xl"
              boxShadow="xl"
              border="1px solid"
              borderColor="gray.700"
            >
                <VStack spacing={8} align="stretch">
                  <VStack spacing={2} align="start">
                    <Heading size="lg" color="white">Hoş Geldiniz</Heading>
                    <Text color="gray.400">Hesabınıza giriş yaparak devam edin</Text>
                  </VStack>

                  {showDemoInfo && (
                    <Alert status="info" bg="blue.900" borderColor="blue.700" color="blue.100" borderRadius="lg">
                      <AlertIcon color="blue.200" />
                      <Box flex="1">
                        <AlertTitle fontSize="sm">Demo Hesapları</AlertTitle>
                        <AlertDescription display="block" fontSize="xs" mt={1}>
                          Hızlı giriş için aşağıdaki demo butonlarını kullanabilirsiniz.
                        </AlertDescription>
                      </Box>
                      <CloseButton onClick={() => setShowDemoInfo(false)} />
                    </Alert>
                  )}

                  <VStack spacing={4}>
                    <HStack spacing={4} w="full">
                      <Button
                        flex={1}
                        variant={selectedRole === 'admin' ? 'solid' : 'outline'}
                        colorScheme={selectedRole === 'admin' ? 'blue' : 'gray'}
                        onClick={() => setSelectedRole('admin')}
                        leftIcon={<Shield size={18} />}
                        h={12}
                        borderColor={selectedRole === 'admin' ? 'transparent' : 'gray.600'}
                        color={selectedRole === 'admin' ? 'white' : 'gray.400'}
                        _hover={{ bg: selectedRole === 'admin' ? 'blue.600' : 'gray.700' }}
                      >
                        Yönetici
                      </Button>
                      <Button
                        flex={1}
                        variant={selectedRole === 'consultant' ? 'solid' : 'outline'}
                        colorScheme={selectedRole === 'consultant' ? 'purple' : 'gray'}
                        onClick={() => setSelectedRole('consultant')}
                        leftIcon={<User size={18} />}
                        h={12}
                        borderColor={selectedRole === 'consultant' ? 'transparent' : 'gray.600'}
                        color={selectedRole === 'consultant' ? 'white' : 'gray.400'}
                        _hover={{ bg: selectedRole === 'consultant' ? 'purple.600' : 'gray.700' }}
                      >
                        Danışman
                      </Button>
                    </HStack>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                      <VStack spacing={5}>
                        {errors.general && (
                          <Alert status="error" bg="red.900" borderColor="red.700" color="red.100" borderRadius="md">
                            <AlertIcon color="red.200" />
                            <AlertDescription>{errors.general}</AlertDescription>
                          </Alert>
                        )}

                        <FormControl isInvalid={!!errors.email}>
                          <FormLabel color="gray.300">E-posta Adresi</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" h={12}>
                              <Mail size={20} color="#718096" />
                            </InputLeftElement>
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="ornek@firma.com"
                              h={12}
                              bg="gray.700"
                              border="1px solid"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: "gray.500" }}
                              _focus={{ borderColor: "blue.500", bg: "gray.700", boxShadow: "none" }}
                              _placeholder={{ color: 'gray.500' }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password}>
                          <FormLabel color="gray.300">Şifre</FormLabel>
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" h={12}>
                              <Lock size={20} color="#718096" />
                            </InputLeftElement>
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="••••••••"
                              h={12}
                              bg="gray.700"
                              border="1px solid"
                              borderColor="gray.600"
                              color="white"
                              _hover={{ borderColor: "gray.500" }}
                              _focus={{ borderColor: "blue.500", bg: "gray.700", boxShadow: "none" }}
                              _placeholder={{ color: 'gray.500' }}
                            />
                            <InputRightElement h={12}>
                              <IconButton
                                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                onClick={() => setShowPassword(!showPassword)}
                                variant="ghost"
                                color="gray.400"
                                _hover={{ color: "white", bg: "transparent" }}
                              />
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>

                        <Button
                          type="submit"
                          colorScheme="blue"
                          size="lg"
                          w="full"
                          h={12}
                          isLoading={authLoading}
                          loadingText="Giriş yapılıyor..."
                          bgGradient="linear(to-r, blue.500, purple.500)"
                          _hover={{ bgGradient: "linear(to-r, blue.600, purple.600)" }}
                          rightIcon={<ArrowRight size={20} />}
                        >
                          Giriş Yap
                        </Button>
                      </VStack>
                    </form>
                  </VStack>

                  <VStack spacing={4} pt={4}>
                    <Text color="gray.500" fontSize="sm">Demo Hesapları ile Hızlı Giriş</Text>
                    <HStack spacing={3} w="full">
                      {Object.entries(demoUsers).map(([role, user]) => (
                        <Button
                          key={role}
                          size="sm"
                          variant="outline"
                          w="full"
                          borderColor="gray.700"
                          color="gray.400"
                          _hover={{ bg: 'gray.700', color: 'white', borderColor: 'gray.600' }}
                          onClick={() => fillDemoData(role as 'admin' | 'consultant')}
                        >
                          {role === 'admin' ? 'Yönetici' : 'Danışman'}
                        </Button>
                      ))}
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Login;