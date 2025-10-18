import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Button, Icon, Flex, useColorModeValue,
  Alert, AlertIcon, Spinner, VStack
} from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import CustomerDetail from './CustomerDetail';

// Dummy data - gerçek uygulamada API'den gelecek
const dummyCustomers = [
  {
    id: 1,
    name: 'Emirhan Aşkayanar',
    phone: '0532 123 4567',
    email: 'ahmet.yilmaz@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '1.500.000 TL - 2.000.000 TL',
    budgetMin: 1500000,
    budgetMax: 2000000,
    preferences: '3+1, Merkez veya Göztepe',
    lastContact: '15.07.2023',
    notes: 'Acil ev arıyor, 2 hafta içinde taşınmak istiyor.',
    source: 'Referans'
  },
  {
    id: 2,
    name: 'Emin Gülertürk',
    phone: '0533 456 7890',
    email: 'ayse.demir@example.com',
    status: 'Aktif',
    type: 'Satıcı',
    budget: '-',
    budgetMin: 0,
    budgetMax: 0,
    preferences: 'Ataşehir, 2+1 Daire',
    lastContact: '10.08.2023',
    notes: 'Evini satmak istiyor, değerleme yapıldı.',
    source: 'Web Sitesi'
  },
  {
    id: 3,
    name: 'Selim Gülertürk',
    phone: '0535 789 0123',
    email: 'mehmet.kaya@example.com',
    status: 'Sürekli Pasif',
    type: 'Kiracı',
    budget: '8.000 TL - 12.000 TL/ay',
    budgetMin: 8000,
    budgetMax: 12000,
    preferences: 'Bahçelievler, 3+1 veya 4+1',
    lastContact: '01.06.2023',
    notes: 'Şu an için erteledi, 3 ay sonra tekrar aranacak.',
    source: 'Sosyal Medya'
  },
  {
    id: 4,
    name: 'Doğukan Çetinkaya',
    phone: '0536 234 5678',
    email: 'zeynep.sahin@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '3.000.000 TL - 4.500.000 TL',
    budgetMin: 3000000,
    budgetMax: 4500000,
    preferences: 'Göztepe, Villa veya Bahçeli Ev',
    lastContact: '20.07.2023',
    notes: 'Lüks konut arıyor, bütçesi esnek.',
    source: 'Referans'
  },
  {
    id: 5,
    name: ' Hasanım Çalımlı',
    phone: '0537 345 6789',
    email: 'mehmet.kaya2@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '2.500.000 TL - 3.500.000 TL',
    budgetMin: 2500000,
    budgetMax: 3500000,
    preferences: 'Kadıköy, 4+1 Daire',
    lastContact: '18.07.2023',
    notes: 'Yatırım amaçlı konut arıyor.',
    source: 'Web Sitesi'
  },
  {
    id: 6,
    name: 'Sinan Çetinkaya',
    phone: '0538 456 7890',
    email: 'fatma.demir@example.com',
    status: 'Aktif',
    type: 'Kiracı',
    budget: '15.000 TL - 20.000 TL/ay',
    budgetMin: 15000,
    budgetMax: 20000,
    preferences: 'Beşiktaş, 3+1 Daire',
    lastContact: '22.07.2023',
    notes: 'Şirket için ofis arıyor.',
    source: 'Referans'
  }
];

const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        // Gerçek uygulamada API çağrısı yapılacak
        const customerId = parseInt(id || '0');
        const foundCustomer = dummyCustomers.find(c => c.id === customerId);
        
        if (!foundCustomer) {
          setError('Müşteri bulunamadı');
          return;
        }
        
        setCustomer(foundCustomer);
      } catch (err) {
        setError('Müşteri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id]);

  const handleGoBack = () => {
    navigate('/customers');
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
        <VStack spacing={6}>
          <Button
            leftIcon={<Icon as={ArrowLeft} />}
            onClick={handleGoBack}
            variant="ghost"
            size="lg"
            alignSelf="flex-start"
          >
            Geri Dön
          </Button>
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            {error || 'Müşteri bulunamadı'}
          </Alert>
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