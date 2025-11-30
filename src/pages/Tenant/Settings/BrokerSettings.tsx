import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  useToast,
  Divider,
  IconButton,
  Tooltip,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { AddIcon, EditIcon, CheckIcon, DeleteIcon, CloseIcon } from '@chakra-ui/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultantsService, Consultant } from '../../../services/consultantsService';

const BrokerSettings: React.FC = () => {
  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    email: '',
    password: '',
    commissionRate: 5
  });
  
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [tempCommissionRates, setTempCommissionRates] = useState<{[key: string]: number}>({});
  const [consultantToDelete, setConsultantToDelete] = useState<Consultant | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);
  
  const toast = useToast();
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Fetch consultants
  const { data: consultants = [], isLoading, error } = useQuery({
    queryKey: ['consultants'],
    queryFn: consultantsService.getConsultants
  });

  // Create consultant mutation
  const createMutation = useMutation({
    mutationFn: consultantsService.createConsultant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      setNewAdvisor({ name: '', email: '', password: '', commissionRate: 5 });
      toast({
        title: 'Başarılı',
        description: 'Danışman başarıyla eklendi. Giriş bilgileri e-posta ile gönderildi.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Danışman eklenirken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  // Update commission mutation
  const updateCommissionMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) => 
      consultantsService.updateCommissionRate(id, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      setEditingCommission(null);
      toast({
        title: 'Başarılı',
        description: 'Komisyon oranı güncellendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Komisyon güncellenirken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  // Delete consultant mutation
  const deleteMutation = useMutation({
    mutationFn: consultantsService.deleteConsultant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      toast({
        title: 'Başarılı',
        description: 'Danışman başarıyla kaldırıldı.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Danışman kaldırılırken bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const handleAddAdvisor = () => {
    if (!newAdvisor.name || !newAdvisor.email || !newAdvisor.password) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newAdvisor.password.length < 6) {
      toast({
        title: 'Hata',
        description: 'Şifre en az 6 karakter olmalıdır.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    createMutation.mutate({
      email: newAdvisor.email,
      password: newAdvisor.password,
      full_name: newAdvisor.name,
      commission_rate: newAdvisor.commissionRate
    });
  };

  const handleEditCommission = (consultantId: string, currentRate: number) => {
    setEditingCommission(consultantId);
    setTempCommissionRates({ ...tempCommissionRates, [consultantId]: currentRate });
  };

  const handleSaveCommission = (consultantId: string) => {
    const newRate = tempCommissionRates[consultantId];
    if (newRate !== undefined && newRate >= 0 && newRate <= 100) {
      updateCommissionMutation.mutate({ id: consultantId, rate: newRate });
    } else {
      toast({
        title: 'Hata',
        description: 'Komisyon oranı 0-100 arasında olmalıdır.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCommissionRateChange = (consultantId: string, value: number) => {
    setTempCommissionRates({ ...tempCommissionRates, [consultantId]: value });
  };

  const handleRemoveAdvisor = (consultant: Consultant) => {
    setConsultantToDelete(consultant);
    onOpen();
  };

  const confirmDelete = () => {
    if (consultantToDelete) {
      deleteMutation.mutate(consultantToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Danışmanlar yüklenirken bir hata oluştu
      </Alert>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color={textColor}>
            Broker Ayarları
          </Heading>
          <Text color={textColor} fontSize="sm">
            Ofis danışmanlarını yönetin ve komisyon oranlarını belirleyin.
          </Text>
        </Box>

        {/* Yeni Danışman Ekleme Formu */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color={textColor}>
              <HStack>
                <AddIcon boxSize={4} />
                <Text>Yeni Danışman Ekle</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="end">
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm">Ad Soyad</FormLabel>
                  <Input
                    placeholder="Danışman adı ve soyadı"
                    value={newAdvisor.name}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, name: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm">E-posta</FormLabel>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={newAdvisor.email}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, email: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm">Şifre</FormLabel>
                  <Input
                    type="password"
                    placeholder="Min. 6 karakter"
                    value={newAdvisor.password}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, password: e.target.value})}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl maxW="150px">
                  <FormLabel color={textColor} fontSize="sm">Komisyon (%)</FormLabel>
                  <NumberInput
                    value={newAdvisor.commissionRate}
                    onChange={(_, value) => setNewAdvisor({ ...newAdvisor, commissionRate: value })}
                    min={0}
                    max={100}
                    precision={1}
                  >
                    <NumberInputField bg={bgColor} borderColor={borderColor} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
              <Box>
                <Button
                  colorScheme="blue"
                  onClick={handleAddAdvisor}
                  leftIcon={<AddIcon />}
                  size="md"
                  isLoading={createMutation.isPending}
                  loadingText="Ekleniyor..."
                >
                  Danışman Ekle
                </Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Divider />

        {/* Danışman Listesi */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md" color={textColor}>
                <HStack>
                  <EditIcon boxSize={4} />
                  <Text>Danışman Listesi</Text>
                  <Badge colorScheme="blue">{consultants.length}</Badge>
                </HStack>
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            {consultants.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color={textColor} fontSize="lg">
                  Henüz danışman eklenmemiş.
                </Text>
                <Text color={textColor} fontSize="sm" mt={2}>
                  Yukarıdaki formu kullanarak yeni danışman ekleyebilirsiniz.
                </Text>
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color={textColor}>Ad Soyad</Th>
                      <Th color={textColor}>E-posta</Th>
                      <Th color={textColor}>Komisyon Oranı (%)</Th>
                      <Th color={textColor}>Durum</Th>
                      <Th color={textColor}>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {consultants.map((consultant) => (
                      <Tr key={consultant.id}>
                        <Td color={textColor} fontWeight="medium">{consultant.full_name}</Td>
                        <Td color={textColor}>{consultant.email}</Td>
                        <Td>
                          {editingCommission === consultant.id ? (
                            <HStack spacing={2}>
                              <NumberInput
                                size="sm"
                                maxW={20}
                                value={tempCommissionRates[consultant.id] || consultant.commission_rate || 5}
                                onChange={(_, value) => handleCommissionRateChange(consultant.id, value)}
                                min={0}
                                max={100}
                                precision={1}
                              >
                                <NumberInputField />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                              <Tooltip label="Kaydet">
                                <IconButton
                                  aria-label="Kaydet"
                                  icon={<CheckIcon />}
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleSaveCommission(consultant.id)}
                                  isLoading={updateCommissionMutation.isPending}
                                />
                              </Tooltip>
                              <Tooltip label="İptal">
                                <IconButton
                                  aria-label="İptal"
                                  icon={<CloseIcon />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingCommission(null)}
                                />
                              </Tooltip>
                            </HStack>
                          ) : (
                            <Text color={textColor} fontWeight="bold">
                              %{consultant.commission_rate || 5}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme="green">Aktif</Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {editingCommission !== consultant.id && (
                              <Tooltip label="Komisyon Oranını Düzenle">
                                <IconButton
                                  aria-label="Düzenle"
                                  icon={<EditIcon />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => handleEditCommission(consultant.id, consultant.commission_rate || 5)}
                                />
                              </Tooltip>
                            )}
                            <Tooltip label="Danışmanı Kaldır">
                              <IconButton
                                aria-label="Kaldır"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleRemoveAdvisor(consultant)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Özet Bilgiler */}
        {consultants.length > 0 && (
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-around">
                <VStack align="center" spacing={1}>
                  <Text fontSize="sm" color={textColor}>Toplam Danışman</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {consultants.length}
                  </Text>
                </VStack>
                <VStack align="center" spacing={1}>
                  <Text fontSize="sm" color={textColor}>Ortalama Komisyon</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    %{(consultants.reduce((sum, c) => sum + (c.commission_rate || 5), 0) / consultants.length).toFixed(1)}
                  </Text>
                </VStack>
                <VStack align="center" spacing={1}>
                  <Text fontSize="sm" color={textColor}>En Yüksek Komisyon</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    %{Math.max(...consultants.map(c => c.commission_rate || 5))}
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Danışmanı Kaldır
            </AlertDialogHeader>

            <AlertDialogBody>
              <strong>{consultantToDelete?.full_name}</strong> adlı danışmanı kaldırmak istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                İptal
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete} 
                ml={3}
                isLoading={deleteMutation.isPending}
              >
                Kaldır
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default BrokerSettings;
