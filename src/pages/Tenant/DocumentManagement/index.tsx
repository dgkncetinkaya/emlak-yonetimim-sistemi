import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useToast,
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
  Checkbox,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { FileText, Download, Upload, Eye, Trash2, Search, Filter, Calendar, User, Archive, Home } from 'react-feather';
import SignatureCanvas from 'react-signature-canvas';
import {
  documentsService,
  Document as DocumentType,
  DocumentTemplate,
  DocumentTag,
  DocumentType as DocType,
  DocumentStatus,
  DepartmentType,
  DocumentFilters,
  CreateDocumentData,
  CreateTemplateData
} from '../../../services/documentsService';
import { User as UserType, UserRole, hasPermission, canViewDocument, canEditDocument, canDeleteDocument } from '../../../types/userTypes';
import { useAuth } from '../../../context/AuthContext';
import YerGostermeEditor from './YerGostermeEditor';
import RentalContractEditor from './RentalContractEditor';
import AdvancedArchiveFilters from '../../../components/AdvancedArchiveFilters';
import EmailSmsNotifications from '../../../components/EmailSmsNotifications';
import { createFilledPdf, downloadBlob, fileToBlob, isPdfFile, formatFileSize } from '../../../utils/pdf';
import { saveToStorage, DOC_ARCHIVE } from '../../../utils/storage';
import { YGFormData, SignatureData } from '../../../types/documentManagement';

// Legacy types for backward compatibility

interface ArchiveFilter {
  search: string;
  type: DocType | '';
  status: DocumentStatus | '';
  dateFrom: string;
  dateTo: string;
  owner: string;
  department: DepartmentType | '';
  tags: string[];
  hasSignature: boolean | null;
  fileSize: { min: number; max: number };
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const DocumentManagement: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [rentalTemplates, setRentalTemplates] = useState<DocumentTemplate[]>([]);
  const [evictionTemplates, setEvictionTemplates] = useState<DocumentTemplate[]>([]);
  const [archive, setArchive] = useState<DocumentType[]>([]);
  const [filteredArchive, setFilteredArchive] = useState<DocumentType[]>([]);
  const [availableTags, setAvailableTags] = useState<DocumentTag[]>([]);
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
    id: user?.id || '1',
    fullName: user?.name || 'Admin User',
    email: user?.email || 'admin@example.com',
    role: (user?.role as UserRole) || 'admin',
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
    customerSignature: undefined,
    agentSignature: undefined
  });
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showRentalEditor, setShowRentalEditor] = useState(false);
  const [editorTemplateUrl, setEditorTemplateUrl] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);


  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rentalTemplateInputRef = useRef<HTMLInputElement>(null);
  const evictionTemplateInputRef = useRef<HTMLInputElement>(null);
  const customerSigRef = useRef<SignatureCanvas>(null);
  const agentSigRef = useRef<SignatureCanvas>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
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

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // Load YG templates
      const ygTemplatesData = await documentsService.getTemplates({
        type: 'yer_gosterme',
        isActive: true
      });
      setTemplates(ygTemplatesData.templates);

      // Load rental templates
      const rentalTemplatesData = await documentsService.getTemplates({
        type: 'kira_sozlesmesi',
        isActive: true
      });
      setRentalTemplates(rentalTemplatesData.templates);

      // Load eviction templates
      const evictionTemplatesData = await documentsService.getTemplates({
        type: 'tahliye_taahhutnamesi',
        isActive: true
      });
      setEvictionTemplates(evictionTemplatesData.templates);

      // Load available tags
      const tags = await documentsService.getTags();
      setAvailableTags(tags);

      // Load archive documents
      await loadArchiveDocuments();

    } catch (error) {
      console.error('Error initializing data:', error);
      toast({
        title: 'Hata',
        description: 'Veriler yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchiveDocuments = async () => {
    try {
      const filters: DocumentFilters = {
        search: archiveFilter.search || undefined,
        type: archiveFilter.type as DocType || undefined,
        status: archiveFilter.status as DocumentStatus || undefined,
        date_from: archiveFilter.dateFrom || undefined,
        date_to: archiveFilter.dateTo || undefined,
        owner_id: archiveFilter.owner || undefined,
        department: archiveFilter.department as DepartmentType || undefined,
        tags: archiveFilter.tags.length > 0 ? archiveFilter.tags : undefined,
        has_signature: archiveFilter.hasSignature !== null ? archiveFilter.hasSignature : undefined,
        file_size_min: archiveFilter.fileSize.min > 0 ? archiveFilter.fileSize.min : undefined,
        file_size_max: archiveFilter.fileSize.max < 100 ? archiveFilter.fileSize.max : undefined,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await documentsService.getDocuments(filters);
      setArchive(response.documents);
      setPagination(prev => ({ ...prev, totalItems: response.pagination.total }));

    } catch (error) {
      console.error('Error loading archive documents:', error);
      toast({
        title: 'Hata',
        description: 'Arşiv belgeleri yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filterArchive = async () => {
    await loadArchiveDocuments();
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

  const handleDownloadTemplate = (template: DocumentTemplate) => {
    handleDownloadPdf(template.file_url, `${template.name}.pdf`);
  };

  const handleDownloadDefaultTemplate = (templateType: string) => {
    const templateUrls: Record<string, string> = {
      'tahliye_taahhutnamesi': '/templates/tahliye-taahhutnamesi.pdf',
      'yer_gosterme': '/templates/yer-gosterme-formu.pdf',
      'kira_sozlesmesi': '/templates/kira-sozlesmesi.pdf'
    };

    const url = templateUrls[templateType];
    if (url) {
      handleDownloadPdf(url, `${templateType}-sablon.pdf`);
    } else {
      toast({
        title: 'Hata',
        description: 'Şablon bulunamadı.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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

    setIsProcessing(true);
    try {
      const templateData: CreateTemplateData = {
        name: file.name.replace('.pdf', ''),
        type: 'yer_gosterme',
        description: `Yer gösterme formu şablonu - ${file.name}`,
        file: file,
        is_default: true
      };

      const template = await documentsService.createTemplate(templateData);

      setTemplates(prev => [...prev, template]);

      toast({
        title: 'Şablon Yüklendi',
        description: `${file.name} başarıyla yüklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading template:', error);
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await documentsService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: 'Şablon Silindi',
        description: 'Şablon başarıyla silindi.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon silinirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUseTemplate = async (template: DocumentTemplate) => {
    try {
      const url = template.file_url;
      setSelectedTemplate(template);
      setEditorTemplateUrl(url);
      setShowEditor(true);
    } catch (error) {
      console.error('Error getting template URL:', error);
      toast({
        title: 'Hata',
        description: 'Şablon yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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

  // Rental template functions
  const handleRentalTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsProcessing(true);
    try {
      const templateData: CreateTemplateData = {
        name: file.name.replace('.pdf', ''),
        type: 'kira_sozlesmesi',
        description: `Kira sözleşmesi şablonu - ${file.name}`,
        file: file,
        is_default: true
      };

      const template = await documentsService.createTemplate(templateData);

      setRentalTemplates(prev => [...prev, template]);

      toast({
        title: 'Kira Sözleşmesi Şablonu Yüklendi',
        description: `${file.name} başarıyla yüklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading rental template:', error);
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }

    if (rentalTemplateInputRef.current) {
      rentalTemplateInputRef.current.value = '';
    }
  };

  const handleDeleteRentalTemplate = async (templateId: string) => {
    try {
      await documentsService.deleteTemplate(templateId);
      setRentalTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: 'Şablon Silindi',
        description: 'Kira sözleşmesi şablonu başarıyla silindi.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting rental template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon silinirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Eviction template functions
  const handleEvictionTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsProcessing(true);
    try {
      const templateData: CreateTemplateData = {
        name: file.name.replace('.pdf', ''),
        type: 'tahliye_taahhutnamesi',
        description: `Tahliye taahhütnamesi şablonu - ${file.name}`,
        file: file,
        is_default: true
      };

      const template = await documentsService.createTemplate(templateData);

      setEvictionTemplates(prev => [...prev, template]);

      toast({
        title: 'Tahliye Taahhütnamesi Şablonu Yüklendi',
        description: `${file.name} başarıyla yüklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading eviction template:', error);
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }

    if (evictionTemplateInputRef.current) {
      evictionTemplateInputRef.current.value = '';
    }
  };

  const handleDeleteEvictionTemplate = async (templateId: string) => {
    try {
      await documentsService.deleteTemplate(templateId);
      setEvictionTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: 'Şablon Silindi',
        description: 'Tahliye taahhütnamesi şablonu başarıyla silindi.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting eviction template:', error);
      toast({
        title: 'Hata',
        description: 'Şablon silinirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFormSubmit = async () => {
    if (!selectedTemplate) return;

    setIsProcessing(true);

    try {
      // Collect signatures
      const customerSig = customerSigRef.current?.toDataURL();
      const agentSig = agentSigRef.current?.toDataURL();

      const signatureData: SignatureData = {
        customerSignature: customerSig || undefined,
        agentSignature: agentSig || undefined
      };

      // Create filled PDF
      const templateUrl = selectedTemplate.file_url;
      const filledPdfBlob = await createFilledPdf(templateUrl, ygFormData, signatureData);

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `yer-gosterme-${ygFormData.customerName.replace(/\s+/g, '-')}-${timestamp}.pdf`;

      // Create document data
      const documentData: CreateDocumentData = {
        name: `Yer Gösterme - ${ygFormData.customerName}`,
        type: 'yer_gosterme',
        status: 'tamamlandi',
        template_id: selectedTemplate.id,
        form_data: {
          customerName: ygFormData.customerName,
          customerTc: ygFormData.customerTc,
          appointmentDate: ygFormData.appointmentDate,
          appointmentTime: ygFormData.appointmentTime,
          propertyAddress: ygFormData.propertyAddress,
          agentName: ygFormData.agentName,
          notes: ygFormData.notes,
          hasCustomerSignature: !!customerSig,
          hasAgentSignature: !!agentSig
        },
        tags: ['Yer Gösterme', 'Tamamlandı'],
        has_signature: !!(customerSig || agentSig)
      };

      // Upload file first
      const fileUrl = await documentsService.uploadDocumentFile(new File([filledPdfBlob], filename, { type: 'application/pdf' }));

      // Save document to Supabase
      const savedDocument = await documentsService.createDocument({
        ...documentData,
        file_url: fileUrl,
        file_size: filledPdfBlob.size
      });

      // Download PDF
      downloadBlob(filledPdfBlob, filename);

      // Update local state
      setArchive(prev => [savedDocument, ...prev]);

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
      setSignatures({ customerSignature: undefined, agentSignature: undefined });
      customerSigRef.current?.clear();
      agentSigRef.current?.clear();

      onFormClose();

      toast({
        title: 'Form Oluşturuldu',
        description: 'Yer gösterme formu başarıyla oluşturuldu ve arşive kaydedildi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating document:', error);
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

  const handleDeleteArchiveItem = async (docId: string) => {
    setDeleteConfirmId(docId);
    onDeleteOpen();
  };

  const confirmDeleteArchiveItem = async () => {
    if (!deleteConfirmId) return;

    try {
      await documentsService.deleteDocument(deleteConfirmId);
      setArchive(prev => prev.filter(doc => doc.id !== deleteConfirmId));

      toast({
        title: 'Belge Silindi',
        description: 'Belge arşivden silindi.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Hata',
        description: 'Belge silinirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteConfirmId(null);
      onDeleteClose();
    }
  };

  const clearFilters = () => {
    setArchiveFilter({
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
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'tamamlandi': return 'green';
      case 'taslak': return 'yellow';
      case 'iptal': return 'red';
      case 'beklemede': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeLabel = (type: DocType) => {
    const labels = {
      'kira_sozlesmesi': 'Kira Sözleşmesi',
      'yer_gosterme': 'Yer Gösterme',
      'tahliye_taahhutnamesi': 'Tahliye Taahhütnamesi',
      'dask_belgesi': 'DASK Belgesi',
      'mali_belge': 'Mali Belge',
      'tapu_belgesi': 'Tapu Belgesi',
      'diger': 'Diğer'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: DocumentStatus) => {
    const labels = {
      'tamamlandi': 'Tamamlandı',
      'taslak': 'Taslak',
      'iptal': 'İptal',
      'beklemede': 'Beklemede'
    };
    return labels[status] || status;
  };

  const handlePreviewDocument = async (document: DocumentType) => {
    try {
      const url = document.file_url;
      setPreviewUrl(url);
      onPreviewOpen();
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast({
        title: 'Hata',
        description: 'Belge önizlemesi yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadDocument = async (doc: DocumentType) => {
    try {
      const url = doc.file_url;
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Hata',
        description: 'Belge indirilirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

  // Authentication kontrolü
  if (authLoading) {
    return (
      <Box w="100%" px={4} py={8} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Yükleniyor...</Text>
        </VStack>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box w="100%" px={4} py={8}>
        <Alert status="warning">
          <AlertIcon />
          Bu sayfaya erişim için giriş yapmanız gerekiyor.
        </Alert>
      </Box>
    );
  }

  return (
    <Box w="100%" px={4} py={8}>
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
                      <Button
                        size="lg"
                        colorScheme="green"
                        variant="outline"
                        leftIcon={<Icon as={Upload} />}
                        onClick={() => rentalTemplateInputRef.current?.click()}
                      >
                        Şablon Ekle
                      </Button>
                    </HStack>
                    <Input
                      ref={rentalTemplateInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleRentalTemplateUpload}
                      display="none"
                    />
                  </VStack>
                </CardBody>
              </Card>

              {/* Rental Templates List */}
              {rentalTemplates.length > 0 && (
                <Card mt={6}>
                  <CardHeader>
                    <Heading as="h4" size="sm">
                      Yüklenen Kira Sözleşmesi Şablonları ({rentalTemplates.length})
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
                        {rentalTemplates.map((template) => (
                          <Tr key={template.id}>
                            <Td>{template.name}</Td>
                            <Td>{new Date(template.uploadedAt).toLocaleDateString('tr-TR')}</Td>
                            <Td>
                              <HStack spacing={2}>
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
                                  onClick={() => handleDeleteRentalTemplate(template.id)}
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
                                    onClick={() => handleDownloadTemplate(template)}
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
                        onClick={() => handleDownloadDefaultTemplate('tahliye_taahhutnamesi')}
                      >
                        Boş Şablonu İndir
                      </Button>
                      <Button
                        size="lg"
                        colorScheme="green"
                        variant="outline"
                        leftIcon={<Icon as={Upload} />}
                        onClick={() => evictionTemplateInputRef.current?.click()}
                      >
                        Şablon Ekle
                      </Button>
                    </HStack>
                    <Input
                      ref={evictionTemplateInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleEvictionTemplateUpload}
                      display="none"
                    />
                  </VStack>
                </CardBody>
              </Card>

              {/* Eviction Templates List */}
              {evictionTemplates.length > 0 && (
                <Card mt={6}>
                  <CardHeader>
                    <Heading as="h4" size="sm">
                      Yüklenen Tahliye Taahhütnamesi Şablonları ({evictionTemplates.length})
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
                        {evictionTemplates.map((template) => (
                          <Tr key={template.id}>
                            <Td>{template.name}</Td>
                            <Td>{new Date(template.uploadedAt).toLocaleDateString('tr-TR')}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => handleDownloadTemplate(template)}
                                >
                                  İndir
                                </Button>
                                <IconButton
                                  size="xs"
                                  colorScheme="red"
                                  variant="outline"
                                  aria-label="Sil"
                                  icon={<Icon as={Trash2} />}
                                  onClick={() => handleDeleteEvictionTemplate(template.id)}
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
                  availableTags={availableTags}
                  currentUser={currentUser}
                  totalResults={archive.length}
                />

                {/* Arşiv Listesi */}
                <Card>
                  <CardHeader>
                    <Flex align="center">
                      <Heading as="h3" size="md">
                        Belge Arşivi ({pagination.totalItems})
                      </Heading>
                      <Spacer />
                      {isLoading && <Spinner size="sm" mr={2} />}
                      <Text fontSize="sm" color="gray.600">
                        Sayfa {pagination.currentPage} / {totalPages || 1}
                      </Text>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {isLoading ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="lg" />
                        <Text color="gray.500">Belgeler yükleniyor...</Text>
                      </VStack>
                    ) : archive.length === 0 ? (
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
                                  isChecked={selectedDocuments.length === archive.length && archive.length > 0}
                                  isIndeterminate={selectedDocuments.length > 0 && selectedDocuments.length < archive.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedDocuments(archive.map(doc => doc.id));
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
                              <Th>Etiketler</Th>
                              <Th>İşlemler</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {archive.map((doc) => (
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
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="medium">{doc.name}</Text>
                                    {doc.has_signature && (
                                      <Badge size="sm" colorScheme="green" variant="subtle">
                                        İmzalı
                                      </Badge>
                                    )}
                                  </VStack>
                                </Td>
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
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm">{new Date(doc.created_at).toLocaleDateString('tr-TR')}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {new Date(doc.created_at).toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">{doc.owner_profile?.full_name || 'Bilinmeyen'}</Text>
                                </Td>
                                <Td>
                                  <HStack spacing={1} flexWrap="wrap">
                                    {doc.tags?.slice(0, 2).map((tag, index) => (
                                      <Badge key={index} size="sm" variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {doc.tags && doc.tags.length > 2 && (
                                      <Badge size="sm" variant="outline" colorScheme="gray">
                                        +{doc.tags.length - 2}
                                      </Badge>
                                    )}
                                  </HStack>
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    {canViewDocument(currentUser, doc.owner_id) && (
                                      <IconButton
                                        size="xs"
                                        colorScheme="blue"
                                        variant="outline"
                                        aria-label="Önizle"
                                        icon={<Icon as={Eye} />}
                                        onClick={() => handlePreviewDocument(doc)}
                                      />
                                    )}
                                    {canViewDocument(currentUser, doc.owner_id) && (
                                      <IconButton
                                        size="xs"
                                        colorScheme="green"
                                        variant="outline"
                                        aria-label="İndir"
                                        icon={<Icon as={Download} />}
                                        onClick={() => handleDownloadDocument(doc)}
                                      />
                                    )}
                                    {canDeleteDocument(currentUser, doc.owner_id) && (
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
                              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const page = pagination.currentPage <= 3 ? i + 1 :
                                  pagination.currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                    pagination.currentPage - 2 + i;
                                return (
                                  <Button
                                    key={page}
                                    size="sm"
                                    variant={pagination.currentPage === page ? "solid" : "outline"}
                                    colorScheme={pagination.currentPage === page ? "blue" : "gray"}
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
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
              // Convert DocItem to Document format
              const document: DocumentType = {
                id: docItem.id,
                name: docItem.metadata.customerName || 'Yer Gösterme Formu',
                type: 'yer_gosterme',
                status: docItem.status === 'COMPLETED' ? 'tamamlandi' : 'taslak',
                file_url: docItem.url,
                has_signature: docItem.metadata.hasCustomerSignature || docItem.metadata.hasAgentSignature || false,
                created_at: docItem.createdAt,
                updated_at: docItem.updatedAt,
                owner_id: docItem.ownerId,
                form_data: docItem.metadata
              };
              const updatedArchive = [document, ...archive];
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
          <RentalContractEditor />
        )}
      </VStack>
    </Box>
  );
};

export default DocumentManagement;