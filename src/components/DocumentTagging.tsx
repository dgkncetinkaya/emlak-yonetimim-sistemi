import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Badge,
  useColorModeValue,
  IconButton,
  Tooltip,
  Flex,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { Plus, Tag as TagIcon, Hash, Filter, X } from 'react-feather';
import { DocItem } from '../types/documentManagement';

interface DocumentTaggingProps {
  documents: DocItem[];
  onTagAdd?: (documentId: string, tag: string) => void;
  onTagRemove?: (documentId: string, tag: string) => void;
  onBulkTagAdd?: (documentIds: string[], tag: string) => void;
  onBulkTagRemove?: (documentIds: string[], tag: string) => void;
  selectedDocuments?: string[];
}

interface TagCategory {
  name: string;
  color: string;
  description: string;
}

const DocumentTagging: React.FC<DocumentTaggingProps> = ({
  documents,
  onTagAdd,
  onTagRemove,
  onBulkTagAdd,
  onBulkTagRemove,
  selectedDocuments = []
}) => {
  const toast = useToast();
  const { isOpen: isTagModalOpen, onOpen: onTagModalOpen, onClose: onTagModalClose } = useDisclosure();
  const { isOpen: isBulkModalOpen, onOpen: onBulkModalOpen, onClose: onBulkModalClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tagDescription, setTagDescription] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Predefined tag categories
  const tagCategories: TagCategory[] = [
    { name: 'Durum', color: 'blue', description: 'Belge durumu etiketleri' },
    { name: 'Öncelik', color: 'red', description: 'Öncelik seviyesi etiketleri' },
    { name: 'Kategori', color: 'green', description: 'Belge kategorisi etiketleri' },
    { name: 'Müşteri', color: 'purple', description: 'Müşteri ile ilgili etiketler' },
    { name: 'Lokasyon', color: 'orange', description: 'Konum bazlı etiketler' },
    { name: 'Özel', color: 'gray', description: 'Özel etiketler' }
  ];

  // Common tags for each category
  const commonTags: Record<string, string[]> = {
    'Durum': ['Beklemede', 'İnceleniyor', 'Onaylandı', 'Reddedildi', 'Tamamlandı'],
    'Öncelik': ['Düşük', 'Orta', 'Yüksek', 'Acil', 'Kritik'],
    'Kategori': ['Kira', 'Satış', 'Değerleme', 'Sigorta', 'Hukuki'],
    'Müşteri': ['VIP', 'Yeni Müşteri', 'Eski Müşteri', 'Kurumsal', 'Bireysel'],
    'Lokasyon': ['İstanbul', 'Ankara', 'İzmir', 'Merkez', 'Taşra'],
    'Özel': ['Gizli', 'Arşiv', 'Yedek', 'Test', 'Taslak']
  };

  // Get all unique tags from documents
  const getAllTags = useCallback(() => {
    const tagSet = new Set<string>();
    documents.forEach(doc => {
      doc.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  // Get tag statistics
  const getTagStats = useCallback(() => {
    const tagCounts: Record<string, number> = {};
    documents.forEach(doc => {
      doc.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }, [documents]);

  // Filter documents by tag
  const getDocumentsByTag = useCallback((tag: string) => {
    return documents.filter(doc => doc.tags?.includes(tag));
  }, [documents]);

  // Get tag color based on category
  const getTagColor = useCallback((tag: string) => {
    for (const [category, tags] of Object.entries(commonTags)) {
      if (tags.includes(tag)) {
        const categoryInfo = tagCategories.find(c => c.name === category);
        return categoryInfo?.color || 'gray';
      }
    }
    return 'gray';
  }, []);

  const handleAddTag = useCallback((documentId: string, tag: string) => {
    if (!tag.trim()) return;
    
    const document = documents.find(d => d.id === documentId);
    if (document?.tags?.includes(tag)) {
      toast({
        title: 'Uyarı',
        description: 'Bu etiket zaten mevcut',
        status: 'warning',
        duration: 2000,
        isClosable: true
      });
      return;
    }

    if (onTagAdd) {
      onTagAdd(documentId, tag);
    }

    toast({
      title: 'Başarılı',
      description: 'Etiket eklendi',
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  }, [documents, onTagAdd, toast]);

  const handleRemoveTag = useCallback((documentId: string, tag: string) => {
    if (onTagRemove) {
      onTagRemove(documentId, tag);
    }

    toast({
      title: 'Başarılı',
      description: 'Etiket kaldırıldı',
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  }, [onTagRemove, toast]);

  const handleBulkAddTag = useCallback(() => {
    if (!newTag.trim() || selectedDocuments.length === 0) {
      toast({
        title: 'Hata',
        description: 'Etiket adı ve seçili belgeler gereklidir',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (onBulkTagAdd) {
      onBulkTagAdd(selectedDocuments, newTag.trim());
    }

    toast({
      title: 'Başarılı',
      description: `${selectedDocuments.length} belgeye etiket eklendi`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });

    setNewTag('');
    onBulkModalClose();
  }, [newTag, selectedDocuments, onBulkTagAdd, toast, onBulkModalClose]);

  const handleBulkRemoveTag = useCallback((tag: string) => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'Hata',
        description: 'Seçili belge bulunamadı',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (onBulkTagRemove) {
      onBulkTagRemove(selectedDocuments, tag);
    }

    toast({
      title: 'Başarılı',
      description: `${selectedDocuments.length} belgeden etiket kaldırıldı`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  }, [selectedDocuments, onBulkTagRemove, toast]);

  const handleQuickAddTag = useCallback((tag: string) => {
    if (selectedDocuments.length > 0) {
      handleBulkAddTag();
    }
    setNewTag(tag);
  }, [selectedDocuments, handleBulkAddTag]);

  const allTags = getAllTags();
  const tagStats = getTagStats();
  const filteredTags = filterTag ? allTags.filter(tag => 
    tag.toLowerCase().includes(filterTag.toLowerCase())
  ) : allTags;

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">Etiket Yönetimi</Text>
            <Text fontSize="sm" color="gray.500">
              {allTags.length} farklı etiket • {Object.keys(tagStats).length} aktif etiket
            </Text>
          </VStack>
          <HStack>
            {selectedDocuments.length > 0 && (
              <Button leftIcon={<Plus size={16} />} colorScheme="green" onClick={onBulkModalOpen}>
                Toplu Etiket ({selectedDocuments.length})
              </Button>
            )}
            <Button leftIcon={<TagIcon size={16} />} colorScheme="blue" onClick={onTagModalOpen}>
              Etiket Yönet
            </Button>
          </HStack>
        </Flex>

        {/* Tag Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Toplam Etiket</StatLabel>
            <StatNumber>{allTags.length}</StatNumber>
            <StatHelpText>Tüm belgeler</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>En Popüler</StatLabel>
            <StatNumber fontSize="md">
              {Object.entries(tagStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Yok'}
            </StatNumber>
            <StatHelpText>
              {Object.entries(tagStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} belge
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Etiketli Belgeler</StatLabel>
            <StatNumber>{documents.filter(d => d.tags && d.tags.length > 0).length}</StatNumber>
            <StatHelpText>{documents.length} toplam</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Ortalama Etiket</StatLabel>
            <StatNumber>
              {documents.length > 0 ? 
                (documents.reduce((sum, d) => sum + (d.tags?.length || 0), 0) / documents.length).toFixed(1) : 
                '0'
              }
            </StatNumber>
            <StatHelpText>Belge başına</StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Tag Filter */}
        <HStack>
          <Filter size={16} />
          <Input
            placeholder="Etiketleri filtrele..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            maxW="300px"
          />
          {filterTag && (
            <IconButton
              aria-label="Filtreyi temizle"
              icon={<X size={16} />}
              size="sm"
              variant="ghost"
              onClick={() => setFilterTag('')}
            />
          )}
        </HStack>

        {/* All Tags Display */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>Mevcut Etiketler</Text>
          {filteredTags.length > 0 ? (
            <Wrap spacing={2}>
              {filteredTags.map(tag => {
                const count = tagStats[tag] || 0;
                const color = getTagColor(tag);
                return (
                  <WrapItem key={tag}>
                    <Tooltip label={`${count} belgede kullanılıyor`}>
                      <Tag
                        size="md"
                        colorScheme={color}
                        variant="subtle"
                        cursor="pointer"
                        _hover={{ transform: 'scale(1.05)' }}
                        onClick={() => handleQuickAddTag(tag)}
                      >
                        <TagLabel>{tag}</TagLabel>
                        <Badge ml={2} colorScheme={color} variant="solid" fontSize="xs">
                          {count}
                        </Badge>
                        {selectedDocuments.length > 0 && (
                          <TagCloseButton onClick={(e) => {
                            e.stopPropagation();
                            handleBulkRemoveTag(tag);
                          }} />
                        )}
                      </Tag>
                    </Tooltip>
                  </WrapItem>
                );
              })}
            </Wrap>
          ) : (
            <Text color="gray.500" fontStyle="italic">
              {filterTag ? 'Filtreye uygun etiket bulunamadı' : 'Henüz etiket eklenmemiş'}
            </Text>
          )}
        </Box>

        {/* Tag Categories */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>Etiket Kategorileri</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {tagCategories.map(category => {
              const categoryTags = commonTags[category.name] || [];
              const usedTags = categoryTags.filter(tag => allTags.includes(tag));
              
              return (
                <Box key={category.name} p={4} borderRadius="md" border="1px" borderColor={borderColor}>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Hash size={16} color={`var(--chakra-colors-${category.color}-500)`} />
                      <Text fontWeight="semibold" color={`${category.color}.500`}>
                        {category.name}
                      </Text>
                      <Badge colorScheme={category.color} variant="subtle">
                        {usedTags.length}/{categoryTags.length}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {category.description}
                    </Text>
                    <Wrap spacing={1}>
                      {categoryTags.slice(0, 5).map(tag => (
                        <WrapItem key={tag}>
                          <Tag
                            size="sm"
                            colorScheme={category.color}
                            variant={allTags.includes(tag) ? 'solid' : 'outline'}
                            cursor="pointer"
                            onClick={() => handleQuickAddTag(tag)}
                          >
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                      {categoryTags.length > 5 && (
                        <Text fontSize="xs" color="gray.500">+{categoryTags.length - 5} daha</Text>
                      )}
                    </Wrap>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      </VStack>

      {/* Tag Management Modal */}
      <Modal isOpen={isTagModalOpen} onClose={onTagModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Etiket Yönetimi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Yeni Etiket</FormLabel>
                <HStack>
                  <Input 
                    ref={inputRef}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiket adını girin..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && selectedDocuments.length > 0) {
                        handleBulkAddTag();
                      }
                    }}
                  />
                  <Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    placeholder="Kategori seç"
                    maxW="200px"
                  >
                    {tagCategories.map(category => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>Açıklama (Opsiyonel)</FormLabel>
                <Textarea 
                  value={tagDescription}
                  onChange={(e) => setTagDescription(e.target.value)}
                  placeholder="Etiket açıklaması..."
                  rows={2}
                />
              </FormControl>

              {selectedCategory && (
                <Box w="100%">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    {selectedCategory} Kategorisi Önerileri:
                  </Text>
                  <Wrap spacing={2}>
                    {(commonTags[selectedCategory] || []).map(tag => (
                      <WrapItem key={tag}>
                        <Tag
                          size="sm"
                          colorScheme={tagCategories.find(c => c.name === selectedCategory)?.color}
                          variant="outline"
                          cursor="pointer"
                          onClick={() => setNewTag(tag)}
                        >
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTagModalClose}>
              İptal
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleBulkAddTag}
              isDisabled={!newTag.trim() || selectedDocuments.length === 0}
            >
              Etiket Ekle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Tag Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={onBulkModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Toplu Etiket İşlemi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" width="100%">
                <Text fontSize="sm" color="blue.600">
                  <strong>{selectedDocuments.length}</strong> belge seçildi. Bu belgelere toplu etiket ekleyebilir veya kaldırabilirsiniz.
                </Text>
              </Box>
              
              <FormControl>
                <FormLabel>Yeni Etiket Ekle</FormLabel>
                <HStack>
                  <Input 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiket adını girin..."
                  />
                  <Button colorScheme="green" onClick={handleBulkAddTag}>
                    Ekle
                  </Button>
                </HStack>
              </FormControl>
              
              <Divider />
              
              <Box w="100%">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Mevcut Etiketlerden Kaldır:
                </Text>
                <Wrap spacing={2}>
                  {allTags.map(tag => (
                    <WrapItem key={tag}>
                      <Tag
                        size="md"
                        colorScheme={getTagColor(tag)}
                        variant="subtle"
                      >
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleBulkRemoveTag(tag)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onBulkModalClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentTagging;