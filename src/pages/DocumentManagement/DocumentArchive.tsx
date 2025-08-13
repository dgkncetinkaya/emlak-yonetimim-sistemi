import { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Input, InputGroup, InputLeftElement, Table, Thead, Tbody, Tr, Th, Td,
  Box, Flex, Text, Badge, Icon, Menu, MenuButton, MenuList, MenuItem,
  useToast, useColorModeValue, Select
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { File, FileText, Download, Eye, Trash2, Calendar, Clock } from 'react-feather';

interface DocumentArchiveProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentArchive = ({ isOpen, onClose }: DocumentArchiveProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('Tümü');
  const [selectedDateRange, setSelectedDateRange] = useState('Tümü');
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const toast = useToast();
  
  // Dummy data for demonstration
  const dummyDocuments = [
    {
      id: 1,
      title: 'Kira Sözleşmesi - Ahmet Yılmaz',
      type: 'Kira Sözleşmesi',
      date: '15.07.2023',
      time: '14:30',
      size: '1.2 MB',
      status: 'Tamamlandı',
      property: 'Merkez Mah. 3+1 Daire',
      createdBy: 'Mehmet Danışman',
    },
    {
      id: 2,
      title: 'Yer Gösterme Formu - Mehmet Kaya',
      type: 'Yer Gösterme Formu',
      date: '20.07.2023',
      time: '10:15',
      size: '0.8 MB',
      status: 'Tamamlandı',
      property: 'Göztepe Deniz Manzaralı',
      createdBy: 'Ayşe Danışman',
    },
    {
      id: 3,
      title: 'Kira Sözleşmesi - Ayşe Demir',
      type: 'Kira Sözleşmesi',
      date: '25.07.2023',
      time: '16:45',
      size: '1.3 MB',
      status: 'Taslak',
      property: 'Bahçelievler 2+1',
      createdBy: 'Mehmet Danışman',
    },
    {
      id: 4,
      title: 'Yer Gösterme Formu - Fatma Şahin',
      type: 'Yer Gösterme Formu',
      date: '01.08.2023',
      time: '11:30',
      size: '0.9 MB',
      status: 'Taslak',
      property: 'Merkez Mah. 2+1 Daire',
      createdBy: 'Ayşe Danışman',
    },
    {
      id: 5,
      title: 'Satış Sözleşmesi - Ali Yıldız',
      type: 'Satış Sözleşmesi',
      date: '05.08.2023',
      time: '15:00',
      size: '2.1 MB',
      status: 'Tamamlandı',
      property: 'Ataşehir 3+1 Daire',
      createdBy: 'Mehmet Danışman',
    },
    {
      id: 6,
      title: 'Tapu Fotokopisi - Zeynep Kara',
      type: 'Tapu Belgesi',
      date: '10.08.2023',
      time: '09:45',
      size: '1.5 MB',
      status: 'Tamamlandı',
      property: 'Kadıköy 2+1 Daire',
      createdBy: 'Ayşe Danışman',
    },
  ];
  
  // Simulate API call to get documents
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setDocuments(dummyDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDocumentTypeChange = (type: string) => {
    setSelectedDocumentType(type);
  };
  
  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
  };
  
  const handleViewDocument = (document: any) => {
    // Belge görüntüleme işlemleri
    toast({
      title: 'Belge Görüntüleniyor',
      description: `"${document.title}" belgesi görüntüleniyor.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDownloadDocument = (document: any) => {
    // Belge indirme işlemleri
    toast({
      title: 'Belge İndiriliyor',
      description: `"${document.title}" belgesi indiriliyor.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDeleteDocument = (documentId: number) => {
    // Belge silme işlemleri
    setDocuments(documents.filter(doc => doc.id !== documentId));
    
    toast({
      title: 'Belge Silindi',
      description: 'Belge başarıyla silindi.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedDocumentType === 'Tümü' || doc.type === selectedDocumentType;
    
    // Date range filtering logic would go here
    // For simplicity, we're not implementing actual date filtering
    const matchesDateRange = true;
    
    return matchesSearch && matchesType && matchesDateRange;
  });
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Kira Sözleşmesi':
      case 'Satış Sözleşmesi':
        return FileText;
      case 'Yer Gösterme Formu':
        return File;
      case 'Tapu Belgesi':
        return FileText;
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
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Belge Arşivi</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <Flex mb={6} justifyContent="space-between" flexWrap="wrap" gap={3}>
            <InputGroup maxW={{ base: '100%', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Belge ara..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </InputGroup>
            
            <Flex gap={3} flexWrap="wrap">
              <Select
                value={selectedDocumentType}
                onChange={(e) => handleDocumentTypeChange(e.target.value)}
                w={{ base: '100%', md: 'auto' }}
              >
                <option value="Tümü">Tüm Belge Tipleri</option>
                <option value="Kira Sözleşmesi">Kira Sözleşmesi</option>
                <option value="Satış Sözleşmesi">Satış Sözleşmesi</option>
                <option value="Yer Gösterme Formu">Yer Gösterme Formu</option>
                <option value="Tapu Belgesi">Tapu Belgesi</option>
              </Select>
              
              <Select
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                w={{ base: '100%', md: 'auto' }}
              >
                <option value="Tümü">Tüm Tarihler</option>
                <option value="Bugün">Bugün</option>
                <option value="Bu Hafta">Bu Hafta</option>
                <option value="Bu Ay">Bu Ay</option>
                <option value="Son 3 Ay">Son 3 Ay</option>
                <option value="Son 6 Ay">Son 6 Ay</option>
              </Select>
            </Flex>
          </Flex>
          
          {isLoading ? (
            <Box textAlign="center" py={10}>
              <Text>Belgeler yükleniyor...</Text>
            </Box>
          ) : filteredDocuments.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text>Belge bulunamadı.</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                  <Tr>
                    <Th>Belge Adı</Th>
                    <Th>Tip</Th>
                    <Th>Tarih</Th>
                    <Th>Boyut</Th>
                    <Th>Durum</Th>
                    <Th>Oluşturan</Th>
                    <Th>İşlemler</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDocuments.map(document => {
                    const DocumentIcon = getDocumentIcon(document.type);
                    
                    return (
                      <Tr key={document.id}>
                        <Td>
                          <Flex alignItems="center">
                            <Icon as={DocumentIcon} color="blue.500" mr={2} />
                            <Box>
                              <Text fontWeight="medium">{document.title}</Text>
                              <Text fontSize="sm" color="gray.600">{document.property}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>{document.type}</Td>
                        <Td>
                          <Flex alignItems="center" fontSize="sm">
                            <Icon as={Calendar} size={14} mr={1} />
                            <Text mr={2}>{document.date}</Text>
                            <Icon as={Clock} size={14} mr={1} />
                            <Text>{document.time}</Text>
                          </Flex>
                        </Td>
                        <Td>{document.size}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                        </Td>
                        <Td>{document.createdBy}</Td>
                        <Td>
                          <Flex>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              leftIcon={<Icon as={Eye} size={16} />}
                              onClick={() => handleViewDocument(document)}
                              mr={1}
                            >
                              Görüntüle
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              leftIcon={<Icon as={Download} size={16} />}
                              onClick={() => handleDownloadDocument(document)}
                              mr={1}
                            >
                              İndir
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
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Kapat</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentArchive;