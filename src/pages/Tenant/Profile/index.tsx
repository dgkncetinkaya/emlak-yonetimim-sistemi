import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Grid,
  GridItem,
  useColorModeValue,
  Icon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { User, Mail, Phone, Calendar, Shield } from 'react-feather';
import { useAuth } from '../../../context/AuthContext';
import { useAppearance } from '../../../context/AppearanceContext';

const Profile = () => {
  const { user } = useAuth();
  const { settings } = useAppearance();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Yönetici',
      consultant: 'Danışman',
      user: 'Kullanıcı'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'red',
      consultant: 'blue',
      user: 'green'
    };
    return colors[role] || 'gray';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Profilim</Heading>
          <Text color="gray.600">
            Profil bilgilerinizi görüntüleyin
          </Text>
        </Box>

        {/* Profile Card */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Avatar and Basic Info */}
              <HStack spacing={6} align="start">
                <Avatar
                  size="2xl"
                  name={user?.name || 'Kullanıcı'}
                  bg={settings.primary_color || 'blue.500'}
                  color="white"
                />
                <VStack align="start" spacing={2} flex={1}>
                  <HStack>
                    <Heading size="lg">{user?.name || 'Kullanıcı'}</Heading>
                    <Badge
                      colorScheme={getRoleColor(user?.role || 'user')}
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {getRoleName(user?.role || 'user')}
                    </Badge>
                  </HStack>
                  <Text color="gray.600">{user?.email}</Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    bg={settings.primary_color || 'blue.500'}
                    mt={2}
                  >
                    Profili Düzenle
                  </Button>
                </VStack>
              </HStack>

              <Divider />

              {/* Detailed Information */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <GridItem>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Icon as={Mail} boxSize={5} color={settings.primary_color || 'blue.500'} />
                        <Text fontWeight="medium">E-posta</Text>
                      </HStack>
                      <Text color="gray.600" pl={8}>{user?.email || '-'}</Text>
                    </Box>

                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Icon as={Phone} boxSize={5} color={settings.primary_color || 'blue.500'} />
                        <Text fontWeight="medium">Telefon</Text>
                      </HStack>
                      <Text color="gray.600" pl={8}>{user?.phone || 'Belirtilmemiş'}</Text>
                    </Box>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Icon as={Shield} boxSize={5} color={settings.primary_color || 'blue.500'} />
                        <Text fontWeight="medium">Rol</Text>
                      </HStack>
                      <Text color="gray.600" pl={8}>{getRoleName(user?.role || 'user')}</Text>
                    </Box>

                    <Box>
                      <HStack spacing={3} mb={2}>
                        <Icon as={Calendar} boxSize={5} color={settings.primary_color || 'blue.500'} />
                        <Text fontWeight="medium">Kayıt Tarihi</Text>
                      </HStack>
                      <Text color="gray.600" pl={8}>
                        {user?.created_at 
                          ? new Date(user.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Bilinmiyor'}
                      </Text>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </VStack>
          </CardBody>
        </Card>

        {/* Additional Info Card */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Hesap Bilgileri</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Kullanıcı ID</Text>
                <Text color="gray.600" fontSize="sm">{user?.id || '-'}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="medium">Hesap Durumu</Text>
                <Badge colorScheme="green">Aktif</Badge>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="medium">Son Giriş</Text>
                <Text color="gray.600">Şimdi</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Profile;
