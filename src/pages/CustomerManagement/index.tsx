import { useState } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Table,
  Thead, Tbody, Tr, Th, Td, Button, Flex, Icon, Input, InputGroup,
  InputLeftElement, Menu, MenuButton, MenuList, MenuItem, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Badge, Avatar, Text, HStack
} from '@chakra-ui/react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MessageSquare, Home } from 'react-feather';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';
import AIMatching from './AIMatching';

// Dummy data for demonstration
const dummyCustomers = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    phone: '0532 123 4567',
    email: 'ahmet.yilmaz@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '1.500.000 TL - 2.000.000 TL',
    preferences: '3+1, Merkez veya Göztepe',
    lastContact: '15.07.2023',
    notes: 'Acil ev arıyor, 2 hafta içinde taşınmak istiyor.',
  },
  {
    id: 2,
    name: 'Ayşe Demir',
    phone: '0533 456 7890',
    email: 'ayse.demir@example.com',
    status: 'Aktif',
    type: 'Satıcı',
    budget: '-',
    preferences: 'Ataşehir, 2+1 Daire',
    lastContact: '10.08.2023',
    notes: 'Evini satmak istiyor, değerleme yapıldı.',
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    phone: '0535 789 0123',
    email: 'mehmet.kaya@example.com',
    status: 'Pasif',
    type: 'Kiracı',
    budget: '8.000 TL - 12.000 TL/ay',
    preferences: 'Bahçelievler, 3+1 veya 4+1',
    lastContact: '01.06.2023',
    notes: 'Şu an için erteledi, 3 ay sonra tekrar aranacak.',
  },
  {
    id: 4,
    name: 'Zeynep Şahin',
    phone: '0536 234 5678',
    email: 'zeynep.sahin@example.com',
    status: 'Aktif',
    type: 'Alıcı',
    budget: '3.000.000 TL - 4.500.000 TL',
    preferences: 'Göztepe, Villa veya Bahçeli Ev',
    lastContact: '20.07.2023',
    notes: 'Lüks konut arıyor, bütçesi esnek.',
  },
];

const CustomerManagement = () => {
  const [customers, setCustomers] = useState(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isAIOpen, onOpen: onAIOpen, onClose: onAIClose } = useDisclosure();

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    onOpen();
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    onDetailOpen();
  };

  const handleDeleteCustomer = (id: number) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const handleAIMatching = (customer: any) => {
    setSelectedCustomer(customer);
    onAIOpen();
  };

  return (
    <Box pt="5" px={{ base: '4', md: '8' }}>
      <Heading mb="6" size="lg">Müşteri Yönetimi</Heading>
      
      <Tabs variant="enclosed" mb="6">
        <TabList>
          <Tab>Tüm Müşteriler</Tab>
          <Tab>Alıcılar</Tab>
          <Tab>Satıcılar</Tab>
          <Tab>Kiracılar</Tab>
          <Tab>Pasif Müşteriler</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <Flex justifyContent="space-between" mb="4" flexWrap="wrap" gap="2">
              <Flex gap="2" flexWrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Müşteri ara..." />
                </InputGroup>
                
                <Menu>
                  <MenuButton as={Button} rightIcon={<Filter />} variant="outline">
                    Filtrele
                  </MenuButton>
                  <MenuList>
                    <MenuItem>İsme Göre (A-Z)</MenuItem>
                    <MenuItem>İsme Göre (Z-A)</MenuItem>
                    <MenuItem>Son İletişime Göre</MenuItem>
                    <MenuItem>Müşteri Tipine Göre</MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={Plus} />}
                onClick={handleAddCustomer}
              >
                Yeni Müşteri
              </Button>
            </Flex>
            
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Müşteri</Th>
                    <Th>İletişim</Th>
                    <Th>Tip</Th>
                    <Th>Bütçe/Tercihler</Th>
                    <Th>Son İletişim</Th>
                    <Th>İşlemler</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((customer) => (
                    <Tr key={customer.id}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={customer.name} />
                          <Box>
                            <Text fontWeight="medium">{customer.name}</Text>
                            <Badge
                              colorScheme={customer.status === 'Aktif' ? 'green' : 'gray'}
                              fontSize="xs"
                            >
                              {customer.status}
                            </Badge>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{customer.phone}</Text>
                        <Text fontSize="xs" color="gray.500">{customer.email}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            customer.type === 'Alıcı' ? 'blue' :
                            customer.type === 'Satıcı' ? 'green' : 'purple'
                          }
                        >
                          {customer.type}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">{customer.budget}</Text>
                        <Text fontSize="xs" color="gray.500" noOfLines={1}>
                          {customer.preferences}
                        </Text>
                      </Td>
                      <Td>{customer.lastContact}</Td>
                      <Td>
                        <HStack spacing="1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Icon as={Eye} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Icon as={Edit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Icon as={Trash2} />
                          </Button>
                          {customer.type === 'Alıcı' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAIMatching(customer)}
                            >
                              <Icon as={Home} />
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Alıcılar İçeriği</Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Satıcılar İçeriği</Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Kiracılar İçeriği</Box>
          </TabPanel>
          
          <TabPanel>
            <Box>Pasif Müşteriler İçeriği</Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Customer Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCustomer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CustomerForm customer={selectedCustomer} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              İptal
            </Button>
            <Button colorScheme="blue">
              {selectedCustomer ? 'Güncelle' : 'Kaydet'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Müşteri Detayı</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CustomerDetail customer={selectedCustomer} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose}>
              Kapat
            </Button>
            <Button colorScheme="blue" onClick={() => {
              onDetailClose();
              handleEditCustomer(selectedCustomer);
            }}>
              Düzenle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* AI Matching Modal */}
      <Modal isOpen={isAIOpen} onClose={onAIClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI İlan Eşleştirme</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AIMatching customer={selectedCustomer} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAIClose}>
              Kapat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerManagement;