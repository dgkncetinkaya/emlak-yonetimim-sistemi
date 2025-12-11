import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Checkbox,
  Divider,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Icon,
  InputGroup,
  InputLeftElement,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import {
  CreditCard,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  FileText,
  Shield,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createSubscription } from '../store/slices/subscriptionSlice';
import { validateCoupon } from '../store/slices/billingSlice';
import { Card, CardHeader, CardContent } from '../../../components/ui/card';

interface CheckoutFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Company Info
  companyName: string;
  taxId: string;

  // Address Info
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Payment Info
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;

  // Other
  couponCode: string;
  agreeToTerms: boolean;
  subscribeToNewsletter: boolean;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantName } = useParams<{ tenantName: string }>();
  const toast = useToast();
  const dispatch = useAppDispatch();

  const { state } = location;
  const planId = state?.planId;
  const billingCycle = state?.billingCycle;
  const selectedPlan = state?.selectedPlan;

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Turkey',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
    couponCode: '',
    agreeToTerms: false,
    subscribeToNewsletter: false,
  });

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponValidation, setCouponValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  const pricing = {
    subtotal: selectedPlan?.price || 0,
    discount: 0,
    tax: (selectedPlan?.price || 0) * 0.18,
    total: (selectedPlan?.price || 0) * 1.18
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast({
        title: 'Hata',
        description: 'Lütfen kullanım şartlarını kabul edin.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Başarılı',
        description: 'Aboneliğiniz başarıyla oluşturuldu.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/${tenantName}`);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCouponValidation = async () => {
    if (!formData.couponCode) return;
    setBillingLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCouponApplied(true);
      setCouponValidation({ coupon: { name: formData.couponCode } });
      toast({
        title: 'Başarılı',
        description: 'Kupon kodu uygulandı.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Geçersiz kupon kodu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (!planId || !billingCycle) {
      navigate('/fiyatlandirma');
    }
  }, [planId, billingCycle, navigate]);

  // ...

  // Redirect to dashboard after successful subscription
  setTimeout(() => {
    navigate(`/${tenantName}`);
  }, 2000);

  // ...

  if (!selectedPlan) {
    return (
      <Box bg={bg} minH="100vh" py={20}>
        <Box w="100%" px={4}>
          <VStack spacing={8}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              Plan bulunamadı. Lütfen fiyatlandırma sayfasından bir plan seçin.
            </Alert>
            <Button onClick={() => navigate('/fiyatlandirma')} colorScheme="blue">
              Fiyatlandırma Sayfasına Dön
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Box w="100%" px={4}>
        <VStack spacing={8}>
          {/* Breadcrumb */}
          <Breadcrumb w="full">
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/fiyatlandirma')} cursor="pointer">
                Fiyatlandırma
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>Ödeme</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Button
              leftIcon={<ArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/fiyatlandirma')}
              alignSelf="flex-start"
            >
              Geri Dön
            </Button>

            <Heading size="xl" color={headingColor}>
              Abonelik Oluştur
            </Heading>

            <Text color={textColor} fontSize="lg">
              {selectedPlan.name} planı için ödeme bilgilerinizi girin
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Left Column - Form */}
            <Card style={{ backgroundColor: cardBg }}>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={8} align="stretch">
                    {/* Personal Information */}
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={User} color="blue.500" boxSize={5} />
                        <Heading size="md" color={headingColor}>
                          Kişisel Bilgiler
                        </Heading>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Ad</FormLabel>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Adınız"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Soyad</FormLabel>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Soyadınız"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>E-posta</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={Mail} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="ornek@email.com"
                            />
                          </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Telefon</FormLabel>
                          <InputGroup>
                            <InputLeftElement>
                              <Icon as={Phone} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+90 555 123 45 67"
                            />
                          </InputGroup>
                        </FormControl>
                      </SimpleGrid>
                    </VStack>

                    <Divider />

                    {/* Company Information */}
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={Building} color="blue.500" boxSize={5} />
                        <Heading size="md" color={headingColor}>
                          Şirket Bilgileri
                        </Heading>
                      </HStack>

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Şirket Adı</FormLabel>
                          <Input
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            placeholder="Şirket Adı"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Vergi No</FormLabel>
                          <Input
                            value={formData.taxId}
                            onChange={(e) => handleInputChange('taxId', e.target.value)}
                            placeholder="1234567890"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>

                    <Divider />

                    {/* Address Information */}
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={MapPin} color="blue.500" boxSize={5} />
                        <Heading size="md" color={headingColor}>
                          Adres Bilgileri
                        </Heading>
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel>Adres</FormLabel>
                        <Input
                          value={formData.addressLine1}
                          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                          placeholder="Sokak, Mahalle, No"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Adres 2 (Opsiyonel)</FormLabel>
                        <Input
                          value={formData.addressLine2}
                          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                          placeholder="Daire, Kat, vb."
                        />
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Şehir</FormLabel>
                          <Input
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="İstanbul"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>İl/Bölge</FormLabel>
                          <Input
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            placeholder="Marmara"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Posta Kodu</FormLabel>
                          <Input
                            value={formData.postalCode}
                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                            placeholder="34000"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>

                    <Divider />

                    {/* Payment Information */}
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <Icon as={CreditCard} color="blue.500" boxSize={5} />
                        <Heading size="md" color={headingColor}>
                          Ödeme Bilgileri
                        </Heading>
                      </HStack>

                      <FormControl isRequired>
                        <FormLabel>Kart Üzerindeki İsim</FormLabel>
                        <Input
                          value={formData.cardHolderName}
                          onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                          placeholder="JOHN DOE"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Kart Numarası</FormLabel>
                        <Input
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </FormControl>

                      <SimpleGrid columns={3} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Ay</FormLabel>
                          <Select
                            value={formData.expiryMonth}
                            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                            placeholder="Ay"
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Yıl</FormLabel>
                          <Select
                            value={formData.expiryYear}
                            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                            placeholder="Yıl"
                          >
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <option key={year} value={String(year)}>
                                  {year}
                                </option>
                              );
                            })}
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>CVV</FormLabel>
                          <Input
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>

                    <Divider />

                    {/* Terms and Newsletter */}
                    <VStack spacing={4} align="stretch">
                      <Checkbox
                        isChecked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        colorScheme="blue"
                      >
                        <Text fontSize="sm" color={textColor}>
                          <Text as="span" color={headingColor}>Kullanım Şartları</Text> ve{' '}
                          <Text as="span" color={headingColor}>Gizlilik Politikası</Text>'nı okudum ve kabul ediyorum.
                        </Text>
                      </Checkbox>

                      <Checkbox
                        isChecked={formData.subscribeToNewsletter}
                        onChange={(e) => handleInputChange('subscribeToNewsletter', e.target.checked)}
                        colorScheme="blue"
                      >
                        <Text fontSize="sm" color={textColor}>
                          Ürün güncellemeleri ve özel teklifler hakkında e-posta almak istiyorum.
                        </Text>
                      </Checkbox>
                    </VStack>
                  </VStack>
                </form>
              </CardContent>
            </Card>

            {/* Right Column - Order Summary */}
            <VStack spacing={6} align="stretch">
              {/* Plan Summary */}
              <Card style={{ backgroundColor: cardBg }}>
                <CardHeader>
                  <Heading size="md" color={headingColor}>
                    Sipariş Özeti
                  </Heading>
                </CardHeader>
                <CardContent>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold" color={headingColor}>
                          {selectedPlan.name}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          {billingCycle === 'yearly' ? 'Yıllık' : 'Aylık'} Abonelik
                        </Text>
                      </VStack>
                      <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                        {billingCycle === 'yearly' ? '%17 İndirim' : 'Aylık'}
                      </Badge>
                    </HStack>

                    <Divider />

                    {/* Coupon Code */}
                    <VStack spacing={3} align="stretch">
                      <Text fontWeight="medium" color={headingColor}>
                        Kupon Kodu
                      </Text>
                      <HStack>
                        <Input
                          value={formData.couponCode}
                          onChange={(e) => handleInputChange('couponCode', e.target.value)}
                          placeholder="Kupon kodunuz"
                          size="sm"
                          disabled={couponApplied}
                        />
                        <Button
                          size="sm"
                          onClick={handleCouponValidation}
                          isLoading={billingLoading}
                          disabled={couponApplied || !formData.couponCode.trim()}
                          colorScheme={couponApplied ? 'green' : 'blue'}
                        >
                          {couponApplied ? <Check size={16} /> : 'Uygula'}
                        </Button>
                      </HStack>

                      {couponApplied && couponValidation.coupon && (
                        <Alert status="success" size="sm" borderRadius="md">
                          <AlertIcon boxSize={4} />
                          <Text fontSize="sm">
                            {couponValidation.coupon.name} kuponu uygulandı!
                          </Text>
                        </Alert>
                      )}
                    </VStack>

                    <Divider />

                    {/* Pricing Breakdown */}
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text color={textColor}>Ara Toplam</Text>
                        <Text color={headingColor}>
                          ₺{pricing.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Text>
                      </HStack>

                      {pricing.discount > 0 && (
                        <HStack justify="space-between">
                          <Text color="green.500">İndirim</Text>
                          <Text color="green.500">
                            -₺{pricing.discount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </Text>
                        </HStack>
                      )}

                      <HStack justify="space-between">
                        <Text color={textColor}>KDV (%18)</Text>
                        <Text color={headingColor}>
                          ₺{pricing.tax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Text>
                      </HStack>

                      <Divider />

                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                          Toplam
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={headingColor}>
                          ₺{pricing.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card style={{ backgroundColor: cardBg }}>
                <CardContent>
                  <VStack spacing={3}>
                    <HStack>
                      <Icon as={Shield} color="green.500" boxSize={5} />
                      <Text fontWeight="medium" color={headingColor}>
                        Güvenli Ödeme
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor} textAlign="center">
                      Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır.
                      Kart bilgileriniz saklanmaz.
                    </Text>
                  </VStack>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                size="lg"
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={loading || subscriptionLoading}
                loadingText="İşleniyor..."
                disabled={!formData.agreeToTerms}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s ease"
              >
                ₺{pricing.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} Öde ve Başla
              </Button>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Box>
    </Box>
  );
};

export default CheckoutPage;