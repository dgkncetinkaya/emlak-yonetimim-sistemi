import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Divider,
  Flex,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  SimpleGrid,
  useBreakpointValue,
  Center,
  TableContainer,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { FileText, Download, CreditCard, Calendar, DollarSign, TrendingUp, Archive, Briefcase, Package, BarChart } from 'react-feather';
import { FiCreditCard, FiDownload, FiEye, FiRefreshCw } from 'react-icons/fi';
import { billingService, Invoice, PaymentMethod, BillingAddress, Subscription, UsageTracking } from '../../../services/billingService';

const BillingManagement: React.FC = () => {
  // All hooks must be called at the top level - no conditional hooks
  const toast = useToast();
  const queryClient = useQueryClient();

  // Color mode values - always called
  const bg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const statBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Responsive values - always called
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 4 });
  const spacing = useBreakpointValue({ base: 4, md: 6 });

  // Queries - always called, but with proper error handling
  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      try {
        const response = await billingService.getInvoices();
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error.status === 404) {
          return []; // Return empty array for 404
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 403 and 404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const {
    data: paymentMethods = [],
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError
  } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      try {
        const response = await billingService.getPaymentMethods();
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error.status === 404) {
          return []; // Return empty array for 404
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 403 and 404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const {
    data: billingAddress,
    isLoading: billingAddressLoading,
    error: billingAddressError
  } = useQuery({
    queryKey: ['billingAddress'],
    queryFn: async () => {
      try {
        const response = await billingService.getBillingAddress();
        return response;
      } catch (error: any) {
        if (error.status === 404) {
          return null; // Return null for 404
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 403 and 404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Subscription query - optional tab
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const response = await billingService.getSubscription();
        return response;
      } catch (error: any) {
        if (error.status === 404) {
          return null; // Return null for 404
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 403 and 404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Usage query - optional tab
  const {
    data: usage = [],
    isLoading: usageLoading,
    error: usageError
  } = useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      try {
        const response = await billingService.getUsage();
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        if (error.status === 404) {
          return []; // Return empty array for 404
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 403 and 404 errors
      if (error?.status === 403 || error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Loading state
  const isLoading = invoicesLoading || paymentMethodsLoading || billingAddressLoading;

  // Error handling - check for non-404 errors
  const hasError = (invoicesError && (invoicesError as any)?.status !== 404) ||
    (paymentMethodsError && (paymentMethodsError as any)?.status !== 404) ||
    (billingAddressError && (billingAddressError as any)?.status !== 404);

  const errorMessage = hasError ?
    (invoicesError || paymentMethodsError || billingAddressError)?.message || 'Bir hata oluştu' :
    null;

  // Check if optional tabs should be shown (not 404)
  const showSubscriptionTab = subscription !== null && (subscriptionError as any)?.status !== 404;
  const showUsageTab = usage.length > 0 && (usageError as any)?.status !== 404;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'payment_failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Beklemede';
      case 'payment_failed':
        return 'Ödeme Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = await billingService.getInvoice(invoiceId);
      // Create a blob URL for PDF download
      const blob = new Blob([JSON.stringify(invoice)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'İndirme Başladı',
        description: 'Fatura dosyası indiriliyor...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Fatura indirilemedi. Lütfen tekrar deneyin.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRetry = () => {
    refetchInvoices();
    queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    queryClient.invalidateQueries({ queryKey: ['billingAddress'] });
  };

  if (isLoading) {
    return (
      <Box bgGradient={bg} minH="100vh" py={8}>
        <Box w="100%" px={4}>
          <Flex justify="center" align="center" h="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">
                Yükleniyor...
              </Text>
            </VStack>
          </Flex>
        </Box>
      </Box>
    );
  }

  if (hasError) {
    const is403Error = errorMessage?.includes('403') || errorMessage?.includes('Forbidden');
    const is500Error = errorMessage?.includes('500') || errorMessage?.includes('Internal Server Error');

    let alertStatus: 'error' | 'warning' | 'info' = 'error';
    let alertTitle = 'Hata';
    let displayMessage = errorMessage;

    if (is403Error) {
      alertStatus = 'warning';
      alertTitle = 'Erişim Engellendi';
      displayMessage = 'Bu sayfaya erişim yetkiniz bulunmuyor.';
    } else if (is500Error) {
      alertStatus = 'error';
      alertTitle = 'Sunucu Hatası';
      displayMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
    }

    return (
      <Box bgGradient={bg} minH="100vh" py={8}>
        <Box w="100%" px={4}>
          <Card bg={cardBg} shadow="xl" borderRadius="xl">
            <CardBody>
              <Alert status={alertStatus} borderRadius="lg">
                <AlertIcon />
                <AlertTitle>{alertTitle}</AlertTitle>
                <AlertDescription>{displayMessage}</AlertDescription>
              </Alert>

              <Box mt={4}>
                <Button
                  leftIcon={<Icon as={FiRefreshCw} />}
                  colorScheme="blue"
                  onClick={handleRetry}
                  size="md"
                >
                  Tekrar Dene
                </Button>
              </Box>
            </CardBody>
          </Card>
        </Box>
      </Box>
    );
  }

  // Ensure invoices is always an array
  const invoicesArray = Array.isArray(invoices) ? invoices : [];

  // Calculate stats
  const totalInvoices = invoicesArray.length;
  const paidInvoices = invoicesArray.filter(inv => inv.status === 'paid').length;
  const totalAmount = invoicesArray.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingAmount = invoicesArray
    .filter(inv => inv.status === 'open' || inv.status === 'draft')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <Box bgGradient={bg} minH="100vh" py={8}>
      <Box w="100%" px={4}>
        <VStack spacing={spacing} align="stretch">
          {/* Header */}
          <Box textAlign="center" py={8}>
            <Text fontSize="4xl" fontWeight="bold" color="white" mb={4}>
              Faturalama
            </Text>
            <Text color="whiteAlpha.800" fontSize="lg" maxW="2xl" mx="auto">
              Faturalarınızı görüntüleyin, indirin ve ödeme yöntemlerinizi yönetin
            </Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={columns} spacing={6}>
            <Card bg={statBg} shadow="xl" borderRadius="xl" overflow="hidden">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel color={textColor} fontSize="sm" fontWeight="medium">
                      Toplam Fatura
                    </StatLabel>
                    <Icon as={Archive} color="blue.500" boxSize={5} />
                  </HStack>
                  <StatNumber color={headingColor} fontSize="2xl">
                    {totalInvoices}
                  </StatNumber>
                  <StatHelpText color="green.500" fontSize="sm">
                    <Icon as={TrendingUp} mr={1} />
                    {paidInvoices} Ödendi
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={statBg} shadow="xl" borderRadius="xl" overflow="hidden">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel color={textColor} fontSize="sm" fontWeight="medium">
                      Toplam Tutar
                    </StatLabel>
                    <Icon as={DollarSign} color="green.500" boxSize={5} />
                  </HStack>
                  <StatNumber color={headingColor} fontSize="2xl">
                    ₺{totalAmount.toFixed(2)}
                  </StatNumber>
                  <StatHelpText color={textColor} fontSize="sm">
                    Tüm Zamanlar
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={statBg} shadow="xl" borderRadius="xl" overflow="hidden">
              <CardBody>
                <Stat>
                  <HStack justify="space-between" mb={2}>
                    <StatLabel color={textColor} fontSize="sm" fontWeight="medium">
                      Bekleyen Tutar
                    </StatLabel>
                    <Icon as={Briefcase} color="orange.500" boxSize={5} />
                  </HStack>
                  <StatNumber color={headingColor} fontSize="2xl">
                    ₺{pendingAmount.toFixed(2)}
                  </StatNumber>
                  <StatHelpText color="orange.500" fontSize="sm">
                    Ödeme Bekliyor
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs for different sections */}
          <Card bg={cardBg} shadow="xl" borderRadius="xl" overflow="hidden">
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={CreditCard} boxSize={4} />
                    <Text>Ödeme Yöntemleri</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FileText} boxSize={4} />
                    <Text>Faturalama Geçmişi</Text>
                  </HStack>
                </Tab>
                {showSubscriptionTab && (
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={Package} boxSize={4} />
                      <Text>Abonelik</Text>
                    </HStack>
                  </Tab>
                )}
                {showUsageTab && (
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={BarChart} boxSize={4} />
                      <Text>Kullanım</Text>
                    </HStack>
                  </Tab>
                )}
              </TabList>

              <TabPanels>
                {/* Payment Methods Tab */}
                <TabPanel p={6}>
                  {paymentMethods && paymentMethods.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {paymentMethods.map((method: PaymentMethod) => (
                        <Box
                          key={method.id}
                          p={6}
                          border="1px"
                          borderColor={borderColor}
                          borderRadius="xl"
                          bg={hoverBg}
                          transition="all 0.2s"
                          _hover={{
                            transform: 'translateY(-2px)',
                            shadow: 'lg',
                            borderColor: 'blue.300'
                          }}
                        >
                          <HStack justify="space-between">
                            <HStack spacing={4}>
                              <Avatar
                                size="md"
                                bg="blue.500"
                                icon={<CreditCard size={20} />}
                              />
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">
                                  **** **** **** {method.card_last4}
                                </Text>
                                <Text fontSize="sm" color={textColor}>
                                  {method.card_brand?.toUpperCase()} • Son Kullanma {method.card_exp_month}/{method.card_exp_year}
                                </Text>
                              </VStack>
                            </HStack>
                            <VStack spacing={2}>
                              {method.is_default && (
                                <Badge colorScheme="blue" borderRadius="full" px={3}>
                                  Varsayılan
                                </Badge>
                              )}
                              <Button size="sm" variant="outline" colorScheme="blue">
                                Yönet
                              </Button>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                      <Button
                        leftIcon={<CreditCard size={16} />}
                        colorScheme="blue"
                        variant="outline"
                        borderRadius="xl"
                        size="lg"
                      >
                        Ödeme Yöntemi Ekle
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={6} py={8}>
                      <Box p={4} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="full">
                        <Icon as={CreditCard} boxSize={8} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text color={textColor} fontSize="lg" fontWeight="medium">
                          Ödeme yöntemi bulunamadı
                        </Text>
                        <Text color={textColor} fontSize="sm" textAlign="center">
                          İlk ödeme yönteminizi ekleyin
                        </Text>
                      </VStack>
                      <Button
                        leftIcon={<CreditCard size={16} />}
                        colorScheme="blue"
                        size="lg"
                        borderRadius="xl"
                      >
                        Ödeme Yöntemi Ekle
                      </Button>
                    </VStack>
                  )}
                </TabPanel>

                {/* Billing History Tab */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                        Faturalama Geçmişi
                      </Text>
                      <Button
                        leftIcon={<Download size={16} />}
                        colorScheme="green"
                        variant="outline"
                        size="sm"
                        borderRadius="lg"
                      >
                        Tümünü Dışa Aktar
                      </Button>
                    </HStack>

                    {invoicesArray.length > 0 ? (
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                            <Tr>
                              <Th py={4} color={textColor} fontWeight="bold" fontSize="sm">
                                Fatura No
                              </Th>
                              <Th py={4} color={textColor} fontWeight="bold" fontSize="sm">
                                Tarih
                              </Th>
                              <Th py={4} color={textColor} fontWeight="bold" fontSize="sm">
                                Tutar
                              </Th>
                              <Th py={4} color={textColor} fontWeight="bold" fontSize="sm">
                                Durum
                              </Th>
                              <Th py={4} color={textColor} fontWeight="bold" fontSize="sm">
                                İşlemler
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {invoicesArray.map((invoice: Invoice, index: number) => (
                              <Tr
                                key={invoice?.id ? String(invoice.id) : `invoice-${index}`}
                                _hover={{ bg: hoverBg }}
                                borderBottom={index === invoicesArray.length - 1 ? 'none' : '1px'}
                                borderColor={borderColor}
                              >
                                <Td py={6}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold" color={headingColor}>
                                      {invoice.invoice_number}
                                    </Text>
                                    <Text fontSize="xs" color={textColor}>
                                      ID: {invoice?.id ? String(invoice.id).slice(0, 8) : "N/A"}...
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td py={6}>
                                  <HStack>
                                    <Icon as={Calendar} color="blue.500" boxSize={4} />
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="medium" color={headingColor}>
                                        {new Date(invoice.created_at).toLocaleDateString('tr-TR')}
                                      </Text>
                                      <Text fontSize="xs" color={textColor}>
                                        {new Date(invoice.created_at).toLocaleTimeString('tr-TR', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td py={6}>
                                  <HStack>
                                    <Icon as={DollarSign} color="green.500" boxSize={4} />
                                    <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                                      ₺{invoice.total_amount?.toFixed(2)}
                                    </Text>
                                  </HStack>
                                </Td>
                                <Td py={6}>
                                  <Badge
                                    colorScheme={getStatusColor(invoice.status)}
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight="bold"
                                  >
                                    {getStatusText(invoice.status)}
                                  </Badge>
                                </Td>
                                <Td py={6}>
                                  <HStack spacing={2}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      colorScheme="blue"
                                      leftIcon={<Download size={14} />}
                                      onClick={() => invoice?.id && handleDownloadInvoice(String(invoice.id))}
                                      borderRadius="lg"
                                    >
                                      İndir
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="gray"
                                      leftIcon={<FileText size={14} />}
                                    >
                                      Görüntüle
                                    </Button>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ) : (
                      <VStack spacing={6} py={12}>
                        <Box p={4} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="full">
                          <Icon as={FileText} boxSize={8} color="gray.400" />
                        </Box>
                        <VStack spacing={2}>
                          <Text color={textColor} fontSize="lg" fontWeight="medium">
                            Fatura bulunamadı
                          </Text>
                          <Text color={textColor} fontSize="sm" textAlign="center" maxW="md">
                            Henüz hiç faturanız bulunmuyor.
                          </Text>
                        </VStack>
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Subscription Tab - Only shown if data exists */}
                {showSubscriptionTab && (
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                        Abonelik Bilgileri
                      </Text>
                      {subscription ? (
                        <Box
                          p={6}
                          border="1px"
                          borderColor={borderColor}
                          borderRadius="xl"
                          bg={hoverBg}
                        >
                          <VStack align="start" spacing={4}>
                            <HStack justify="space-between" w="100%">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="xl">
                                  {subscription.plan?.name || 'Plan'}
                                </Text>
                                <Badge
                                  colorScheme={subscription.status === 'active' ? 'green' : 'gray'}
                                  borderRadius="full"
                                  px={3}
                                >
                                  {subscription.status === 'active' ? 'Aktif' : subscription.status}
                                </Badge>
                              </VStack>
                              <Text fontWeight="bold" fontSize="2xl" color={headingColor}>
                                ₺{subscription.plan?.price_monthly?.toFixed(2) || '0.00'}
                              </Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between" w="100%">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color={textColor}>
                                  Dönem Başlangıcı
                                </Text>
                                <Text fontWeight="medium">
                                  {new Date(subscription.start_date).toLocaleDateString('tr-TR')}
                                </Text>
                              </VStack>
                              <VStack align="end" spacing={1}>
                                <Text fontSize="sm" color={textColor}>
                                  Sonraki Fatura
                                </Text>
                                <Text fontWeight="medium">
                                  {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString('tr-TR') : 'Belirsiz'}
                                </Text>
                              </VStack>
                            </HStack>
                          </VStack>
                        </Box>
                      ) : (
                        <VStack spacing={6} py={8}>
                          <Box p={4} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="full">
                            <Icon as={Package} boxSize={8} color="gray.400" />
                          </Box>
                          <VStack spacing={2}>
                            <Text color={textColor} fontSize="lg" fontWeight="medium">
                              Abonelik bulunamadı
                            </Text>
                            <Text color={textColor} fontSize="sm" textAlign="center">
                              Henüz aktif bir aboneliğiniz bulunmuyor
                            </Text>
                          </VStack>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>
                )}

                {/* Usage Tab - Only shown if data exists */}
                {showUsageTab && (
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                        Kullanım İstatistikleri
                      </Text>
                      {usage.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                          {usage.map((item: UsageTracking) => (
                            <Box
                              key={item.id}
                              p={6}
                              border="1px"
                              borderColor={borderColor}
                              borderRadius="xl"
                              bg={hoverBg}
                            >
                              <VStack align="start" spacing={4}>
                                <HStack justify="space-between" w="100%">
                                  <Text fontWeight="bold" fontSize="lg">
                                    {item.feature}
                                  </Text>
                                  <Text fontSize="sm" color={textColor}>
                                    {item.usage_count} kullanım
                                  </Text>
                                </HStack>
                                <HStack justify="space-between" w="100%" fontSize="sm" color={textColor}>
                                  <Text>
                                    Dönem: {new Date(item.period_start).toLocaleDateString('tr-TR')} - {new Date(item.period_end).toLocaleDateString('tr-TR')}
                                  </Text>
                                  <Text>
                                    Toplam: {item.usage_count} kullanım
                                  </Text>
                                </HStack>
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <VStack spacing={6} py={8}>
                          <Box p={4} bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="full">
                            <Icon as={BarChart} boxSize={8} color="gray.400" />
                          </Box>
                          <VStack spacing={2}>
                            <Text color={textColor} fontSize="lg" fontWeight="medium">
                              Kullanım verisi bulunamadı
                            </Text>
                            <Text color={textColor} fontSize="sm" textAlign="center">
                              Henüz kullanım verisi bulunmuyor
                            </Text>
                          </VStack>
                        </VStack>
                      )}
                    </VStack>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
};

export default BillingManagement;