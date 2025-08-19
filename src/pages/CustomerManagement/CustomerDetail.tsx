import {
  Box, VStack, HStack, Text, Badge, Divider, Heading, Avatar,
  Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  useColorModeValue, SimpleGrid, Button, Icon, IconButton, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Input, Select, FormControl, FormLabel, Textarea,
  Alert, AlertIcon, Flex
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Plus } from 'react-feather';

interface CustomerDetailProps {
  customer: any;
  activeTab?: number;
  autoOpenDocumentModal?: boolean;
}

const CustomerDetail = ({ customer, activeTab = 0, autoOpenDocumentModal = false }: CustomerDetailProps) => {
  if (!customer) return null;
  
  const { isOpen: isDocumentModalOpen, onOpen: onDocumentModalOpen, onClose: onDocumentModalClose } = useDisclosure();
  
  // Auto open document modal if requested
  useEffect(() => {
    if (autoOpenDocumentModal) {
      onDocumentModalOpen();
    }
  }, [autoOpenDocumentModal, onDocumentModalOpen]);
  
  // Dummy data for demonstration
  const interactions = [
    { date: '15.07.2023', type: 'Telefon', notes: 'Müşteri ile ilk görüşme yapıldı, ihtiyaçları belirlendi.' },
    { date: '20.07.2023', type: 'E-posta', notes: 'Müşteriye uygun ilanlar gönderildi.' },
    { date: '25.07.2023', type: 'Yüz Yüze', notes: 'Göztepe\'deki daireyi gösterdik, beğendi ancak fiyatı yüksek buldu.' },
    { date: '01.08.2023', type: 'Telefon', notes: 'Fiyat düşüşü hakkında bilgilendirme yapıldı, tekrar düşünecek.' },
  ];
  
  const properties = [
    { date: '20.07.2023', property: 'Merkez Mah. 3+1 Daire', status: 'Gösterildi', notes: 'Beğendi, düşünecek.' },
    { date: '25.07.2023', property: 'Göztepe Deniz Manzaralı', status: 'Gösterildi', notes: 'Çok beğendi, fiyat pazarlığı yapılacak.' },
    { date: '01.08.2023', property: 'Bahçelievler 2+1', status: 'Önerildi', notes: 'Henüz gösterilmedi.' },
  ];
  
  const documents = [
    { id: 1, name: 'Kira Sözleşmesi - Merkez Mah.', type: 'Kira Sözleşmesi', date: '15.07.2023', size: '2.4 MB', format: 'PDF' },
    { id: 2, name: 'Yer Gösterme Tutanağı - Göztepe', type: 'Yer Gösterme', date: '25.07.2023', size: '1.8 MB', format: 'PDF' },
    { id: 3, name: 'Kimlik Fotokopisi', type: 'Kimlik Belgesi', date: '10.07.2023', size: '856 KB', format: 'JPG' },
    { id: 4, name: 'Gelir Belgesi', type: 'Mali Belge', date: '12.07.2023', size: '1.2 MB', format: 'PDF' },
  ];
  
  return (
    <Box>
      <HStack spacing={4} mb={6} align="flex-start">
        <Avatar size="xl" name={customer.name} />
        
        <VStack align="flex-start" spacing={1} flex={1}>
          <Heading size="md">{customer.name}</Heading>
          
          <HStack>
            <Badge
              colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
            >
              {customer.status}
            </Badge>
            
            <Badge
              colorScheme={
                customer.type === 'Alıcı' ? 'blue' :
                customer.type === 'Satıcı' ? 'green' : 'purple'
              }
            >
              {customer.type}
            </Badge>
          </HStack>
          
          <Text>{customer.phone}</Text>
          <Text color="gray.600">{customer.email}</Text>
        </VStack>
      </HStack>
      
      <Divider mb={6} />
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Box>
          <Heading size="sm" mb={2}>Bütçe</Heading>
          <Text>{customer.budget}</Text>
        </Box>
        
        <Box>
          <Heading size="sm" mb={2}>Tercihler</Heading>
          <Text>{customer.preferences}</Text>
        </Box>
      </SimpleGrid>
      
      <Box mb={6}>
        <Heading size="sm" mb={2}>Notlar</Heading>
        <Box
          p={3}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="md"
        >
          <Text>{customer.notes}</Text>
        </Box>
      </Box>
      
      <Tabs variant="enclosed" colorScheme="blue" defaultIndex={activeTab}>
        <TabList>
          <Tab>Görüşme Geçmişi</Tab>
          <Tab>Gösterilen Gayrimenkuller</Tab>
          <Tab>Belgeler</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Tarih</Th>
                  <Th>Tür</Th>
                  <Th>Notlar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {interactions.map((interaction, index) => (
                  <Tr key={index}>
                    <Td>{interaction.date}</Td>
                    <Td>{interaction.type}</Td>
                    <Td>{interaction.notes}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          
          <TabPanel>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Tarih</Th>
                  <Th>Gayrimenkul</Th>
                  <Th>Durum</Th>
                  <Th>Notlar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {properties.map((property, index) => (
                  <Tr key={index}>
                    <Td>{property.date}</Td>
                    <Td>{property.property}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          property.status === 'Gösterildi' ? 'green' :
                          property.status === 'Önerildi' ? 'blue' : 'gray'
                        }
                      >
                        {property.status}
                      </Badge>
                    </Td>
                    <Td>{property.notes}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="sm">Müşteri Belgeleri</Heading>
                <Button
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onDocumentModalOpen}
                >
                  Belge Ekle
                </Button>
              </Flex>
              
              {documents.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  Henüz belge eklenmemiş.
                </Alert>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Belge Adı</Th>
                      <Th>Tür</Th>
                      <Th>Tarih</Th>
                      <Th>Boyut</Th>
                      <Th>Format</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {documents.map((doc) => (
                      <Tr key={doc.id}>
                        <Td>
                          <HStack>
                            <Icon as={FileText} color="blue.500" />
                            <Text>{doc.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              doc.type === 'Kira Sözleşmesi' ? 'green' :
                              doc.type === 'Yer Gösterme' ? 'blue' :
                              doc.type === 'Kimlik Belgesi' ? 'purple' : 'orange'
                            }
                          >
                            {doc.type}
                          </Badge>
                        </Td>
                        <Td>{doc.date}</Td>
                        <Td>{doc.size}</Td>
                        <Td>{doc.format}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="İndir"
                              icon={<Icon as={Download} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                            />
                            <IconButton
                              aria-label="Sil"
                              icon={<Icon as={Trash2} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Belge Ekleme Modal'ı */}
      <Modal isOpen={isDocumentModalOpen} onClose={onDocumentModalClose} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} pb={4}>
            <Text fontSize="lg" fontWeight="600">Yeni Belge Ekle</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel fontWeight="600">Belge Türü</FormLabel>
                <Select placeholder="Belge türünü seçiniz" size="lg" borderRadius="lg">
                  <option value="kira-sozlesmesi">📄 Kira Sözleşmesi</option>
                  <option value="yer-gosterme">🏠 Yer Gösterme Tutanağı</option>
                  <option value="kimlik-belgesi">🆔 Kimlik Belgesi</option>
                  <option value="mali-belge">💰 Mali Belge</option>
                  <option value="tapu-belgesi">📋 Tapu Belgesi</option>
                  <option value="sigorta-belgesi">🛡️ Sigorta Belgesi</option>
                  <option value="diger">📎 Diğer</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Belge Adı</FormLabel>
                <Input
                  placeholder="Belge adını giriniz"
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Dosya Seçimi</FormLabel>
                <Box
                  border="2px dashed"
                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.400', bg: useColorModeValue('blue.50', 'blue.900') }}
                  transition="all 0.2s"
                >
                  <VStack spacing={3}>
                    <Icon as={Upload} size={32} color="blue.500" />
                    <Text fontWeight="600" color="blue.500">Dosya Seçmek İçin Tıklayın</Text>
                    <Text fontSize="sm" color="gray.500">
                      PDF, DOC, DOCX, JPG, PNG (Maks. 10MB)
                    </Text>
                  </VStack>
                </Box>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Açıklama</FormLabel>
                <Textarea
                  placeholder="Belge hakkında açıklama..."
                  rows={3}
                  size="lg"
                  borderRadius="lg"
                  resize="none"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} pt={4}>
            <Button variant="ghost" mr={3} onClick={onDocumentModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button colorScheme="blue" borderRadius="lg" px={6}>
              Belgeyi Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerDetail;