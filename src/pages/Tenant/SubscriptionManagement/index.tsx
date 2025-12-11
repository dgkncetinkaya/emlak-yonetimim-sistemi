import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  GridItem,
  Button,
  useColorModeValue,
  Icon,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Progress,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { CreditCard, Calendar, Package, AlertCircle, Clock, TrendingUp } from 'react-feather';
import { useAppearance } from '../../../context/AppearanceContext';
import { useEffect, useState } from 'react';
import { subscriptionService, Subscription } from '../../../services/subscriptionService';
import { useAuth } from '../../../context/AuthContext';
import SubscriptionHistory from '../../../components/SubscriptionHistory';

const SubscriptionManagement = () => {
  const { settings } = useAppearance();
  const { user } = useAuth();
  const toast = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Abonelik verilerini yükle
  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Abonelik yüklenirken hata:', error);
      toast({
        title: 'Hata',
        description: 'Abonelik bilgileri yüklenemedi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await subscriptionService.cancelSubscription('Kullanıcı isteği');
      toast({
        title: 'Başarılı',
        description: 'Aboneliğiniz iptal edildi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadSubscription();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Abonelik iptal edilemedi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getPlanName = () => {
    return subscription?.plan?.name || 'Bilinmiyor';
  };

  const getBillingCycleName = (cycle: string) => {
    return cycle === 'monthly' ? 'Aylık' : 'Yıllık';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Beklemede';
      case 'expired':
        return 'Süresi Dolmuş';
      default:
        return 'Bilinmiyor';
    }
  };

  // Kalan gün sayısını hesapla
  const getRemainingDays = () => {
    if (!subscription?.end_date) return 0;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Abonelik süresinin yüzdesini hesapla
  const getSubscriptionProgress = () => {
    if (!subscription?.start_date || !subscription?.end_date) return 0;
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  // Sonraki ödemeye kalan gün sayısı
  const getDaysUntilNextPayment = () => {
    if (!subscription?.next_billing_date) return 0;
    const nextDate = new Date(subscription.next_billing_date);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Kaç aydır abone olduğunu hesapla
  const getSubscriptionDuration = () => {
    if (!subscription?.start_date) return { months: 0, days: 0 };
    const startDate = new Date(subscription.start_date);
    const today = new Date();
    
    const diffTime = today.getTime() - startDate.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    
    return { months, days, totalDays };
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="400px">
          <Spinner size="xl" color={settings.primary_color || 'blue.500'} />
        </Center>
      </Container>
    );
  }

  if (!subscription) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="400px">
          <VStack spacing={4}>
            <Icon as={AlertCircle} boxSize={16} color="gray.400" />
            <Heading size="md" color="gray.600">Abonelik Bulunamadı</Heading>
            <Text color="gray.500" textAlign="center">
              Sistemi kullanabilmek için aktif bir aboneliğiniz olması gerekmektedir.
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Abonelik Yönetimi</Heading>
          <Text color="gray.600">
            Abonelik bilgilerinizi görüntüleyin ve yönetin
          </Text>
        </Box>

        {/* Özet Banner */}
        <Card 
          bg={useColorModeValue(
            subscription.status === 'active' ? 'green.50' : 'gray.50',
            subscription.status === 'active' ? 'green.900' : 'gray.700'
          )}
          borderColor={subscription.status === 'active' ? 'green.500' : 'gray.500'}
          borderWidth="2px"
          borderLeft="6px"
        >
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'auto 1fr auto' }} gap={6} alignItems="center">
              <HStack spacing={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg={subscription.status === 'active' ? 'green.500' : 'gray.500'}
                >
                  <Icon as={Package} boxSize={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" color="gray.600">Mevcut Planınız</Text>
                  <Heading size="md">{getPlanName()}</Heading>
                </VStack>
              </HStack>

              <VStack align={{ base: 'start', md: 'center' }} spacing={1}>
                <Badge
                  colorScheme={getStatusColor(subscription.status)}
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {getStatusText(subscription.status)}
                </Badge>
                {subscription.auto_renew && (
                  <Text fontSize="xs" color="gray.600">
                    Otomatik yenileme aktif
                  </Text>
                )}
              </VStack>

              <VStack align={{ base: 'start', md: 'end' }} spacing={1}>
                <Text fontSize="2xl" fontWeight="bold" color={settings.primary_color || 'blue.500'}>
                  ₺{subscription.amount.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {getBillingCycleName(subscription.billing_cycle)}
                </Text>
              </VStack>
            </Grid>
          </CardBody>
        </Card>

        {/* Hızlı Özet Kartları */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
          {/* Abonelik Süresi */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack spacing={3}>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg={useColorModeValue('purple.50', 'purple.900')}
                    >
                      <Icon as={Clock} boxSize={6} color="purple.500" />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.600">Abonelik Süresi</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {getSubscriptionDuration().months} Ay
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {getSubscriptionDuration().totalDays} gün
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Kalan Gün */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={4}>
                  <CircularProgress 
                    value={100 - getSubscriptionProgress()} 
                    color={settings.primary_color || 'blue.500'}
                    size="70px"
                    thickness="8px"
                  >
                    <CircularProgressLabel fontSize="md" fontWeight="bold">
                      {getRemainingDays()}
                    </CircularProgressLabel>
                  </CircularProgress>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Kalan Süre</Text>
                    <Text fontSize="lg" fontWeight="bold">{getRemainingDays()} Gün</Text>
                    <Text fontSize="xs" color="gray.500">
                      {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Sonraki Ödeme */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={4}>
                  <Box
                    p={3}
                    borderRadius="full"
                    bg={useColorModeValue('blue.50', 'blue.900')}
                  >
                    <Icon as={Calendar} boxSize={6} color={settings.primary_color || 'blue.500'} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Sonraki Ödeme</Text>
                    <Text fontSize="lg" fontWeight="bold">{getDaysUntilNextPayment()} Gün</Text>
                    <Text fontSize="xs" color="gray.500">
                      {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Ödeme Tutarı */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <HStack spacing={4}>
                  <Box
                    p={3}
                    borderRadius="full"
                    bg={useColorModeValue('green.50', 'green.900')}
                  >
                    <Icon as={TrendingUp} boxSize={6} color="green.500" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">Ödeme Tutarı</Text>
                    <Text fontSize="lg" fontWeight="bold" color={settings.primary_color || 'blue.500'}>
                      ₺{subscription.amount.toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {getBillingCycleName(subscription.billing_cycle)}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Abonelik İlerleme Çubuğu */}
        {subscription.end_date && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={Clock} boxSize={5} color={settings.primary_color || 'blue.500'} />
                    <Text fontWeight="medium">Abonelik Dönemi İlerlemesi</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    %{getSubscriptionProgress().toFixed(0)} tamamlandı
                  </Text>
                </HStack>
                <Progress 
                  value={getSubscriptionProgress()} 
                  colorScheme="blue" 
                  size="lg" 
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                />
                <HStack justify="space-between" fontSize="sm" color="gray.600">
                  <Text>{new Date(subscription.start_date).toLocaleDateString('tr-TR')}</Text>
                  <Text>{new Date(subscription.end_date).toLocaleDateString('tr-TR')}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Uyarı Mesajları */}
        {getDaysUntilNextPayment() <= 7 && getDaysUntilNextPayment() > 0 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Yaklaşan Ödeme</Text>
              <Text fontSize="sm">
                Sonraki ödemeniz {getDaysUntilNextPayment()} gün içinde yapılacak. 
                Ödeme yönteminizin güncel olduğundan emin olun.
              </Text>
            </VStack>
          </Alert>
        )}

        {getRemainingDays() <= 7 && getRemainingDays() > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Abonelik Süresi Doluyor</Text>
              <Text fontSize="sm">
                Aboneliğinizin süresi {getRemainingDays()} gün içinde dolacak. 
                {subscription.auto_renew 
                  ? ' Otomatik yenileme aktif, endişelenmenize gerek yok.' 
                  : ' Planınızı yenilemek için lütfen işlem yapın.'}
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Abonelik Durumu */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={Package} boxSize={6} color={settings.primary_color || 'blue.500'} />
                <Heading size="md">Mevcut Abonelik</Heading>
              </HStack>
              <Badge
                colorScheme={getStatusColor(subscription.status)}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                {getStatusText(subscription.status)}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
              <GridItem>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Plan</Text>
                  <Text fontSize="lg" fontWeight="bold">{getPlanName()}</Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Ücret</Text>
                  <Text fontSize="lg" fontWeight="bold">₺{subscription.amount.toLocaleString()}</Text>
                  <Text fontSize="xs" color="gray.500">{getBillingCycleName(subscription.billing_cycle)}</Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Başlangıç Tarihi</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {new Date(subscription.start_date).toLocaleDateString('tr-TR')}
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Bitiş Tarihi</Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('tr-TR') : '-'}
                  </Text>
                </VStack>
              </GridItem>
            </Grid>

            <Divider my={6} />

            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Sonraki Ödeme Tarihi</Text>
                <HStack>
                  <Icon as={Calendar} boxSize={4} color="gray.500" />
                  <Text>
                    {subscription.next_billing_date 
                      ? new Date(subscription.next_billing_date).toLocaleDateString('tr-TR')
                      : '-'}
                  </Text>
                </HStack>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Ödeme Tutarı</Text>
                <Text fontWeight="bold" color={settings.primary_color || 'blue.500'}>
                  ₺{subscription.amount.toLocaleString()}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Ödeme Bilgileri */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={CreditCard} boxSize={5} color={settings.primary_color || 'blue.500'} />
              <Heading size="md">Ödeme Bilgileri</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">Ödeme Yöntemi</Text>
                  <Text fontWeight="medium">{subscription.payment_method || 'Belirtilmemiş'}</Text>
                </VStack>
                <Button size="sm" variant="outline" colorScheme="blue">
                  Güncelle
                </Button>
              </HStack>
              
              {subscription.auto_renew && (
                <HStack
                  p={4}
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  borderRadius="md"
                  borderLeft="4px"
                  borderColor="blue.500"
                >
                  <Icon as={AlertCircle} color="blue.500" />
                  <Text fontSize="sm">
                    Otomatik ödeme aktif. Sonraki ödeme {subscription.next_billing_date 
                      ? new Date(subscription.next_billing_date).toLocaleDateString('tr-TR')
                      : '-'} tarihinde otomatik olarak alınacaktır.
                  </Text>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Aksiyon Butonları */}
        <HStack spacing={4} justify="flex-end">
          <Button 
            colorScheme="blue" 
            bg={settings.primary_color || 'blue.500'}
            onClick={() => setShowHistory(true)}
          >
            Fatura Geçmişi
          </Button>
          {subscription.status === 'active' && (
            <Button 
              variant="outline" 
              colorScheme="red"
              onClick={handleCancelSubscription}
            >
              Aboneliği İptal Et
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Fatura Geçmişi Modal */}
      <SubscriptionHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </Container>
  );
};

export default SubscriptionManagement;
