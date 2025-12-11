import {
    Box,
    Container,
    Stack,
    SimpleGrid,
    Text,
    Link,
    VisuallyHidden,
    chakra,
    useColorModeValue,
    HStack,
    Icon,
} from '@chakra-ui/react';
import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

const SocialButton = ({
    children,
    label,
    href,
}: {
    children: React.ReactNode;
    label: string;
    href: string;
}) => {
    return (
        <chakra.button
            bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
            rounded={'full'}
            w={8}
            h={8}
            cursor={'pointer'}
            as={'a'}
            href={href}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            transition={'background 0.3s ease'}
            _hover={{
                bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
            }}
        >
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </chakra.button>
    );
};

const Footer = () => {
    return (
        <Box
            bg="gray.900"
            color="gray.200"
            borderTop="1px solid"
            borderColor="gray.800"
        >
            <Container as={Stack} maxW={'container.xl'} py={10}>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
                    <Stack spacing={6}>
                        <Box>
                            <HStack spacing={2}>
                                <Box
                                    w={8}
                                    h={8}
                                    bgGradient="linear(to-r, blue.600, blue.400)"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    color="white"
                                    fontWeight="bold"
                                >
                                    E
                                </Box>
                                <Text fontSize="lg" fontWeight="bold" color="white">
                                    Emlak<Text as="span" color="blue.500">Yönetim</Text>
                                </Text>
                            </HStack>
                        </Box>
                        <Text fontSize={'sm'}>
                            Emlak ofisleri için geliştirilmiş, modern ve kapsamlı yönetim platformu.
                            İşinizi dijitale taşıyın.
                        </Text>
                    </Stack>

                    <Stack align={'flex-start'}>
                        <Text fontWeight={'500'} fontSize={'lg'} mb={2} color="white">
                            Ürün
                        </Text>
                        <Link href={'#features'}>Özellikler</Link>
                        <Link href={'#pricing'}>Fiyatlar</Link>
                        <Link href={'#'}>Güvenlik</Link>
                        <Link href={'#'}>Yol Haritası</Link>
                    </Stack>

                    <Stack align={'flex-start'}>
                        <Text fontWeight={'500'} fontSize={'lg'} mb={2} color="white">
                            Şirket
                        </Text>
                        <Link href={'#'}>Hakkımızda</Link>
                        <Link href={'#'}>Blog</Link>
                        <Link href={'#'}>Kariyer</Link>
                        <Link href={'#'}>İletişim</Link>
                    </Stack>

                    <Stack align={'flex-start'}>
                        <Text fontWeight={'500'} fontSize={'lg'} mb={2} color="white">
                            Destek
                        </Text>
                        <Link href={'#'}>Yardım Merkezi</Link>
                        <Link href={'#'}>Kullanım Koşulları</Link>
                        <Link href={'#'}>Gizlilik Politikası</Link>
                        <Link href={'#'}>KVKK</Link>
                    </Stack>
                </SimpleGrid>
            </Container>

            <Box
                borderTopWidth={1}
                borderStyle={'solid'}
                borderColor="gray.800"
            >
                <Container
                    as={Stack}
                    maxW={'container.xl'}
                    py={4}
                    direction={{ base: 'column', md: 'row' }}
                    spacing={4}
                    justify={{ base: 'center', md: 'space-between' }}
                    align={{ base: 'center', md: 'center' }}
                >
                    <Text fontSize="sm">© 2024 Emlak Yönetim Sistemi. Tüm hakları saklıdır.</Text>
                    <Stack direction={'row'} spacing={6}>
                        <SocialButton label={'Twitter'} href={'#'}>
                            <Twitter size={20} />
                        </SocialButton>
                        <SocialButton label={'Facebook'} href={'#'}>
                            <Facebook size={20} />
                        </SocialButton>
                        <SocialButton label={'Instagram'} href={'#'}>
                            <Instagram size={20} />
                        </SocialButton>
                        <SocialButton label={'Linkedin'} href={'#'}>
                            <Linkedin size={20} />
                        </SocialButton>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default Footer;
