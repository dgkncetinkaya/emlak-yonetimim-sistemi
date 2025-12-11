import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    useColorModeValue,
    Container,
    HStack,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerHeader,
    DrawerBody,
} from '@chakra-ui/react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const bg = scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent';
    const backdropFilter = scrolled ? 'blur(10px)' : 'none';
    const shadow = scrolled ? 'sm' : 'none';
    const textColor = scrolled ? 'gray.800' : 'white';

    const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
        <Text
            as="a"
            href={to}
            fontWeight="medium"
            color={textColor}
            _hover={{ color: 'blue.500' }}
            cursor="pointer"
            transition="color 0.2s"
        >
            {children}
        </Text>
    );

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            bg={bg}
            backdropFilter={backdropFilter}
            boxShadow={shadow}
            transition="all 0.3s"
            borderBottom={scrolled ? '1px solid' : 'none'}
            borderColor="gray.100"
        >
            <Container maxW="container.xl">
                <Flex h={20} alignItems="center" justify="space-between">
                    {/* Logo */}
                    <HStack spacing={2} cursor="pointer" onClick={() => window.scrollTo(0, 0)}>
                        <Box
                            w={10}
                            h={10}
                            bgGradient="linear(to-r, blue.600, blue.400)"
                            borderRadius="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="bold"
                            fontSize="xl"
                        >
                            E
                        </Box>
                        <Text fontSize="xl" fontWeight="bold" color={scrolled ? 'gray.900' : 'white'}>
                            Emlak<Text as="span" color="blue.500">Yönetim</Text>
                        </Text>
                    </HStack>

                    {/* Desktop Nav */}
                    <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
                        <NavLink to="#features">Özellikler</NavLink>
                        <NavLink to="#how-it-works">Nasıl Çalışır?</NavLink>
                        <NavLink to="#pricing">Fiyatlar</NavLink>
                        <NavLink to="#faq">SSS</NavLink>
                    </HStack>

                    {/* Actions */}
                    <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                        <Button
                            variant="ghost"
                            color={textColor}
                            _hover={{ bg: 'whiteAlpha.200' }}
                            onClick={() => navigate('/login')}
                        >
                            Giriş Yap
                        </Button>
                        <Button
                            colorScheme="blue"
                            bg="blue.600"
                            _hover={{ bg: 'blue.700' }}
                            onClick={() => navigate('/register')}
                            px={6}
                        >
                            Ücretsiz Dene
                        </Button>
                    </HStack>

                    {/* Mobile Menu Button */}
                    <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        aria-label="Open menu"
                        icon={<Menu color={scrolled ? 'black' : 'white'} />}
                        variant="ghost"
                        onClick={onOpen}
                    />
                </Flex>
            </Container>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Menü</DrawerHeader>
                    <DrawerBody>
                        <Stack spacing={4} mt={4}>
                            <Button variant="ghost" justifyContent="flex-start" onClick={onClose}>
                                Özellikler
                            </Button>
                            <Button variant="ghost" justifyContent="flex-start" onClick={onClose}>
                                Nasıl Çalışır?
                            </Button>
                            <Button variant="ghost" justifyContent="flex-start" onClick={onClose}>
                                Fiyatlar
                            </Button>
                            <Button variant="ghost" justifyContent="flex-start" onClick={onClose}>
                                SSS
                            </Button>
                            <Stack direction="row" spacing={4} mt={8}>
                                <Button flex={1} variant="outline" onClick={() => navigate('/login')}>
                                    Giriş
                                </Button>
                                <Button flex={1} colorScheme="blue" onClick={() => navigate('/register')}>
                                    Kayıt Ol
                                </Button>
                            </Stack>
                        </Stack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Navbar;
