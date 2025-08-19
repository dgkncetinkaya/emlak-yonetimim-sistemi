import { useState, useRef } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel,
  SimpleGrid, Button, Input, InputGroup, InputLeftElement,
  Menu, MenuButton, MenuList, MenuItem, Flex, Text, Badge,
  useDisclosure, Icon, useColorModeValue, Portal, AlertDialog,
  AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { File, FileText, FilePlus, Calendar, Download, Trash2, Edit } from 'react-feather';

// Alt bileşenler (daha sonra ayrı dosyalara taşınabilir)
import RentalAgreement from './RentalAgreement';
import ShowingForm from './ShowingForm';
import DocumentArchive from './DocumentArchive';

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('Tümü');
  const [documents, setDocuments] = useState<any[]>([
    {
      id: 1,
      title: 'Kira Sözleşmesi - Ahmet Yılmaz',
      type: 'Kira Sözleşmesi',
      date: '15.07.2023',
      status: 'Tamamlandı',
      property: 'Merkez Mah. 3+1 Daire',
    },
    {
      id: 2,
      title: 'Yer Gösterme Formu - Mehmet Kaya',
      type: 'Yer Gösterme Formu',
      date: '20.07.2023',
      status: 'Tamamlandı',
      property: 'Göztepe Deniz Manzaralı',
    },
    {
      id: 3,
      title: 'Kira Sözleşmesi - Ayşe Demir',
      type: 'Kira Sözleşmesi',
      date: '25.07.2023',
      status: 'Taslak',
      property: 'Bahçelievler 2+1',
    },
    {
      id: 4,
      title: 'Yer Gösterme Formu - Fatma Şahin',
      type: 'Yer Gösterme Formu',
      date: '01.08.2023',
      status: 'Taslak',
      property: 'Merkez Mah. 2+1 Daire',
    },
  ]);
  
  const { isOpen: isRentalAgreementOpen, onOpen: onRentalAgreementOpen, onClose: onRentalAgreementClose } = useDisclosure();
  const { isOpen: isShowingFormOpen, onOpen: onShowingFormOpen, onClose: onShowingFormClose } = useDisclosure();
  const { isOpen: isDocumentArchiveOpen, onOpen: onDocumentArchiveOpen, onClose: onDocumentArchiveClose } = useDisclosure();
  const { isOpen: isDeleteConfirmOpen, onOpen: onDeleteConfirmOpen, onClose: onDeleteConfirmClose } = useDisclosure();
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDocumentTypeChange = (type: string) => {
    setSelectedDocumentType(type);
  };
  
  const handleCreateDocument = (type: string) => {
    if (type === 'Kira Sözleşmesi') {
      onRentalAgreementOpen();
    } else if (type === 'Yer Gösterme Formu') {
      onShowingFormOpen();
    }
  };
  
  const handleViewDocument = (document: any) => {
    // Belge görüntüleme işlemleri
    console.log('Belge görüntüleniyor:', document);
  };
  
  const handleEditDocument = (document: any) => {
    // Belge düzenleme işlemleri
    console.log('Belge düzenleniyor:', document);
    
    if (document.type === 'Kira Sözleşmesi') {
      onRentalAgreementOpen();
    } else if (document.type === 'Yer Gösterme Formu') {
      onShowingFormOpen();
    }
  };
  
  const handleDeleteDocument = (documentId: number) => {
    setDocumentToDelete(documentId);
    onDeleteConfirmOpen();
  };
  
  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      setDocumentToDelete(null);
    }
    onDeleteConfirmClose();
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedDocumentType === 'Tümü' || doc.type === selectedDocumentType;
    
    return matchesSearch && matchesType;
  });
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Kira Sözleşmesi':
        return FileText;
      case 'Yer Gösterme Formu':
        return File;
      default:
        return File;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return 'green';
      case 'Taslak':
        return 'orange';
      case 'İptal Edildi':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box p={4}>
      <Heading mb={6}>Belge Yönetimi</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={handleTabChange} mb={6}>
        <TabList>
          <Tab>Belgeler</Tab>
          <Tab>Kira Sözleşmesi</Tab>
          <Tab>Yer Gösterme Formu</Tab>
          <Tab>Belge Arşivi</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box mb={6}>
              <Flex mb={4} justifyContent="space-between" flexWrap="wrap" gap={2}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Belge ara..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
                
                <Flex gap={2}>
                  <Menu strategy="fixed">
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline">
                      {selectedDocumentType}
                    </MenuButton>
                    <Portal>
                      <MenuList zIndex={9999}>
                        <MenuItem onClick={() => handleDocumentTypeChange('Tümü')}>Tümü</MenuItem>
                        <MenuItem onClick={() => handleDocumentTypeChange('Kira Sözleşmesi')}>Kira Sözleşmesi</MenuItem>
                        <MenuItem onClick={() => handleDocumentTypeChange('Yer Gösterme Formu')}>Yer Gösterme Formu</MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                  
                  <Menu strategy="fixed">
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue">
                      Yeni Belge
                    </MenuButton>
                    <Portal>
                      <MenuList zIndex={9999}>
                        <MenuItem
                          icon={<Icon as={FileText} />}
                          onClick={() => handleCreateDocument('Kira Sözleşmesi')}
                        >
                          Kira Sözleşmesi
                        </MenuItem>
                        <MenuItem
                          icon={<Icon as={File} />}
                          onClick={() => handleCreateDocument('Yer Gösterme Formu')}
                        >
                          Yer Gösterme Formu
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Flex>
              </Flex>
              
              {filteredDocuments.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Text>Belge bulunamadı.</Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {filteredDocuments.map(document => {
                    const DocumentIcon = getDocumentIcon(document.type);
                    
                    return (
                      <Box
                        key={document.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        boxShadow="sm"
                        bg={useColorModeValue('white', 'gray.700')}
                        _hover={{ boxShadow: 'md' }}
                      >
                        <Flex mb={3} alignItems="center">
                          <Icon as={DocumentIcon} boxSize={6} color="blue.500" mr={2} />
                          <Heading size="sm" isTruncated>{document.title}</Heading>
                        </Flex>
                        
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          <Icon as={Calendar} size={14} style={{ display: 'inline', marginRight: '5px' }} />
                          {document.date}
                        </Text>
                        
                        <Text fontSize="sm" mb={3}>{document.property}</Text>
                        
                        <Flex justifyContent="space-between" alignItems="center">
                          <Badge colorScheme={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          
                          <Flex>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              leftIcon={<Icon as={Download} size={16} />}
                              onClick={() => handleViewDocument(document)}
                              mr={1}
                            >
                              İndir
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              leftIcon={<Icon as={Edit} size={16} />}
                              onClick={() => handleEditDocument(document)}
                              mr={1}
                            >
                              Düzenle
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              leftIcon={<Icon as={Trash2} size={16} />}
                              onClick={() => handleDeleteDocument(document.id)}
                            >
                              Sil
                            </Button>
                          </Flex>
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box p={4}>
              <Heading size="md" mb={4}>Kira Sözleşmesi</Heading>
              <Text mb={4}>Kira sözleşmesi oluşturmak için aşağıdaki butona tıklayın.</Text>
              <Button colorScheme="blue" onClick={onRentalAgreementOpen}>
                Yeni Kira Sözleşmesi Oluştur
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box p={4}>
              <Heading size="md" mb={4}>Yer Gösterme Formu</Heading>
              <Text mb={4}>Yer gösterme formu oluşturmak için aşağıdaki butona tıklayın.</Text>
              <Button colorScheme="blue" onClick={onShowingFormOpen}>
                Yeni Yer Gösterme Formu Oluştur
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box p={4}>
              <Heading size="md" mb={4}>Belge Arşivi</Heading>
              <Text mb={4}>Belge arşivini görüntülemek için aşağıdaki butona tıklayın.</Text>
              <Button colorScheme="blue" onClick={onDocumentArchiveOpen}>
                Belge Arşivini Aç
              </Button>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Modal bileşenleri */}
      <RentalAgreement isOpen={isRentalAgreementOpen} onClose={onRentalAgreementClose} />
      <ShowingForm isOpen={isShowingFormOpen} onClose={onShowingFormClose} />
      <DocumentArchive isOpen={isDocumentArchiveOpen} onClose={onDocumentArchiveClose} />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteConfirmOpen} onClose={onDeleteConfirmClose} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Belgeyi Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Bu belgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteConfirmClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DocumentManagement;