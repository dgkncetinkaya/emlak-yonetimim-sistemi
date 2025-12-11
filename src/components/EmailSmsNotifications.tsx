import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Spacer,
  useColorModeValue
} from '@chakra-ui/react';
import { Mail, MessageSquare, Plus, Edit, Trash2, Send } from 'react-feather';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms';
  category: 'appointment' | 'contract' | 'reminder' | 'marketing';
  isActive: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  autoSend: boolean;
  sendTime: string;
  maxDailyEmails: number;
  maxDailySms: number;
}

interface EmailSmsNotificationsProps {
  onSendNotification?: (type: 'email' | 'sms', recipients: string[], template: EmailTemplate) => void;
}

const EmailSmsNotifications: React.FC<EmailSmsNotificationsProps> = ({ onSendNotification }) => {
  const toast = useToast();
  const { isOpen: isTemplateModalOpen, onOpen: onTemplateModalOpen, onClose: onTemplateModalClose } = useDisclosure();
  const { isOpen: isSendModalOpen, onOpen: onSendModalOpen, onClose: onSendModalClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Randevu Hatırlatması',
      subject: 'Emlak Randevunuz Yaklaşıyor',
      body: 'Sayın {customerName}, {appointmentDate} tarihinde saat {appointmentTime} için randevunuz bulunmaktadır. Adres: {propertyAddress}',
      type: 'email',
      category: 'appointment',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'SMS Randevu Hatırlatması',
      subject: '',
      body: '{customerName}, {appointmentDate} {appointmentTime} randevunuz var. Adres: {propertyAddress}',
      type: 'sms',
      category: 'appointment',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Sözleşme Hazır',
      subject: 'Kira Sözleşmeniz Hazır',
      body: 'Sayın {customerName}, kira sözleşmeniz hazırlanmıştır. Lütfen ofisimize gelerek imzalayınız.',
      type: 'email',
      category: 'contract',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: true,
    autoSend: false,
    sendTime: '09:00',
    maxDailyEmails: 100,
    maxDailySms: 50
  });

  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    id: '',
    name: '',
    subject: '',
    body: '',
    type: 'email',
    category: 'appointment',
    isActive: true,
    createdAt: new Date().toISOString()
  });

  const [sendData, setSendData] = useState({
    templateId: '',
    recipients: '',
    scheduledTime: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleCreateTemplate = useCallback(() => {
    setCurrentTemplate({
      id: '',
      name: '',
      subject: '',
      body: '',
      type: 'email',
      category: 'appointment',
      isActive: true,
      createdAt: new Date().toISOString()
    });
    setIsEditing(false);
    onTemplateModalOpen();
  }, [onTemplateModalOpen]);

  const handleEditTemplate = useCallback((template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    onTemplateModalOpen();
  }, [onTemplateModalOpen]);

  const handleSaveTemplate = useCallback(() => {
    if (!currentTemplate.name || !currentTemplate.body) {
      toast({
        title: 'Hata',
        description: 'Şablon adı ve içeriği zorunludur',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (isEditing) {
      setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? currentTemplate : t));
      toast({
        title: 'Başarılı',
        description: 'Şablon güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } else {
      const newTemplate = {
        ...currentTemplate,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: 'Başarılı',
        description: 'Yeni şablon oluşturuldu',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }

    onTemplateModalClose();
  }, [currentTemplate, isEditing, toast, onTemplateModalClose]);

  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'Başarılı',
      description: 'Şablon silindi',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  }, [toast]);

  const handleToggleTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  }, []);

  const handleSendNotification = useCallback(() => {
    const template = templates.find(t => t.id === sendData.templateId);
    if (!template || !sendData.recipients) {
      toast({
        title: 'Hata',
        description: 'Şablon ve alıcı listesi seçilmelidir',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const recipients = sendData.recipients.split(',').map(r => r.trim()).filter(r => r);
    
    if (onSendNotification) {
      onSendNotification(template.type, recipients, template);
    }

    toast({
      title: 'Başarılı',
      description: `${template.type === 'email' ? 'E-posta' : 'SMS'} gönderildi`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });

    onSendModalClose();
    setSendData({ templateId: '', recipients: '', scheduledTime: '' });
  }, [sendData, templates, onSendNotification, toast, onSendModalClose]);

  const getCategoryLabel = (category: string) => {
    const labels = {
      appointment: 'Randevu',
      contract: 'Sözleşme',
      reminder: 'Hatırlatma',
      marketing: 'Pazarlama'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      appointment: 'blue',
      contract: 'green',
      reminder: 'orange',
      marketing: 'purple'
    };
    return colors[category as keyof typeof colors] || 'gray';
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Text fontSize="xl" fontWeight="bold">E-posta & SMS Bildirimleri</Text>
          <HStack>
            <Button leftIcon={<Send size={16} />} colorScheme="blue" onClick={onSendModalOpen}>
              Bildirim Gönder
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={handleCreateTemplate}>
              Yeni Şablon
            </Button>
          </HStack>
        </Flex>

        {/* Settings */}
        <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>Bildirim Ayarları</Text>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>E-posta Bildirimleri</Text>
              <Switch 
                isChecked={settings.emailEnabled} 
                onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
              />
            </HStack>
            <HStack justify="space-between">
              <Text>SMS Bildirimleri</Text>
              <Switch 
                isChecked={settings.smsEnabled} 
                onChange={(e) => setSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
              />
            </HStack>
            <HStack justify="space-between">
              <Text>Otomatik Gönderim</Text>
              <Switch 
                isChecked={settings.autoSend} 
                onChange={(e) => setSettings(prev => ({ ...prev, autoSend: e.target.checked }))}
              />
            </HStack>
            <HStack>
              <FormControl maxW="200px">
                <FormLabel>Günlük E-posta Limiti</FormLabel>
                <Input 
                  type="number" 
                  value={settings.maxDailyEmails}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDailyEmails: parseInt(e.target.value) || 0 }))}
                />
              </FormControl>
              <FormControl maxW="200px">
                <FormLabel>Günlük SMS Limiti</FormLabel>
                <Input 
                  type="number" 
                  value={settings.maxDailySms}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxDailySms: parseInt(e.target.value) || 0 }))}
                />
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        {/* Templates Table */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>Bildirim Şablonları</Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Şablon Adı</Th>
                <Th>Tür</Th>
                <Th>Kategori</Th>
                <Th>Durum</Th>
                <Th>Oluşturulma</Th>
                <Th>İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {templates.map((template) => (
                <Tr key={template.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{template.name}</Text>
                      {template.subject && (
                        <Text fontSize="sm" color="gray.500">{template.subject}</Text>
                      )}
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={template.type === 'email' ? 'blue' : 'green'}>
                      {template.type === 'email' ? 'E-posta' : 'SMS'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getCategoryColor(template.category)}>
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </Td>
                  <Td>
                    <Switch 
                      isChecked={template.isActive}
                      onChange={() => handleToggleTemplate(template.id)}
                      size="sm"
                    />
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(template.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </Td>
                  <Td>
                    <HStack>
                      <IconButton
                        aria-label="Düzenle"
                        icon={<Edit size={16} />}
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      />
                      <IconButton
                        aria-label="Sil"
                        icon={<Trash2 size={16} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteTemplate(template.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Template Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Şablon Düzenle' : 'Yeni Şablon Oluştur'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Şablon Adı</FormLabel>
                <Input 
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Şablon adını girin"
                />
              </FormControl>
              
              <HStack width="100%">
                <FormControl>
                  <FormLabel>Tür</FormLabel>
                  <Select 
                    value={currentTemplate.type}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, type: e.target.value as 'email' | 'sms' }))}
                  >
                    <option value="email">E-posta</option>
                    <option value="sms">SMS</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Kategori</FormLabel>
                  <Select 
                    value={currentTemplate.category}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="appointment">Randevu</option>
                    <option value="contract">Sözleşme</option>
                    <option value="reminder">Hatırlatma</option>
                    <option value="marketing">Pazarlama</option>
                  </Select>
                </FormControl>
              </HStack>

              {currentTemplate.type === 'email' && (
                <FormControl>
                  <FormLabel>Konu</FormLabel>
                  <Input 
                    value={currentTemplate.subject}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="E-posta konusunu girin"
                  />
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel>İçerik</FormLabel>
                <Textarea 
                  value={currentTemplate.body}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Şablon içeriğini girin. Değişkenler: {customerName}, {appointmentDate}, {appointmentTime}, {propertyAddress}"
                  rows={6}
                />
              </FormControl>
              
              <Text fontSize="sm" color="gray.500">
                Kullanılabilir değişkenler: {'{customerName}'}, {'{appointmentDate}'}, {'{appointmentTime}'}, {'{propertyAddress}'}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTemplateModalClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleSaveTemplate}>
              {isEditing ? 'Güncelle' : 'Oluştur'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Send Notification Modal */}
      <Modal isOpen={isSendModalOpen} onClose={onSendModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bildirim Gönder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Şablon Seç</FormLabel>
                <Select 
                  value={sendData.templateId}
                  onChange={(e) => setSendData(prev => ({ ...prev, templateId: e.target.value }))}
                  placeholder="Şablon seçin"
                >
                  {templates.filter(t => t.isActive).map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type === 'email' ? 'E-posta' : 'SMS'})
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Alıcılar</FormLabel>
                <Textarea 
                  value={sendData.recipients}
                  onChange={(e) => setSendData(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="E-posta adresleri veya telefon numaralarını virgülle ayırarak girin"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Zamanlanmış Gönderim (Opsiyonel)</FormLabel>
                <Input 
                  type="datetime-local"
                  value={sendData.scheduledTime}
                  onChange={(e) => setSendData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSendModalClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleSendNotification}>
              Gönder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmailSmsNotifications;