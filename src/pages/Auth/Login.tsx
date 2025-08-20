import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  HStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { Mail, Lock, Shield, User } from 'react-feather';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [activeTab, setActiveTab] = useState(0);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'E-posta zorunludur';
    if (!password) errs.password = 'Şifre zorunludur';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (role: 'admin' | 'consultant') => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      await login({ email, password, role });
      toast({ title: 'Giriş başarılı', status: 'success' });
      navigate(from, { replace: true });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu';
      toast({ title: 'Giriş başarısız', description: errorMessage, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const role = activeTab === 0 ? 'admin' : 'consultant';
      handleSubmit(role);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50" p={4}>
      <Card maxW="md" w="100%" boxShadow="xl">
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">Emlak Yönetim Sistemi</Heading>
            <Text textAlign="center" color="gray.600">Hoş Geldiniz</Text>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>E-posta</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Mail size={18} />
                </InputLeftElement>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder="ornek@firma.com" 
                />
              </InputGroup>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Şifre</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Lock size={18} />
                </InputLeftElement>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder="******" 
                />
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Tabs colorScheme="blue" isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab display="flex" alignItems="center" gap={2}><Shield size={16} /> Admin Girişi</Tab>
                <Tab display="flex" alignItems="center" gap={2}><User size={16} /> Danışman Girişi</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack>
                    <Button colorScheme="blue" w="full" isLoading={isLoading} onClick={() => handleSubmit('admin')}>Admin olarak giriş yap</Button>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack>
                    <Button colorScheme="green" w="full" isLoading={isLoading} onClick={() => handleSubmit('consultant')}>Danışman olarak giriş yap</Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <HStack justify="space-between">
              <Link to="#">Şifremi unuttum</Link>
              <Text fontSize="sm" color="gray.500">Destek için: info@adnbilisim.com.tr</Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;