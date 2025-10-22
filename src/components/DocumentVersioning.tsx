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
  useColorModeValue,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { Clock, Download, Eye, RotateCcw, Trash2, Upload } from 'react-feather';
import { DocItem, DocVersion } from '../types/documentManagement';

interface DocumentVersioningProps {
  document: DocItem;
  onVersionCreate?: (documentId: string, file: File, changes: string) => void;
  onVersionRestore?: (documentId: string, versionId: string) => void;
  onVersionDelete?: (documentId: string, versionId: string) => void;
  onVersionDownload?: (versionId: string, url: string) => void;
}

const DocumentVersioning: React.FC<DocumentVersioningProps> = ({
  document,
  onVersionCreate,
  onVersionRestore,
  onVersionDelete,
  onVersionDownload
}) => {
  const toast = useToast();
  const { isOpen: isUploadModalOpen, onOpen: onUploadModalOpen, onClose: onUploadModalClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    changes: ''
  });
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  // Mock version history if not provided
  const versionHistory = document.versionHistory || [
    {
      id: '1',
      version: 1,
      createdAt: document.createdAt,
      createdBy: document.ownerId,
      changes: 'İlk versiyon',
      url: document.url,
      fileSize: document.fileSize || 0
    }
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  }, []);

  const handleCreateVersion = useCallback(() => {
    if (!uploadData.file || !uploadData.changes.trim()) {
      toast({
        title: 'Hata',
        description: 'Dosya ve değişiklik açıklaması gereklidir',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (onVersionCreate) {
      onVersionCreate(document.id, uploadData.file, uploadData.changes);
    }

    toast({
      title: 'Başarılı',
      description: 'Yeni versiyon oluşturuldu',
      status: 'success',
      duration: 3000,
      isClosable: true
    });

    setUploadData({ file: null, changes: '' });
    onUploadModalClose();
  }, [uploadData, document.id, onVersionCreate, toast, onUploadModalClose]);

  const handleRestoreVersion = useCallback((versionId: string) => {
    if (onVersionRestore) {
      onVersionRestore(document.id, versionId);
    }

    toast({
      title: 'Başarılı',
      description: 'Versiyon geri yüklendi',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  }, [document.id, onVersionRestore, toast]);

  const handleDeleteVersion = useCallback(() => {
    if (selectedVersionId && onVersionDelete) {
      onVersionDelete(document.id, selectedVersionId);
    }

    toast({
      title: 'Başarılı',
      description: 'Versiyon silindi',
      status: 'success',
      duration: 3000,
      isClosable: true
    });

    setSelectedVersionId('');
    onDeleteAlertClose();
  }, [selectedVersionId, document.id, onVersionDelete, toast, onDeleteAlertClose]);

  const handleDownloadVersion = useCallback((version: DocVersion) => {
    if (onVersionDownload) {
      onVersionDownload(version.id, version.url);
    } else {
      // Default download behavior
      const link = window.document.createElement('a');
      link.href = version.url;
      link.download = `${document.name}_v${version.version}.pdf`;
      link.click();
    }
  }, [document.name, onVersionDownload]);

  const openDeleteAlert = useCallback((versionId: string) => {
    setSelectedVersionId(versionId);
    onDeleteAlertOpen();
  }, [onDeleteAlertOpen]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentVersion = () => {
    return Math.max(...versionHistory.map(v => v.version));
  };

  const isCurrentVersion = (version: number) => {
    return version === getCurrentVersion();
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">Doküman Versiyonları</Text>
            <Text fontSize="sm" color="gray.500">
              {document.name} - Güncel Versiyon: v{getCurrentVersion()}
            </Text>
          </VStack>
          <Button leftIcon={<Upload size={16} />} colorScheme="blue" onClick={onUploadModalOpen}>
            Yeni Versiyon
          </Button>
        </Flex>

        {/* Version History Table */}
        <Box>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Versiyon</Th>
                <Th>Değişiklikler</Th>
                <Th>Oluşturan</Th>
                <Th>Tarih</Th>
                <Th>Boyut</Th>
                <Th>İşlemler</Th>
              </Tr>
            </Thead>
            <Tbody>
              {versionHistory
                .sort((a, b) => b.version - a.version)
                .map((version) => (
                <Tr key={version.id} bg={isCurrentVersion(version.version) ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}>
                  <Td>
                    <HStack>
                      <Badge 
                        colorScheme={isCurrentVersion(version.version) ? 'blue' : 'gray'}
                        variant={isCurrentVersion(version.version) ? 'solid' : 'outline'}
                      >
                        v{version.version}
                      </Badge>
                      {isCurrentVersion(version.version) && (
                        <Badge colorScheme="green" size="sm">Güncel</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{version.changes}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{version.createdBy}</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(version.createdAt).toLocaleString('tr-TR')}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm">{formatFileSize(version.fileSize)}</Text>
                  </Td>
                  <Td>
                    <HStack>
                      <Tooltip label="Önizle">
                        <IconButton
                          aria-label="Önizle"
                          icon={<Eye size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(version.url, '_blank')}
                        />
                      </Tooltip>
                      
                      <Tooltip label="İndir">
                        <IconButton
                          aria-label="İndir"
                          icon={<Download size={16} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadVersion(version)}
                        />
                      </Tooltip>
                      
                      {!isCurrentVersion(version.version) && (
                        <Tooltip label="Bu versiyonu geri yükle">
                          <IconButton
                            aria-label="Geri yükle"
                            icon={<RotateCcw size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => handleRestoreVersion(version.id)}
                          />
                        </Tooltip>
                      )}
                      
                      {!isCurrentVersion(version.version) && versionHistory.length > 1 && (
                        <Tooltip label="Versiyonu sil">
                          <IconButton
                            aria-label="Sil"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openDeleteAlert(version.id)}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Version Statistics */}
        <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <HStack justify="space-around">
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {versionHistory.length}
              </Text>
              <Text fontSize="sm" color="gray.500">Toplam Versiyon</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                v{getCurrentVersion()}
              </Text>
              <Text fontSize="sm" color="gray.500">Güncel Versiyon</Text>
            </VStack>
            <VStack>
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {formatFileSize(versionHistory.reduce((total, v) => total + v.fileSize, 0))}
              </Text>
              <Text fontSize="sm" color="gray.500">Toplam Boyut</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>

      {/* Upload New Version Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={onUploadModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Yeni Versiyon Oluştur</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Dosya Seç</FormLabel>
                <Input 
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  p={1}
                />
                {uploadData.file && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Seçilen dosya: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Değişiklik Açıklaması</FormLabel>
                <Textarea 
                  value={uploadData.changes}
                  onChange={(e) => setUploadData(prev => ({ ...prev, changes: e.target.value }))}
                  placeholder="Bu versiyonda yapılan değişiklikleri açıklayın..."
                  rows={4}
                />
              </FormControl>
              
              <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" width="100%">
                <Text fontSize="sm" color="blue.600">
                  <strong>Not:</strong> Yeni versiyon oluşturulduğunda, mevcut versiyon v{getCurrentVersion() + 1} olarak kaydedilecektir.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUploadModalClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleCreateVersion}>
              Versiyon Oluştur
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Version Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Versiyonu Sil
            </AlertDialogHeader>
            <AlertDialogBody>
              Bu versiyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                İptal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteVersion} ml={3}>
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DocumentVersioning;