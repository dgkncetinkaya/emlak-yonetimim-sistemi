import {
  Box, VStack, HStack, Text, Badge, Divider, Heading, Avatar,
  Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  useColorModeValue, SimpleGrid, Button, Icon, IconButton, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Input, Select, FormControl, FormLabel, Textarea,
  Alert, AlertIcon, Flex, Editable, EditableInput, EditableTextarea, EditablePreview,
  useEditableControls, ButtonGroup, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Spinner, useToast
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, FileText, Download, Trash2, Plus, Edit3, Check, X } from 'react-feather';
import { customersService, Customer } from '../../../services/customersService';
import { meetingsService } from '../../../services/meetingsService';
import { customerPropertiesService } from '../../../services/customerPropertiesService';

// UI formatında müşteri tipi
interface UICustomer extends Omit<Customer, 'status'> {
  type: string;
  status: string;
}

interface CustomerDetailProps {
  customer: UICustomer;
  activeTab?: number;
  autoOpenDocumentModal?: boolean;
}

const CustomerDetail = ({ customer, activeTab = 0, autoOpenDocumentModal = false }: CustomerDetailProps) => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Early return if customer is not provided
  if (!customer) {
    return (
      <Box p={6}>
        <Alert status="warning">
          <AlertIcon />
          Müşteri bilgileri yüklenemedi.
        </Alert>
      </Box>
    );
  }

  const shouldOpenDocumentModal = searchParams.get('openDocumentModal') === 'true' || autoOpenDocumentModal;
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

  // Supabase integration states
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState(customer);
  const [inquiries, setInquiries] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [editableBudget, setEditableBudget] = useState(() => {
    if (customer?.budget_min && customer?.budget_max) {
      return `${customer.budget_min.toLocaleString()} TL - ${customer.budget_max.toLocaleString()} TL`;
    }
    return '';
  });

  // Supabase'den gelen ayrı tercih alanlarını birleştir
  const formatPreferences = (customer: any) => {
    if (!customer) return '';
    const preferences = [];
    if (customer.preferred_property_type) preferences.push(customer.preferred_property_type);
    if (customer.preferred_location) preferences.push(customer.preferred_location);
    if (customer.preferred_rooms) preferences.push(customer.preferred_rooms);
    // customer.preferences objesi olabilir, güvenli string'e çevir
    const fallbackPreferences = customer.preferences && typeof customer.preferences === 'string'
      ? customer.preferences
      : '';
    return preferences.join(', ') || fallbackPreferences;
  };

  const [editablePreferences, setEditablePreferences] = useState(() => formatPreferences(customer));
  const [editableNotes, setEditableNotes] = useState(customer?.notes || '');

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

  // Meeting form states
  const [meetingType, setMeetingType] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  // Property form states
  const [propertyName, setPropertyName] = useState('');
  const [propertyStatus, setPropertyStatus] = useState('');
  const [propertyDate, setPropertyDate] = useState('');
  const [propertyNotes, setPropertyNotes] = useState('');

  // Color mode values
  const headingColor = useColorModeValue('gray.700', 'gray.300');
  const tableBg = useColorModeValue('gray.100', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const modalBorderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');

  // Load customer data and related information
  useEffect(() => {
    if (customer?.id) {
      loadCustomerData();
    }
  }, [customer?.id]);

  const loadCustomerData = async () => {
    if (!customer?.id) return;

    setLoading(true);
    try {
      // Load customer inquiries
      const inquiriesResponse = await customersService.getCustomerInquiries(customer.id);
      if (inquiriesResponse.inquiries) {
        setInquiries(inquiriesResponse.inquiries);
      }

      // Load customer viewings
      const viewingsResponse = await customersService.getCustomerViewings(customer.id);
      if (viewingsResponse.viewings) {
        setViewings(viewingsResponse.viewings);
      }

      // Load customer interactions
      const interactionsResponse = await customersService.getCustomerInteractions(customer.id);
      if (interactionsResponse.interactions) {
        setInteractions(interactionsResponse.interactions);
      }

      // Load customer documents
      const documentsResponse = await customersService.getCustomerDocuments(customer.id);
      if (documentsResponse.documents) {
        setDocuments(documentsResponse.documents);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      toast({
        title: 'Hata',
        description: 'Müşteri verileri yüklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerField = async (field: string, value: any) => {
    if (!customer?.id) return;

    setLoading(true);
    try {
      const updateData = { [field]: value };
      const response = await customersService.updateCustomer(customer.id, updateData);

      setCustomerData({ ...customerData, ...updateData });
      toast({
        title: 'Başarılı',
        description: 'Müşteri bilgileri güncellendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Hata',
        description: 'Müşteri bilgileri güncellenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for buttons
  const handleBudgetEdit = () => {
    setTempBudget(editableBudget);
    onBudgetEditOpen();
  };

  const handleBudgetEditSave = async () => {
    if (tempBudget && tempBudget.trim() !== '') {
      setEditableBudget(tempBudget);
      // Parse budget range and update in Supabase
      const budgetParts = tempBudget.split(' - ');
      if (budgetParts.length === 2) {
        const budgetMin = parseInt(budgetParts[0].replace(/[^\d]/g, ''));
        const budgetMax = parseInt(budgetParts[1].replace(/[^\d]/g, ''));
        await updateCustomerField('budget_min', budgetMin);
        await updateCustomerField('budget_max', budgetMax);
      } else {
        await updateCustomerField('budget', tempBudget);
      }
    }
    onBudgetEditClose();
  };

  const handleBudgetDelete = () => {
    onBudgetDeleteOpen();
  };

  const handleBudgetDeleteConfirm = async () => {
    setEditableBudget('');
    await updateCustomerField('budget_min', null);
    await updateCustomerField('budget_max', null);
    await updateCustomerField('budget', null);
    onBudgetDeleteClose();
  };

  const handlePreferencesAdd = () => {
    setTempNewPreference('');
    onPreferencesAddOpen();
  };

  const handlePreferencesAddSave = async () => {
    if (tempNewPreference.trim() !== '') {
      const newPreferences = editablePreferences + ', ' + tempNewPreference;
      setEditablePreferences(newPreferences);
      await updateCustomerField('preferences', newPreferences);
    }
    onPreferencesAddClose();
  };

  const handlePreferencesEdit = () => {
    setTempPreferences(editablePreferences);
    onPreferencesEditOpen();
  };

  const handlePreferencesEditSave = async () => {
    if (tempPreferences.trim() !== '') {
      setEditablePreferences(tempPreferences);
      await updateCustomerField('preferences', tempPreferences);
    }
    onPreferencesEditClose();
  };

  const handlePreferencesDelete = () => {
    onPreferencesDeleteOpen();
  };

  const handlePreferencesDeleteConfirm = async () => {
    setEditablePreferences('');
    await updateCustomerField('preferences', null);
    onPreferencesDeleteClose();
  };

  const handleNotesAdd = () => {
    setTempNewNote('');
    onNotesAddOpen();
  };

  const handleNotesAddSave = async () => {
    if (tempNewNote.trim() !== '') {
      const newNotes = editableNotes + '\n' + tempNewNote;
      setEditableNotes(newNotes);
      await updateCustomerField('notes', newNotes);
    }
    onNotesAddClose();
  };

  const handleNotesEdit = () => {
    setTempNotes(editableNotes);
    onNotesEditOpen();
  };

  const handleNotesEditSave = async () => {
    if (tempNotes.trim() !== '') {
      setEditableNotes(tempNotes);
      await updateCustomerField('notes', tempNotes);
    }
    onNotesEditClose();
  };

  const handleNotesDelete = () => {
    onNotesDeleteOpen();
  };

  const handleNotesDeleteConfirm = async () => {
    setEditableNotes('');
    await updateCustomerField('notes', null);
    onNotesDeleteClose();
  };

  // Meeting handlers
  const handleSaveMeeting = async () => {
    if (!meetingType || !meetingDate || !customer?.id) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await meetingsService.createMeeting({
        customer_id: customer.id,
        date: meetingDate,
        type: meetingType,
        notes: meetingNotes || null
      });

      // Reset form
      setMeetingType('');
      setMeetingDate('');
      setMeetingNotes('');

      // Close modal
      onInterviewModalClose();

      // Reload data
      await loadCustomerData();

      toast({
        title: 'Başarılı',
        description: 'Görüşme başarıyla eklendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving meeting:', error);
      toast({
        title: 'Hata',
        description: 'Görüşme eklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Property handlers
  const handleSaveProperty = async () => {
    if (!propertyName || !propertyStatus || !propertyDate || !customer?.id) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await customerPropertiesService.createProperty({
        customer_id: customer.id,
        date: propertyDate,
        property: propertyName,
        status: propertyStatus,
        notes: propertyNotes || null
      });

      // Reset form
      setPropertyName('');
      setPropertyStatus('');
      setPropertyDate('');
      setPropertyNotes('');

      // Close modal
      onPropertyModalClose();

      // Reload data
      await loadCustomerData();

      toast({
        title: 'Başarılı',
        description: 'Gayrimenkul başarıyla eklendi.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Hata',
        description: 'Gayrimenkul eklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
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
    if (shouldOpenDocumentModal) {
      onDocumentModalOpen();
    }
  }, [shouldOpenDocumentModal, onDocumentModalOpen]);

  if (!customer) return null;

  // Helper functions to format data for display
  const formatInteractionType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'phone': 'Telefon',
      'email': 'E-posta',
      'meeting': 'Yüz Yüze',
      'sms': 'SMS',
      'whatsapp': 'WhatsApp',
      'other': 'Diğer'
    };
    return typeMap[type] || type;
  };

  const formatViewingStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Planlandı',
      'confirmed': 'Onaylandı',
      'completed': 'Tamamlandı',
      'cancelled': 'İptal Edildi',
      'no_show': 'Gelmedi'
    };
    return statusMap[status] || status;
  };

  const formatDocumentType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'contract': 'Sözleşme',
      'id_document': 'Kimlik Belgesi',
      'income_proof': 'Gelir Belgesi',
      'viewing_form': 'Yer Gösterme Formu',
      'other': 'Diğer'
    };
    return typeMap[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <HStack spacing={4} mb={6} align="flex-start">
        <Avatar size="xl" name={customer?.name || 'Müşteri'} />

        <VStack align="flex-start" spacing={1} flex={1}>
          <Heading size="md">{customer?.name || 'İsimsiz Müşteri'}</Heading>

          <HStack>
            <Badge
              colorScheme={customer?.status === 'Aktif' ? 'green' : 'gray'}
            >
              {customer?.status || 'Bilinmiyor'}
            </Badge>

            <Badge
              colorScheme={
                customer?.type === 'Alıcı' ? 'blue' :
                  customer?.type === 'Satıcı' ? 'green' : 'purple'
              }
            >
              {customer?.type || 'Bilinmiyor'}
            </Badge>
          </HStack>

          <Text>{customer?.phone || '-'}</Text>
          <Text color="gray.600">{customer?.email || '-'}</Text>
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

              {loading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Tarih</Th>
                      <Th>Tür</Th>
                      <Th>Temsilci</Th>
                      <Th>Notlar</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {interactions.length === 0 ? (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={8}>
                          <Text color="gray.500">Henüz görüşme kaydı bulunmuyor.</Text>
                        </Td>
                      </Tr>
                    ) : (
                      interactions.map((interaction: any, index: number) => (
                        <Tr key={interaction.id || index}>
                          <Td>{new Date(interaction.interaction_date).toLocaleDateString('tr-TR')}</Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {formatInteractionType(interaction.interaction_type)}
                            </Badge>
                          </Td>
                          <Td>
                            {interaction.assigned_agent_profile ? (
                              <HStack>
                                <Avatar
                                  size="xs"
                                  name={`${interaction.assigned_agent_profile.first_name} ${interaction.assigned_agent_profile.last_name}`}
                                />
                                <Text fontSize="sm">
                                  {interaction.assigned_agent_profile.first_name} {interaction.assigned_agent_profile.last_name}
                                </Text>
                              </HStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">-</Text>
                            )}
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {interaction.notes || '-'}
                            </Text>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              )}
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

              {loading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Tarih</Th>
                      <Th>Gayrimenkul</Th>
                      <Th>Durum</Th>
                      <Th>Temsilci</Th>
                      <Th>Notlar</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {viewings.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={8}>
                          <Text color="gray.500">Henüz gayrimenkul gösterimi bulunmuyor.</Text>
                        </Td>
                      </Tr>
                    ) : (
                      viewings.map((viewing: any, index: number) => (
                        <Tr key={viewing.id || index}>
                          <Td>{new Date(viewing.viewing_date).toLocaleDateString('tr-TR')}</Td>
                          <Td>
                            {viewing.property ? (
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {viewing.property.title}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {viewing.property.location}
                                </Text>
                              </VStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">-</Text>
                            )}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                viewing.status === 'completed' ? 'green' :
                                  viewing.status === 'confirmed' ? 'blue' :
                                    viewing.status === 'scheduled' ? 'yellow' :
                                      viewing.status === 'cancelled' ? 'red' : 'gray'
                              }
                            >
                              {formatViewingStatus(viewing.status)}
                            </Badge>
                          </Td>
                          <Td>
                            {viewing.agent_profile ? (
                              <HStack>
                                <Avatar
                                  size="xs"
                                  name={`${viewing.agent_profile.first_name} ${viewing.agent_profile.last_name}`}
                                />
                                <Text fontSize="sm">
                                  {viewing.agent_profile.first_name} {viewing.agent_profile.last_name}
                                </Text>
                              </HStack>
                            ) : (
                              <Text fontSize="sm" color="gray.500">-</Text>
                            )}
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {viewing.notes || '-'}
                            </Text>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              )}
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

              {loading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : documents.length === 0 ? (
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
                      <Th>Yükleyen</Th>
                      <Th>Tarih</Th>
                      <Th>Boyut</Th>
                      <Th>Format</Th>
                      <Th>İşlemler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {documents.map((doc: any) => (
                      <Tr key={doc.id}>
                        <Td>
                          <HStack>
                            <Icon as={FileText} color="blue.500" />
                            <Text fontSize="sm">{doc.document_name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              doc.document_type === 'contract' ? 'green' :
                                doc.document_type === 'viewing_form' ? 'blue' :
                                  doc.document_type === 'id_document' ? 'purple' : 'orange'
                            }
                          >
                            {formatDocumentType(doc.document_type)}
                          </Badge>
                        </Td>
                        <Td>
                          {doc.uploaded_by_profile ? (
                            <HStack>
                              <Avatar
                                size="xs"
                                name={`${doc.uploaded_by_profile.first_name} ${doc.uploaded_by_profile.last_name}`}
                              />
                              <Text fontSize="sm">
                                {doc.uploaded_by_profile.first_name} {doc.uploaded_by_profile.last_name}
                              </Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500">-</Text>
                          )}
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(doc.created_at).toLocaleDateString('tr-TR')}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {doc.file_size ? formatFileSize(doc.file_size) : '-'}
                          </Text>
                        </Td>
                        <Td>
                          <Badge variant="outline">
                            {doc.file_format?.toUpperCase() || '-'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="İndir"
                              icon={<Icon as={Download} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => {
                                if (doc.file_path) {
                                  window.open(doc.file_path, '_blank');
                                }
                              }}
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
                  <option value="tapu-belgesi">📋 Tapu Belgesi</option>
                  <option value="dask-belgesi">🏠 DASK Belgesi</option>
                  <option value="tahliye-taahhutnamesi">📋 Tahliye Taahhütnamesi</option>
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
                <Select
                  placeholder="Görüşme türünü seçiniz"
                  size="lg"
                  borderRadius="lg"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                >
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
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
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
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={modalBorderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={onInterviewModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="lg"
              px={6}
              onClick={handleSaveMeeting}
              isLoading={loading}
            >
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
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Durum</FormLabel>
                <Select
                  placeholder="Durum seçiniz"
                  size="lg"
                  borderRadius="lg"
                  value={propertyStatus}
                  onChange={(e) => setPropertyStatus(e.target.value)}
                >
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
                  value={propertyDate}
                  onChange={(e) => setPropertyDate(e.target.value)}
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
                  value={propertyNotes}
                  onChange={(e) => setPropertyNotes(e.target.value)}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px" borderColor={modalBorderColor} pt={4}>
            <Button variant="ghost" mr={3} onClick={onPropertyModalClose} borderRadius="lg">
              İptal
            </Button>
            <Button
              colorScheme="blue"
              borderRadius="lg"
              px={6}
              onClick={handleSaveProperty}
              isLoading={loading}
            >
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
      <AlertDialog isOpen={isBudgetDeleteOpen} onClose={onBudgetDeleteClose} leastDestructiveRef={budgetDeleteCancelRef as any}>
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
      <AlertDialog isOpen={isPreferencesDeleteOpen} onClose={onPreferencesDeleteClose} leastDestructiveRef={preferencesDeleteCancelRef as any}>
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
      <AlertDialog isOpen={isNotesDeleteOpen} onClose={onNotesDeleteClose} leastDestructiveRef={notesDeleteCancelRef as any}>
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