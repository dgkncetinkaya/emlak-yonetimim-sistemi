import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Checkbox,
  Link,
  Flex,
  Image,
  useToast,
  VStack,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building2, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

const MotionBox = motion(Box);

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Şifreler eşleşmiyor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: 'Hata',
        description: 'Kullanım koşullarını kabul etmelisiniz',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase (trigger will automatically create user profile)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            phone: formData.phone,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        toast({
          title: 'Başarılı!',
          description: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Kayıt sırasında bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: '14 Gün Ücretsiz',
      description: 'Kredi kartı gerekmez'
    },
    {
      icon: Zap,
      title: 'Hızlı Kurulum',
      description: '5 dakikada başlayın'
    },
    {
      icon: Users,
      title: 'Sınırsız Destek',
      description: '7/24 yardım'
    }
  ];

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
      {/* Background Gradients - Optimized */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        w="50%"
        h="50%"
        bgGradient="radial(blue.600, transparent 70%)"
        opacity={0.1}
        filter="blur(60px)"
        pointerEvents="none"
        willChange="transform"
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="50%"
        h="50%"
        bgGradient="radial(purple.600, transparent 70%)"
        opacity={0.1}
        filter="blur(60px)"
        pointerEvents="none"
        willChange="transform"
      />

      <Container maxW="container.xl" py={12} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
          {/* Left Side - Info */}
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            display={{ base: 'none', lg: 'block' }}
          >
            <VStack align="start" spacing={8}>
              {/* Logo */}
              <Box>
                <Heading size="2xl" color="white" mb={2}>
                  Emlak Yönetim Sistemi
                </Heading>
                <Text color="gray.400" fontSize="lg">
                  Emlak işinizi dijitalleştirin, verimliliğinizi artırın
                </Text>
              </Box>

              {/* Benefits */}
              <VStack align="start" spacing={6} w="full">
                {benefits.map((benefit, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <HStack spacing={4} align="start">
                      <Box
                        p={3}
                        bg="whiteAlpha.100"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                      >
                        <Icon as={benefit.icon} color="blue.400" boxSize={6} />
                      </Box>
                      <Box>
                        <Text color="white" fontWeight="bold" fontSize="lg">
                          {benefit.title}
                        </Text>
                        <Text color="gray.400">
                          {benefit.description}
                        </Text>
                      </Box>
                    </HStack>
                  </MotionBox>
                ))}
              </VStack>

              {/* Features List */}
              <Box
                bg="whiteAlpha.50"
                p={6}
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                w="full"
              >
                <Text color="white" fontWeight="bold" mb={4}>
                  Ücretsiz Deneme Süresinde:
                </Text>
                <VStack align="start" spacing={3}>
                  {[
                    'Sınırsız portföy ekleme',
                    'Gelişmiş CRM özellikleri',
                    'Müşteri takip sistemi',
                    'Finansal raporlar',
                    'Mobil uygulama erişimi'
                  ].map((feature, index) => (
                    <HStack key={index} spacing={3}>
                      <Icon as={CheckCircle2} color="green.400" boxSize={5} />
                      <Text color="gray.300">{feature}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </MotionBox>

          {/* Right Side - Form */}
          <MotionBox
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box
              bg="gray.800"
              p={8}
              borderRadius="2xl"
              border="1px solid"
              borderColor="gray.700"
              boxShadow="2xl"
            >
              <VStack spacing={6} align="stretch">
                {/* Header */}
                <Box textAlign="center">
                  <Badge
                    colorScheme="green"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                    mb={4}
                  >
                    14 Gün Ücretsiz Deneme
                  </Badge>
                  <Heading size="xl" color="white" mb={2}>
                    Hemen Başlayın
                  </Heading>
                  <Text color="gray.400">
                    Kredi kartı bilgisi gerekmez
                  </Text>
                </Box>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.300">Ad Soyad</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={User} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Ahmet Yılmaz"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.300">E-posta</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={Mail} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="ornek@email.com"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.300">Telefon</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={Phone} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="0532 123 4567"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.300">Şirket Adı</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={Building2} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Emlak Ofisi"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.300">Şifre</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={Lock} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label="Toggle password"
                            icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            variant="ghost"
                            color="gray.500"
                            onClick={() => setShowPassword(!showPassword)}
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.300">Şifre Tekrar</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={Lock} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          name="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          bg="gray.900"
                          border="1px solid"
                          borderColor="gray.600"
                          color="white"
                          _hover={{ borderColor: 'gray.500' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <Checkbox
                        name="acceptTerms"
                        isChecked={formData.acceptTerms}
                        onChange={handleChange}
                        colorScheme="blue"
                        color="gray.300"
                      >
                        <Text fontSize="sm">
                          <Link color="blue.400" href="/terms" isExternal>
                            Kullanım Koşulları
                          </Link>
                          {' '}ve{' '}
                          <Link color="blue.400" href="/privacy" isExternal>
                            Gizlilik Politikası
                          </Link>
                          'nı kabul ediyorum
                        </Text>
                      </Checkbox>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      rightIcon={<ArrowRight size={20} />}
                      isLoading={loading}
                      loadingText="Hesap Oluşturuluyor..."
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      Ücretsiz Denemeyi Başlat
                    </Button>
                  </VStack>
                </form>

                <Divider borderColor="gray.600" />

                {/* Footer */}
                <Text textAlign="center" color="gray.400" fontSize="sm">
                  Zaten hesabınız var mı?{' '}
                  <Link color="blue.400" fontWeight="bold" onClick={() => navigate('/login')}>
                    Giriş Yapın
                  </Link>
                </Text>
              </VStack>
            </Box>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Register;
