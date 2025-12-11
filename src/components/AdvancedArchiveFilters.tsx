import React from 'react';
import {
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Button,
  Flex,
  Spacer,
  HStack,
  Badge,
  Text,
  Checkbox,
  VStack,
  Collapse,
  useDisclosure,
  Icon
} from '@chakra-ui/react';
import { Search, Filter, ChevronDown, ChevronUp } from 'react-feather';
import { DocumentType, DocumentStatus, DepartmentType, DocumentTag } from '../services/documentsService';
import { User } from '../types/userTypes';

export interface ArchiveFilter {
  search: string;
  type: DocumentType | '';
  status: DocumentStatus | '';
  dateFrom: string;
  dateTo: string;
  owner: string;
  department: DepartmentType | '';
  tags: string[];
  hasSignature: boolean | null;
  fileSize: {
    min: number;
    max: number;
  };
}

interface AdvancedArchiveFiltersProps {
  filter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
  onClearFilters: () => void;
  availableTags: DocumentTag[];
  currentUser: User;
  totalResults: number;
}

const AdvancedArchiveFilters: React.FC<AdvancedArchiveFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  availableTags,
  currentUser,
  totalResults
}) => {
  const { isOpen, onToggle } = useDisclosure();

  const handleFilterChange = (key: keyof ArchiveFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter(t => t !== tag)
      : [...filter.tags, tag];
    handleFilterChange('tags', newTags);
  };

  const departments: DepartmentType[] = ['satis', 'kiralama', 'degerleme', 'hukuk', 'muhasebe'];

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.type) count++;
    if (filter.status) count++;
    if (filter.dateFrom) count++;
    if (filter.dateTo) count++;
    if (filter.owner) count++;
    if (filter.department) count++;
    if (filter.tags.length > 0) count++;
    if (filter.hasSignature !== null) count++;
    if (filter.fileSize.min > 0 || filter.fileSize.max < 100) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const getTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      yer_gosterme: 'Yer Gösterme',
      kira_sozlesmesi: 'Kira Sözleşmesi',
      tahliye_taahhutnamesi: 'Tahliye Taahhütnamesi',
      kimlik_belgesi: 'Kimlik Belgesi',
      mali_belge: 'Mali Belge',
      tapu_belgesi: 'Tapu Belgesi',
      sigorta_belgesi: 'Sigorta Belgesi',
      diger: 'Diğer'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: DocumentStatus): string => {
    const labels: Record<DocumentStatus, string> = {
      taslak: 'Taslak',
      tamamlandi: 'Tamamlandı',
      iptal_edildi: 'İptal Edildi',
      onay_bekliyor: 'Onay Bekliyor',
      iptal: 'İptal',
      beklemede: 'Beklemede'
    };
    return labels[status] || status;
  };

  const getDepartmentLabel = (department: DepartmentType): string => {
    const labels: Record<DepartmentType, string> = {
      satis: 'Satış',
      kiralama: 'Kiralama',
      degerleme: 'Değerleme',
      hukuk: 'Hukuk',
      muhasebe: 'Muhasebe'
    };
    return labels[department] || department;
  };

  return (
    <Card>
      <CardBody>
        {/* Temel Filtreler */}
        <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">Arama</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={Search} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Belge adı, müşteri adı veya içerik"
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </InputGroup>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Belge Türü</FormLabel>
            <Select
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value as DocumentType)}
            >
              <option value="">Tümü</option>
              <option value="yer_gosterme">Yer Gösterme</option>
              <option value="kira_sozlesmesi">Kira Sözleşmesi</option>
              <option value="tahliye_taahhutnamesi">Tahliye Taahhütnamesi</option>
              <option value="kimlik_belgesi">Kimlik Belgesi</option>
              <option value="mali_belge">Mali Belge</option>
              <option value="tapu_belgesi">Tapu Belgesi</option>
              <option value="sigorta_belgesi">Sigorta Belgesi</option>
              <option value="diger">Diğer</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Durum</FormLabel>
            <Select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value as DocumentStatus)}
            >
              <option value="">Tümü</option>
              <option value="taslak">Taslak</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal_edildi">İptal Edildi</option>
              <option value="onay_bekliyor">Onay Bekliyor</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Departman</FormLabel>
            <Select
              value={filter.department}
              onChange={(e) => handleFilterChange('department', e.target.value as DepartmentType)}
            >
              <option value="">Tümü</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {getDepartmentLabel(dept)}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* Gelişmiş Filtreler Toggle */}
        <Flex align="center" mb={4}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            leftIcon={<Icon as={Filter} />}
            rightIcon={<Icon as={isOpen ? ChevronUp : ChevronDown} />}
          >
            Gelişmiş Filtreler
            {activeFilterCount > 0 && (
              <Badge ml={2} colorScheme="blue" variant="solid">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Spacer />
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              {totalResults} sonuç bulundu
            </Text>
            <Button size="sm" variant="outline" onClick={onClearFilters}>
              Temizle
            </Button>
          </HStack>
        </Flex>

        {/* Gelişmiş Filtreler */}
        <Collapse in={isOpen}>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Başlangıç Tarihi</FormLabel>
                <Input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Bitiş Tarihi</FormLabel>
                <Input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Belge Sahibi</FormLabel>
                <Input
                  placeholder="Kullanıcı ID'si"
                  value={filter.owner}
                  onChange={(e) => handleFilterChange('owner', e.target.value)}
                />
              </FormControl>
            </SimpleGrid>

            {/* Etiketler */}
            <FormControl>
              <FormLabel fontSize="sm">Etiketler</FormLabel>
              <HStack spacing={2} wrap="wrap">
                {availableTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={filter.tags.includes(tag.name) ? "solid" : "outline"}
                    colorScheme={filter.tags.includes(tag.name) ? "blue" : "gray"}
                    cursor="pointer"
                    onClick={() => handleTagToggle(tag.name)}
                    px={3}
                    py={1}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </HStack>
            </FormControl>

            {/* Dijital İmza Filtresi */}
            <FormControl>
              <FormLabel fontSize="sm">Dijital İmza</FormLabel>
              <HStack spacing={4}>
                <Checkbox
                  isChecked={filter.hasSignature === true}
                  onChange={(e) => handleFilterChange('hasSignature', e.target.checked ? true : null)}
                >
                  İmzalı belgeler
                </Checkbox>
                <Checkbox
                  isChecked={filter.hasSignature === false}
                  onChange={(e) => handleFilterChange('hasSignature', e.target.checked ? false : null)}
                >
                  İmzasız belgeler
                </Checkbox>
              </HStack>
            </FormControl>

            {/* Dosya Boyutu */}
            <FormControl>
              <FormLabel fontSize="sm">Dosya Boyutu (MB)</FormLabel>
              <HStack spacing={4}>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filter.fileSize.min || ''}
                  onChange={(e) => handleFilterChange('fileSize', {
                    ...filter.fileSize,
                    min: parseInt(e.target.value) || 0
                  })}
                  size="sm"
                />
                <Text>-</Text>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filter.fileSize.max === 100 ? '' : filter.fileSize.max}
                  onChange={(e) => handleFilterChange('fileSize', {
                    ...filter.fileSize,
                    max: parseInt(e.target.value) || 100
                  })}
                  size="sm"
                />
              </HStack>
            </FormControl>
          </VStack>
        </Collapse>
      </CardBody>
    </Card>
  );
};

export default AdvancedArchiveFilters;