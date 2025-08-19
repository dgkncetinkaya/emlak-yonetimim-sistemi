import { useState, useEffect } from 'react';
import {
  Box, VStack, Text, Button, SimpleGrid, Flex, Badge, Image,
  Heading, Divider, useToast, Skeleton, Progress, HStack, Icon,
  Alert, AlertIcon, AlertTitle, AlertDescription, Card, CardBody,
  Stat, StatLabel, StatNumber, StatHelpText, Tooltip
} from '@chakra-ui/react';
import { Zap, Star, MapPin, Home, DollarSign, TrendingUp } from 'react-feather';

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  area: number;
  rooms: number;
  location: string;
  status: string;
  description: string;
}

interface MatchResult {
  property: Property;
  score: number;
  reasons: string[];
}

interface AIMatchingResponse {
  customer: {
    id: number;
    name: string;
    preferences: any;
    budget: any;
  };
  matches: MatchResult[];
  totalMatches: number;
  generatedAt: string;
}

interface AIMatchingProps {
  customer: any;
}

const AIMatching = ({ customer }: AIMatchingProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<AIMatchingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // AI Matching API call
  const performAIMatching = async () => {
    if (!customer) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/customers/${customer.id}/ai-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('AI eşleştirme işlemi başarısız oldu');
      }

      const data: AIMatchingResponse = await response.json();
      setMatchResults(data);

      toast({
        title: 'AI Eşleştirme Tamamlandı',
        description: `${data.totalMatches} adet uygun emlak bulundu`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Hata',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual AI matching trigger
  const handleAIMatching = () => {
    performAIMatching();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
  };

  if (!customer) {
    return (
      <Box textAlign="center" py={10}>
        <Icon as={Zap} boxSize={12} color="gray.400" mb={4} />
        <Text color="gray.500" fontSize="lg">
          AI eşleştirme için bir müşteri seçin
        </Text>
      </Box>
    );
  }

  if (customer.type !== 'Alıcı') {
    return (
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>Bilgi!</AlertTitle>
          <AlertDescription>
            AI eşleştirme sadece alıcı müşteriler için kullanılabilir.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Customer Info Header */}
      <Card mb={6}>
        <CardBody>
          <HStack mb={4}>
            <Icon as={Zap} color="blue.500" boxSize={6} />
            <VStack align="start" spacing={1}>
              <Heading size="md" color="blue.600">
                {customer.name} için AI Eşleştirme
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Müşteri tercihlerine göre en uygun emlakları bulun
              </Text>
            </VStack>
          </HStack>

          {/* Customer Preferences */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
            <Stat>
              <StatLabel>Bütçe</StatLabel>
              <StatNumber fontSize="md">
                {formatPrice(customer.budget?.min || 0)} - {formatPrice(customer.budget?.max || 0)}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Emlak Tipi</StatLabel>
              <StatNumber fontSize="md">{customer.preferences?.propertyType || 'Belirtilmemiş'}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Konum</StatLabel>
              <StatNumber fontSize="md">{customer.preferences?.location || 'Belirtilmemiş'}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Oda Sayısı</StatLabel>
              <StatNumber fontSize="md">{customer.preferences?.rooms || 'Belirtilmemiş'}</StatNumber>
            </Stat>
          </SimpleGrid>

          <Button
            leftIcon={<TrendingUp />}
            colorScheme="blue"
            onClick={handleAIMatching}
            isLoading={isLoading}
            loadingText="Eşleştiriliyor..."
            size="lg"
          >
            AI Eşleştirme Başlat
          </Button>
        </CardBody>
      </Card>

      {/* Error State */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Hata!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box>
          <HStack mb={4}>
            <Icon as={Zap} color="blue.500" />
            <Text>AI algoritması çalışıyor...</Text>
          </HStack>
          <VStack spacing={4}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </VStack>
        </Box>
      )}

      {/* Results */}
      {matchResults && !isLoading && (
        <Box>
          <HStack justify="space-between" mb={6}>
            <Box>
              <Heading size="md" mb={2}>
                Eşleştirme Sonuçları
              </Heading>
              <Text color="gray.600">
                {matchResults.totalMatches} adet uygun emlak bulundu
              </Text>
            </Box>
            <Button
              leftIcon={<Icon as={Zap} />}
              colorScheme="blue"
              variant="outline"
              onClick={performAIMatching}
              isLoading={isLoading}
            >
              Yeniden Eşleştir
            </Button>
          </HStack>

          {matchResults.matches.length === 0 ? (
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Eşleşme Bulunamadı!</AlertTitle>
                <AlertDescription>
                  Bu müşterinin kriterlerine uygun emlak bulunamadı.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {matchResults.matches.map((match) => (
                <Card
                  key={match.property.id}
                  overflow="hidden"
                  _hover={{ shadow: 'md' }}
                  transition="all 0.2s"
                >
                  {/* Property Image */}
                  <Box position="relative">
                    <Image
                      src={`https://via.placeholder.com/400x250?text=${encodeURIComponent(match.property.title)}`}
                      alt={match.property.title}
                      height="200px"
                      width="100%"
                      objectFit="cover"
                    />
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      colorScheme={getMatchColor(Math.round(match.score))}
                      fontSize="sm"
                      px={2}
                      py={1}
                    >
                      %{Math.round(match.score)} Uyum
                    </Badge>
                  </Box>

                  {/* Property Details */}
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Heading size="sm" mb={1}>
                          {match.property.title}
                        </Heading>
                        <HStack color="gray.600" fontSize="sm">
                          <Icon as={MapPin} boxSize={4} />
                          <Text>{match.property.location}</Text>
                        </HStack>
                      </Box>

                      <SimpleGrid columns={3} spacing={2} fontSize="sm">
                        <VStack spacing={1}>
                          <Icon as={DollarSign} color="green.500" />
                          <Text fontWeight="bold" color="green.600">
                            {formatPrice(match.property.price)}
                          </Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Icon as={Home} color="blue.500" />
                          <Text>{match.property.rooms} oda</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.500">Alan</Text>
                          <Text>{match.property.area}m²</Text>
                        </VStack>
                      </SimpleGrid>

                      {/* Match Progress */}
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            Uyum Skoru
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {Math.round(match.score)}/100
                          </Text>
                        </HStack>
                        <Progress
                          value={match.score}
                          colorScheme={getMatchColor(Math.round(match.score))}
                          size="sm"
                          borderRadius="full"
                        />
                      </Box>

                      {/* Match Reasons */}
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Eşleşme Nedenleri:
                        </Text>
                        <Flex wrap="wrap" gap={1}>
                          {match.reasons.map((reason, index) => (
                            <Badge
                              key={index}
                              colorScheme="blue"
                              variant="subtle"
                              fontSize="xs"
                            >
                              {reason}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>

                      {/* Action Buttons */}
                      <HStack spacing={2} pt={2}>
                        <Button size="sm" colorScheme="blue" flex={1}>
                          Detayları Gör
                        </Button>
                        <Button size="sm" variant="outline" flex={1}>
                          Randevu Al
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AIMatching;