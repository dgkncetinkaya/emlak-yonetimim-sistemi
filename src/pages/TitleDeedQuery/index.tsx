import { useState } from 'react';
import {
  Box, Heading, VStack, HStack, FormControl, FormLabel, Input, Button, Select,
  Tabs, TabList, TabPanels, Tab, TabPanel, Text, Divider, Badge, Flex,
  SimpleGrid, useToast, Alert, AlertIcon, AlertTitle, AlertDescription,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Icon, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue
} from '@chakra-ui/react';
import { Search, MapPin, Home, User, Calendar, FileText, Download, Printer } from 'react-feather';

const TitleDeedQuery = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([
    {
      id: 1,
      date: '15.07.2023',
      province: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Göztepe',
      block: '101',
      parcel: '5',
      status: 'Tamamlandı',
    },
    {
      id: 2,
      date: '20.07.2023',
      province: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Levent',
      block: '250',
      parcel: '12',
      status: 'Tamamlandı',
    },
    {
      id: 3,
      date: '25.07.2023',
      province: 'Ankara',
      district: 'Çankaya',
      neighborhood: 'Bahçelievler',
      block: '1250',
      parcel: '8',
      status: 'Tamamlandı',
    },
  ]);
  
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);
  
  const toast = useToast();
  
  // Form state for parcel query
  const [parcelQueryForm, setParcelQueryForm] = useState({
    province: '',
    district: '',
    neighborhood: '',
    block: '',
    parcel: '',
  });
  
  // Form state for address query
  const [addressQueryForm, setAddressQueryForm] = useState({
    province: '',
    district: '',
    neighborhood: '',
    street: '',
    buildingNo: '',
    apartmentNo: '',
  });
  
  // Form state for owner query
  const [ownerQueryForm, setOwnerQueryForm] = useState({
    identityNumber: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  });
  
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setQueryResult(null);
  };
  
  const handleParcelQueryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParcelQueryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddressQueryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressQueryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOwnerQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnerQueryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleParcelQuery = () => {
    // Validate form
    if (!parcelQueryForm.province || !parcelQueryForm.district || !parcelQueryForm.block || !parcelQueryForm.parcel) {
      toast({
        title: 'Eksik bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Dummy result data
      const result = {
        parcelInfo: {
          province: parcelQueryForm.province,
          district: parcelQueryForm.district,
          neighborhood: parcelQueryForm.neighborhood,
          block: parcelQueryForm.block,
          parcel: parcelQueryForm.parcel,
          area: '250 m²',
          type: 'Arsa',
          qualification: 'İmarlı',
          zoning: 'Konut Alanı',
          constructionPermit: 'Var',
        },
        ownerInfo: [
          {
            name: 'Ahmet Yılmaz',
            share: '1/2',
            acquisitionDate: '10.05.2015',
            acquisitionReason: 'Satış',
          },
          {
            name: 'Mehmet Yılmaz',
            share: '1/2',
            acquisitionDate: '10.05.2015',
            acquisitionReason: 'Satış',
          },
        ],
        encumbrances: [
          {
            type: 'İpotek',
            beneficiary: 'X Bankası',
            amount: '500.000 TL',
            date: '15.06.2015',
          },
        ],
        annotations: [
          {
            type: 'Şerh',
            content: 'Kira sözleşmesi',
            date: '20.07.2018',
            duration: '5 yıl',
          },
        ],
      };
      
      setQueryResult(result);
      setIsLoading(false);
      
      // Add to history
      const newQuery = {
        id: queryHistory.length + 1,
        date: new Date().toLocaleDateString('tr-TR'),
        province: parcelQueryForm.province,
        district: parcelQueryForm.district,
        neighborhood: parcelQueryForm.neighborhood,
        block: parcelQueryForm.block,
        parcel: parcelQueryForm.parcel,
        status: 'Tamamlandı',
      };
      
      setQueryHistory(prev => [newQuery, ...prev]);
    }, 2000);
  };
  
  const handleAddressQuery = () => {
    // Validate form
    if (!addressQueryForm.province || !addressQueryForm.district || !addressQueryForm.street || !addressQueryForm.buildingNo) {
      toast({
        title: 'Eksik bilgi',
        description: 'Lütfen gerekli alanları doldurun.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Dummy result data - same structure as parcel query for simplicity
      const result = {
        parcelInfo: {
          province: addressQueryForm.province,
          district: addressQueryForm.district,
          neighborhood: addressQueryForm.neighborhood,
          block: '156',
          parcel: '8',
          area: '180 m²',
          type: 'Arsa',
          qualification: 'İmarlı',
          zoning: 'Konut Alanı',
          constructionPermit: 'Var',
        },
        ownerInfo: [
          {
            name: 'Ayşe Demir',
            share: '1/1',
            acquisitionDate: '05.03.2018',
            acquisitionReason: 'Satış',
          },
        ],
        encumbrances: [],
        annotations: [],
      };
      
      setQueryResult(result);
      setIsLoading(false);
      
      // Add to history
      const newQuery = {
        id: queryHistory.length + 1,
        date: new Date().toLocaleDateString('tr-TR'),
        province: addressQueryForm.province,
        district: addressQueryForm.district,
        neighborhood: addressQueryForm.neighborhood,
        block: '156',
        parcel: '8',
        status: 'Tamamlandı',
      };
      
      setQueryHistory(prev => [newQuery, ...prev]);
    }, 2000);
  };
  
  const handleOwnerQuery = () => {
    // Validate form
    if (!ownerQueryForm.identityNumber || (!ownerQueryForm.firstName && !ownerQueryForm.lastName)) {
      toast({
        title: 'Eksik bilgi',
        description: 'Lütfen TC Kimlik No ve Ad veya Soyad alanlarını doldurun.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // For owner query, we'll show a list of properties
      const result = {
        ownerName: `${ownerQueryForm.firstName} ${ownerQueryForm.lastName}`,
        properties: [
          {
            province: 'İstanbul',
            district: 'Kadıköy',
            neighborhood: 'Göztepe',
            block: '101',
            parcel: '5',
            type: 'Daire',
            area: '120 m²',
            share: '1/1',
            acquisitionDate: '10.05.2015',
          },
          {
            province: 'İstanbul',
            district: 'Üsküdar',
            neighborhood: 'Acıbadem',
            block: '250',
            parcel: '12',
            type: 'Dükkan',
            area: '80 m²',
            share: '1/2',
            acquisitionDate: '15.08.2018',
          },
        ],
      };
      
      setQueryResult(result);
      setIsLoading(false);
      
      // Add to history
      const newQuery = {
        id: queryHistory.length + 1,
        date: new Date().toLocaleDateString('tr-TR'),
        province: 'Çoklu',
        district: 'Çoklu',
        neighborhood: 'Çoklu',
        block: 'Çoklu',
        parcel: 'Çoklu',
        status: 'Tamamlandı',
      };
      
      setQueryHistory(prev => [newQuery, ...prev]);
    }, 2000);
  };
  
  const handleViewQueryDetail = (query: any) => {
    setSelectedQuery(query);
    onDetailOpen();
  };
  
  const handlePrintResult = () => {
    toast({
      title: 'Yazdırılıyor',
      description: 'Tapu bilgileri yazdırılıyor.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDownloadResult = () => {
    toast({
      title: 'İndiriliyor',
      description: 'Tapu bilgileri PDF olarak indiriliyor.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  const renderParcelQueryForm = () => (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel>İl</FormLabel>
          <Select
            name="province"
            value={parcelQueryForm.province}
            onChange={handleParcelQueryChange}
            placeholder="İl seçin"
          >
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>İlçe</FormLabel>
          <Select
            name="district"
            value={parcelQueryForm.district}
            onChange={handleParcelQueryChange}
            placeholder="İlçe seçin"
            isDisabled={!parcelQueryForm.province}
          >
            {parcelQueryForm.province === 'İstanbul' && (
              <>
                <option value="Kadıköy">Kadıköy</option>
                <option value="Beşiktaş">Beşiktaş</option>
                <option value="Üsküdar">Üsküdar</option>
                <option value="Şişli">Şişli</option>
                <option value="Ataşehir">Ataşehir</option>
              </>
            )}
            {parcelQueryForm.province === 'Ankara' && (
              <>
                <option value="Çankaya">Çankaya</option>
                <option value="Keçiören">Keçiören</option>
                <option value="Mamak">Mamak</option>
                <option value="Yenimahalle">Yenimahalle</option>
              </>
            )}
          </Select>
        </FormControl>
      </SimpleGrid>
      
      <FormControl>
        <FormLabel>Mahalle</FormLabel>
        <Select
          name="neighborhood"
          value={parcelQueryForm.neighborhood}
          onChange={handleParcelQueryChange}
          placeholder="Mahalle seçin"
          isDisabled={!parcelQueryForm.district}
        >
          {parcelQueryForm.district === 'Kadıköy' && (
            <>
              <option value="Göztepe">Göztepe</option>
              <option value="Fenerbahçe">Fenerbahçe</option>
              <option value="Suadiye">Suadiye</option>
              <option value="Caddebostan">Caddebostan</option>
            </>
          )}
          {parcelQueryForm.district === 'Beşiktaş' && (
            <>
              <option value="Levent">Levent</option>
              <option value="Etiler">Etiler</option>
              <option value="Ortaköy">Ortaköy</option>
              <option value="Arnavutköy">Arnavutköy</option>
            </>
          )}
        </Select>
      </FormControl>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel>Ada</FormLabel>
          <Input
            name="block"
            value={parcelQueryForm.block}
            onChange={handleParcelQueryChange}
            placeholder="Ada numarası"
          />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Parsel</FormLabel>
          <Input
            name="parcel"
            value={parcelQueryForm.parcel}
            onChange={handleParcelQueryChange}
            placeholder="Parsel numarası"
          />
        </FormControl>
      </SimpleGrid>
      
      <Button
        colorScheme="blue"
        leftIcon={<Icon as={Search} />}
        onClick={handleParcelQuery}
        isLoading={isLoading}
        loadingText="Sorgulanıyor"
        mt={2}
      >
        Sorgula
      </Button>
    </VStack>
  );
  
  const renderAddressQueryForm = () => (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel>İl</FormLabel>
          <Select
            name="province"
            value={addressQueryForm.province}
            onChange={handleAddressQueryChange}
            placeholder="İl seçin"
          >
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
          </Select>
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>İlçe</FormLabel>
          <Select
            name="district"
            value={addressQueryForm.district}
            onChange={handleAddressQueryChange}
            placeholder="İlçe seçin"
            isDisabled={!addressQueryForm.province}
          >
            {addressQueryForm.province === 'İstanbul' && (
              <>
                <option value="Kadıköy">Kadıköy</option>
                <option value="Beşiktaş">Beşiktaş</option>
                <option value="Üsküdar">Üsküdar</option>
                <option value="Şişli">Şişli</option>
                <option value="Ataşehir">Ataşehir</option>
              </>
            )}
            {addressQueryForm.province === 'Ankara' && (
              <>
                <option value="Çankaya">Çankaya</option>
                <option value="Keçiören">Keçiören</option>
                <option value="Mamak">Mamak</option>
                <option value="Yenimahalle">Yenimahalle</option>
              </>
            )}
          </Select>
        </FormControl>
      </SimpleGrid>
      
      <FormControl>
        <FormLabel>Mahalle</FormLabel>
        <Select
          name="neighborhood"
          value={addressQueryForm.neighborhood}
          onChange={handleAddressQueryChange}
          placeholder="Mahalle seçin"
          isDisabled={!addressQueryForm.district}
        >
          {addressQueryForm.district === 'Kadıköy' && (
            <>
              <option value="Göztepe">Göztepe</option>
              <option value="Fenerbahçe">Fenerbahçe</option>
              <option value="Suadiye">Suadiye</option>
              <option value="Caddebostan">Caddebostan</option>
            </>
          )}
          {addressQueryForm.district === 'Beşiktaş' && (
            <>
              <option value="Levent">Levent</option>
              <option value="Etiler">Etiler</option>
              <option value="Ortaköy">Ortaköy</option>
              <option value="Arnavutköy">Arnavutköy</option>
            </>
          )}
        </Select>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Cadde/Sokak</FormLabel>
        <Input
          name="street"
          value={addressQueryForm.street}
          onChange={handleAddressQueryChange}
          placeholder="Cadde veya sokak adı"
        />
      </FormControl>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel>Bina No</FormLabel>
          <Input
            name="buildingNo"
            value={addressQueryForm.buildingNo}
            onChange={handleAddressQueryChange}
            placeholder="Bina numarası"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Daire No</FormLabel>
          <Input
            name="apartmentNo"
            value={addressQueryForm.apartmentNo}
            onChange={handleAddressQueryChange}
            placeholder="Daire numarası"
          />
        </FormControl>
      </SimpleGrid>
      
      <Button
        colorScheme="blue"
        leftIcon={<Icon as={MapPin} />}
        onClick={handleAddressQuery}
        isLoading={isLoading}
        loadingText="Sorgulanıyor"
        mt={2}
      >
        Sorgula
      </Button>
    </VStack>
  );
  
  const renderOwnerQueryForm = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          Kişi bilgileri ile sorgulama yapmak için TC Kimlik Numarası ve Ad/Soyad bilgilerini girmeniz gerekmektedir.
        </AlertDescription>
      </Alert>
      
      <FormControl isRequired>
        <FormLabel>TC Kimlik No</FormLabel>
        <Input
          name="identityNumber"
          value={ownerQueryForm.identityNumber}
          onChange={handleOwnerQueryChange}
          placeholder="11 haneli TC Kimlik No"
          maxLength={11}
        />
      </FormControl>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl isRequired>
          <FormLabel>Ad</FormLabel>
          <Input
            name="firstName"
            value={ownerQueryForm.firstName}
            onChange={handleOwnerQueryChange}
            placeholder="Ad"
          />
        </FormControl>
        
        <FormControl isRequired>
          <FormLabel>Soyad</FormLabel>
          <Input
            name="lastName"
            value={ownerQueryForm.lastName}
            onChange={handleOwnerQueryChange}
            placeholder="Soyad"
          />
        </FormControl>
      </SimpleGrid>
      
      <FormControl>
        <FormLabel>Doğum Tarihi</FormLabel>
        <Input
          name="birthDate"
          value={ownerQueryForm.birthDate}
          onChange={handleOwnerQueryChange}
          type="date"
        />
      </FormControl>
      
      <Button
        colorScheme="blue"
        leftIcon={<Icon as={User} />}
        onClick={handleOwnerQuery}
        isLoading={isLoading}
        loadingText="Sorgulanıyor"
        mt={2}
      >
        Sorgula
      </Button>
    </VStack>
  );
  
  const renderQueryHistory = () => (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
          <Tr>
            <Th>Tarih</Th>
            <Th>İl</Th>
            <Th>İlçe</Th>
            <Th>Mahalle</Th>
            <Th>Ada</Th>
            <Th>Parsel</Th>
            <Th>Durum</Th>
            <Th>İşlem</Th>
          </Tr>
        </Thead>
        <Tbody>
          {queryHistory.map(query => (
            <Tr key={query.id}>
              <Td>{query.date}</Td>
              <Td>{query.province}</Td>
              <Td>{query.district}</Td>
              <Td>{query.neighborhood || '-'}</Td>
              <Td>{query.block}</Td>
              <Td>{query.parcel}</Td>
              <Td>
                <Badge colorScheme="green">{query.status}</Badge>
              </Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleViewQueryDetail(query)}
                >
                  Detay
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
  
  const renderParcelQueryResult = () => {
    if (!queryResult) return null;
    
    return (
      <Box mt={8} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="md">Tapu Bilgileri</Heading>
          <HStack>
            <Button
              size="sm"
              leftIcon={<Icon as={Printer} />}
              onClick={handlePrintResult}
            >
              Yazdır
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Icon as={Download} />}
              onClick={handleDownloadResult}
            >
              İndir
            </Button>
          </HStack>
        </Flex>
        
        <Divider mb={6} />
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <Heading size="sm" mb={4}>Parsel Bilgileri</Heading>
            
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Text fontWeight="bold" minW="120px">İl:</Text>
                <Text>{queryResult.parcelInfo.province}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">İlçe:</Text>
                <Text>{queryResult.parcelInfo.district}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Mahalle:</Text>
                <Text>{queryResult.parcelInfo.neighborhood || '-'}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Ada:</Text>
                <Text>{queryResult.parcelInfo.block}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Parsel:</Text>
                <Text>{queryResult.parcelInfo.parcel}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Yüzölçümü:</Text>
                <Text>{queryResult.parcelInfo.area}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Nitelik:</Text>
                <Text>{queryResult.parcelInfo.qualification}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">İmar Durumu:</Text>
                <Text>{queryResult.parcelInfo.zoning}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="bold" minW="120px">Yapı İzni:</Text>
                <Text>{queryResult.parcelInfo.constructionPermit}</Text>
              </HStack>
            </VStack>
          </Box>
          
          <Box>
            <Heading size="sm" mb={4}>Malik Bilgileri</Heading>
            
            {queryResult.ownerInfo.map((owner: any, index: number) => (
              <Box key={index} p={3} borderWidth="1px" borderRadius="md" mb={3}>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <Text fontWeight="bold" minW="120px">Malik:</Text>
                    <Text>{owner.name}</Text>
                  </HStack>
                  
                  <HStack>
                    <Text fontWeight="bold" minW="120px">Hisse:</Text>
                    <Text>{owner.share}</Text>
                  </HStack>
                  
                  <HStack>
                    <Text fontWeight="bold" minW="120px">Edinme Tarihi:</Text>
                    <Text>{owner.acquisitionDate}</Text>
                  </HStack>
                  
                  <HStack>
                    <Text fontWeight="bold" minW="120px">Edinme Nedeni:</Text>
                    <Text>{owner.acquisitionReason}</Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
            
            <Heading size="sm" mt={6} mb={4}>Takyidatlar</Heading>
            
            {queryResult.encumbrances.length === 0 ? (
              <Text color="gray.500">Takyidat bulunmamaktadır.</Text>
            ) : (
              queryResult.encumbrances.map((encumbrance: any, index: number) => (
                <Box key={index} p={3} borderWidth="1px" borderRadius="md" mb={3}>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Tür:</Text>
                      <Text>{encumbrance.type}</Text>
                    </HStack>
                    
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Lehtar:</Text>
                      <Text>{encumbrance.beneficiary}</Text>
                    </HStack>
                    
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Tutar:</Text>
                      <Text>{encumbrance.amount}</Text>
                    </HStack>
                    
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Tarih:</Text>
                      <Text>{encumbrance.date}</Text>
                    </HStack>
                  </VStack>
                </Box>
              ))
            )}
            
            <Heading size="sm" mt={6} mb={4}>Şerhler</Heading>
            
            {queryResult.annotations.length === 0 ? (
              <Text color="gray.500">Şerh bulunmamaktadır.</Text>
            ) : (
              queryResult.annotations.map((annotation: any, index: number) => (
                <Box key={index} p={3} borderWidth="1px" borderRadius="md" mb={3}>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Tür:</Text>
                      <Text>{annotation.type}</Text>
                    </HStack>
                    
                    <HStack>
                      <Text fontWeight="bold" minW="120px">İçerik:</Text>
                      <Text>{annotation.content}</Text>
                    </HStack>
                    
                    <HStack>
                      <Text fontWeight="bold" minW="120px">Tarih:</Text>
                      <Text>{annotation.date}</Text>
                    </HStack>
                    
                    {annotation.duration && (
                      <HStack>
                        <Text fontWeight="bold" minW="120px">Süre:</Text>
                        <Text>{annotation.duration}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))
            )}
          </Box>
        </SimpleGrid>
      </Box>
    );
  };
  
  const renderOwnerQueryResult = () => {
    if (!queryResult) return null;
    
    return (
      <Box mt={8} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="md">{queryResult.ownerName} - Taşınmaz Bilgileri</Heading>
          <HStack>
            <Button
              size="sm"
              leftIcon={<Icon as={Printer} />}
              onClick={handlePrintResult}
            >
              Yazdır
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Icon as={Download} />}
              onClick={handleDownloadResult}
            >
              İndir
            </Button>
          </HStack>
        </Flex>
        
        <Divider mb={6} />
        
        <Text mb={4}>Toplam {queryResult.properties.length} adet taşınmaz bulundu.</Text>
        
        {queryResult.properties.map((property: any, index: number) => (
          <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Text fontWeight="bold" minW="120px">İl:</Text>
                  <Text>{property.province}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">İlçe:</Text>
                  <Text>{property.district}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Mahalle:</Text>
                  <Text>{property.neighborhood}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Ada:</Text>
                  <Text>{property.block}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Parsel:</Text>
                  <Text>{property.parcel}</Text>
                </HStack>
              </VStack>
              
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Text fontWeight="bold" minW="120px">Nitelik:</Text>
                  <Text>{property.type}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Yüzölçümü:</Text>
                  <Text>{property.area}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Hisse:</Text>
                  <Text>{property.share}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Edinme Tarihi:</Text>
                  <Text>{property.acquisitionDate}</Text>
                </HStack>
                
                <Button
                  size="sm"
                  colorScheme="blue"
                  mt={2}
                  leftIcon={<Icon as={FileText} />}
                  onClick={() => {
                    // Simulate parcel query with this property's data
                    setParcelQueryForm({
                      province: property.province,
                      district: property.district,
                      neighborhood: property.neighborhood,
                      block: property.block,
                      parcel: property.parcel,
                    });
                    setActiveTab(0);
                    handleParcelQuery();
                  }}
                >
                  Detaylı Bilgi
                </Button>
              </VStack>
            </SimpleGrid>
          </Box>
        ))}
      </Box>
    );
  };
  
  return (
    <Box p={4}>
      <Heading mb={6}>Tapu Sorgulama</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={handleTabChange}>
        <TabList>
          <Tab>Ada/Parsel Sorgulama</Tab>
          <Tab>Adres Sorgulama</Tab>
          <Tab>Malik Sorgulama</Tab>
          <Tab>Sorgulama Geçmişi</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {renderParcelQueryForm()}
            {activeTab === 0 && renderParcelQueryResult()}
          </TabPanel>
          
          <TabPanel>
            {renderAddressQueryForm()}
            {activeTab === 1 && renderParcelQueryResult()}
          </TabPanel>
          
          <TabPanel>
            {renderOwnerQueryForm()}
            {activeTab === 2 && renderOwnerQueryResult()}
          </TabPanel>
          
          <TabPanel>
            {renderQueryHistory()}
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sorgu Detayı</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedQuery && (
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontWeight="bold" minW="120px">Tarih:</Text>
                  <Text>{selectedQuery.date}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">İl:</Text>
                  <Text>{selectedQuery.province}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">İlçe:</Text>
                  <Text>{selectedQuery.district}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Mahalle:</Text>
                  <Text>{selectedQuery.neighborhood || '-'}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Ada:</Text>
                  <Text>{selectedQuery.block}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Parsel:</Text>
                  <Text>{selectedQuery.parcel}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" minW="120px">Durum:</Text>
                  <Badge colorScheme="green">{selectedQuery.status}</Badge>
                </HStack>
                
                <Button
                  colorScheme="blue"
                  mt={2}
                  onClick={() => {
                    // Simulate parcel query with this query's data
                    setParcelQueryForm({
                      province: selectedQuery.province,
                      district: selectedQuery.district,
                      neighborhood: selectedQuery.neighborhood || '',
                      block: selectedQuery.block,
                      parcel: selectedQuery.parcel,
                    });
                    setActiveTab(0);
                    handleParcelQuery();
                    onDetailClose();
                  }}
                >
                  Yeniden Sorgula
                </Button>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button onClick={onDetailClose}>Kapat</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TitleDeedQuery;