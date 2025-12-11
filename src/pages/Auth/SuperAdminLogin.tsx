import React, { useState } from 'react';
import {
    Box,
    Card,
    CardBody,
    Heading,
    Text,
    VStack,
    HStack,
    Input,
    Button,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    useColorModeValue,
    useToast,
    Alert,
    AlertIcon,
    Image,
    Divider
} from '@chakra-ui/react';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock SuperAdmin credentials
const MOCK_SUPERADMIN = {
    email: 'superadmin@emlak.com',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'superadmin'
};

const SuperAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const bg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check credentials
        if (email === MOCK_SUPERADMIN.email && password === MOCK_SUPERADMIN.password) {
            // Store session in localStorage
            const session = {
                user: {
                    email: MOCK_SUPERADMIN.email,
                    name: MOCK_SUPERADMIN.name,
                    role: MOCK_SUPERADMIN.role
                },
                token: 'mock-superadmin-token-' + Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };

            localStorage.setItem('superadmin_session', JSON.stringify(session));

            toast({
                title: 'Giriş Başarılı',
                description: 'SuperAdmin paneline yönlendiriliyorsunuz...',
                status: 'success',
                duration: 2000,
                isClosable: true
            });

            setTimeout(() => {
                navigate('/superadmin3537/dashboard');
            }, 1000);
        } else {
            toast({
                title: 'Giriş Başarısız',
                description: 'Email veya şifre hatalı',
                status: 'error',
                duration: 3000,
                isClosable: true
            });
        }

        setLoading(false);
    };

    const fillMockCredentials = () => {
        setEmail(MOCK_SUPERADMIN.email);
        setPassword(MOCK_SUPERADMIN.password);
    };

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={bg}
            px={4}
        >
            <Card
                maxW="450px"
                w="full"
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                shadow="2xl"
            >
                <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                        {/* Header */}
                        <VStack spacing={3}>
                            <Box
                                p={4}
                                bg="red.50"
                                borderRadius="full"
                                display="inline-flex"
                            >
                                <Shield size={40} color="#E53E3E" />
                            </Box>
                            <Heading fontSize="2xl" textAlign="center">
                                SuperAdmin Girişi
                            </Heading>
                            <Text fontSize="sm" color="gray.500" textAlign="center">
                                Sistem yönetimi için giriş yapın
                            </Text>
                        </VStack>

                        <Divider />

                        {/* Mock Credentials Info */}
                        <Alert status="info" borderRadius="lg" fontSize="sm">
                            <AlertIcon />
                            <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="medium">Test Bilgileri:</Text>
                                <Text fontSize="xs">Email: {MOCK_SUPERADMIN.email}</Text>
                                <Text fontSize="xs">Şifre: {MOCK_SUPERADMIN.password}</Text>
                                <Button
                                    size="xs"
                                    colorScheme="blue"
                                    variant="link"
                                    onClick={fillMockCredentials}
                                    mt={1}
                                >
                                    Otomatik Doldur
                                </Button>
                            </VStack>
                        </Alert>

                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Email</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Mail size={18} color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            type="email"
                                            placeholder="superadmin@emlak.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            size="lg"
                                        />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm">Şifre</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <Lock size={18} color="gray" />
                                        </InputLeftElement>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            size="lg"
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label="Toggle password visibility"
                                                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>

                                <Button
                                    type="submit"
                                    colorScheme="red"
                                    size="lg"
                                    w="full"
                                    isLoading={loading}
                                    loadingText="Giriş yapılıyor..."
                                    leftIcon={<Shield size={18} />}
                                >
                                    SuperAdmin Girişi
                                </Button>
                            </VStack>
                        </form>

                        <Divider />

                        {/* Footer */}
                        <VStack spacing={2}>
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                                Bu sayfa sadece sistem yöneticileri içindir
                            </Text>
                            <Button
                                variant="link"
                                size="sm"
                                colorScheme="blue"
                                onClick={() => navigate('/login')}
                            >
                                Normal Kullanıcı Girişi
                            </Button>
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>
        </Box>
    );
};

export default SuperAdminLogin;
