import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  useColorModeValue,
  Icon,
  Box,
  Button,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { Download, Calendar, CreditCard } from 'react-feather';
import { useEffect, useState } from 'react';
import { subscriptionService, PaymentHistory } from '../services/subscriptionService';
import { useAppearance } from '../context/AppearanceContext';

interface SubscriptionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionHistory = ({ isOpen, onClose }: SubscriptionHistoryProps) => {
  const { settings } = useAppearance();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (isOpen) {
      loadPaymentHistory();
    }
  }, [isOpen]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getPaymentHistory();
      setPayments(data);
    } catch (error) {
      console.error('Ödeme geçmişi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Beklemede';
      case 'failed':
        return 'Başarısız';
      case 'refunded':
        return 'İade Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Fatura Geçmişi</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color={settings.primary_color || 'blue.500'} />
            </Center>
          ) : payments.length === 0 ? (
            <Center py={10}>
              <VStack spacing={3}>
                <Icon as={CreditCard} boxSize={12} color="gray.400" />
                <Text color="gray.600">Henüz ödeme kaydı bulunmuyor</Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {payments.map((payment) => (
                <Box
                  key={payment.id}
                  p={4}
                  bg={cardBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={Calendar} boxSize={5} color={settings.primary_color || 'blue.500'} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {new Date(payment.payment_date).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {payment.payment_method}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge
                        colorScheme={getStatusColor(payment.status)}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {getStatusText(payment.status)}
                      </Badge>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Tutar</Text>
                      <Text fontSize="lg" fontWeight="bold" color={settings.primary_color || 'blue.500'}>
                        ₺{payment.amount.toLocaleString()} {payment.currency}
                      </Text>
                    </HStack>

                    {payment.invoice_url && (
                      <Button
                        size="sm"
                        leftIcon={<Icon as={Download} />}
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => window.open(payment.invoice_url, '_blank')}
                      >
                        Faturayı İndir
                      </Button>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubscriptionHistory;
