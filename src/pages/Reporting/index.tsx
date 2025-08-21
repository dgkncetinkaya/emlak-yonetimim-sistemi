import { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Select, Button, Flex, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup,
  useColorModeValue, Icon, Menu, MenuButton, MenuList, MenuItem, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Input, FormControl, FormLabel, Checkbox, CheckboxGroup, Stack, Portal,
  Card, CardBody, CardHeader, ButtonGroup
} from '@chakra-ui/react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  Calendar, Filter, Download, Printer, Share2, MoreVertical, 
  ChevronDown, FileText, PieChart as PieChartIcon, BarChart2, TrendingUp,
  DollarSign, Home, Users, Activity, MapPin
} from 'react-feather';

// Dummy data for charts
const salesData = [
  { name: 'Oca', value: 120000 },
  { name: 'Şub', value: 150000 },
  { name: 'Mar', value: 180000 },
  { name: 'Nis', value: 220000 },
  { name: 'May', value: 250000 },
  { name: 'Haz', value: 280000 },
  { name: 'Tem', value: 310000 },
  { name: 'Ağu', value: 290000 },
  { name: 'Eyl', value: 320000 },
  { name: 'Eki', value: 350000 },
  { name: 'Kas', value: 380000 },
  { name: 'Ara', value: 420000 },
];

const propertyTypeData = [
  { name: 'Daire', value: 45 },
  { name: 'Villa', value: 15 },
  { name: 'Müstakil Ev', value: 10 },
  { name: 'Arsa', value: 20 },
  { name: 'Dükkan', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Modern StatCard bileşeni
interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  helpText?: string;
  increase?: boolean;
  decrease?: boolean;
  percentage?: string;
  isWarning?: boolean;
}

const StatCard = (props: StatCardProps) => {
  const { title, stat, icon, helpText, increase, decrease, percentage, isWarning } = props;
  const borderColor = useColorModeValue(
    isWarning ? 'orange.300' : 'gray.200', 
    isWarning ? 'orange.600' : 'gray.500'
  );
  const bg = useColorModeValue(
    isWarning ? 'orange.50' : 'white', 
    isWarning ? 'orange.900' : 'gray.700'
  );
  const iconColor = useColorModeValue(
    isWarning ? 'orange.600' : 'gray.800', 
    isWarning ? 'orange.300' : 'gray.200'
  );
  
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={borderColor}
      rounded="lg"
      bg={bg}
      position="relative"
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <Flex align="center" gap={2}>
            <StatLabel fontWeight="medium" isTruncated>
              {title}
            </StatLabel>
            {isWarning && stat !== '0' && (
              <Badge colorScheme="orange" size="sm">
                Dikkat!
              </Badge>
            )}
          </Flex>
          <StatNumber fontSize="2xl" fontWeight="medium" color={isWarning ? 'orange.600' : undefined}>
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText color={isWarning ? 'orange.600' : undefined}>
              {increase && <StatArrow type="increase" />}
              {decrease && <StatArrow type="decrease" />}
              {percentage || helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={iconColor}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

const districtData = [
  { name: 'Kadıköy', value: 25 },
  { name: 'Beşiktaş', value: 20 },
  { name: 'Şişli', value: 15 },
  { name: 'Ataşehir', value: 12 },
  { name: 'Üsküdar', value: 18 },
  { name: 'Diğer', value: 10 },
];

const performanceData = [
  { name: 'Oca', sales: 4, listings: 12, showings: 18 },
  { name: 'Şub', sales: 6, listings: 15, showings: 22 },
  { name: 'Mar', sales: 8, listings: 18, showings: 28 },
  { name: 'Nis', sales: 10, listings: 20, showings: 32 },
  { name: 'May', sales: 12, listings: 22, showings: 38 },
  { name: 'Haz', sales: 14, listings: 25, showings: 42 },
  { name: 'Tem', sales: 16, listings: 28, showings: 48 },
  { name: 'Ağu', sales: 15, listings: 26, showings: 44 },
  { name: 'Eyl', sales: 18, listings: 30, showings: 52 },
  { name: 'Eki', sales: 20, listings: 32, showings: 58 },
  { name: 'Kas', sales: 22, listings: 35, showings: 62 },
  { name: 'Ara', sales: 25, listings: 38, showings: 68 },
];

const salesReportData = [
  {
    id: 1,
    date: '15.10.2023',
    property: 'Kadıköy 3+1 Daire',
    price: '4,500,000 TL',
    agent: 'Ahmet Yılmaz',
    commission: '135,000 TL',
    status: 'Tamamlandı',
  },
  {
    id: 2,
    date: '22.10.2023',
    property: 'Beşiktaş 2+1 Daire',
    price: '3,800,000 TL',
    agent: 'Ayşe Demir',
    commission: '114,000 TL',
    status: 'Tamamlandı',
  },
  {
    id: 3,
    date: '05.11.2023',
    property: 'Şişli Dükkan',
    price: '6,200,000 TL',
    agent: 'Mehmet Kaya',
    commission: '186,000 TL',
    status: 'Tamamlandı',
  },
  {
    id: 4,
    date: '12.11.2023',
    property: 'Ataşehir 4+1 Daire',
    price: '5,100,000 TL',
    agent: 'Zeynep Aydın',
    commission: '153,000 TL',
    status: 'Tamamlandı',
  },
  {
    id: 5,
    date: '20.11.2023',
    property: 'Üsküdar 3+1 Daire',
    price: '4,200,000 TL',
    agent: 'Ali Yıldız',
    commission: '126,000 TL',
    status: 'Tamamlandı',
  },
];

const rentalReportData = [
  {
    id: 1,
    date: '10.10.2023',
    property: 'Kadıköy 2+1 Daire',
    price: '12,000 TL/ay',
    agent: 'Ahmet Yılmaz',
    commission: '12,000 TL',
    status: 'Aktif',
  },
  {
    id: 2,
    date: '18.10.2023',
    property: 'Beşiktaş 1+1 Daire',
    price: '9,500 TL/ay',
    agent: 'Ayşe Demir',
    commission: '9,500 TL',
    status: 'Aktif',
  },
  {
    id: 3,
    date: '02.11.2023',
    property: 'Şişli Dükkan',
    price: '25,000 TL/ay',
    agent: 'Mehmet Kaya',
    commission: '25,000 TL',
    status: 'Aktif',
  },
  {
    id: 4,
    date: '08.11.2023',
    property: 'Ataşehir 3+1 Daire',
    price: '15,000 TL/ay',
    agent: 'Zeynep Aydın',
    commission: '15,000 TL',
    status: 'Aktif',
  },
  {
    id: 5,
    date: '15.11.2023',
    property: 'Üsküdar 2+1 Daire',
    price: '11,000 TL/ay',
    agent: 'Ali Yıldız',
    commission: '11,000 TL',
    status: 'Aktif',
  },
];

const agentPerformanceData = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    sales: 12,
    rentals: 8,
    showings: 45,
    commission: '285,000 TL',
    conversionRate: '26.7%',
  },
  {
    id: 2,
    name: 'Ayşe Demir',
    sales: 10,
    rentals: 12,
    showings: 52,
    commission: '264,000 TL',
    conversionRate: '19.2%',
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    sales: 15,
    rentals: 6,
    showings: 58,
    commission: '342,000 TL',
    conversionRate: '25.9%',
  },
  {
    id: 4,
    name: 'Zeynep Aydın',
    sales: 8,
    rentals: 15,
    showings: 48,
    commission: '228,000 TL',
    conversionRate: '16.7%',
  },
  {
    id: 5,
    name: 'Ali Yıldız',
    sales: 11,
    rentals: 9,
    showings: 50,
    commission: '270,000 TL',
    conversionRate: '22.0%',
  },
];

const Reporting = () => {
  const [dateRange, setDateRange] = useState('year');
  const [reportType, setReportType] = useState('all');
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };
  
  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    onExportClose();
    // Simulate export
    setTimeout(() => {
      alert('Rapor başarıyla dışa aktarıldı!');
    }, 1000);
  };
  
  // Modern istatistik verileri
  const stats = [
    {
      title: 'Toplam Satış',
      stat: '₺3.2M',
      icon: DollarSign,
      helpText: '23.36%',
      increase: true
    },
    {
      title: 'Toplam Kiralama',
      stat: '₺420K',
      icon: Home,
      helpText: '14.05%',
      increase: true
    },
    {
      title: 'Aktif Portföy',
      stat: '128',
      icon: Activity,
      helpText: '9.52%',
      increase: true
    },
    {
      title: 'Toplam Komisyon',
      stat: '₺1.2M',
      icon: TrendingUp,
      helpText: '18.24%',
      increase: true
    }
  ];

  const renderDashboard = () => (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            stat={stat.stat}
            icon={stat.icon}
            helpText={stat.helpText}
            increase={stat.increase}
          />
        ))}
      </SimpleGrid>
      
      {/* Grafik Kartları */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card bg={bgColor} shadow="xl">
          <CardHeader>
            <Flex align="center" gap={3}>
              <Icon as={BarChart2} w={6} h={6} color="blue.500" />
              <Heading size="md">Aylık Satış Performansı</Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₺${value.toLocaleString()}`, 'Satış']} />
                <Bar dataKey="value" fill="#3182CE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} shadow="xl">
          <CardHeader>
            <Flex align="center" gap={3}>
              <Icon as={PieChartIcon} w={6} h={6} color="green.500" />
              <Heading size="md">Emlak Türü Dağılımı</Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Performans Grafiği */}
      <Card bg={bgColor} shadow="xl" mb={8}>
        <CardHeader>
          <Flex align="center" gap={3}>
            <Icon as={TrendingUp} w={6} h={6} color="purple.500" />
            <Heading size="md">Yıllık Performans Trendi</Heading>
          </Flex>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3182CE" strokeWidth={3} name="Satışlar" />
              <Line type="monotone" dataKey="listings" stroke="#38A169" strokeWidth={3} name="İlanlar" />
              <Line type="monotone" dataKey="showings" stroke="#D69E2E" strokeWidth={3} name="Geziler" />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </Box>
  );
  
  const renderSalesReport = () => (
    <Box
      bg={bgColor}
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      rounded="lg"
      boxShadow="sm"
    >
      <Heading size="md" mb={6}>Satış Raporu</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>Tarih</Th>
              <Th>Emlak</Th>
              <Th>Fiyat</Th>
              <Th>Danışman</Th>
              <Th>Komisyon</Th>
              <Th>Durum</Th>
            </Tr>
          </Thead>
          <Tbody>
            {salesReportData.map((item) => (
              <Tr key={item.id}>
                <Td>{item.date}</Td>
                <Td>{item.property}</Td>
                <Td>{item.price}</Td>
                <Td>{item.agent}</Td>
                <Td>{item.commission}</Td>
                <Td>
                  <Badge colorScheme="green">{item.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      <Flex justify="flex-end" mt={4}>
        <Text>Toplam Satış: 5 | Toplam Komisyon: 714,000 TL</Text>
      </Flex>
    </Box>
  );
  
  const renderRentalReport = () => (
    <Box
      bg={bgColor}
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      rounded="lg"
      boxShadow="sm"
    >
      <Heading size="md" mb={6}>Kiralama Raporu</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>Tarih</Th>
              <Th>Emlak</Th>
              <Th>Fiyat</Th>
              <Th>Danışman</Th>
              <Th>Komisyon</Th>
              <Th>Durum</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rentalReportData.map((item) => (
              <Tr key={item.id}>
                <Td>{item.date}</Td>
                <Td>{item.property}</Td>
                <Td>{item.price}</Td>
                <Td>{item.agent}</Td>
                <Td>{item.commission}</Td>
                <Td>
                  <Badge colorScheme="blue">{item.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      <Flex justify="flex-end" mt={4}>
        <Text>Toplam Kiralama: 5 | Toplam Komisyon: 72,500 TL</Text>
      </Flex>
    </Box>
  );
  
  const renderAgentPerformance = () => (
    <Box
      bg={bgColor}
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      rounded="lg"
      boxShadow="sm"
    >
      <Heading size="md" mb={6}>Danışman Performansı</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>Danışman</Th>
              <Th>Satışlar</Th>
              <Th>Kiralamalar</Th>
              <Th>Gösterimler</Th>
              <Th>Komisyon</Th>
              <Th>Dönüşüm Oranı</Th>
            </Tr>
          </Thead>
          <Tbody>
            {agentPerformanceData.map((item) => (
              <Tr key={item.id}>
                <Td>{item.name}</Td>
                <Td>{item.sales}</Td>
                <Td>{item.rentals}</Td>
                <Td>{item.showings}</Td>
                <Td>{item.commission}</Td>
                <Td>{item.conversionRate}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      <Flex justify="flex-end" mt={4}>
        <Text>Toplam Danışman: 5 | Ortalama Dönüşüm Oranı: 22.1%</Text>
      </Flex>
    </Box>
  );
  
  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Modern Başlık ve Kontroller */}
      <Card bg={bgColor} shadow="xl" mb={6}>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
            <Box mb={{ base: 4, md: 0 }}>
              <Flex align="center" gap={3}>
                <Icon as={BarChart2} w={8} h={8} color="blue.500" />
                <Box>
                  <Heading size="lg" color="blue.600">Raporlama Merkezi</Heading>
                  <Text color="gray.600" fontSize="sm">Detaylı analiz ve performans raporları</Text>
                </Box>
              </Flex>
            </Box>
            
            <HStack spacing={3} flexWrap="wrap">
              <Select
                value={dateRange}
                onChange={handleDateRangeChange}
                w={{ base: 'full', md: '200px' }}
                bg={bgColor}
                borderColor="gray.300"
                _hover={{ borderColor: 'blue.400' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182CE' }}
              >
                <option value="today">Bugün</option>
                <option value="week">Bu Hafta</option>
                <option value="month">Bu Ay</option>
                <option value="quarter">Bu Çeyrek</option>
                <option value="year">Bu Yıl</option>
                <option value="custom">Özel Aralık</option>
              </Select>
              
              <Button 
                leftIcon={<Icon as={Filter} />} 
                onClick={onFilterOpen}
                colorScheme="blue"
                variant="outline"
                _hover={{ bg: 'blue.50' }}
              >
                Filtrele
              </Button>
              
              <Menu strategy="fixed">
                <MenuButton 
                  as={Button} 
                  rightIcon={<Icon as={ChevronDown} />}
                  colorScheme="blue"
                  variant="solid"
                >
                  İşlemler
                </MenuButton>
                <Portal>
                  <MenuList zIndex={9999} bg={bgColor} shadow="xl">
                    <MenuItem icon={<Icon as={Printer} />} onClick={handlePrint} _hover={{ bg: 'blue.50' }}>
                      Yazdır
                    </MenuItem>
                    <MenuItem icon={<Icon as={Download} />} onClick={onExportOpen} _hover={{ bg: 'blue.50' }}>
                      Dışa Aktar
                    </MenuItem>
                    <MenuItem icon={<Icon as={Share2} />} _hover={{ bg: 'blue.50' }}>
                      Paylaş
                    </MenuItem>
                    <MenuItem icon={<Icon as={Calendar} />} _hover={{ bg: 'blue.50' }}>
                      Zamanla
                    </MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </HStack>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Modern Tab Tasarımı */}
      <Card bg={bgColor} shadow="xl">
        <Tabs variant="soft-rounded" colorScheme="blue">
          <CardHeader>
            <TabList bg="gray.50" p={2} rounded="lg">
              <Tab _selected={{ color: 'white', bg: 'blue.500' }} fontWeight="medium">
                <Icon as={BarChart2} w={4} h={4} mr={2} />
                Genel Bakış
              </Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.500' }} fontWeight="medium">
                <Icon as={DollarSign} w={4} h={4} mr={2} />
                Satış Raporu
              </Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.500' }} fontWeight="medium">
                <Icon as={Home} w={4} h={4} mr={2} />
                Kiralama Raporu
              </Tab>
              <Tab _selected={{ color: 'white', bg: 'blue.500' }} fontWeight="medium">
                <Icon as={Users} w={4} h={4} mr={2} />
                Danışman Performansı
              </Tab>
            </TabList>
          </CardHeader>
          
          <CardBody>
              <TabPanels>
                <TabPanel p={0}>
                  {renderDashboard()}
                </TabPanel>
                
                <TabPanel p={0}>
                  {renderSalesReport()}
                </TabPanel>
                
                <TabPanel p={0}>
                  {renderRentalReport()}
                </TabPanel>
                
                <TabPanel p={0}>
                  {renderAgentPerformance()}
                </TabPanel>
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      
      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rapor Filtresi</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Rapor Türü</FormLabel>
                <Select value={reportType} onChange={handleReportTypeChange}>
                  <option value="all">Tümü</option>
                  <option value="sales">Satışlar</option>
                  <option value="rentals">Kiralamalar</option>
                  <option value="listings">Portföy</option>
                  <option value="agents">Danışmanlar</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Tarih Aralığı</FormLabel>
                <SimpleGrid columns={2} spacing={4}>
                  <Input type="date" placeholder="Başlangıç" />
                  <Input type="date" placeholder="Bitiş" />
                </SimpleGrid>
              </FormControl>
              
              <FormControl>
                <FormLabel>Bölge</FormLabel>
                <CheckboxGroup>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    <Checkbox value="kadikoy">Kadıköy</Checkbox>
                    <Checkbox value="besiktas">Beşiktaş</Checkbox>
                    <Checkbox value="sisli">Şişli</Checkbox>
                    <Checkbox value="atasehir">Ataşehir</Checkbox>
                    <Checkbox value="uskudar">Üsküdar</Checkbox>
                    <Checkbox value="other">Diğer</Checkbox>
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Emlak Tipi</FormLabel>
                <CheckboxGroup>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    <Checkbox value="apartment">Daire</Checkbox>
                    <Checkbox value="villa">Villa</Checkbox>
                    <Checkbox value="house">Müstakil Ev</Checkbox>
                    <Checkbox value="land">Arsa</Checkbox>
                    <Checkbox value="commercial">Ticari</Checkbox>
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Danışman</FormLabel>
                <CheckboxGroup>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    <Checkbox value="ahmet">Ahmet Yılmaz</Checkbox>
                    <Checkbox value="ayse">Ayşe Demir</Checkbox>
                    <Checkbox value="mehmet">Mehmet Kaya</Checkbox>
                    <Checkbox value="zeynep">Zeynep Aydın</Checkbox>
                    <Checkbox value="ali">Ali Yıldız</Checkbox>
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onFilterClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={onFilterClose}>
              Uygula
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Export Modal */}
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Raporu Dışa Aktar</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Format</FormLabel>
                <Select defaultValue="pdf">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>İçerik</FormLabel>
                <CheckboxGroup defaultValue={['data', 'charts']}>
                  <Stack spacing={2}>
                    <Checkbox value="data">Veri Tabloları</Checkbox>
                    <Checkbox value="charts">Grafikler</Checkbox>
                    <Checkbox value="summary">Özet Bilgiler</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onExportClose}>
              İptal
            </Button>
            <Button colorScheme="blue" onClick={handleExport}>
              Dışa Aktar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Reporting;