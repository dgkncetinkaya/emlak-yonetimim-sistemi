import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Stack,
    Image,
    Flex,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <Box
            bg="gray.900"
            position="relative"
            overflow="hidden"
            pt={{ base: 32, md: 40 }}
            pb={{ base: 20, md: 32 }}
        >
            {/* Background Gradients */}
            <Box
                position="absolute"
                top="-20%"
                left="-10%"
                w="50%"
                h="50%"
                bgGradient="radial(blue.600, transparent 70%)"
                opacity={0.2}
                filter="blur(100px)"
            />
            <Box
                position="absolute"
                bottom="-20%"
                right="-10%"
                w="50%"
                h="50%"
                bgGradient="radial(purple.600, transparent 70%)"
                opacity={0.2}
                filter="blur(100px)"
            />

            <Container maxW="container.xl" position="relative" zIndex={1}>
                <Stack spacing={12} alignItems="center" textAlign="center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Flex
                            align="center"
                            bg="whiteAlpha.100"
                            px={4}
                            py={2}
                            borderRadius="full"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            gap={2}
                        >
                            <Icon as={CheckCircle2} color="green.400" size={16} />
                            <Text color="white" fontSize="sm" fontWeight="medium">
                                Türkiye'nin En Kapsamlı Emlak Yönetim Sistemi
                            </Text>
                        </Flex>
                    </motion.div>

                    {/* Headings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Heading
                            as="h1"
                            size="3xl"
                            fontWeight="bold"
                            color="white"
                            lineHeight="1.2"
                            mb={6}
                            maxW="4xl"
                        >
                            Emlak Ofisinizi{' '}
                            <Text as="span" bgGradient="linear(to-r, blue.400, purple.400)" bgClip="text">
                                Dijitalin Gücüyle
                            </Text>{' '}
                            Yönetin
                        </Heading>
                        <Text color="gray.400" fontSize="xl" maxW="2xl" mx="auto">
                            Portföy yönetiminden müşteri takibine, sözleşmelerden finansal raporlara kadar
                            ihtiyacınız olan her şey tek bir platformda.
                        </Text>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                            <Button
                                size="lg"
                                height="14"
                                px={8}
                                fontSize="md"
                                colorScheme="blue"
                                bg="blue.600"
                                _hover={{ bg: 'blue.700' }}
                                rightIcon={<ArrowRight size={20} />}
                                onClick={() => navigate('/register')}
                            >
                                14 Gün Ücretsiz Dene
                            </Button>
                            <Button
                                size="lg"
                                height="14"
                                px={8}
                                fontSize="md"
                                variant="outline"
                                color="white"
                                _hover={{ bg: 'whiteAlpha.100' }}
                                leftIcon={<PlayCircle size={20} />}
                            >
                                Demoyu İzle
                            </Button>
                        </Stack>
                        <Text color="gray.500" fontSize="sm" mt={4}>
                            Kredi kartı gerekmez • İptal edilebilir
                        </Text>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ width: '100%' }}
                    >
                        <Box
                            mt={10}
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="2xl"
                            border="1px solid"
                            borderColor="whiteAlpha.200"
                            position="relative"
                            _before={{
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgGradient: 'linear(to-b, transparent 0%, gray.900 100%)',
                                opacity: 0.2,
                                pointerEvents: 'none',
                            }}
                        >
                            {/* Mockup Image Placeholder - In real app use actual screenshot */}
                            <Box
                                bg="gray.800"
                                h={{ base: '300px', md: '600px' }}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                position="relative"
                            >
                                {/* Browser Bar */}
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    h="40px"
                                    bg="gray.900"
                                    borderBottom="1px solid"
                                    borderColor="gray.700"
                                    display="flex"
                                    alignItems="center"
                                    px={4}
                                    gap={2}
                                >
                                    <Box w={3} h={3} borderRadius="full" bg="red.500" />
                                    <Box w={3} h={3} borderRadius="full" bg="yellow.500" />
                                    <Box w={3} h={3} borderRadius="full" bg="green.500" />
                                    <Box
                                        ml={4}
                                        bg="gray.800"
                                        h="24px"
                                        borderRadius="md"
                                        w="400px"
                                        display={{ base: 'none', md: 'block' }}
                                    />
                                </Box>

                                {/* Content Placeholder */}
                                <Text color="gray.500" fontSize="lg">
                                    Dashboard Ekran Görüntüsü Gelecek
                                </Text>
                                {/* You can replace this with an actual image later */}
                                {/* <Image src="/dashboard-mockup.png" alt="Dashboard" w="100%" h="100%" objectFit="cover" /> */}
                            </Box>
                        </Box>
                    </motion.div>
                </Stack>
            </Container>
        </Box>
    );
};

export default Hero;
