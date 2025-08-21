import { useState } from 'react';
import {
  Box, Heading, VStack, HStack, Text, Select, Button, Flex, SimpleGrid,
  Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, StatGroup,
  useColorModeValue, Icon, Menu, MenuButton, MenuList, MenuItem, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Input, FormControl, FormLabel, Checkbox, CheckboxGroup, Stack, Portal,
  ButtonGroup, IconButton, Spacer, useToast
} from '@chakra-ui/react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, AreaChart
} from 'recharts';
import { 
  Calendar, Filter, Download, Printer, Share2, MoreVertical, 
  ChevronDown, FileText, PieChart as PieChartIcon, BarChart2, TrendingUp,
  DollarSign, Home, Users, Activity, MapPin, ArrowUp, ArrowDown, Eye
} from 'react-feather';

// Gelişmiş veri yapıları
const yearlyComparisonData = [
  { month: 'Oca', sales2024: 12, sales2025: 15, rentals2024: 8, rentals2025: 10, commission2024: 180000, commission2025: 225000 },
  { month: 'Şub', sales2024: 14, sales2025: 18, rentals2024: 10, rentals2025: 12, commission2024: 210000, commission2025: 270000 },
  { month: 'Mar', sales2024: 16, sales2025: 20, rentals2024: 12, rentals2025: 15, commission2024: 240000, commission2025: 315000 },
  { month: 'Nis', sales2024: 18, sales2025: 22, rentals2024: 14, rentals2025: 18, commission2024: 270000, commission2025: 360000 },
  { month: 'May', sales2024: 20, sales2025: 25, rentals2024: 16, rentals2025: 20, commission2024: 300000, commission2025: 405000 },
  { month: 'Haz', sales2024: 22, sales2025: 28, rentals2024: 18, rentals2025: 22, commission2024: 330000, commission2025: 450000 },
  { month: 'Tem', sales2024: 24, sales2025: 30, rentals2024: 20, rentals2025: 25, commission2024: 360000, commission2025: 495000 },
  { month: 'Ağu', sales2024: 26, sales2025: 32, rentals2024: 22, rentals2025: 28, commission2024: 390000, commission2025: 540000 },
  { month: 'Eyl', sales2024: 28, sales2025: 35, rentals2024: 24, rentals2025: 30, commission2024: 420000, commission2025: 585000 },
  { month: 'Eki', sales2024: 30, sales2025: 38, rentals2024: 26, rentals2025: 32, commission2024: 450000, commission2025: 630000 },
  { month: 'Kas', sales2024: 32, sales2025: 40, rentals2024: 28, rentals2025: 35, commission2024: 480000, commission2025: 675000 },
  { month: 'Ara', sales2024: 35, sales2025: 42, rentals2024: 30, rentals2025: 38, commission2024: 525000, commission2025: 720000 },
];

const agentPerformanceData = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    sales: 42,
    rentals: 28,
    showings: 156,
    totalCommission: 1250000,
    salesCommission: 850000,
    rentalCommission: 400000,
    conversionRate: 26.9,
    district: 'Kadıköy',
    propertyTypes: ['Daire', 'Villa']
  },
  {
    id: 2,
    name: 'Ayşe Demir',
    sales: 38,
    rentals: 35,
    showings: 142,
    totalCommission: 1180000,
    salesCommission: 760000,
    rentalCommission: 420000,
    conversionRate: 25.4,
    district: 'Beşiktaş',
    propertyTypes: ['Daire', 'Dükkan']
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    sales: 45,
    rentals: 22,
    showings: 168,
    totalCommission: 1320000,
    salesCommission: 900000,
    rentalCommission: 420000,
    conversionRate: 28.6,
    district: 'Şişli',
    propertyTypes: ['Villa', 'Arsa']
  },
  {
    id: 4,
    name: 'Zeynep Aydın',
    sales: 35,
    rentals: 40,
    showings: 135,
    totalCommission: 1050000,
    salesCommission: 630000,
    rentalCommission: 420000,
    conversionRate: 24.1,
    district: 'Ataşehir',
    propertyTypes: ['Daire', 'Dükkan']
  },
  {
    id: 5,
    name: 'Can Özkan',
    sales: 40,
    rentals: 30,
    showings: 150,
    totalCommission: 1200000,
    salesCommission: 800000,
    rentalCommission: 400000,
    conversionRate: 27.3,
    district: 'Üsküdar',
    propertyTypes: ['Villa', 'Arsa']
  }
];

const commissionDistributionData = [
  { name: 'Satış Komisyonu', value: 4940000 },
  { name: 'Kiralama Komisyonu', value: 2060000 }
];

const agentCommissionData = agentPerformanceData.map(agent => ({
  name: agent.name,
  total: agent.totalCommission
}));

// Diğer veri yapıları
const propertyTypeData = [
  { name: 'Daire', value: 45 },
  { name: 'Villa', value: 25 },
  { name: 'Arsa', value: 15 },
  { name: 'Dükkan', value: 15 }
];

const COLORS = ['#3182CE', '#38A169', '#D69E2E', '#E53E3E'];

const districtData = [
  { district: 'Kadıköy', sales: 45 },
  { district: 'Beşiktaş', sales: 38 },
  { district: 'Şişli', sales: 42 },
  { district: 'Ataşehir', sales: 35 },
  { district: 'Üsküdar', sales: 40 }
];

const performanceData = [
  { month: 'Oca', sales: 12 },
  { month: 'Şub', sales: 19 },
  { month: 'Mar', sales: 15 },
  { month: 'Nis', sales: 25 },
  { month: 'May', sales: 22 },
  { month: 'Haz', sales: 30 }
];

const salesReportData = [
  {
    id: 1,
    date: '2024-01-15',
    property: 'Kadıköy 3+1 Daire',
    price: 2500000,
    agent: 'Ahmet Yılmaz',
    commission: 75000,
    status: 'Tamamlandı'
  },
  {
    id: 2,
    date: '2024-01-18',
    property: 'Beşiktaş 2+1 Daire',
    price: 1800000,
    agent: 'Ayşe Demir',
    commission: 54000,
    status: 'Tamamlandı'
  }
];

const rentalReportData = [
  {
    id: 1,
    date: '2024-01-10',
    property: 'Şişli 2+1 Daire',
    monthlyRent: 15000,
    agent: 'Mehmet Kaya',
    commission: 15000,
    status: 'Aktif'
  }
];

const StatCard = ({ title, stat, icon, helpText, increase, isWarning = false }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="lg"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
    >
      <Stat>
        <Flex justify="space-between" align="center">
          <Box>
            <StatLabel fontSize="sm" color={isWarning ? 'orange.500' : 'gray.500'}>
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" color={isWarning ? 'orange.500' : 'inherit'}>
              {stat}
            </StatNumber>
            {helpText && (
              <StatHelpText mb={0}>
                <StatArrow type={increase ? 'increase' : 'decrease'} />
                {helpText}
              </StatHelpText>
            )}
          </Box>
          <Box color={isWarning ? 'orange.500' : 'blue.500'}>
            {icon}
          </Box>
        </Flex>
      </Stat>
    </Box>
  );
};

const Reporting = () => {
  const [dateRange, setDateRange] = useState('year');
  const [reportType, setReportType] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [sortBy, setSortBy] = useState('totalCommission');
  const [sortOrder, setSortOrder] = useState('desc');
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const filteredAgentData = agentPerformanceData
    .filter(agent => {
      if (selectedAgent !== 'all' && agent.name !== selectedAgent) return false;
      if (selectedDistrict !== 'all' && agent.district !== selectedDistrict) return false;
      if (selectedPropertyType !== 'all' && !agent.propertyTypes.includes(selectedPropertyType)) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'sales':
          aValue = a.sales;
          bValue = b.sales;
          break;
        case 'rentals':
          aValue = a.rentals;
          bValue = b.rentals;
          break;
        case 'showings':
          aValue = a.showings;
          bValue = b.showings;
          break;
        case 'totalCommission':
        default:
          aValue = a.totalCommission;
          bValue = b.totalCommission;
          break;
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  
  const resetFilters = () => {
    setSelectedAgent('all');
    setSelectedPropertyType('all');
    setSelectedDistrict('all');
    toast({
      title: 'Filtreler sıfırlandı',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExport = () => {
    onExportOpen();
  };
  
  const stats = [
    {
      title: 'Toplam Satış',
      stat: '₺12.5M',
      icon: <DollarSign size={24} />,
      helpText: '12% artış',
      increase: true
    },
    {
      title: 'Aktif İlanlar',
      stat: '248',
      icon: <Home size={24} />,
      helpText: '8% artış',
      increase: true
    },
    {
      title: 'Toplam Müşteri',
      stat: '1,429',
      icon: <Users size={24} />,
      helpText: '15% artış',
      increase: true
    },
    {
      title: 'Ortalama Komisyon',
      stat: '₺45K',
      icon: <Activity size={24} />,
      helpText: '5% azalış',
      increase: false
    }
  ];

  const renderAdvancedFilters = () => (
    <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor} mb={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold">Gelişmiş Filtreler</Text>
        <Button size="sm" variant="outline" onClick={resetFilters}>
          Filtreleri Sıfırla
        </Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <FormControl>
          <FormLabel fontSize="sm">Danışman</FormLabel>
          <Select size="sm" value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
            <option value="all">Tüm Danışmanlar</option>
            {agentPerformanceData.map(agent => (
              <option key={agent.name} value={agent.name}>{agent.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Emlak Türü</FormLabel>
          <Select size="sm" value={selectedPropertyType} onChange={(e) => setSelectedPropertyType(e.target.value)}>
            <option value="all">Tüm Türler</option>
            <option value="Daire">Daire</option>
            <option value="Villa">Villa</option>
            <option value="Arsa">Arsa</option>
            <option value="Dükkan">Dükkan</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Bölge</FormLabel>
          <Select size="sm" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            <option value="all">Tüm Bölgeler</option>
            <option value="Kadıköy">Kadıköy</option>
            <option value="Beşiktaş">Beşiktaş</option>
            <option value="Şişli">Şişli</option>
            <option value="Ataşehir">Ataşehir</option>
            <option value="Üsküdar">Üsküdar</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Sıralama</FormLabel>
          <Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="totalCommission">Toplam Komisyon</option>
            <option value="sales">Satış Sayısı</option>
            <option value="rentals">Kiralama Sayısı</option>
            <option value="showings">Gösterim Sayısı</option>
          </Select>
        </FormControl>
      </SimpleGrid>
    </Box>
  );

  const renderPerformanceTable = () => (
    <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor} mb={6}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>Kişi Bazlı Performans Metrikleri</Text>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Danışman</Th>
              <Th cursor="pointer" onClick={() => handleSort('sales')}>
                <HStack>
                  <Text>Satış Sayısı</Text>
                  {sortBy === 'sales' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('rentals')}>
                <HStack>
                  <Text>Kiralama Sayısı</Text>
                  {sortBy === 'rentals' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('totalCommission')}>
                <HStack>
                  <Text>Toplam Komisyon</Text>
                  {sortBy === 'totalCommission' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('showings')}>
                <HStack>
                  <Text>Gösterim Sayısı</Text>
                  {sortBy === 'showings' && (
                    sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </HStack>
              </Th>
              <Th>Bölge</Th>
              <Th>Dönüşüm Oranı</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAgentData.map((agent, index) => (
              <Tr key={index}>
                <Td fontWeight="medium">{agent.name}</Td>
                <Td>
                  <Badge colorScheme="blue" variant="subtle">
                    {agent.sales}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme="green" variant="subtle">
                    {agent.rentals}
                  </Badge>
                </Td>
                <Td fontWeight="bold" color="green.500">
                  ₺{agent.totalCommission.toLocaleString()}
                </Td>
                <Td>
                  <HStack>
                    <Eye size={16} />
                    <Text>{agent.showings}</Text>
                  </HStack>
                </Td>
                <Td>{agent.district}</Td>
                <Td>
                  <Badge colorScheme={agent.conversionRate > 25 ? 'green' : 'orange'}>
                    {agent.conversionRate}%
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );

  const renderYearlyComparison = () => (
    <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor} mb={6}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>Yıllık Karşılaştırmalı Analiz (2024 vs 2025)</Text>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={yearlyComparisonData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="sales2024" fill="#3182CE" name="2024 Satış" />
          <Bar yAxisId="left" dataKey="sales2025" fill="#63B3ED" name="2025 Satış" />
          <Line yAxisId="right" type="monotone" dataKey="commission2024" stroke="#E53E3E" strokeWidth={2} name="2024 Komisyon" />
          <Line yAxisId="right" type="monotone" dataKey="commission2025" stroke="#FC8181" strokeWidth={2} name="2025 Komisyon" />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderCommissionDistribution = () => (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
      <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>Komisyon Dağılımı (Satış vs Kiralama)</Text>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={commissionDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {commissionDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#3182CE' : '#38A169'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      
      <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>Danışman Bazında Komisyon Dağılımı</Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentCommissionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value) => `₺${value.toLocaleString()}`} />
            <Bar dataKey="total" fill="#38A169" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </SimpleGrid>
  );

  const renderDashboard = () => (
    <Box>
      {renderAdvancedFilters()}
      {renderPerformanceTable()}
      {renderYearlyComparison()}
      {renderCommissionDistribution()}
      
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

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
          <HStack mb={4}>
            <BarChart2 size={24} color="#3182CE" />
            <Text fontSize="lg" fontWeight="bold">Aylık Satış Performansı</Text>
          </HStack>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3182CE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor}>
          <HStack mb={4}>
            <PieChartIcon size={24} color="#38A169" />
            <Text fontSize="lg" fontWeight="bold">Emlak Türü Dağılımı</Text>
          </HStack>
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
        </Box>
      </SimpleGrid>

      <Box bg={bgColor} p={6} borderRadius="lg" border="1px" borderColor={borderColor} mb={8}>
        <HStack mb={4}>
          <TrendingUp size={24} color="#805AD5" />
          <Text fontSize="lg" fontWeight="bold">Yıllık Performans Trendi</Text>
        </HStack>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3182CE" strokeWidth={3} name="Satışlar" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
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
            {salesReportData.map((sale) => (
              <Tr key={sale.id}>
                <Td>{new Date(sale.date).toLocaleDateString('tr-TR')}</Td>
                <Td fontWeight="medium">{sale.property}</Td>
                <Td color="green.500" fontWeight="bold">
                  ₺{sale.price.toLocaleString()}
                </Td>
                <Td>{sale.agent}</Td>
                <Td color="blue.500" fontWeight="medium">
                  ₺{sale.commission.toLocaleString()}
                </Td>
                <Td>
                  <Badge colorScheme="green" variant="subtle">
                    {sale.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      
      <Divider my={6} />
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Stat>
          <StatLabel>Toplam Satış</StatLabel>
          <StatNumber color="green.500">
            ₺{salesReportData.reduce((sum, sale) => sum + sale.price, 0).toLocaleString()}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Toplam Komisyon</StatLabel>
          <StatNumber color="blue.500">
            ₺{salesReportData.reduce((sum, sale) => sum + sale.commission, 0).toLocaleString()}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Satış Sayısı</StatLabel>
          <StatNumber>{salesReportData.length}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" mb={2}>Raporlama ve Analiz</Heading>
            <Text color="gray.500">Detaylı performans metrikleri ve iş analitiği</Text>
          </Box>
          
          <HStack spacing={3}>
            <Select
              size="sm"
              value={dateRange}
              onChange={handleDateRangeChange}
              w="auto"
              minW="120px"
            >
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
            </Select>
            
            <Button
              leftIcon={<Filter size={16} />}
              size="sm"
              variant="outline"
              onClick={onFilterOpen}
            >
              Filtrele
            </Button>
            
            <Menu>
              <MenuButton as={Button} size="sm" variant="outline" rightIcon={<ChevronDown size={16} />}>
                Dışa Aktar
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Download size={16} />} onClick={handleExport}>
                  Excel Olarak İndir
                </MenuItem>
                <MenuItem icon={<FileText size={16} />}>
                  PDF Olarak İndir
                </MenuItem>
                <MenuItem icon={<Printer size={16} />} onClick={handlePrint}>
                  Yazdır
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Satış Raporu</Tab>
            <Tab>Kiralama Raporu</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {renderDashboard()}
            </TabPanel>
            
            <TabPanel px={0}>
              {renderSalesReport()}
            </TabPanel>
            
            <TabPanel px={0}>
              <Text>Kiralama raporu içeriği buraya gelecek...</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      
      <Modal isOpen={isExportOpen} onClose={onExportClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Raporu Dışa Aktar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Rapor başarıyla Excel formatında dışa aktarıldı.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onExportClose}>
              Tamam
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Reporting;