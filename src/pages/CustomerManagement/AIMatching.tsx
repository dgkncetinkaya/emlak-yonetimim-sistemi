import { useState, useEffect } from 'react';
import {
  Box, VStack, Text, Button, SimpleGrid, Flex, Badge, Image,
  Heading, Divider, useToast, Skeleton
} from '@chakra-ui/react';

interface AIMatchingProps {
  customer: any;
}

const AIMatching = ({ customer }: AIMatchingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  const toast = useToast();

  // Dummy data for demonstration
  const dummyProperties = [
    {
      id: 1,
      title: 'Merkez Mahallesi 3+1 Daire',
      price: '1.850.000 TL',
      location: 'Merkez Mah. Atatürk Cad. No:123',
      type: 'Satılık',
      size: '145m²',
      rooms: '3+1',
      matchScore: 95,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZWRmMmYyIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzMzIiBmb250LXNpemU9IjE2Ij5QbGFjZWhvbGRlciBJbWFnZTwvdGV4dD4KPC9zdmc+',
      matchReasons: ['Bütçeye uygun', 'İstenen bölgede', 'Oda sayısı uyumlu'],
    },
    {
      id: 2,
      title: 'Göztepe Deniz Manzaralı Daire',
      price: '2.100.000 TL',
      location: 'Göztepe Mah. Sahil Cad. No:45',
      type: 'Satılık',
      size: '160m²',
      rooms: '3+1',
      matchScore: 87,
      image: 'https://via.placeholder.com/300x200',
      matchReasons: ['İstenen bölgede', 'Oda sayısı uyumlu', 'Deniz manzaralı'],
    },
    {
      id: 3,
      title: 'Merkez Mahallesi Yeni Bina',
      price: '1.650.000 TL',
      location: 'Merkez Mah. Cumhuriyet Cad. No:78',
      type: 'Satılık',
      size: '130m²',
      rooms: '2+1',
      matchScore: 82,
      image: 'https://via.placeholder.com/300x200',
      matchReasons: ['Bütçeye uygun', 'İstenen bölgede', 'Yeni bina'],
    },
    {
      id: 4,
      title: 'Bahçelievler Geniş Daire',
      price: '1.950.000 TL',
      location: 'Bahçelievler Mah. Park Cad. No:12',
      type: 'Satılık',
      size: '170m²',
      rooms: '3+1',
      matchScore: 78,
      image: 'https://via.placeholder.com/300x200',
      matchReasons: ['Oda sayısı uyumlu', 'Geniş metrekare', 'Otoparklı'],
    },
  ];

  // Simulate API call to get matched properties
  useEffect(() => {
    if (customer) {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        setMatchedProperties(dummyProperties);
        setIsLoading(false);
      }, 1500);
    }
  }, [customer]);

  const handleContactCustomer = () => {
    toast({
      title: 'Müşteriye bilgi verilecek',
      description: 'Müşteri bilgilendirme işlemi başlatıldı.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!customer) return null;

  return (
    <Box>
      <Box mb={6}>
        <Heading size="md" mb={2}>Müşteri Bilgileri</Heading>
        <Text><strong>Ad Soyad:</strong> {customer.name}</Text>
        <Text><strong>Bütçe:</strong> {customer.budget}</Text>
        <Text><strong>Tercihler:</strong> {customer.preferences}</Text>
      </Box>
      
      <Divider mb={6} />
      
      <Heading size="md" mb={4}>AI Eşleştirme Sonuçları</Heading>
      
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height="200px" borderRadius="md" />
          ))}
        </SimpleGrid>
      ) : (
        <>
          <Text mb={4}>Müşteri tercihlerine göre {matchedProperties.length} ilan bulundu.</Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {matchedProperties.map((property) => (
              <Box
                key={property.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
              >
                <Image src={property.image} alt={property.title} height="150px" width="100%" objectFit="cover" />
                
                <Flex p={4} justifyContent="space-between" alignItems="center">
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">{property.title}</Heading>
                    <Text fontWeight="bold" color="blue.600">{property.price}</Text>
                    <Text fontSize="sm">{property.location}</Text>
                    <Text fontSize="sm">{property.rooms} · {property.size}</Text>
                  </VStack>
                  
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={1}
                    colorScheme={
                      property.matchScore >= 90 ? 'green' :
                      property.matchScore >= 80 ? 'blue' :
                      property.matchScore >= 70 ? 'yellow' : 'orange'
                    }
                    fontSize="0.8em"
                  >
                    {property.matchScore}% Uyumlu
                  </Badge>
                </Flex>
                
                <Divider />
                
                <Box p={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Eşleşme Nedenleri:</Text>
                  <Flex wrap="wrap" gap={2}>
                    {property.matchReasons.map((reason: string, index: number) => (
                      <Badge key={index} colorScheme="green" variant="subtle">
                        {reason}
                      </Badge>
                    ))}
                  </Flex>
                </Box>
                
                <Divider />
                
                <Flex p={3} justifyContent="space-between">
                  <Button size="sm" variant="outline">Detaylar</Button>
                  <Button size="sm" colorScheme="blue" onClick={handleContactCustomer}>
                    Müşteriyi Bilgilendir
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default AIMatching;