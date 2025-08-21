import {
  Box, VStack, HStack, Text, Badge, Divider, Heading, Avatar,
  Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  useColorModeValue, SimpleGrid, Button, Icon, IconButton, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Input, Select, FormControl, FormLabel, Textarea,
  Alert, AlertIcon, Flex, Editable, EditableInput, EditableTextarea, EditablePreview,
  useEditableControls, ButtonGroup, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Download, Trash2, Plus, Edit3, Check, X } from 'react-feather';

interface CustomerDetailProps {
  customer: any;
  activeTab?: number;
  autoOpenDocumentModal?: boolean;
}

const CustomerDetail = ({ customer, activeTab = 0, autoOpenDocumentModal = false }: CustomerDetailProps) => {
  const { isOpen: isDocumentModalOpen, onOpen: onDocumentModalOpen, onClose: onDocumentModalClose } = useDisclosure();
  const { isOpen: isInterviewModalOpen, onOpen: onInterviewModalOpen, onClose: onInterviewModalClose } = useDisclosure();
  const { isOpen: isPropertyModalOpen, onOpen: onPropertyModalOpen, onClose: onPropertyModalClose } = useDisclosure();
  
  // Edit modals
  const { isOpen: isBudgetEditOpen, onOpen: onBudgetEditOpen, onClose: onBudgetEditClose } = useDisclosure();
  const { isOpen: isPreferencesEditOpen, onOpen: onPreferencesEditOpen, onClose: onPreferencesEditClose } = useDisclosure();
  const { isOpen: isNotesEditOpen, onOpen: onNotesEditOpen, onClose: onNotesEditClose } = useDisclosure();
  const { isOpen: isPreferencesAddOpen, onOpen: onPreferencesAddOpen, onClose: onPreferencesAddClose } = useDisclosure();
  const { isOpen: isNotesAddOpen, onOpen: onNotesAddOpen, onClose: onNotesAddClose } = useDisclosure();
  
  // Delete confirmation modals
  const { isOpen: isBudgetDeleteOpen, onOpen: onBudgetDeleteOpen, onClose: onBudgetDeleteClose } = useDisclosure();
  const { isOpen: isPreferencesDeleteOpen, onOpen: onPreferencesDeleteOpen, onClose: onPreferencesDeleteClose } = useDisclosure();
  const { isOpen: isNotesDeleteOpen, onOpen: onNotesDeleteOpen, onClose: onNotesDeleteClose } = useDisclosure();
  
  const [editableBudget, setEditableBudget] = useState(customer.budget || '1.500.000 TL - 2.000.000 TL');
  const [editablePreferences, setEditablePreferences] = useState(customer.preferences || '3+1, Merkez veya Göztepe');
  const [editableNotes, setEditableNotes] = useState(customer.notes || 'Acil ev arıyor, 2 hafta içinde taşınmak istiyor.');
  
  // Temporary states for editing
  const [tempBudget, setTempBudget] = useState('');
  const [tempPreferences, setTempPreferences] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [tempNewPreference, setTempNewPreference] = useState('');
  
  // Refs for AlertDialog
  const budgetDeleteCancelRef = useRef<HTMLButtonElement>(null);
  const preferencesDeleteCancelRef = useRef<HTMLButtonElement>(null);
  const notesDeleteCancelRef = useRef<HTMLButtonElement>(null);
  const [tempNewNote, setTempNewNote] = useState('');
  
  // Color mode values
  const headingColor = useColorModeValue('gray.700', 'gray.300');
  const tableBg = useColorModeValue('gray.100', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const modalBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  
  // Handler functions for buttons
  const handleBudgetEdit = () => {
    setTempBudget(editableBudget);
    onBudgetEditOpen();
  };
  
  const handleBudgetEditSave = () => {
    if (tempBudget.trim() !== '') {
      setEditableBudget(tempBudget);
      console.log('Bütçe güncellendi:', tempBudget);
    }
    onBudgetEditClose();
  };
  
  const handleBudgetDelete = () => {
    onBudgetDeleteOpen();
  };
  
  const handleBudgetDeleteConfirm = () => {
    setEditableBudget('');
    console.log('Bütçe silindi');
    onBudgetDeleteClose();
  };
  
  const handlePreferencesAdd = () => {
    setTempNewPreference('');
    onPreferencesAddOpen();
  };
  
  const handlePreferencesAddSave = () => {
    if (tempNewPreference.trim() !== '') {
      setEditablePreferences(editablePreferences + ', ' + tempNewPreference);
      console.log('Yeni tercih eklendi:', tempNewPreference);
    }
    onPreferencesAddClose();
  };
  
  const handlePreferencesEdit = () => {
    setTempPreferences(editablePreferences);
    onPreferencesEditOpen();
  };
  
  const handlePreferencesEditSave = () => {
    if (tempPreferences.trim() !== '') {
      setEditablePreferences(tempPreferences);
      console.log('Tercihler güncellendi:', tempPreferences);
    }
    onPreferencesEditClose();
  };
  
  const handlePreferencesDelete = () => {
    onPreferencesDeleteOpen();
  };
  
  const handlePreferencesDeleteConfirm = () => {
    setEditablePreferences('');
    console.log('Tercihler silindi');
    onPreferencesDeleteClose();
  };
  
  const handleNotesAdd = () => {
    setTempNewNote('');
    onNotesAddOpen();
  };
  
  const handleNotesAddSave = () => {
    if (tempNewNote.trim() !== '') {
      setEditableNotes(editableNotes + '\n' + tempNewNote);
      console.log('Yeni not eklendi:', tempNewNote);
    }
    onNotesAddClose();
  };
  
  const handleNotesEdit = () => {
    setTempNotes(editableNotes);
    onNotesEditOpen();
  };
  
  const handleNotesEditSave = () => {
    if (tempNotes.trim() !== '') {
      setEditableNotes(tempNotes);
      console.log('Notlar güncellendi:', tempNotes);
    }
    onNotesEditClose();
  };
  
  const handleNotesDelete = () => {
    onNotesDeleteOpen();
  };
  
  const handleNotesDeleteConfirm = () => {
    setEditableNotes('');
    console.log('Notlar silindi');
    onNotesDeleteClose();
  };
  
  // EditableControls component
  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup justifyContent="center" size="sm" mt={2}>
        <IconButton
          aria-label="Kaydet"
          icon={<Icon as={Check} />}
          {...getSubmitButtonProps()}
          colorScheme="green"
        />
        <IconButton
          aria-label="İptal"
          icon={<Icon as={X} />}
          {...getCancelButtonProps()}
          colorScheme="red"
        />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center" mt={2}>
        <IconButton
          aria-label="Düzenle"
          size="sm"
          icon={<Icon as={Edit3} />}
          {...getEditButtonProps()}
          variant="ghost"
          colorScheme="blue"
        />
      </Flex>
    );
  }
  
  // Auto open document modal if requested
  useEffect(() => {
    if (autoOpenDocumentModal) {
      onDocumentModalOpen();
    }
  }, [autoOpenDocumentModal, onDocumentModalOpen]);
  
  if (!customer) return null;
  
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
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color={headingColor}>
              Bütçe
            </Heading>
            <ButtonGroup size="sm" variant="ghost">
               <IconButton
                 aria-label="Düzenle"
                 icon={<Icon as={Edit3} />}
                 colorScheme="blue"
                 onClick={handleBudgetEdit}
               />
               <IconButton
                 aria-label="Sil"
                 icon={<Icon as={Trash2} />}
                 colorScheme="red"
                 onClick={handleBudgetDelete}
               />
             </ButtonGroup>
          </Flex>
          <Editable
            value={editableBudget}
            onChange={setEditableBudget}
            fontSize="md"
            isPreviewFocusable={false}
          >
            <EditablePreview
              py={2}
              px={3}
              _hover={{
                background: tableBg,
                cursor: 'pointer'
              }}
              borderRadius="md"
            />
            <EditableInput py={2} px={3} />
          </Editable>
        </Box>
        
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color={headingColor}>
              Tercihler
            </Heading>
            <ButtonGroup size="sm" variant="ghost">
               <IconButton
                 aria-label="Ekle"
                 icon={<Icon as={Plus} />}
                 colorScheme="green"
                 onClick={handlePreferencesAdd}
               />
               <IconButton
                 aria-label="Düzenle"
                 icon={<Icon as={Edit3} />}
                 colorScheme="blue"
                 onClick={handlePreferencesEdit}
               />
               <IconButton
                 aria-label="Sil"
                 icon={<Icon as={Trash2} />}
                 colorScheme="red"
                 onClick={handlePreferencesDelete}
               />
             </ButtonGroup>
          </Flex>
          <Editable
            value={editablePreferences}
            onChange={setEditablePreferences}
            fontSize="md"
            isPreviewFocusable={false}
          >
            <EditablePreview
              py={2}
              px={3}
              _hover={{
                background: tableBg,
                cursor: 'pointer'
              }}
              borderRadius="md"
            />
            <EditableInput py={2} px={3} />
          </Editable>
        </Box>
      </SimpleGrid>
      
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size="sm" color={headingColor}>
            Notlar
          </Heading>
          <ButtonGroup size="sm" variant="ghost">
             <IconButton
               aria-label="Ekle"
               icon={<Icon as={Plus} />}
               colorScheme="green"
               onClick={handleNotesAdd}
             />
             <IconButton
               aria-label="Düzenle"
               icon={<Icon as={Edit3} />}
               colorScheme="blue"
               onClick={handleNotesEdit}
             />
             <IconButton
               aria-label="Sil"
               icon={<Icon as={Trash2} />}
               colorScheme="red"
               onClick={handleNotesDelete}
             />
           </ButtonGroup>
        </Flex>
        <Box
          p={3}
          bg={tableHeaderBg}
          borderRadius="md"
        >
          <Editable
            value={editableNotes}
            onChange={setEditableNotes}
            fontSize="md"
            isPreviewFocusable={false}
          >
            <EditablePreview
              _hover={{
                background: useColorModeValue('gray.100', 'gray.600'),
                cursor: 'pointer'
              }}
              borderRadius="md"
              p={2}
            />
            <EditableTextarea
              resize="none"
              rows={3}
              p={2}
            />
          </Editable>
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
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="sm">Görüşme Geçmişi</Heading>
                <Button
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onInterviewModalOpen}
                >
                  Yeni Görüşme Ekle
                </Button>
              </Flex>
              
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
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="sm">Gösterilen Gayrimenkuller</Heading>
                <Button
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onPropertyModalOpen}
                >
                  Yeni Gayrimenkul Ekle
                </Button>
              </Flex>
              
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
            </VStack>
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
          <ModalHeader borderBottom="1px" borderColor={modalBorderColor} pb={4}>
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
                  borderColor={inputBorderColor}
                  borderRadius="lg"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.400', bg: hoverBg }}
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
          <ModalFooter borderTop="1px" borderColor={modalBorderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={onDocumentModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button colorScheme="blue" borderRadius="lg" px={6}>
              Belgeyi Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Yeni Görüşme Ekleme Modal'ı */}
      <Modal isOpen={isInterviewModalOpen} onClose={onInterviewModalClose} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={modalBorderColor} pb={4}>
            <Text fontSize="lg" fontWeight="600">Yeni Görüşme Ekle</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel fontWeight="600">Görüşme Türü</FormLabel>
                <Select placeholder="Görüşme türünü seçiniz" size="lg" borderRadius="lg">
                  <option value="telefon">📞 Telefon</option>
                  <option value="email">📧 E-posta</option>
                  <option value="yuz-yuze">👥 Yüz Yüze</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="video-call">📹 Video Görüşme</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Tarih</FormLabel>
                <Input
                  type="date"
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Görüşme Notları</FormLabel>
                <Textarea
                  placeholder="Görüşme detayları ve notlar..."
                  rows={4}
                  size="lg"
                  borderRadius="lg"
                  resize="none"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={modalBorderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={onInterviewModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button colorScheme="blue" borderRadius="lg" px={6}>
              Görüşmeyi Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Yeni Gayrimenkul Ekleme Modal'ı */}
      <Modal isOpen={isPropertyModalOpen} onClose={onPropertyModalClose} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" boxShadow="xl">
          <ModalHeader borderBottom="1px" borderColor={modalBorderColor} pb={4}>
            <Text fontSize="lg" fontWeight="600">Yeni Gayrimenkul Ekle</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5}>
              <FormControl>
                 <FormLabel fontWeight="600">Gayrimenkul</FormLabel>
                 <Input
                   placeholder="Gayrimenkul adını yazınız (örn: Merkez - 3+1 Daire 150m²)"
                   size="lg"
                   borderRadius="lg"
                   _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                 />
               </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Durum</FormLabel>
                <Select placeholder="Durum seçiniz" size="lg" borderRadius="lg">
                  <option value="onerildi">💡 Önerildi</option>
                  <option value="gosterildi">✅ Gösterildi</option>
                  <option value="begenildi">❤️ Beğenildi</option>
                  <option value="reddedildi">❌ Reddedildi</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Tarih</FormLabel>
                <Input
                  type="date"
                  size="lg"
                  borderRadius="lg"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="600">Notlar</FormLabel>
                <Textarea
                  placeholder="Müşteri geri bildirimleri ve notlar..."
                  rows={3}
                  size="lg"
                  borderRadius="lg"
                  resize="none"
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={modalBorderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={onPropertyModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button colorScheme="blue" borderRadius="lg" px={6}>
              Gayrimenkulü Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Budget Edit Modal */}
      <Modal isOpen={isBudgetEditOpen} onClose={onBudgetEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bütçe Düzenle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Bütçe Bilgisi</FormLabel>
              <Input
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                placeholder="Bütçe bilgisini giriniz"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBudgetEditClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleBudgetEditSave}>
              Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preferences Edit Modal */}
      <Modal isOpen={isPreferencesEditOpen} onClose={onPreferencesEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tercihler Düzenle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Tercih Bilgileri</FormLabel>
              <Textarea
                value={tempPreferences}
                onChange={(e) => setTempPreferences(e.target.value)}
                placeholder="Tercih bilgilerini giriniz"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPreferencesEditClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handlePreferencesEditSave}>
              Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Edit Modal */}
      <Modal isOpen={isNotesEditOpen} onClose={onNotesEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notlar Düzenle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Not Bilgileri</FormLabel>
              <Textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Not bilgilerini giriniz"
                rows={6}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNotesEditClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleNotesEditSave}>
              Kaydet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preferences Add Modal */}
      <Modal isOpen={isPreferencesAddOpen} onClose={onPreferencesAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Tercih Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Yeni Tercih</FormLabel>
              <Input
                value={tempNewPreference}
                onChange={(e) => setTempNewPreference(e.target.value)}
                placeholder="Yeni tercih giriniz"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPreferencesAddClose}>
              İptal
            </Button>
            <Button colorScheme="green" onClick={handlePreferencesAddSave}>
              Ekle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Notes Add Modal */}
      <Modal isOpen={isNotesAddOpen} onClose={onNotesAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Not Ekle</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Yeni Not</FormLabel>
              <Textarea
                value={tempNewNote}
                onChange={(e) => setTempNewNote(e.target.value)}
                placeholder="Yeni not giriniz"
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNotesAddClose}>
              İptal
            </Button>
            <Button colorScheme="green" onClick={handleNotesAddSave}>
              Ekle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Budget Delete Confirmation */}
      <AlertDialog isOpen={isBudgetDeleteOpen} onClose={onBudgetDeleteClose} leastDestructiveRef={budgetDeleteCancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Bütçeyi Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Bütçe bilgisini silmek istediğinizden emin misiniz?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={budgetDeleteCancelRef} onClick={onBudgetDeleteClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleBudgetDeleteConfirm} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Preferences Delete Confirmation */}
      <AlertDialog isOpen={isPreferencesDeleteOpen} onClose={onPreferencesDeleteClose} leastDestructiveRef={preferencesDeleteCancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Tercihleri Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Tercih bilgisini silmek istediğinizden emin misiniz?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={preferencesDeleteCancelRef} onClick={onPreferencesDeleteClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handlePreferencesDeleteConfirm} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Notes Delete Confirmation */}
      <AlertDialog isOpen={isNotesDeleteOpen} onClose={onNotesDeleteClose} leastDestructiveRef={notesDeleteCancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Notları Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Not bilgisini silmek istediğinizden emin misiniz?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={notesDeleteCancelRef} onClick={onNotesDeleteClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleNotesDeleteConfirm} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CustomerDetail;