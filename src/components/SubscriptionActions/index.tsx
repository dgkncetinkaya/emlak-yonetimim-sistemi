import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  useToast,
  Text,
  Badge,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../pages/Tenant/store/hooks';
import {
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  fetchDunningEvents,
  retryFailedPayment
} from '../../pages/Tenant/store/slices/subscriptionSlice';

interface SubscriptionActionsProps {
  subscription: any;
  onPlanChange?: () => void;
  onCancel?: () => void;
}

const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({ subscription, onPlanChange, onCancel }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { dunningEvents, loading } = useAppSelector(state => state.subscription);

  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const { isOpen: isPauseOpen, onOpen: onPauseOpen, onClose: onPauseClose } = useDisclosure();
  const { isOpen: isDunningOpen, onOpen: onDunningOpen, onClose: onDunningClose } = useDisclosure();

  const [cancelReason, setCancelReason] = useState('');
  const [cancelType, setCancelType] = useState('end_of_period');
  const [pauseReason, setPauseReason] = useState('');
  const [pauseDuration, setPauseDuration] = useState(30);

  const handleCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscription({
        cancellation_reason: cancelReason,
        cancel_at_period_end: cancelType === 'end_of_period'
      })).unwrap();

      toast({
        title: 'Abonelik İptal Edildi',
        description: cancelType === 'end_of_period'
          ? 'Aboneliğiniz mevcut dönem sonunda iptal edilecek'
          : 'Aboneliğiniz hemen iptal edildi',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onCancelClose();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Abonelik iptal edilirken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePauseSubscription = async () => {
    try {
      await dispatch(pauseSubscription({
        pauseDurationDays: pauseDuration,
        reason: pauseReason
      })).unwrap();

      toast({
        title: 'Abonelik Donduruldu',
        description: `Aboneliğiniz ${pauseDuration} gün süreyle donduruldu`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onPauseClose();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Abonelik dondurulurken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await dispatch(resumeSubscription()).unwrap();

      toast({
        title: 'Abonelik Devam Ettirildi',
        description: 'Aboneliğiniz başarıyla devam ettirildi',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Abonelik devam ettirilirken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRetryPayment = async (eventId: string) => {
    try {
      await dispatch(retryFailedPayment(eventId)).unwrap();

      toast({
        title: 'Ödeme Yeniden Denendi',
        description: 'Ödeme işlemi başarıyla yeniden denendi',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh dunning events
      dispatch(fetchDunningEvents());
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Ödeme yeniden denenirken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const loadDunningEvents = () => {
    dispatch(fetchDunningEvents());
    onDunningOpen();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: 'Aktif' },
      paused: { color: 'yellow', text: 'Donduruldu' },
      canceled: { color: 'red', text: 'İptal Edildi' },
      cancel_at_period_end: { color: 'orange', text: 'Dönem Sonunda İptal' },
      past_due: { color: 'red', text: 'Ödeme Gecikmiş' },
      trialing: { color: 'blue', text: 'Deneme Sürümü' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'gray', text: status };
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Abonelik Durumu: {getStatusBadge(subscription?.status)}
          </Text>

          {subscription?.status === 'cancel_at_period_end' && (
            <Alert status="warning" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Abonelik İptal Edildi!</AlertTitle>
                <AlertDescription>
                  Aboneliğiniz mevcut dönem sonunda ({new Date(subscription.next_billing_date).toLocaleDateString()}) iptal edilecek.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {subscription?.status === 'paused' && (
            <Alert status="info" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Abonelik Donduruldu!</AlertTitle>
                <AlertDescription>
                  Aboneliğiniz {subscription.pause_until ? new Date(subscription.pause_until).toLocaleDateString() : ''} tarihine kadar donduruldu.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {subscription?.status === 'past_due' && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Ödeme Gecikmiş!</AlertTitle>
                <AlertDescription>
                  Aboneliğinizde ödeme sorunu var. Lütfen ödeme bilgilerinizi kontrol edin.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>

        <Divider />

        <HStack spacing={4} wrap="wrap">
          {subscription?.status === 'active' && (
            <>
              {onPlanChange && (
                <Button colorScheme="blue" onClick={onPlanChange}>
                  Plan Değiştir
                </Button>
              )}
              <Button colorScheme="orange" onClick={onPauseOpen}>
                Aboneliği Dondur
              </Button>
              <Button colorScheme="red" onClick={onCancelOpen}>
                Aboneliği İptal Et
              </Button>
            </>
          )}

          {subscription?.status === 'paused' && (
            <Button colorScheme="green" onClick={handleResumeSubscription} isLoading={loading}>
              Aboneliği Devam Ettir
            </Button>
          )}

          {(subscription?.status === 'past_due' || subscription?.status === 'active') && (
            <Button colorScheme="blue" onClick={loadDunningEvents}>
              Ödeme Geçmişi
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Cancel Subscription Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aboneliği İptal Et</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>İptal Türü</FormLabel>
                <RadioGroup value={cancelType} onChange={setCancelType}>
                  <Stack>
                    <Radio value="end_of_period">Dönem sonunda iptal et</Radio>
                    <Radio value="immediate">Hemen iptal et</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel>İptal Nedeni (Opsiyonel)</FormLabel>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="İptal nedeninizi belirtebilirsiniz..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCancelClose}>
              Vazgeç
            </Button>
            <Button colorScheme="red" onClick={handleCancelSubscription} isLoading={loading}>
              İptal Et
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Pause Subscription Modal */}
      <Modal isOpen={isPauseOpen} onClose={onPauseClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aboneliği Dondur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Dondurma Süresi (Gün)</FormLabel>
                <NumberInput value={pauseDuration} onChange={(_, value) => setPauseDuration(value)} min={1} max={365}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Dondurma Nedeni (Opsiyonel)</FormLabel>
                <Textarea
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="Dondurma nedeninizi belirtebilirsiniz..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPauseClose}>
              Vazgeç
            </Button>
            <Button colorScheme="orange" onClick={handlePauseSubscription} isLoading={loading}>
              Dondur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dunning Events Modal */}
      <Modal isOpen={isDunningOpen} onClose={onDunningClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ödeme Geçmişi ve Başarısız Ödemeler</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {dunningEvents.length === 0 ? (
              <Text>Henüz ödeme sorunu yaşanmamış.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {dunningEvents.map((event: any) => (
                  <Box key={event.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Ödeme Hatası #{event.id}</Text>
                      <Badge colorScheme={event.status === 'active' ? 'red' : event.status === 'resolved' ? 'green' : 'gray'}>
                        {event.status === 'active' ? 'Aktif' : event.status === 'resolved' ? 'Çözüldü' : 'Başarısız'}
                      </Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Hata: {event.failure_reason}
                    </Text>

                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Deneme Sayısı: {event.retry_count} / 4
                    </Text>

                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Tarih: {new Date(event.created_at).toLocaleString()}
                    </Text>

                    {event.status === 'active' && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleRetryPayment(event.id)}
                        isLoading={loading}
                      >
                        Ödemeyi Yeniden Dene
                      </Button>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDunningClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionActions;