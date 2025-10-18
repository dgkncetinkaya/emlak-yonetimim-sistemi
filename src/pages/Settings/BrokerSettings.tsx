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
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, EditIcon, CheckIcon, DeleteIcon } from '@chakra-ui/icons';

interface Advisor {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
}

const BrokerSettings: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([
    { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', commissionRate: 5 },
    { id: '2', name: 'Ayşe Demir', email: 'ayse@example.com', commissionRate: 7 },
    { id: '3', name: 'Mehmet Kaya', email: 'mehmet@example.com', commissionRate: 6 }
  ]);
  
  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [editingCommission, setEditingCommission] = useState<string | null>(null);
  const [tempCommissionRates, setTempCommissionRates] = useState<{[key: string]: number}>({});
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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

    const emailExists = advisors.some(advisor => advisor.email === newAdvisor.email);
    if (emailExists) {
      toast({
        title: 'Hata',
        description: 'Bu e-posta adresi zaten kullanılıyor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newId = Date.now().toString();
    const advisor: Advisor = {
      id: newId,
      name: newAdvisor.name,
      email: newAdvisor.email,
      commissionRate: 5 // Varsayılan komisyon oranı
    };

    setAdvisors([...advisors, advisor]);
    setNewAdvisor({ name: '', email: '', password: '' });
    
    toast({
      title: 'Başarılı',
      description: 'Danışman başarıyla eklendi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditCommission = (advisorId: string) => {
    setEditingCommission(advisorId);
    const advisor = advisors.find(a => a.id === advisorId);
    if (advisor) {
      setTempCommissionRates({ ...tempCommissionRates, [advisorId]: advisor.commissionRate });
    }
  };

  const handleSaveCommission = (advisorId: string) => {
    const newRate = tempCommissionRates[advisorId];
    if (newRate !== undefined && newRate >= 0 && newRate <= 100) {
      setAdvisors(advisors.map(advisor => 
        advisor.id === advisorId 
          ? { ...advisor, commissionRate: newRate }
          : advisor
      ));
      setEditingCommission(null);
      
      toast({
        title: 'Başarılı',
        description: 'Komisyon oranı güncellendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleCommissionRateChange = (advisorId: string, value: number) => {
    setTempCommissionRates({ ...tempCommissionRates, [advisorId]: value });
  };

  const handleRemoveAdvisor = (advisorId: string) => {
    const advisor = advisors.find(a => a.id === advisorId);
    if (advisor) {
      setAdvisors(advisors.filter(a => a.id !== advisorId));
      
      toast({
        title: 'Başarılı',
        description: `${advisor.name} başarıyla kaldırıldı.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Ad Soyad</FormLabel>
                  <Input
                    placeholder="Danışman adı ve soyadı"
                    value={newAdvisor.name}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, name: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>E-posta</FormLabel>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={newAdvisor.email}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, email: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Şifre</FormLabel>
                  <Input
                    type="password"
                    placeholder="Güvenli şifre oluşturun"
                    value={newAdvisor.password}
                    onChange={(e) => setNewAdvisor({ ...newAdvisor, password: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>
              <Box>
                <Button
                  colorScheme="blue"
                  onClick={handleAddAdvisor}
                  leftIcon={<AddIcon />}
                  size="md"
                >
                  Danışman Ekle
                </Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Divider />

        {/* Danışman Listesi ve Komisyon Yönetimi */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color={textColor}>
              <HStack>
                <EditIcon boxSize={4} />
                <Text>Danışman Listesi ve Komisyon Oranları</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            {advisors.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color={textColor} fontSize="lg">
                  Henüz danışman eklenmemiş.
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
                      <Th color={textColor}>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {advisors.map((advisor) => (
                      <Tr key={advisor.id}>
                        <Td color={textColor} fontWeight="medium">{advisor.name}</Td>
                        <Td color={textColor}>{advisor.email}</Td>
                        <Td>
                          {editingCommission === advisor.id ? (
                            <HStack spacing={2}>
                              <NumberInput
                                size="sm"
                                maxW={20}
                                value={tempCommissionRates[advisor.id] || advisor.commissionRate}
                                onChange={(_, value) => handleCommissionRateChange(advisor.id, value)}
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
                                  onClick={() => handleSaveCommission(advisor.id)}
                                />
                              </Tooltip>
                            </HStack>
                          ) : (
                            <HStack spacing={2}>
                              <Text color={textColor} fontWeight="bold">
                                %{advisor.commissionRate}
                              </Text>
                            </HStack>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {editingCommission !== advisor.id && (
                              <Tooltip label="Komisyon Oranını Düzenle">
                                <IconButton
                                  aria-label="Düzenle"
                                  icon={<EditIcon />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => handleEditCommission(advisor.id)}
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
                                onClick={() => handleRemoveAdvisor(advisor.id)}
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
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={textColor}>Toplam Danışman</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {advisors.length}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={textColor}>Ortalama Komisyon</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  %{advisors.length > 0 ? (advisors.reduce((sum, advisor) => sum + advisor.commissionRate, 0) / advisors.length).toFixed(1) : '0'}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color={textColor}>En Yüksek Komisyon</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  %{advisors.length > 0 ? Math.max(...advisors.map(a => a.commissionRate)) : '0'}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default BrokerSettings;