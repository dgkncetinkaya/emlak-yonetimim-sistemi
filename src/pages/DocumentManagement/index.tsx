import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useToast,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,
  Spacer,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Textarea,
  Checkbox
} from '@chakra-ui/react';
import { FileText, Download, Upload, Eye, Trash2, Search, Filter, Calendar, User, Archive, Home } from 'react-feather';
import SignatureCanvas from 'react-signature-canvas';
import { DocItem, DocType, DocStatus, YGTemplate, YGFormData, SignatureData, ArchiveFilter, Pagination } from '../../types/documentManagement';
import { getFromStorage, saveToStorage, DOC_ARCHIVE, YG_TEMPLATES, CURRENT_USER } from '../../utils/storage';
import { User as UserType, UserRole, hasPermission, canViewDocument, canEditDocument, canDeleteDocument } from '../../types/userTypes';
import YerGostermeEditor from './YerGostermeEditor';
import RentalContractEditor from './RentalContractEditor';
import AdvancedArchiveFilters from '../../components/AdvancedArchiveFilters';

import EmailSmsNotifications from '../../components/EmailSmsNotifications';
import { createFilledPdf, downloadBlob, fileToBlob, isPdfFile, formatFileSize } from '../../utils/pdf';

const DocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<YGTemplate[]>([]);
  const [archive, setArchive] = useState<DocItem[]>([]);
  const [filteredArchive, setFilteredArchive] = useState<DocItem[]>([]);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>({
    search: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    owner: '',
    department: '',
    tags: [],
    hasSignature: null,
    fileSize: { min: 0, max: 100 }
  });
  const [currentUser, setCurrentUser] = useState<UserType>({
    id: '1',
    fullName: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['documents.view.all', 'documents.create', 'documents.edit.all', 'documents.delete.all', 'documents.archive.access'],
    isActive: true,
    createdAt: new Date().toISOString()
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [ygFormData, setYgFormData] = useState<YGFormData>({
    customerName: '',
    customerTc: '',
    appointmentDate: '',
    appointmentTime: '',
    propertyAddress: '',
    agentName: '',
    notes: ''
  });
  const [signatures, setSignatures] = useState<SignatureData>({
    customer: null,
    agent: null
  });
  const [selectedTemplate, setSelectedTemplate] = useState<YGTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showRentalEditor, setShowRentalEditor] = useState(false);
  const [editorTemplateUrl, setEditorTemplateUrl] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customerSigRef = useRef<SignatureCanvas>(null);
  const agentSigRef = useRef<SignatureCanvas>(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Initialize users data
  useEffect(() => {
    const mockUsers: UserType[] = [
      {
        id: '1',
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['documents.view.all', 'documents.create', 'documents.edit.all', 'documents.delete.all', 'documents.archive.access'],
        department: 'Yönetim',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        role: 'agent',
        permissions: ['documents.view.own', 'documents.create', 'documents.edit.own', 'documents.delete.own'],
        department: 'Satış',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        fullName: 'Fatma Demir',
        email: 'fatma@example.com',
        role: 'manager',
        permissions: ['documents.view.all', 'documents.create', 'documents.edit.all', 'documents.delete.own'],
        department: 'Kiralama',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    setUsers(mockUsers);
  }, []);
  
  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);
  
  // Filter archive when filter changes
  useEffect(() => {
    filterArchive();
  }, [archive, archiveFilter]);
  
  const initializeData = () => {
    // Load templates
    const savedTemplates = getFromStorage<YGTemplate[]>(YG_TEMPLATES, []);
    setTemplates(savedTemplates);
    
    // Load archive with seed data
    let savedArchive = getFromStorage<DocItem[]>(DOC_ARCHIVE, []);
    
    if (savedArchive.length === 0) {
      // Seed initial data
      savedArchive = [
        {
          id: 'doc-1',
          name: 'Örnek Kira Sözleşmesi',
          type: 'kira' as DocType,
          status: 'tamamlandi' as DocStatus,
          createdAt: '2024-01-15T10:30:00Z',
          ownerId: '1',
          url: '/templates/kira-sozlesmesi.pdf',
          tags: ['Önemli', 'Onaylandı'],
          hasSignature: true,
          fileSize: 2.5
        },
        {
          id: 'doc-2',
          name: 'Yer Gösterme Formu - Ahmet Yılmaz',
          type: 'yer' as DocType,
          status: 'tamamlandi' as DocStatus,
          createdAt: '2024-01-20T14:15:00Z',
          ownerId: '2',
          url: '/templates/yer-gosterme-formu.pdf',
          tags: ['Tamamlandı'],
          hasSignature: true,
          fileSize: 1.8
        },
        {
          id: 'doc-3',
          name: 'Taslak Sözleşme',
          type: 'kira' as DocType,
          status: 'taslak' as DocStatus,
          createdAt: '2024-01-25T09:45:00Z',
          ownerId: '3',
          url: '/templates/kira-sozlesmesi.pdf',
          tags: ['Beklemede'],
          hasSignature: false,
          fileSize: 1.2
        },
        {
          id: 'doc-4',
          name: 'Mali Belge - Vergi Levhası',
          type: 'mali' as DocType,
          status: 'tamamlandi' as DocStatus,
          createdAt: '2024-01-10T08:20:00Z',
          ownerId: '1',
          url: '/templates/mali-belge.pdf',
          tags: ['Acil', 'Arşivlendi'],
          hasSignature: false,
          fileSize: 0.8
        },
        {
          id: 'doc-5',
          name: 'DASK Belgesi - Müşteri',
          type: 'dask' as DocType,
          status: 'tamamlandi' as DocStatus,
          createdAt: '2024-01-28T16:30:00Z',
          ownerId: '2',
          url: '/templates/dask-belgesi.pdf',
          tags: ['İnceleme Gerekli'],
          hasSignature: false,
          fileSize: 0.5
        }
      ];
      saveToStorage(DOC_ARCHIVE, savedArchive);
    }
    
    setArchive(savedArchive);
  };
  
  const filterArchive = () => {
    let filtered = [...archive];
    
    // Role-based filtering
    filtered = filtered.filter(doc => canViewDocument(currentUser, doc.ownerId));
    
    // Search filter
    if (archiveFilter.search) {
      const searchLower = archiveFilter.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchLower) ||
        users.find(u => u.id === doc.ownerId)?.fullName.toLowerCase().includes(searchLower)
      );
    }
    
    // Type filter
    if (archiveFilter.type) {
      filtered = filtered.filter(doc => doc.type === archiveFilter.type);
    }
    
    // Status filter
    if (archiveFilter.status) {
      filtered = filtered.filter(doc => doc.status === archiveFilter.status);
    }
    
    // Date range filter
    if (archiveFilter.dateFrom) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) >= new Date(archiveFilter.dateFrom));
    }
    if (archiveFilter.dateTo) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) <= new Date(archiveFilter.dateTo));
    }
    
    // Owner filter
    if (archiveFilter.owner) {
      filtered = filtered.filter(doc => doc.ownerId === archiveFilter.owner);
    }
    
    // Department filter
    if (archiveFilter.department) {
      filtered = filtered.filter(doc => {
        const owner = users.find(u => u.id === doc.ownerId);
        return owner?.department === archiveFilter.department;
      });
    }
    
    // Tags filter
    if (archiveFilter.tags.length > 0) {
      filtered = filtered.filter(doc => 
        archiveFilter.tags.some(tag => doc.tags?.includes(tag))
      );
    }
    
    // Signature filter
    if (archiveFilter.hasSignature !== null) {
      filtered = filtered.filter(doc => 
        Boolean(doc.hasSignature) === archiveFilter.hasSignature
      );
    }
    
    // File size filter
    if (archiveFilter.fileSize.min > 0 || archiveFilter.fileSize.max < 100) {
      filtered = filtered.filter(doc => {
        const size = doc.fileSize || 0;
        return size >= archiveFilter.fileSize.min && size <= archiveFilter.fileSize.max;
      });
    }
    
    // Status filter
    if (archiveFilter.status) {
      filtered = filtered.filter(doc => doc.status === archiveFilter.status);
    }
    
    // Date range filter
    if (archiveFilter.dateFrom) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) >= new Date(archiveFilter.dateFrom));
    }
    if (archiveFilter.dateTo) {
      filtered = filtered.filter(doc => new Date(doc.createdAt) <= new Date(archiveFilter.dateTo));
    }
    
    // Update pagination
    const totalItems = filtered.length;
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, endIndex);
    
    setFilteredArchive(paginatedItems);
    setPagination(prev => ({ ...prev, totalItems }));
  };
  
  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    toast({
      title: 'İndirme Başlatıldı',
      description: `${filename} dosyası indiriliyor...`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const handlePreviewPdf = (url: string) => {
    setPreviewUrl(url);
    onPreviewOpen();
  };
  
  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!isPdfFile(file)) {
      toast({
        title: 'Hata',
        description: 'Lütfen sadece PDF dosyası yükleyin.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const url = await fileToBlob(file);
      const newTemplate: YGTemplate = {
        id: `template-${Date.now()}`,
        name: file.name.replace('.pdf', ''),
        url,
        uploadedAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      saveToStorage(YG_TEMPLATES, updatedTemplates);
      
      toast({
        title: 'Şablon Yüklendi',
        description: `${file.name} başarıyla yüklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    saveToStorage(YG_TEMPLATES, updatedTemplates);
    
    toast({
      title: 'Şablon Silindi',
      description: 'Şablon başarıyla silindi.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const handleUseTemplate = (template: YGTemplate) => {
    setSelectedTemplate(template);
    setEditorTemplateUrl(template.url);
    setShowEditor(true);
  };

  const handleUseDefaultTemplate = () => {
    setEditorTemplateUrl('/templates/yer-gosterme-formu.pdf');
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedTemplate(null);
    setEditorTemplateUrl('');
  };

  const handleCloseRentalEditor = () => {
    setShowRentalEditor(false);
  };
  
  const handleFormSubmit = async () => {
    if (!selectedTemplate) return;
    
    setIsProcessing(true);
    
    try {
      // Collect signatures
      const customerSig = customerSigRef.current?.toDataURL();
      const agentSig = agentSigRef.current?.toDataURL();
      
      const signatureData: SignatureData = {
        customer: customerSig || null,
        agent: agentSig || null
      };
      
      // Create filled PDF
      const filledPdfBlob = await createFilledPdf(selectedTemplate.url, ygFormData, signatureData);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `yer-gosterme-${ygFormData.customerName.replace(/\s+/g, '-')}-${timestamp}.pdf`;
      
      // Download PDF
      downloadBlob(filledPdfBlob, filename);
      
      // Save to archive
      const newDoc: DocItem = {
        id: `doc-${Date.now()}`,
        name: `Yer Gösterme - ${ygFormData.customerName}`,
        type: 'yer' as DocType,
        status: 'tamamlandi' as DocStatus,
        createdAt: new Date().toISOString(),
        ownerId: currentUser.id,
        url: URL.createObjectURL(filledPdfBlob)
      };
      
      const updatedArchive = [newDoc, ...archive];
      setArchive(updatedArchive);
      saveToStorage(DOC_ARCHIVE, updatedArchive);
      
      // Reset form
      setYgFormData({
        customerName: '',
        customerTc: '',
        appointmentDate: '',
        appointmentTime: '',
        propertyAddress: '',
        agentName: '',
        notes: ''
      });
      setSignatures({ customer: null, agent: null });
      customerSigRef.current?.clear();
      agentSigRef.current?.clear();
      
      onFormClose();
      
      toast({
        title: 'Form Oluşturuldu',
        description: 'Yer gösterme formu başarıyla oluşturuldu ve indirildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Form oluşturulurken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteArchiveItem = (docId: string) => {
    const updatedArchive = archive.filter(doc => doc.id !== docId);
    setArchive(updatedArchive);
    saveToStorage(DOC_ARCHIVE, updatedArchive);
    
    toast({
      title: 'Belge Silindi',
      description: 'Belge arşivden silindi.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const clearFilters = () => {
    setArchiveFilter({
      search: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case 'tamamlandi': return 'green';
      case 'taslak': return 'yellow';
      default: return 'gray';
    }
  };
  
  const getTypeLabel = (type: DocType) => {
    const labels = {
      'kira': 'Kira Sözleşmesi',
      'yer': 'Yer Gösterme',
      'dask': 'DASK Belgesi',
      'mali': 'Mali Belge',
      'tapu': 'Tapu',
      'diger': 'Diğer'
    };
    return labels[type] || type;
  };
  
  const getStatusLabel = (status: DocStatus) => {
    const labels = {
      'tamamlandi': 'Tamamlandı',
      'taslak': 'Taslak'
    };
    return labels[status] || status;
  };
  
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  
  return (
    <Container maxW="1100px" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Belge Yönetimi
          </Heading>
          <Text color="gray.600">
            Kira sözleşmeleri, yer gösterme formları ve diğer belgeleri yönetin
          </Text>
        </Box>

        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FileText} boxSize={4} />
                <Text>Kira Sözleşmesi</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={User} boxSize={4} />
                <Text>Yer Gösterme Formu</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={Home} boxSize={4} />
                <Text>Tahliye Taahhütnamesi</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={Archive} boxSize={4} />
                <Text>Arşiv</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Kira Sözleşmesi Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <VStack spacing={6} align="center" py={8}>
                    <Icon as={FileText} boxSize={16} color="blue.500" />
                    <VStack spacing={2} textAlign="center">
                      <Heading as="h3" size="lg">
                        Kira Sözleşmesi
                      </Heading>
                      <Text color="gray.600" maxW="md">
                        Hazır şablonu kullanarak kira sözleşmesi oluşturun, form bilgilerini doldurun ve PDF çıktısı alın.
                      </Text>
                      <Alert status="info" mt={4}>
                        <AlertIcon />
                        Oluşturulan sözleşmeler otomatik olarak Arşiv sekmesine kaydedilir.
                      </Alert>
                    </VStack>
                    <HStack spacing={4}>
                      <Button
                        size="lg"
                        colorScheme="blue"
                        leftIcon={<Icon as={FileText} />}
                        onClick={() => setShowRentalEditor(true)}
                      >
                        Yeni Kira Sözleşmesi Oluştur
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        leftIcon={<Icon as={Download} />}
                        onClick={() => handleDownloadPdf('/templates/kira-sozlesmesi.pdf', 'kira-sozlesmesi-sablon.pdf')}
                      >
                        Boş Şablonu İndir
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Yer Gösterme Formu Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardHeader>
                    <Heading as="h3" size="md">
                      Yer Gösterme Formu
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      Örneği indirip sistemde doldurun; isterseniz dijital imza ile imzalayıp yazdırın.
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <Button
                        leftIcon={<Icon as={Download} />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => handleDownloadPdf('/templates/yer-gosterme-formu.pdf', 'yer-gosterme-formu.pdf')}
                      >
                        Örnek Yer Gösterme PDF'sini Aç/İndir
                      </Button>
                      <Button
                        leftIcon={<Icon as={FileText} />}
                        colorScheme="green"
                        onClick={handleUseDefaultTemplate}
                      >
                        Varsayılan Şablonu Kullan
                      </Button>
                      <Button
                        leftIcon={<Icon as={Upload} />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Ofis Şablonu Yükle (PDF)
                      </Button>
                    </SimpleGrid>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleTemplateUpload}
                      display="none"
                    />
                  </CardBody>
                </Card>

                {/* Şablon Listesi */}
                {templates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Heading as="h4" size="sm">
                        Yüklenen Şablonlar ({templates.length})
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Şablon Adı</Th>
                            <Th>Yükleme Tarihi</Th>
                            <Th>İşlemler</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {templates.map((template) => (
                            <Tr key={template.id}>
                              <Td>{template.name}</Td>
                              <Td>{new Date(template.uploadedAt).toLocaleDateString('tr-TR')}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="xs"
                                    colorScheme="green"
                                    onClick={() => handleUseTemplate(template)}
                                  >
                                    Kullan
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleDownloadPdf(template.url, `${template.name}.pdf`)}
                                  >
                                    İndir
                                  </Button>
                                  <IconButton
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    aria-label="Sil"
                                    icon={<Icon as={Trash2} />}
                                    onClick={() => handleDeleteTemplate(template.id)}
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>

            {/* Tahliye Taahhütnamesi Tab */}
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <VStack spacing={8} align="center" py={8}>
                    <VStack spacing={4} textAlign="center">
                      <Icon as={Home} boxSize={16} color="blue.500" />
                      <Heading as="h2" size="lg">
                        Tahliye Taahhütnamesi
                      </Heading>
                      <Text color="gray.600" maxW="md">
                        Hazır şablonu kullanarak tahliye taahhütnamesi oluşturun, form bilgilerini doldurun ve PDF çıktısı alın.
                      </Text>
                      <Alert status="info" mt={4}>
                        <AlertIcon />
                        Oluşturulan taahhütnameler otomatik olarak Arşiv sekmesine kaydedilir.
                      </Alert>
                    </VStack>
                    <HStack spacing={4}>
                      <Button
                        size="lg"
                        colorScheme="blue"
                        leftIcon={<Icon as={FileText} />}
                      >
                        Yeni Tahliye Taahhütnamesi Oluştur
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        leftIcon={<Icon as={Download} />}
                      >
                        Boş Şablonu İndir
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Arşiv Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Gelişmiş Filtreler */}
                <AdvancedArchiveFilters
                  filter={archiveFilter}
                  onFilterChange={setArchiveFilter}
                  onClearFilters={() => setArchiveFilter({
                    search: '',
                    type: '',
                    status: '',
                    dateFrom: '',
                    dateTo: '',
                    owner: '',
                    department: '',
                    tags: [],
                    hasSignature: null,
                    fileSize: { min: 0, max: 100 }
                  })}
                  users={users}
                  currentUser={currentUser}
                  totalResults={filteredArchive.length}
                />

                {/* Arşiv Listesi */}
                <Card>
                  <CardHeader>
                    <Flex align="center">
                      <Heading as="h3" size="md">
                        Belge Arşivi ({pagination.totalItems})
                      </Heading>
                      <Spacer />
                      <Text fontSize="sm" color="gray.600">
                        Sayfa {pagination.currentPage} / {totalPages || 1}
                      </Text>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {filteredArchive.length === 0 ? (
                      <VStack spacing={4} py={8}>
                        <Icon as={Archive} boxSize={12} color="gray.400" />
                        <Text color="gray.500">Arşivde belge yok</Text>
                        <Button size="sm" variant="outline" onClick={clearFilters}>
                          Filtreleri Temizle
                        </Button>
                      </VStack>
                    ) : (
                      <>
                        <Table>
                          <Thead>
                            <Tr>
                              <Th>
                                <Checkbox
                                  isChecked={selectedDocuments.length === filteredArchive.length && filteredArchive.length > 0}
                                  isIndeterminate={selectedDocuments.length > 0 && selectedDocuments.length < filteredArchive.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDocuments(filteredArchive.map(doc => doc.id));
                                    } else {
                                      setSelectedDocuments([]);
                                    }
                                  }}
                                />
                              </Th>
                              <Th>Belge Adı</Th>
                              <Th>Tür</Th>
                              <Th>Durum</Th>
                              <Th>Tarih</Th>
                              <Th>Sahip</Th>
                              <Th>İşlemler</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredArchive.map((doc) => (
                              <Tr key={doc.id}>
                                <Td>
                                  <Checkbox
                                    isChecked={selectedDocuments.includes(doc.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedDocuments(prev => [...prev, doc.id]);
                                      } else {
                                        setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                                      }
                                    }}
                                  />
                                </Td>
                                <Td>{doc.name}</Td>
                                <Td>
                                  <Badge colorScheme="blue" variant="subtle">
                                    {getTypeLabel(doc.type)}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getStatusColor(doc.status)} variant="subtle">
                                    {getStatusLabel(doc.status)}
                                  </Badge>
                                </Td>
                                <Td>{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</Td>
                                <Td>{users.find(u => u.id === doc.ownerId)?.fullName || 'Bilinmeyen'}</Td>
                                <Td>
                                  <HStack spacing={2}>
                                    {canViewDocument(currentUser, doc.ownerId) && (
                                      <IconButton
                                        size="xs"
                                        colorScheme="blue"
                                        variant="outline"
                                        aria-label="Önizle"
                                        icon={<Icon as={Eye} />}
                                        onClick={() => handlePreviewPdf(doc.url)}
                                      />
                                    )}
                                    {canViewDocument(currentUser, doc.ownerId) && (
                                      <IconButton
                                        size="xs"
                                        colorScheme="green"
                                        variant="outline"
                                        aria-label="İndir"
                                        icon={<Icon as={Download} />}
                                        onClick={() => handleDownloadPdf(doc.url, `${doc.name}.pdf`)}
                                      />
                                    )}
                                    {canDeleteDocument(currentUser, doc.ownerId) && (
                                      <IconButton
                                        size="xs"
                                        colorScheme="red"
                                        variant="outline"
                                        aria-label="Sil"
                                        icon={<Icon as={Trash2} />}
                                        onClick={() => handleDeleteArchiveItem(doc.id)}
                                      />
                                    )}
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                        
                        {/* Sayfalama */}
                        {totalPages > 1 && (
                          <Flex justify="center" mt={4}>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                isDisabled={pagination.currentPage === 1}
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                              >
                                Önceki
                              </Button>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  size="sm"
                                  variant={pagination.currentPage === page ? "solid" : "outline"}
                                  colorScheme={pagination.currentPage === page ? "blue" : "gray"}
                                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                                >
                                  {page}
                                </Button>
                              ))}
                              <Button
                                size="sm"
                                variant="outline"
                                isDisabled={pagination.currentPage === totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                              >
                                Sonraki
                              </Button>
                            </HStack>
                          </Flex>
                        )}
                      </>
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Yer Gösterme Form Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Yer Gösterme Formu Doldur</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Müşteri Adı</FormLabel>
                    <Input
                      value={ygFormData.customerName}
                      onChange={(e) => setYgFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <Input
                      value={ygFormData.customerTc}
                      onChange={(e) => setYgFormData(prev => ({ ...prev, customerTc: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Randevu Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={ygFormData.appointmentDate}
                      onChange={(e) => setYgFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Randevu Saati</FormLabel>
                    <Input
                      type="time"
                      value={ygFormData.appointmentTime}
                      onChange={(e) => setYgFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl isRequired>
                  <FormLabel>Taşınmaz Adresi</FormLabel>
                  <Textarea
                    value={ygFormData.propertyAddress}
                    onChange={(e) => setYgFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Danışman Adı</FormLabel>
                  <Input
                    value={ygFormData.agentName}
                    onChange={(e) => setYgFormData(prev => ({ ...prev, agentName: e.target.value }))}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notlar</FormLabel>
                  <Textarea
                    value={ygFormData.notes}
                    onChange={(e) => setYgFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </FormControl>
                
                <Divider />
                
                <Text fontWeight="semibold">Dijital İmzalar (Opsiyonel)</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" mb={2}>Müşteri İmzası</Text>
                    <Box border="1px" borderColor={borderColor} borderRadius="md" p={2}>
                      <SignatureCanvas
                        ref={customerSigRef}
                        canvasProps={{
                          width: 250,
                          height: 100,
                          className: 'signature-canvas'
                        }}
                      />
                    </Box>
                    <Button
                      size="xs"
                      mt={1}
                      onClick={() => customerSigRef.current?.clear()}
                    >
                      Temizle
                    </Button>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" mb={2}>Danışman İmzası</Text>
                    <Box border="1px" borderColor={borderColor} borderRadius="md" p={2}>
                      <SignatureCanvas
                        ref={agentSigRef}
                        canvasProps={{
                          width: 250,
                          height: 100,
                          className: 'signature-canvas'
                        }}
                      />
                    </Box>
                    <Button
                      size="xs"
                      mt={1}
                      onClick={() => agentSigRef.current?.clear()}
                    >
                      Temizle
                    </Button>
                  </Box>
                </SimpleGrid>
                
                <Flex justify="flex-end" gap={3} mt={6}>
                  <Button variant="outline" onClick={onFormClose}>
                    İptal
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleFormSubmit}
                    isLoading={isProcessing}
                    loadingText="Oluşturuluyor..."
                    isDisabled={!ygFormData.customerName || !ygFormData.customerTc || !ygFormData.appointmentDate || !ygFormData.appointmentTime || !ygFormData.propertyAddress}
                  >
                    PDF Oluştur ve İndir
                  </Button>
                </Flex>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* PDF Preview Modal */}
        <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>PDF Önizleme</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {previewUrl && (
                <Box h="600px">
                  <object
                    data={previewUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                  >
                    <Text>PDF görüntülenemiyor. <Button as="a" href={previewUrl} target="_blank" size="sm" colorScheme="blue">Yeni sekmede aç</Button></Text>
                  </object>
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Yer Gösterme Editor */}
        {showEditor && (
          <YerGostermeEditor
            templateUrl={editorTemplateUrl}
            onClose={handleCloseEditor}
            onSave={(docItem) => {
              const updatedArchive = [docItem, ...archive];
              setArchive(updatedArchive);
              saveToStorage(DOC_ARCHIVE, updatedArchive);
              handleCloseEditor();
              
              toast({
                title: 'Form Kaydedildi',
                description: 'Yer gösterme formu başarıyla oluşturuldu.',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            }}
          />
        )}

        {/* Kira Sözleşmesi Editor */}
        {showRentalEditor && (
          <RentalContractEditor
            onClose={handleCloseRentalEditor}
          />
        )}
      </VStack>
    </Container>
  );
};

export default DocumentManagement;