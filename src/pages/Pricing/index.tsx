import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { Check, Star, Zap, Shield, Users, Database, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Tenant/store/hooks';
import { fetchPlans } from '../Tenant/store/slices/subscriptionSlice';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/card';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { plans, loading, error } = useAppSelector((state) => state.subscription);

  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const popularBg = useColorModeValue('blue.50', 'blue.900');
  const popularBorder = useColorModeValue('blue.200', 'blue.600');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const handlePlanSelect = (planId: string) => {
    navigate('/checkout', {
      state: {
        planId,
        billingCycle
      }
    });
  };

  const formatPrice = (monthlyPrice: number, yearlyPrice: number) => {
    if (billingCycle === 'yearly') {
      const monthlyEquivalent = yearlyPrice / 12;
      return {
        price: monthlyEquivalent,
        originalPrice: monthlyPrice,
        totalPrice: yearlyPrice,
        savings: ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0)
      };
    }
    return {
      price: monthlyPrice,
      originalPrice: null,
      totalPrice: monthlyPrice,
      savings: null
    };
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('portföy') || feature.toLowerCase().includes('property')) {
      return Database;
    }
    if (feature.toLowerCase().includes('danışman') || feature.toLowerCase().includes('agent')) {
      return Users;
    }
    if (feature.toLowerCase().includes('depolama') || feature.toLowerCase().includes('storage')) {
      return Database;
    }
    if (feature.toLowerCase().includes('e-imza') || feature.toLowerCase().includes('signature')) {
      return FileText;
    }
    if (feature.toLowerCase().includes('sms') || feature.toLowerCase().includes('bildirim')) {
      return Mail;
    }
    return Check;
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" py={20}>
        <Box w="100%" px={4}>
          <VStack spacing={8} justify="center" minH="50vh">
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>Planlar yükleniyor...</Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bg} minH="100vh" py={20}>
        <Box w="100%" px={4}>
          <VStack spacing={8}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
            <Button onClick={() => dispatch(fetchPlans())} colorScheme="blue">
              Tekrar Dene
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={20}>
      <Box w="100%" px={4}>
        <VStack spacing={16}>
          {/* Header Section */}
          <VStack spacing={6} textAlign="center" maxW="3xl">
            <Badge
              colorScheme="blue"
              fontSize="sm"
              px={4}
              py={2}
              borderRadius="full"
              textTransform="none"
            >
              <Icon as={Zap} mr={2} boxSize={4} />
              Emlak Yönetimim Sistemi
            </Badge>

            <Heading
              size="2xl"
              color={headingColor}
              lineHeight="shorter"
            >
              Emlak İşinizi Büyütün
            </Heading>

            <Text
              fontSize="xl"
              color={textColor}
              lineHeight="tall"
            >
              Brokerlar ve emlak ofisleri için tasarlanmış profesyonel SaaS platformu.
              Portföy yönetiminden müşteri takibine kadar tüm ihtiyaçlarınızı karşılayın.
            </Text>
          </VStack>

          {/* Billing Toggle */}
          <VStack spacing={4}>
            <FormControl display="flex" alignItems="center" justifyContent="center">
              <FormLabel htmlFor="billing-toggle" mb={0} color={textColor}>
                Aylık
              </FormLabel>
              <Switch
                id="billing-toggle"
                colorScheme="blue"
                size="lg"
                isChecked={billingCycle === 'yearly'}
                onChange={(e) => setBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
                mx={4}
              />
              <FormLabel htmlFor="billing-toggle" mb={0} color={textColor}>
                Yıllık
              </FormLabel>
            </FormControl>

            {billingCycle === 'yearly' && (
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                <Icon as={Star} mr={1} boxSize={3} />
                2 ay ücretsiz!
              </Badge>
            )}
          </VStack>

          {/* Pricing Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {plans.map((plan, index) => {
              const pricing = formatPrice(plan.price_monthly, plan.price_yearly);
              const isPopular = plan.is_popular || index === 1; // Middle plan is popular by default

              return (
                <Box
                  key={plan.id}
                  position="relative"
                  transform={isPopular ? 'scale(1.05)' : 'scale(1)'}
                  transition="all 0.3s ease"
                  _hover={{ transform: isPopular ? 'scale(1.08)' : 'scale(1.03)' }}
                >
                  {isPopular && (
                    <Badge
                      position="absolute"
                      top="-12px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="blue"
                      fontSize="sm"
                      px={4}
                      py={2}
                      borderRadius="full"
                      zIndex={1}
                    >
                      <Icon as={Star} mr={1} boxSize={3} />
                      En Popüler
                    </Badge>
                  )}

                  <Card
                    className={`h-full ${isPopular ? 'border-2' : 'border'}`}
                    style={{
                      backgroundColor: isPopular ? popularBg : cardBg,
                      borderColor: isPopular ? popularBorder : undefined,
                    }}
                  >
                    <CardHeader>
                      <VStack spacing={4} align="start">
                        <HStack justify="space-between" w="full">
                          <Heading size="lg" color={headingColor}>
                            {plan.name}
                          </Heading>
                          {plan.name === 'Enterprise' && (
                            <Icon as={Shield} color={accentColor} boxSize={6} />
                          )}
                        </HStack>

                        <VStack align="start" spacing={1}>
                          <HStack align="baseline">
                            <Text fontSize="4xl" fontWeight="bold" color={headingColor}>
                              ₺{pricing.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                            </Text>
                            <Text color={textColor} fontSize="lg">
                              /ay
                            </Text>
                          </HStack>

                          {billingCycle === 'yearly' && pricing.savings && (
                            <VStack align="start" spacing={1}>
                              <Text
                                fontSize="sm"
                                color={textColor}
                                textDecoration="line-through"
                              >
                                ₺{pricing.originalPrice?.toLocaleString('tr-TR')} /ay
                              </Text>
                              <Badge colorScheme="green" fontSize="xs">
                                %{pricing.savings} tasarruf
                              </Badge>
                            </VStack>
                          )}

                          {billingCycle === 'yearly' && (
                            <Text fontSize="sm" color={textColor}>
                              Yıllık ₺{pricing.totalPrice.toLocaleString('tr-TR')} faturalandırılır
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    </CardHeader>

                    <CardContent>
                      <VStack spacing={6} align="stretch">
                        {/* Key Features */}
                        <VStack spacing={2} align="start">
                          <HStack>
                            <Icon as={Database} color={accentColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {plan.max_properties === -1 ? 'Sınırsız' : plan.max_properties} Portföy
                            </Text>
                          </HStack>

                          <HStack>
                            <Icon as={Users} color={accentColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {plan.max_agents === -1 ? 'Sınırsız' : plan.max_agents} Danışman
                            </Text>
                          </HStack>

                          <HStack>
                            <Icon as={Database} color={accentColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {plan.storage_gb}GB Depolama
                            </Text>
                          </HStack>

                          <HStack>
                            <Icon as={FileText} color={accentColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {plan.esignature_count === -1 ? 'Sınırsız' : plan.esignature_count} E-İmza
                            </Text>
                          </HStack>

                          <HStack>
                            <Icon as={Mail} color={accentColor} boxSize={4} />
                            <Text fontSize="sm" color={textColor}>
                              {plan.sms_count === -1 ? 'Sınırsız' : plan.sms_count} SMS
                            </Text>
                          </HStack>
                        </VStack>

                        <Divider />

                        {/* All Features */}
                        <List spacing={3}>
                          {plan.features.map((feature, featureIndex) => {
                            const FeatureIcon = getFeatureIcon(feature);
                            return (
                              <ListItem key={featureIndex}>
                                <ListIcon as={FeatureIcon} color={accentColor} boxSize={4} />
                                <Text as="span" fontSize="sm" color={textColor}>
                                  {feature}
                                </Text>
                              </ListItem>
                            );
                          })}
                        </List>
                      </VStack>
                    </CardContent>

                    <CardFooter>
                      <Button
                        size="lg"
                        w="full"
                        colorScheme={isPopular ? 'blue' : 'gray'}
                        variant={isPopular ? 'solid' : 'outline'}
                        onClick={() => handlePlanSelect(plan.id)}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg',
                        }}
                        transition="all 0.2s ease"
                      >
                        Planı Seç
                      </Button>
                    </CardFooter>
                  </Card>
                </Box>
              );
            })}
          </SimpleGrid>

          {/* FAQ or Additional Info */}
          <VStack spacing={6} textAlign="center" maxW="4xl">
            <Heading size="lg" color={headingColor}>
              Tüm planlar 14 gün ücretsiz deneme ile başlar
            </Heading>

            <Text color={textColor} fontSize="lg">
              Kredi kartı gerekmez. İstediğiniz zaman iptal edebilirsiniz.
              Tüm planlar 7/24 müşteri desteği ve ücretsiz kurulum içerir.
            </Text>

            <HStack spacing={8} justify="center" flexWrap="wrap">
              <HStack>
                <Icon as={Shield} color={accentColor} boxSize={5} />
                <Text color={textColor}>SSL Güvenlik</Text>
              </HStack>

              <HStack>
                <Icon as={Database} color={accentColor} boxSize={5} />
                <Text color={textColor}>Günlük Yedekleme</Text>
              </HStack>

              <HStack>
                <Icon as={Users} color={accentColor} boxSize={5} />
                <Text color={textColor}>7/24 Destek</Text>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default PricingPage;