import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
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
  Divider,
  useToast,
  IconButton,
  Flex,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { Mail, Lock, Eye, EyeOff, Shield, User, Home } from 'react-feather';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { login, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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
      description: 'Tüm sistem yetkilerine sahip'
    },
    consultant: {
      email: 'danisman@emlak.com',
      password: 'danisman123',
      name: 'Emlak Danışmanı',
      description: 'Emlak işlemleri ve müşteri yönetimi'
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
      console.log('Login attempt:', { email, role: selectedRole });
      
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
      });
      
      // Kısa bir gecikme ile yönlendirme
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
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
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      p={4}
    >
      <Box maxW="lg" w="100%">
        {/* Demo Bilgi Kartı */}
        {showDemoInfo && (
          <Alert status="info" mb={6} borderRadius="lg" boxShadow="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="lg">Demo Sistemi</AlertTitle>
              <AlertDescription display="block" mt={2}>
                Bu bir demo sistemdir. Aşağıdaki demo hesapları ile giriş yapabilirsiniz.
              </AlertDescription>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={() => setShowDemoInfo(false)}
            />
          </Alert>
        )}

        {/* Ana Giriş Kartı */}
        <Card boxShadow="2xl" borderRadius="xl" bg="white">
          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Başlık */}
              <VStack spacing={2}>
                <Flex align="center" gap={3}>
                   <Home size={32} color="#667eea" />
                   <Heading size="xl" color="gray.700">
                     ADN One Emlak
                   </Heading>
                 </Flex>
                <Text color="gray.500" fontSize="lg">
                  Hesabınıza giriş yapın
                </Text>
              </VStack>

              {/* Rol Seçimi */}
              <VStack spacing={3}>
                <Text fontWeight="semibold" color="gray.600">Giriş Türü Seçiniz</Text>
                <HStack spacing={4} w="full">
                  <Button
                    variant={selectedRole === 'admin' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    leftIcon={<Shield size={18} />}
                    onClick={() => setSelectedRole('admin')}
                    flex={1}
                    size="lg"
                  >
                    Yönetici
                  </Button>
                  <Button
                    variant={selectedRole === 'consultant' ? 'solid' : 'outline'}
                    colorScheme="green"
                    leftIcon={<User size={18} />}
                    onClick={() => setSelectedRole('consultant')}
                    flex={1}
                    size="lg"
                  >
                    Danışman
                  </Button>
                </HStack>
              </VStack>

              <Divider />

              {/* Giriş Formu */}
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  {/* Genel Hata Mesajı */}
                  {errors.general && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  {/* E-posta */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontWeight="semibold">E-posta Adresi</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Mail size={20} color="#718096" />
                      </InputLeftElement>
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="ornek@firma.com"
                        bg="gray.50"
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{ borderColor: "blue.400", bg: "white" }}
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  {/* Şifre */}
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontWeight="semibold">Şifre</FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Lock size={20} color="#718096" />
                      </InputLeftElement>
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        onKeyDown={handleKeyDown}
                        placeholder="Şifrenizi giriniz"
                        bg="gray.50"
                        border="2px"
                        borderColor="gray.200"
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{ borderColor: "blue.400", bg: "white" }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                          icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          onClick={togglePasswordVisibility}
                          variant="ghost"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  {/* Giriş Butonu */}
                  <Button 
                    type="submit"
                    colorScheme={selectedRole === 'admin' ? 'blue' : 'green'}
                    size="lg"
                    w="full"
                    isLoading={authLoading}
                    loadingText="Giriş yapılıyor..."
                    leftIcon={selectedRole === 'admin' ? <Shield size={18} /> : <User size={18} />}
                  >
                    {selectedRole === 'admin' ? 'Yönetici Girişi' : 'Danışman Girişi'}
                  </Button>
                </VStack>
              </form>

              <Divider />

              {/* Demo Hesaplar */}
              <VStack spacing={3}>
                <Text fontWeight="semibold" color="gray.600">Demo Hesapları</Text>
                <VStack spacing={2} w="full">
                  {Object.entries(demoUsers).map(([role, user]) => (
                    <Card 
                      key={role}
                      variant="outline" 
                      w="full" 
                      cursor="pointer"
                      onClick={() => fillDemoData(role as 'admin' | 'consultant')}
                      _hover={{ bg: "gray.50", borderColor: role === 'admin' ? 'blue.300' : 'green.300' }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Badge colorScheme={role === 'admin' ? 'blue' : 'green'}>
                                {role === 'admin' ? 'YÖNETİCİ' : 'DANIŞMAN'}
                              </Badge>
                              <Text fontWeight="semibold">{user.name}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">{user.description}</Text>
                            <Text fontSize="xs" color="gray.400">{user.email}</Text>
                          </VStack>
                          {role === 'admin' ? <Shield size={24} color="#3182ce" /> : <User size={24} color="#38a169" />}
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </VStack>

              {/* Alt Bilgiler */}
              <VStack spacing={2}>
                <HStack justify="center" spacing={4}>
                  <Link to="#" style={{ color: '#718096', fontSize: '14px' }}>
                    Şifremi Unuttum
                  </Link>
                  <Text color="gray.400">•</Text>
                  <Link to="#" style={{ color: '#718096', fontSize: '14px' }}>
                    Destek
                  </Link>
                </HStack>
                <Text fontSize="xs" color="gray.400" textAlign="center">
                  © 2025 ADN Bilişim - ADN One Emlak
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;