import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Button, Icon, Flex, useColorModeValue,
  Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, VStack, HStack
} from '@chakra-ui/react';
import { ArrowLeft, RefreshCw } from 'react-feather';
import CustomerDetail from './CustomerDetail';
import { customersService, Customer } from '../../../services/customersService';

// UI formatında müşteri tipi
interface UICustomer extends Omit<Customer, 'status'> {
  type: string;
  status: string;
}

// Supabase veri formatını UI formatına dönüştüren yardımcı fonksiyonlar
const formatCustomerType = (customerType: string): string => {
  const typeMap: { [key: string]: string } = {
    'buyer': 'Alıcı',
    'seller': 'Satıcı',
    'tenant': 'Kiracı',
    'landlord': 'Ev Sahibi'
  };
  return typeMap[customerType] || customerType;
};

const formatCustomerStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'Aktif',
    'inactive': 'Pasif',
    'potential': 'Potansiyel',
    'converted': 'Dönüştürülmüş'
  };
  return statusMap[status] || status;
};

// UI formatındaki müşteriyi oluşturan fonksiyon
const formatCustomerForUI = (customer: Customer): UICustomer => {
  return {
    ...customer,
    type: formatCustomerType(customer.customer_type),
    status: formatCustomerStatus(customer.status)
  };
};

const CustomerDetailPage = () => {
  const { id, tenantName } = useParams<{ id: string; tenantName: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<UICustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) {
        setError('Geçersiz müşteri ID\'si');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const customerData = await customersService.getCustomer(id);
        const formattedCustomer = formatCustomerForUI(customerData);
        setCustomer(formattedCustomer);
      } catch (err: any) {
        console.error('Müşteri yüklenirken hata:', err);
        if (err.message?.includes('not found') || err.message?.includes('No rows returned')) {
          setError('Müşteri bulunamadı. Lütfen geçerli bir müşteri ID\'si ile tekrar deneyin.');
        } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
          setError('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
        } else {
          setError('Müşteri bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  const handleGoBack = () => {
    navigate(`/${tenantName}/musteriler`);
  };

  if (loading) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <VStack spacing={4} justify="center" minH="50vh">
          <Spinner size="xl" color="blue.500" />
          <Heading size="md" color={headingColor}>Müşteri bilgileri yükleniyor...</Heading>
        </VStack>
      </Box>
    );
  }

  if (error || !customer) {
    return (
      <Box p={6} bg={bgColor} minH="100vh">
        <VStack spacing={6} align="center">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Hata!</AlertTitle>
              <AlertDescription>{error || 'Müşteri bulunamadı'}</AlertDescription>
            </Box>
          </Alert>
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
              leftIcon={<Icon as={RefreshCw} />}
            >
              Sayfayı Yenile
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              leftIcon={<Icon as={ArrowLeft} />}
            >
              Müşteri Listesine Dön
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={{ base: '4', md: '6' }} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Button
            leftIcon={<Icon as={ArrowLeft} />}
            onClick={handleGoBack}
            variant="ghost"
            size="lg"
          >
            Geri Dön
          </Button>
          <Heading size="xl" color={headingColor}>
            {customer.name}
          </Heading>
          <Box /> {/* Spacer */}
        </Flex>

        {/* Customer Detail Component */}
        <CustomerDetail customer={customer} />
      </VStack>
    </Box>
  );
};

export default CustomerDetailPage;