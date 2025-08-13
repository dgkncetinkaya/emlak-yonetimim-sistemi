import {
  Box, VStack, HStack, Text, Badge, Divider, Heading, Avatar,
  Tabs, TabList, Tab, TabPanels, TabPanel, Table, Thead, Tbody, Tr, Th, Td,
  useColorModeValue, SimpleGrid
} from '@chakra-ui/react';

interface CustomerDetailProps {
  customer: any;
}

const CustomerDetail = ({ customer }: CustomerDetailProps) => {
  if (!customer) return null;
  
  // Dummy data for demonstration
  const interactions = [
    { date: '15.07.2023', type: 'Telefon', notes: 'Müşteri ile ilk görüşme yapıldı, ihtiyaçları belirlendi.' },
    { date: '20.07.2023', type: 'E-posta', notes: 'Müşteriye uygun ilanlar gönderildi.' },
    { date: '25.07.2023', type: 'Yüz Yüze', notes: 'Göztepe\'deki daireyi gösterdik, beğendi ancak fiyatı yüksek buldu.' },
    { date: '01.08.2023', type: 'Telefon', notes: 'Fiyat düşüşü hakkında bilgilendirme yapıldı, tekrar düşünecek.' },
  ];
  
  const properties = [
    { date: '20.07.2023', property: 'Merkez Mah. 3+1 Daire', status: 'Gösterildi', notes: 'Beğendi, düşünecek.' },
    { date: '25.07.2023', property: 'Göztepe Deniz Manzaralı', status: 'Gösterildi', notes: 'Çok beğendi, fiyat pazarlığı yapılacak.' },
    { date: '01.08.2023', property: 'Bahçelievler 2+1', status: 'Önerildi', notes: 'Henüz gösterilmedi.' },
  ];
  
  return (
    <Box>
      <HStack spacing={4} mb={6} align="flex-start">
        <Avatar size="xl" name={customer.name} />
        
        <VStack align="flex-start" spacing={1} flex={1}>
          <Heading size="md">{customer.name}</Heading>
          
          <HStack>
            <Badge
              colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
            >
              {customer.status}
            </Badge>
            
            <Badge
              colorScheme={
                customer.type === 'Alıcı' ? 'blue' :
                customer.type === 'Satıcı' ? 'green' : 'purple'
              }
            >
              {customer.type}
            </Badge>
          </HStack>
          
          <Text>{customer.phone}</Text>
          <Text color="gray.600">{customer.email}</Text>
        </VStack>
      </HStack>
      
      <Divider mb={6} />
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Box>
          <Heading size="sm" mb={2}>Bütçe</Heading>
          <Text>{customer.budget}</Text>
        </Box>
        
        <Box>
          <Heading size="sm" mb={2}>Tercihler</Heading>
          <Text>{customer.preferences}</Text>
        </Box>
      </SimpleGrid>
      
      <Box mb={6}>
        <Heading size="sm" mb={2}>Notlar</Heading>
        <Box
          p={3}
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderRadius="md"
        >
          <Text>{customer.notes}</Text>
        </Box>
      </Box>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Görüşme Geçmişi</Tab>
          <Tab>Gösterilen Gayrimenkuller</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Tarih</Th>
                  <Th>Tür</Th>
                  <Th>Notlar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {interactions.map((interaction, index) => (
                  <Tr key={index}>
                    <Td>{interaction.date}</Td>
                    <Td>{interaction.type}</Td>
                    <Td>{interaction.notes}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          
          <TabPanel>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Tarih</Th>
                  <Th>Gayrimenkul</Th>
                  <Th>Durum</Th>
                  <Th>Notlar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {properties.map((property, index) => (
                  <Tr key={index}>
                    <Td>{property.date}</Td>
                    <Td>{property.property}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          property.status === 'Gösterildi' ? 'green' :
                          property.status === 'Önerildi' ? 'blue' : 'gray'
                        }
                      >
                        {property.status}
                      </Badge>
                    </Td>
                    <Td>{property.notes}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default CustomerDetail;