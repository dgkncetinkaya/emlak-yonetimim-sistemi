import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  Progress,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Icon,
  IconButton,
  Avatar,
  AvatarBadge,
  Tooltip,
  Skeleton,
  SkeletonText,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import {
  Crown,
  Calendar,
  Users,
  TrendingUp,
  CreditCard,
  Download,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchCurrentSubscription,
  fetchUsageTracking,
} from '../../store/slices/subscriptionSlice';
import {
  fetchInvoices,
  downloadInvoicePDF,
} from '../../store/slices/billingSlice';
import {
  fetchPaymentMethods,
} from '../../store/slices/paymentSlice';

const SubscriptionManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  const { currentSubscription, plans, usage, loading } = useAppSelector(
    (state) => state.subscription
  );
  const { invoices } = useAppSelector((state: any) => state.billing);
  const { paymentMethods } = useAppSelector((state: any) => state.payment);

  // Mock data for testing when no subscription exists
  const mockSubscription = {
    id: 'mock-1',
    user_id: 'user-1',
    plan_id: 'plan-1',
    plan: {
      id: 'plan-1',
      name: 'Profesyonel Plan',
      price_monthly: 299,
      price_yearly: 2990,
      features: ['Sınırsız Portföy', '10 Kullanıcı', '100GB Depolama'],
      max_properties: 1000,
      max_agents: 10,
      storage_gb: 100,
      esignature_count: 100,
      sms_count: 1000
    },
    status: 'active' as const,
    seats: 5,
    addons: {},
    start_date: '2024-01-01',
    next_billing_date: '2024-12-01',
    billing_cycle: 'yearly' as const,
    cancel_at_period_end: false
  };

  const mockUsage = [
    {
      subscription_id: 'mock-1',
      feature_name: 'properties',
      current_usage: 450,
      limit_value: 1000,
      period_start: '2024-01-01',
      period_end: '2024-12-01'
    }
  ];

  // Use mock data if no real data exists
  const displaySubscription = currentSubscription || mockSubscription;
  const displayUsage = usage.length > 0 ? usage : mockUsage;
  
  const {
    isOpen: isUpgradeOpen,
    onOpen: onUpgradeOpen,
    onClose: onUpgradeClose,
  } = useDisclosure();
  
  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  
  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchInvoices({}));
    dispatch(fetchPaymentMethods());
    dispatch(fetchUsageTracking());
  }, [dispatch]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'past_due':
        return 'yellow';
      case 'canceled':
        return 'red';
      case 'paused':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'past_due':
        return 'Ödeme Bekliyor';
      case 'canceled':
        return 'İptal Edildi';
      case 'paused':
        return 'Donduruldu';
      default:
        return status;
    }
  };
  
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await dispatch(downloadInvoicePDF(invoiceId)).unwrap();
      toast({
        title: 'Fatura indiriliyor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Fatura indirme başarısız',
        description: error as string,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (loading) {
    return (
      <Box bg={bg} minH="100vh" py={8}>
        <Container maxW="7xl">
          <VStack spacing={8}>
            <Skeleton height="60px" width="300px" />
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} bg={cardBg}>
                  <CardBody>
                    <SkeletonText mt="4" noOfLines={3} spacing="4" />
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    );
  }
  
  const currentPlan = plans.find(p => p.id === displaySubscription.plan_id) || displaySubscription.plan;
  const propertyUsage = displayUsage.find(u => u.feature_name === 'properties');
  const usagePercentage = propertyUsage
    ? (propertyUsage.current_usage / propertyUsage.limit_value) * 100
    : 0;
  
  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8}>
          {/* Modern Header */}
          <VStack spacing={6} textAlign="center" w="full">
            <VStack spacing={3}>
              <HStack spacing={3}>
                <Avatar 
                  size="lg" 
                  bg={accentColor} 
                  icon={<Crown size={24} />}
                >
                  <AvatarBadge 
                    boxSize="1.25em" 
                    bg={getStatusColor(displaySubscription.status) + '.400'}
                  />
                </Avatar>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color={headingColor}>
                    {currentPlan?.name || 'Plan'}
                  </Heading>
                  <Badge 
                    colorScheme={getStatusColor(displaySubscription.status)} 
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {getStatusText(displaySubscription.status)}
                  </Badge>
                </VStack>
              </HStack>
              <Text color={textColor} fontSize="lg" maxW="2xl">
                Aboneliğinizi yönetin, kullanım durumunuzu takip edin ve planınızı optimize edin.
              </Text>
            </VStack>
          </VStack>
          
          {/* Modern Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {/* Next Billing */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box p={3} bg="green.50" borderRadius="xl">
                      <Icon as={Calendar} color="green.500" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        Sonraki Ödeme
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                        {new Date(displaySubscription.next_billing_date).toLocaleDateString('tr-TR')}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="sm" color={textColor}>
                    ₺{displaySubscription.billing_cycle === 'yearly' 
                      ? currentPlan?.price_yearly 
                      : currentPlan?.price_monthly
                    } / {displaySubscription.billing_cycle === 'yearly' ? 'Yıl' : 'Ay'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            
            {/* Seat Usage */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box p={3} bg="purple.50" borderRadius="xl">
                      <Icon as={Users} color="purple.500" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        Koltuk Kullanımı
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                         {displaySubscription.seats} / {currentPlan?.max_agents || 0}
                       </Text>
                     </VStack>
                   </HStack>
                   <Progress 
                     value={(displaySubscription.seats / (currentPlan?.max_agents || 1)) * 100} 
                    size="sm" 
                    colorScheme="purple" 
                    borderRadius="full"
                    bg="purple.50"
                  />
                </VStack>
              </CardBody>
            </Card>
            
            {/* Property Usage */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box p={3} bg="orange.50" borderRadius="xl">
                      <Icon as={TrendingUp} color="orange.500" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        Portföy Kullanımı
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                         {propertyUsage?.current_usage || 0} / {propertyUsage?.limit_value || 0}
                       </Text>
                    </VStack>
                  </HStack>
                  <Progress 
                    value={usagePercentage} 
                    size="sm" 
                    colorScheme="orange" 
                    borderRadius="full"
                    bg="orange.50"
                  />
                </VStack>
              </CardBody>
            </Card>
            
            {/* Payment Method */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <HStack>
                    <Box p={3} bg="blue.50" borderRadius="xl">
                      <Icon as={CreditCard} color="blue.500" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        Ödeme Yöntemi
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                        {paymentMethods?.length > 0 ? `**** ${paymentMethods[0].card_last4}` : 'Tanımlı Değil'}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="sm" color={textColor}>
                    {paymentMethods?.length > 0 ? paymentMethods[0].card_brand?.toUpperCase() : 'Kart ekleyin'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Action Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            {/* Plan Management */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm">
              <CardHeader>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box p={2} bg="blue.50" borderRadius="lg">
                      <Icon as={Zap} color="blue.500" boxSize={5} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={headingColor}>
                        Plan Yönetimi
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        Planınızı yükseltin veya değiştirin
                      </Text>
                    </VStack>
                  </HStack>
                  <Button 
                    colorScheme="blue" 
                    variant="ghost" 
                    size="sm"
                    onClick={onUpgradeOpen}
                  >
                    Yönet
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={textColor}>Mevcut Plan</Text>
                    <Badge colorScheme="blue" variant="subtle">{currentPlan?.name}</Badge>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={textColor}>Faturalama Döngüsü</Text>
                    <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                      {displaySubscription.billing_cycle === 'yearly' ? 'Yıllık' : 'Aylık'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={textColor}>Otomatik Yenileme</Text>
                    <Badge colorScheme={displaySubscription.cancel_at_period_end ? 'gray' : 'green'} variant="subtle">
                       {displaySubscription.cancel_at_period_end ? 'Pasif' : 'Aktif'}
                     </Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
            
            {/* Recent Invoices */}
            <Card bg={cardBg} borderWidth={1} borderColor={borderColor} shadow="sm">
              <CardHeader>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box p={2} bg="green.50" borderRadius="lg">
                      <Icon as={Download} color="green.500" boxSize={5} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" color={headingColor}>
                        Son Faturalar
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        Faturalarınızı görüntüleyin ve indirin
                      </Text>
                    </VStack>
                  </HStack>
                  <Button 
                    colorScheme="green" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/billing'}
                  >
                    Tümü
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={3}>
                  {invoices?.slice(0, 3).map((invoice: any) => (
                    <HStack key={invoice.id} justify="space-between" p={3} bg={bg} borderRadius="lg">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                          #{invoice.invoice_number}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          {new Date(invoice.created_at).toLocaleDateString('tr-TR')}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="bold" color={headingColor}>
                          ₺{invoice.total_amount}
                        </Text>
                        <Badge 
                          colorScheme={invoice.status === 'paid' ? 'green' : 'orange'} 
                          variant="subtle"
                          size="sm"
                        >
                          {invoice.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                        </Badge>
                        <Tooltip label="Faturayı İndir">
                          <IconButton
                            aria-label="Download invoice"
                            icon={<Download />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>
                  )) || (
                    <Text fontSize="sm" color={textColor} textAlign="center" py={4}>
                      Henüz fatura bulunmuyor
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Usage Alert */}
          {usagePercentage > 80 && (
            <Alert status="warning" borderRadius="xl" bg="orange.50" borderColor="orange.200">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium" color="orange.800">
                  Kullanım Limiti Uyarısı
                </Text>
                <Text fontSize="sm" color="orange.700">
                  Portföy kullanımınız %{Math.round(usagePercentage)} seviyesinde. 
                  Planınızı yükseltmeyi düşünebilirsiniz.
                </Text>
              </VStack>
              <Button 
                colorScheme="orange" 
                variant="outline" 
                size="sm" 
                ml="auto"
                onClick={onUpgradeOpen}
              >
                Planı Yükselt
              </Button>
            </Alert>
          )}
        </VStack>
      </Container>
      
      {/* Upgrade Modal */}
      <Modal isOpen={isUpgradeOpen} onClose={onUpgradeClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={Crown} color="blue.500" />
              <Text>Plan Yükseltme</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <Text color={textColor} textAlign="center">
                Daha fazla özellik ve kapasite için planınızı yükseltin.
              </Text>
              <Button 
                colorScheme="blue" 
                size="lg" 
                w="full"
                onClick={() => window.location.href = '/pricing'}
              >
                Planları Görüntüle
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onUpgradeClose}>
              İptal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionManagementPage;