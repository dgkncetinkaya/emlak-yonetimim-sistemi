import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  VStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tooltip
} from '@chakra-ui/react';
import { Eye, Edit3, Trash2, MoreVertical, Download, Printer, CheckCircle } from 'react-feather';
import { RentalContract, ContractStatus } from '../../types/rentalContract';
import { downloadPDF, printPDF, preparePDFForPrint } from '../../utils/pdfTemplate';

interface ContractListProps {
  contracts?: RentalContract[];
  onView: (contract: RentalContract) => void;
  onEdit: (contract: RentalContract) => void;
  onDelete: (contractId: string) => void;
  onStatusChange: (contractId: string, status: ContractStatus) => void;
  isLoading?: boolean;
}

const ContractList: React.FC<ContractListProps> = ({
  contracts,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isLoading = false
}) => {
  // Güvenli liste oluştur
  const items = Array.isArray(contracts) ? contracts : [];
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.DRAFT:
        return 'yellow';
      case ContractStatus.ACTIVE:
        return 'green';
      case ContractStatus.COMPLETED:
        return 'blue';
      case ContractStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.DRAFT:
        return 'Taslak';
      case ContractStatus.ACTIVE:
        return 'Aktif';
      case ContractStatus.COMPLETED:
        return 'Tamamlandı';
      case ContractStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleDownload = async (contract: RentalContract) => {
    try {
      const tenantName = contract.tenant?.name ?? 'bilinmeyen-kiracı';
      const createdDate = contract.createdAt ? new Date(contract.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const filename = `kira-sozlesmesi-${tenantName.replace(/\s+/g, '-').toLowerCase()}-${createdDate}.pdf`;
      
      if (!contract.pdfData) {
        throw new Error('PDF verisi bulunamadı');
      }
      
      downloadPDF(contract.pdfData, filename);
      
      toast({
        title: 'İndirme Başarılı',
        description: 'Sözleşme başarıyla indirildi.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('İndirme hatası:', error);
      toast({
        title: 'İndirme Hatası',
        description: 'Dosya indirilirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrint = async (contract: RentalContract) => {
    try {
      const printReadyPdf = await preparePDFForPrint(contract.pdfData);
      printPDF(printReadyPdf);
      
      toast({
        title: 'Yazdırma Hazır',
        description: 'Sözleşme yazdırma için hazırlandı.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      toast({
        title: 'Yazdırma Hatası',
        description: 'Yazdırma sırasında bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = (contract: RentalContract, newStatus: ContractStatus) => {
    onStatusChange(contract.id, newStatus);
    
    toast({
      title: 'Durum Güncellendi',
      description: `Sözleşme durumu "${getStatusText(newStatus)}" olarak güncellendi.`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteClick = (contract: RentalContract) => {
    setSelectedContract(contract);
    onOpen();
  };

  const handleDeleteConfirm = () => {
    if (selectedContract) {
      onDelete(selectedContract.id);
      toast({
        title: 'Sözleşme Silindi',
        description: 'Sözleşme başarıyla silindi.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    onClose();
    setSelectedContract(null);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (amount == null) return "—";
    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency === 'TL' ? 'TRY' : currency || 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return "—";
    }
  };

  if (items.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Henüz sözleşme bulunmuyor.
        </Text>
        <Text fontSize="sm" color="gray.400" mt={2}>
          Yeni bir kira sözleşmesi oluşturmak için yukarıdaki butonu kullanın.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Kiracı</Th>
              <Th>Ev Sahibi</Th>
              <Th>Emlak Adresi</Th>
              <Th>Kira Bedeli</Th>
              <Th>Başlangıç</Th>
              <Th>Bitiş</Th>
              <Th>Durum</Th>
              <Th>Oluşturma</Th>
              <Th width="120px">İşlemler</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((contract) => (
              <Tr key={contract.id} _hover={{ bg: 'gray.50' }}>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{contract.tenant?.name ?? "—"}</Text>
                    <Text fontSize="sm" color="gray.600">{contract.tenant?.phone ?? "—"}</Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold">{contract.landlord?.name ?? "—"}</Text>
                    <Text fontSize="sm" color="gray.600">{contract.landlord?.phone ?? "—"}</Text>
                  </VStack>
                </Td>
                <Td>
                  <Text fontSize="sm" maxW="200px" isTruncated>
                    {contract.property?.address ?? "—"}
                  </Text>
                </Td>
                <Td>
                  <Text fontWeight="semibold">
                    {formatCurrency(contract.contractDetails?.rentAmount, contract.contractDetails?.currency)}
                  </Text>
                </Td>
                <Td>{formatDate(contract.contractDetails?.startDate)}</Td>
                <Td>{formatDate(contract.contractDetails?.endDate)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(contract.status)} variant="subtle">
                    {getStatusText(contract.status)}
                  </Badge>
                </Td>
                <Td>{formatDate(contract.createdAt)}</Td>
                <Td>
                  <HStack spacing={1}>
                    <Tooltip label="Görüntüle">
                      <IconButton
                        aria-label="Görüntüle"
                        icon={<Eye size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => onView(contract)}
                      />
                    </Tooltip>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Daha fazla işlem"
                        icon={<MoreVertical size={16} />}
                        size="sm"
                        variant="ghost"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<Edit3 size={16} />}
                          onClick={() => onEdit(contract)}
                          isDisabled={contract.status === ContractStatus.COMPLETED}
                        >
                          Düzenle
                        </MenuItem>
                        
                        <MenuItem
                          icon={<Download size={16} />}
                          onClick={() => handleDownload(contract)}
                        >
                          İndir
                        </MenuItem>
                        
                        <MenuItem
                          icon={<Printer size={16} />}
                          onClick={() => handlePrint(contract)}
                        >
                          Yazdır
                        </MenuItem>
                        
                        {contract.status === ContractStatus.DRAFT && (
                          <MenuItem
                            icon={<CheckCircle size={16} />}
                            onClick={() => handleStatusChange(contract, ContractStatus.ACTIVE)}
                            color="green.600"
                          >
                            Aktif Yap
                          </MenuItem>
                        )}
                        
                        {contract.status === ContractStatus.ACTIVE && (
                          <MenuItem
                            icon={<CheckCircle size={16} />}
                            onClick={() => handleStatusChange(contract, ContractStatus.COMPLETED)}
                            color="blue.600"
                          >
                            Tamamlandı Olarak İşaretle
                          </MenuItem>
                        )}
                        
                        <MenuItem
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDeleteClick(contract)}
                          color="red.600"
                        >
                          Sil
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Sözleşmeyi Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              {selectedContract && (
                <>
                  <Text mb={2}>
                    <strong>{selectedContract.tenant?.name}</strong> adlı kiracının sözleşmesini silmek istediğinizden emin misiniz?
                  </Text>
                  <Text fontSize="sm" color="red.600">
                    Bu işlem geri alınamaz.
                  </Text>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
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

export default ContractList;