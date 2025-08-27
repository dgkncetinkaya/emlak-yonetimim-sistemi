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
} from '@chakra-ui/react';
import { FileText, Download, CreditCard, Calendar, DollarSign } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchInvoices, fetchBillingAddress, downloadInvoicePDF } from '../../store/slices/billingSlice';
import { fetchPaymentMethods } from '../../store/slices/paymentSlice';
import { useTranslation } from 'react-i18next';

const BillingManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { t } = useTranslation();
  
  const { invoices, billingAddress, loading, error } = useAppSelector(
    (state) => state.billing
  );
  const { paymentMethods } = useAppSelector((state) => state.payment);
  
  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  
  useEffect(() => {
    dispatch(fetchInvoices());
    dispatch(fetchPaymentMethods());
    dispatch(fetchBillingAddress());
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
        return t('billing.paid');
      case 'pending':
        return t('billing.pending');
      case 'payment_failed':
        return t('billing.paymentFailed');
      case 'cancelled':
        return t('billing.cancelled');
      default:
        return status;
    }
  };
  
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      await dispatch(downloadInvoicePDF(invoiceId)).unwrap();
      toast({
        title: t('billing.downloadStarted'),
        description: t('billing.downloadInvoiceDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('billing.downloadError'),
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
          <Flex justify="center" align="center" h="400px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        </Container>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box bg={bg} minH="100vh" py={8}>
        <Container maxW="7xl">
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color={headingColor} mb={2}>
              {t('navigation.billing')}
            </Text>
            <Text color={textColor}>
              {t('billing.description')}
            </Text>
          </Box>
          
          {/* Payment Methods */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack>
                <Icon as={CreditCard} color="blue.500" />
                <Text fontSize="xl" fontWeight="semibold" color={headingColor}>
                  {t('billing.paymentMethods')}
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              {paymentMethods && paymentMethods.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {paymentMethods.map((method: any) => (
                    <Box key={method.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={CreditCard} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">
                              **** **** **** {method.last4}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {method.brand?.toUpperCase()} • {t('common.expires')} {method.exp_month}/{method.exp_year}
                            </Text>
                          </VStack>
                        </HStack>
                        {method.is_default && (
                          <Badge colorScheme="blue">{t('billing.default')}</Badge>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color={textColor}>{t('billing.noPaymentMethods')}</Text>
              )}
            </CardBody>
          </Card>
          
          {/* Billing History */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <HStack>
                  <Icon as={FileText} color="blue.500" />
                  <Text fontSize="xl" fontWeight="semibold" color={headingColor}>
                    {t('billing.billingHistory')}
                  </Text>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              {invoices && invoices.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t('billing.invoiceNumber')}</Th>
                      <Th>{t('billing.date')}</Th>
                      <Th>{t('billing.amount')}</Th>
                      <Th>{t('billing.status')}</Th>
                      <Th>{t('billing.actions')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoices.map((invoice: any) => (
                      <Tr key={invoice.id}>
                        <Td>
                          <Text fontWeight="medium">{invoice.invoice_number}</Text>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={Calendar} size="sm" />
                            <Text>
                              {new Date(invoice.created_at).toLocaleDateString('tr-TR')}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={DollarSign} size="sm" />
                            <Text fontWeight="medium">
                              ₺{invoice.total_amount?.toFixed(2)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(invoice.status)}>
                            {getStatusText(invoice.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Download size={16} />}
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            {t('billing.download')}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color={textColor}>{t('billing.noInvoices')}</Text>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default BillingManagement;