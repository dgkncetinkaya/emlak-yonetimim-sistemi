import React, { useEffect } from 'react';
import {
  Box,
  Container,
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
} from '@chakra-ui/react';
import { FileText, Download, CreditCard, Calendar, DollarSign, TrendingUp, Archive, Briefcase } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInvoices, fetchBillingAddress, downloadInvoicePDF } from '../../store/slices/billingSlice';
import { fetchPaymentMethods } from '../../store/slices/paymentSlice';
const BillingManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  const { invoices, billingAddress, loading, error } = useAppSelector(
    (state) => state.billing
  );
  const { paymentMethods } = useAppSelector(
    (state) => state.payment
  );
  
  // Color mode values
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
  
  // Responsive values
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 4 });
  const spacing = useBreakpointValue({ base: 4, md: 6 });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchInvoices({})).unwrap();
      } catch (error) {
        console.warn('Failed to load invoices:', error);
      }
      
      try {
        await dispatch(fetchPaymentMethods(undefined)).unwrap();
      } catch (error) {
        console.warn('Failed to load payment methods:', error);
      }
      
      try {
        await dispatch(fetchBillingAddress()).unwrap();
      } catch (error) {
        console.warn('Failed to load billing address:', error);
      }
    };
    
    loadData();
  }, [dispatch]);
  
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
      await dispatch(downloadInvoicePDF(invoiceId)).unwrap();
      toast({
        title: 'İndirme Başladı',
        description: 'Fatura PDF dosyası indiriliyor...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Fatura indirilemedi. Lütfen tekrar deneyin.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (loading) {
    return (
      <Box bgGradient={bg} minH="100vh" py={8}>
        <Container maxW="7xl">
          <Flex justify="center" align="center" h="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="white" thickness="4px" />
              <Text color="white" fontSize="lg">
                Yükleniyor...
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error) {
    const is404Error = error.includes('404') || error.includes('not found');
    const errorMessage = is404Error 
      ? 'Fatura bilgileri henüz mevcut değil. Lütfen daha sonra tekrar deneyin.'
      : error;
    
    return (
      <Box bgGradient={bg} minH="100vh" py={8}>
        <Container maxW="7xl">
          <Card bg={cardBg} shadow="xl" borderRadius="xl">
            <CardBody>
              <Alert status={is404Error ? 'info' : 'error'} borderRadius="lg">
                <AlertIcon />
                <AlertTitle>{is404Error ? 'Bilgi' : 'Hata'}</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </CardBody>
          </Card>
        </Container>
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
      <Container maxW="7xl">
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
          
          {/* Payment Methods */}
          <Card bg={cardBg} shadow="xl" borderRadius="xl" overflow="hidden">
            <CardHeader bg="blue.50" _dark={{ bg: 'blue.900' }} py={6}>
              <HStack>
                <Box p={3} bg="blue.500" borderRadius="lg">
                  <Icon as={CreditCard} color="white" boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color={headingColor}>
                    Ödeme Yöntemleri
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Ödeme yöntemlerinizi yönetin
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody p={6}>
              {paymentMethods && paymentMethods.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {paymentMethods.map((method: any) => (
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
                              **** **** **** {method.last4}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {method.brand?.toUpperCase()} • Son Kullanma {method.exp_month}/{method.exp_year}
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
            </CardBody>
          </Card>
          
          {/* Billing History */}
          <Card bg={cardBg} shadow="xl" borderRadius="xl" overflow="hidden">
            <CardHeader bg="green.50" _dark={{ bg: 'green.900' }} py={6}>
              <HStack justify="space-between">
                <HStack>
                  <Box p={3} bg="green.500" borderRadius="lg">
                    <Icon as={FileText} color="white" boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xl" fontWeight="bold" color={headingColor}>
                      Faturalama Geçmişi
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      Faturalarınızı görüntüleyin ve indirin
                    </Text>
                  </VStack>
                </HStack>
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
            </CardHeader>
            <CardBody p={0}>
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
                      {invoicesArray.map((invoice: any, index: number) => (
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
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default BillingManagement;