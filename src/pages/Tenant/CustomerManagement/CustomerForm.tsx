import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  Button, useToast, VStack, HStack, Text, Icon, InputGroup,
  InputLeftElement, InputLeftAddon, Badge, Divider, useColorModeValue,
  FormHelperText, Flex, Heading, Checkbox, CheckboxGroup, Stack,
  Radio, RadioGroup, Tag, TagLabel, TagCloseButton, Wrap, WrapItem,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import {
  User, Phone, Mail, Home, FileText, DollarSign, TrendingUp,
  Calendar, Clock, Check, X, MapPin, Award, Image as ImageIcon
} from 'react-feather';
import { customersService } from '../../../services/customersService';
import { useAuth } from '../../../context/AuthContext';

interface CustomerFormProps {
  customer?: any;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const CustomerForm = ({ customer, onSubmit, onCancel }: CustomerFormProps) => {
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  
  const [formData, setFormData] = useState({
    // Ortak Alanlar
    name: '',
    phone: '',
    email: '',
    customer_type: 'landlord', // Varsayılan: Ev Sahibi
    status: 'potential',
    important_note: '',
    detailed_notes: '',
    owner_user_id: user?.id || '',
    
    // ALICI için alanlar
    buyer_source: '',
    buyer_max_budget: 0,
    buyer_preferred_locations: [] as string[],
    buyer_property_type: '',
    buyer_room_count: [] as string[],
    buyer_area_min: 0,
    buyer_area_max: 0,
    buyer_building_age: '',
    buyer_floor_preference: [] as string[],
    buyer_features: {
      in_site: false,
      parking: false,
      elevator: false,
      balcony: false,
      view: false,
      furnished: false
    },
    buyer_preferred_contact_method: 'phone',
    buyer_available_days: [] as string[],
    buyer_available_time_start: '',
    buyer_available_time_end: '',
    
    // SATICI için alanlar
    seller_property_address: '',
    seller_property_type: '',
    seller_room_count: '',
    seller_area_net: 0,
    seller_area_gross: 0,
    seller_building_age: '',
    seller_floor: '',
    seller_total_floors: 0,
    seller_heating: '',
    seller_in_site: false,
    seller_features: {
      balcony: false,
      parking: false,
      elevator: false
    },
    seller_deed_status: '',
    seller_rental_income: 0,
    seller_expected_price: 0,
    seller_min_price: 0,
    seller_urgency: '',
    seller_reason: '',
    seller_authorization_type: '',
    seller_authorization_start: '',
    seller_authorization_end: '',
    seller_listing_status: '',
    seller_photo_video_done: false,
    seller_virtual_tour: false,
    seller_description_ready: false,
    
    // KİRACI için alanlar
    tenant_occupation: '',
    tenant_max_rent_budget: 0,
    tenant_preferred_locations: [] as string[],
    tenant_property_type: '',
    tenant_room_count: [] as string[],
    tenant_area_min: 0,
    tenant_area_max: 0,
    tenant_building_age: '',
    tenant_floor_preference: [] as string[],
    tenant_heating: '',
    tenant_features: {
      furnished: false,
      unfurnished: false,
      in_site: false,
      balcony: false,
      parking: false,
      elevator: false,
      pet_friendly: false,
      family_friendly: false
    },
    tenant_move_in_date: '',
    tenant_lease_duration: '',
    tenant_monthly_income: '',
    tenant_employment_status: '',
    tenant_occupants_count: '',
    tenant_has_pets: false,
    tenant_preferred_contact_method: 'phone',
    tenant_available_days: [] as string[],
    tenant_available_time_start: '',
    tenant_available_time_end: '',
    
    // EV SAHİBİ için alanlar
    landlord_id_number: '',
    landlord_property_address: '',
    landlord_property_type: '',
    landlord_room_count: '',
    landlord_area_net: 0,
    landlord_area_gross: 0,
    landlord_building_age: '',
    landlord_floor: '',
    landlord_total_floors: 0,
    landlord_heating: '',
    landlord_in_site: false,
    landlord_features: {
      balcony: false,
      parking: false,
      elevator: false
    },
    landlord_deed_type: '',
    landlord_property_status: '',
    landlord_current_rent: 0,
    landlord_tenant_exit_date: '',
    landlord_request_type: '',
    landlord_expected_sale_price: 0,
    landlord_expected_rent: 0,
    landlord_min_price: 0,
    landlord_urgency: '',
    landlord_request_description: '',
    landlord_authorization_type: '',
    landlord_authorization_start: '',
    landlord_authorization_end: '',
    landlord_photo_video_done: false,
    landlord_listing_live: false,
    landlord_description_ready: false,
    landlord_virtual_tour: false
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.750');

  useEffect(() => {
    if (customer) {
      // Notes'u parse et
      const notes = customer.notes || '';
      const importantMatch = notes.match(/ÖNEMLİ: (.*?)(\n\n|$)/);
      const important_note = importantMatch ? importantMatch[1] : '';
      const detailed_notes = notes.replace(/ÖNEMLİ: .*?(\n\n|$)/, '').trim();

      // Preferences'ı al
      const prefs = customer.preferences || {};

      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        customer_type: customer.customer_type || 'landlord',
        status: customer.status || 'active',
        important_note,
        detailed_notes,
        owner_user_id: user?.id || '',
        
        // Alıcı alanları (preferences'tan)
        buyer_source: prefs.buyer_source || '',
        buyer_max_budget: prefs.buyer_max_budget || 0,
        buyer_preferred_locations: prefs.buyer_preferred_locations || [],
        buyer_property_type: prefs.buyer_property_type || '',
        buyer_room_count: prefs.buyer_room_count || [],
        buyer_area_min: prefs.buyer_area_min || 0,
        buyer_area_max: prefs.buyer_area_max || 0,
        buyer_building_age: prefs.buyer_building_age || '',
        buyer_floor_preference: prefs.buyer_floor_preference || [],
        buyer_features: prefs.buyer_features || {
          in_site: false,
          parking: false,
          elevator: false,
          balcony: false,
          view: false,
          furnished: false
        },
        buyer_preferred_contact_method: prefs.buyer_preferred_contact_method || 'phone',
        buyer_available_days: prefs.buyer_available_days || [],
        buyer_available_time_start: prefs.buyer_available_time_start || '',
        buyer_available_time_end: prefs.buyer_available_time_end || '',
        
        // Satıcı alanları (preferences'tan)
        seller_property_address: prefs.seller_property_address || '',
        seller_property_type: prefs.seller_property_type || '',
        seller_room_count: prefs.seller_room_count || '',
        seller_area_net: prefs.seller_area_net || 0,
        seller_area_gross: prefs.seller_area_gross || 0,
        seller_building_age: prefs.seller_building_age || '',
        seller_floor: prefs.seller_floor || '',
        seller_total_floors: prefs.seller_total_floors || 0,
        seller_heating: prefs.seller_heating || '',
        seller_in_site: prefs.seller_in_site || false,
        seller_features: prefs.seller_features || {
          balcony: false,
          parking: false,
          elevator: false
        },
        seller_deed_status: prefs.seller_deed_status || '',
        seller_rental_income: prefs.seller_rental_income || 0,
        seller_expected_price: prefs.seller_expected_price || 0,
        seller_min_price: prefs.seller_min_price || 0,
        seller_urgency: prefs.seller_urgency || '',
        seller_reason: prefs.seller_reason || '',
        seller_authorization_type: prefs.seller_authorization_type || '',
        seller_authorization_start: prefs.seller_authorization_start || '',
        seller_authorization_end: prefs.seller_authorization_end || '',
        seller_listing_status: prefs.seller_listing_status || '',
        seller_photo_video_done: prefs.seller_photo_video_done || false,
        seller_virtual_tour: prefs.seller_virtual_tour || false,
        seller_description_ready: prefs.seller_description_ready || false,
        
        // Kiracı alanları (preferences'tan)
        tenant_occupation: prefs.tenant_occupation || '',
        tenant_max_rent_budget: prefs.tenant_max_rent_budget || 0,
        tenant_preferred_locations: prefs.tenant_preferred_locations || [],
        tenant_property_type: prefs.tenant_property_type || '',
        tenant_room_count: prefs.tenant_room_count || [],
        tenant_area_min: prefs.tenant_area_min || 0,
        tenant_area_max: prefs.tenant_area_max || 0,
        tenant_building_age: prefs.tenant_building_age || '',
        tenant_floor_preference: prefs.tenant_floor_preference || [],
        tenant_heating: prefs.tenant_heating || '',
        tenant_features: prefs.tenant_features || {
          furnished: false,
          unfurnished: false,
          in_site: false,
          balcony: false,
          parking: false,
          elevator: false,
          pet_friendly: false,
          family_friendly: false
        },
        tenant_move_in_date: prefs.tenant_move_in_date || '',
        tenant_lease_duration: prefs.tenant_lease_duration || '',
        tenant_monthly_income: prefs.tenant_monthly_income || '',
        tenant_employment_status: prefs.tenant_employment_status || '',
        tenant_occupants_count: prefs.tenant_occupants_count || '',
        tenant_has_pets: prefs.tenant_has_pets || false,
        tenant_preferred_contact_method: prefs.tenant_preferred_contact_method || 'phone',
        tenant_available_days: prefs.tenant_available_days || [],
        tenant_available_time_start: prefs.tenant_available_time_start || '',
        tenant_available_time_end: prefs.tenant_available_time_end || '',
        
        // Ev Sahibi alanları (preferences'tan)
        landlord_id_number: prefs.landlord_id_number || '',
        landlord_property_address: prefs.landlord_property_address || '',
        landlord_property_type: prefs.landlord_property_type || '',
        landlord_room_count: prefs.landlord_room_count || '',
        landlord_area_net: prefs.landlord_area_net || 0,
        landlord_area_gross: prefs.landlord_area_gross || 0,
        landlord_building_age: prefs.landlord_building_age || '',
        landlord_floor: prefs.landlord_floor || '',
        landlord_total_floors: prefs.landlord_total_floors || 0,
        landlord_heating: prefs.landlord_heating || '',
        landlord_in_site: prefs.landlord_in_site || false,
        landlord_features: prefs.landlord_features || {
          balcony: false,
          parking: false,
          elevator: false
        },
        landlord_deed_type: prefs.landlord_deed_type || '',
        landlord_property_status: prefs.landlord_property_status || '',
        landlord_current_rent: prefs.landlord_current_rent || 0,
        landlord_tenant_exit_date: prefs.landlord_tenant_exit_date || '',
        landlord_request_type: prefs.landlord_request_type || '',
        landlord_expected_sale_price: prefs.landlord_expected_sale_price || 0,
        landlord_expected_rent: prefs.landlord_expected_rent || 0,
        landlord_min_price: prefs.landlord_min_price || 0,
        landlord_urgency: prefs.landlord_urgency || '',
        landlord_request_description: prefs.landlord_request_description || '',
        landlord_authorization_type: prefs.landlord_authorization_type || '',
        landlord_authorization_start: prefs.landlord_authorization_start || '',
        landlord_authorization_end: prefs.landlord_authorization_end || '',
        landlord_photo_video_done: prefs.landlord_photo_video_done || false,
        landlord_listing_live: prefs.landlord_listing_live || false,
        landlord_description_ready: prefs.landlord_description_ready || false,
        landlord_virtual_tour: prefs.landlord_virtual_tour || false
      });
    }
  }, [customer, user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBuyerFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      buyer_features: { ...prev.buyer_features, [feature]: value }
    }));
  };

  const handleSellerFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      seller_features: { ...prev.seller_features, [feature]: value }
    }));
  };

  const handleTenantFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      tenant_features: { ...prev.tenant_features, [feature]: value }
    }));
  };

  const handleLandlordFeatureChange = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      landlord_features: { ...prev.landlord_features, [feature]: value }
    }));
  };

  const addLocation = () => {
    const locations = formData.customer_type === 'buyer' 
      ? formData.buyer_preferred_locations 
      : formData.tenant_preferred_locations;
    
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      if (formData.customer_type === 'buyer') {
        setFormData(prev => ({
          ...prev,
          buyer_preferred_locations: [...prev.buyer_preferred_locations, locationInput.trim()]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          tenant_preferred_locations: [...prev.tenant_preferred_locations, locationInput.trim()]
        }));
      }
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    if (formData.customer_type === 'buyer') {
      setFormData(prev => ({
        ...prev,
        buyer_preferred_locations: prev.buyer_preferred_locations.filter(l => l !== location)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tenant_preferred_locations: prev.tenant_preferred_locations.filter(l => l !== location)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: 'Hata',
        description: 'Lütfen zorunlu alanları doldurun (Ad Soyad, Telefon).',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Müşteri tipine göre ek validasyon
    if (formData.customer_type === 'buyer' && !formData.buyer_max_budget) {
      toast({
        title: 'Hata',
        description: 'Alıcı müşteri için maksimum bütçe zorunludur.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.customer_type === 'seller' && !formData.seller_expected_price) {
      toast({
        title: 'Hata',
        description: 'Satıcı müşteri için beklenen satış fiyatı zorunludur.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.customer_type === 'tenant' && !formData.tenant_max_rent_budget) {
      toast({
        title: 'Hata',
        description: 'Kiracı müşteri için maksimum kira bütçesi zorunludur.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.customer_type === 'landlord' && !formData.landlord_property_address) {
      toast({
        title: 'Hata',
        description: 'Ev sahibi müşteri için mülk adresi zorunludur.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      // Tablodaki sütunlar ve preferences'a gidecek alanları ayır
      const {
        name,
        phone,
        email,
        customer_type,
        status,
        important_note,
        detailed_notes,
        ...preferences
      } = formData;

      const dataToSave = {
        name,
        phone,
        email,
        customer_type,
        status,
        notes: `${important_note ? 'ÖNEMLİ: ' + important_note + '\n\n' : ''}${detailed_notes || ''}`,
        preferences: preferences // Diğer tüm alanlar preferences'a
      };

      if (customer?.id) {
        await customersService.updateCustomer(customer.id, dataToSave);
        toast({
          title: 'Başarılı',
          description: 'Müşteri bilgileri güncellendi.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await customersService.createCustomer(dataToSave);
        const typeLabel = formData.customer_type === 'buyer' ? 'alıcı' : formData.customer_type === 'seller' ? 'satıcı' : formData.customer_type === 'tenant' ? 'kiracı' : 'ev sahibi';
        toast({
          title: 'Başarılı',
          description: `Yeni ${typeLabel} müşteri eklendi.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSubmit?.();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Seçenekler - ALICI
  const buyerStatusOptions = [
    { value: 'potential', label: 'Potansiyel Müşteri' },
    { value: 'active', label: 'Aktif Müşteri' },
    { value: 'inactive', label: 'Pasif Müşteri' },
    { value: 'converted', label: 'Dönüştürüldü (Satın Aldı)' }
  ];

  const buyerSourceOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'sahibinden', label: 'Sahibinden' },
    { value: 'zingat', label: 'Zingat' },
    { value: 'google', label: 'Google / Web sitesi' },
    { value: 'referral', label: 'Yönlendirme (Referral)' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'walk_in', label: 'Ofise gelen' },
    { value: 'other', label: 'Diğer' }
  ];

  // Seçenekler - SATICI
  const sellerStatusOptions = [
    { value: 'potential', label: 'Potansiyel Müşteri' },
    { value: 'active', label: 'Aktif Müşteri' },
    { value: 'inactive', label: 'Pasif Müşteri' },
    { value: 'converted', label: 'Dönüştürüldü (Satıldı)' }
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Daire' },
    { value: 'residence', label: 'Rezidans' },
    { value: 'detached', label: 'Müstakil' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Ticari' },
    { value: 'land', label: 'Arsa' }
  ];

  const roomOptions = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+'];
  
  const buildingAgeOptions = [
    { value: '0', label: '0 (Yeni)' },
    { value: '0-5', label: '0-5 yıl' },
    { value: '6-10', label: '6-10 yıl' },
    { value: '11-15', label: '11-15 yıl' },
    { value: '16-20', label: '16-20 yıl' },
    { value: '21+', label: '21+ yıl' }
  ];
  
  const floorOptions = ['Bodrum', 'Zemin', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+', 'Çatı Katı'];
  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const timeOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const heatingOptions = [
    'Kombi (Doğalgaz)',
    'Merkezi Sistem',
    'Yerden Isıtma',
    'Klima',
    'Soba',
    'Yok'
  ];

  // Seçenekler - KİRACI
  const tenantStatusOptions = [
    { value: 'potential', label: 'Potansiyel Müşteri' },
    { value: 'active', label: 'Aktif Müşteri' },
    { value: 'inactive', label: 'Pasif Müşteri' },
    { value: 'converted', label: 'Dönüştürüldü (Kiralandı)' }
  ];

  const tenantPropertyTypes = [
    { value: 'apartment', label: 'Daire' },
    { value: 'residence', label: 'Rezidans' },
    { value: 'studio', label: 'Stüdyo' },
    { value: '1+1', label: '1+1' },
    { value: '2+1', label: '2+1' },
    { value: '3+1', label: '3+1' },
    { value: 'detached', label: 'Müstakil' },
    { value: 'office', label: 'Ofis' },
    { value: 'warehouse', label: 'Depo' },
    { value: 'shop', label: 'Dükkan' }
  ];

  const leaseDurationOptions = [
    { value: 'long_term', label: 'Uzun dönem' },
    { value: '6_months', label: '6 ay' },
    { value: '1_year', label: '1 yıl' },
    { value: 'short_term', label: 'Kısa dönem' }
  ];

  const incomeRangeOptions = [
    { value: '0-10000', label: '0 - 10.000 TL' },
    { value: '10000-20000', label: '10.000 - 20.000 TL' },
    { value: '20000-30000', label: '20.000 - 30.000 TL' },
    { value: '30000-50000', label: '30.000 - 50.000 TL' },
    { value: '50000+', label: '50.000+ TL' }
  ];

  const employmentStatusOptions = [
    { value: 'employed', label: 'Çalışıyor' },
    { value: 'student', label: 'Öğrenci' },
    { value: 'civil_servant', label: 'Memur' },
    { value: 'private_sector', label: 'Özel Sektör' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'retired', label: 'Emekli' }
  ];

  const occupantsCountOptions = ['1', '2', '3', '4', '5+'];

  const availableDaysOptions = [
    { value: 'weekdays', label: 'Hafta içi' },
    { value: 'weekend', label: 'Hafta sonu' },
    { value: 'saturday', label: 'Sadece Cumartesi' },
    { value: 'sunday', label: 'Sadece Pazar' }
  ];

  // Seçenekler - EV SAHİBİ
  const landlordStatusOptions = [
    { value: 'potential', label: 'Potansiyel Müşteri' },
    { value: 'active', label: 'Aktif Müşteri' },
    { value: 'inactive', label: 'Pasif Müşteri' },
    { value: 'converted', label: 'Dönüştürüldü (Tamamlandı)' }
  ];

  const landlordPropertyTypes = [
    { value: 'apartment', label: 'Daire' },
    { value: 'residence', label: 'Rezidans' },
    { value: 'detached', label: 'Müstakil' },
    { value: 'villa', label: 'Villa' },
    { value: 'office', label: 'Ofis' },
    { value: 'shop', label: 'Dükkan' },
    { value: 'warehouse', label: 'Depo' },
    { value: 'land', label: 'Arsa' }
  ];

  const deedTypeOptions = [
    { value: 'kat_mulkiyeti', label: 'Kat Mülkiyeti' },
    { value: 'kat_irtifaki', label: 'Kat İrtifakı' },
    { value: 'hisseli', label: 'Hisseli' },
    { value: 'arsa', label: 'Arsa' }
  ];

  const propertyStatusOptions = [
    { value: 'empty', label: 'Boş' },
    { value: 'rented', label: 'Kiracılı' },
    { value: 'owner_occupied', label: 'Mülk Sahibi Oturuyor' }
  ];

  const requestTypeOptions = [
    { value: 'sell', label: 'Satmak istiyor' },
    { value: 'rent', label: 'Kiraya vermek istiyor' },
    { value: 'both', label: 'Hem satılık hem kiralık olabilir' }
  ];

  const deedStatusOptions = [
    { value: 'kat_mulkiyeti', label: 'Kat Mülkiyeti' },
    { value: 'kat_irtifaki', label: 'Kat İrtifakı' },
    { value: 'hisseli', label: 'Hisseli' },
    { value: 'arsa', label: 'Arsa' }
  ];

  const urgencyOptions = [
    { value: 'urgent', label: 'Acil' },
    { value: 'medium', label: 'Orta' },
    { value: 'not_urgent', label: 'Acele değil' }
  ];

  const saleReasonOptions = [
    'Yatırım amaçlı',
    'Taşınma',
    'Boşanma',
    'Miras',
    'Kiracı çıkacak',
    'Nakit ihtiyacı',
    'Diğer'
  ];

  const authorizationTypes = [
    { value: 'open', label: 'Açık yetki' },
    { value: 'exclusive', label: 'Tek yetki' },
    { value: 'not_received', label: 'Henüz alınmadı' }
  ];

  const listingStatusOptions = [
    { value: 'live', label: 'Yayında' },
    { value: 'preparing', label: 'Hazırlanıyor' }
  ];

  const isBuyer = formData.customer_type === 'buyer';
  const isSeller = formData.customer_type === 'seller';
  const isTenant = formData.customer_type === 'tenant';
  const isLandlord = formData.customer_type === 'landlord';

  return (
    <Box as="form" onSubmit={handleSubmit} p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color={labelColor}>
            {customer?.id ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Müşteri bilgilerini eksiksiz doldurun. Tüm bilgiler sadece size özeldir.
          </Text>
        </Box>

        <Divider />

        {/* 1) MÜŞTERİ TİPİ */}
        <Box bg={sectionBg} p={6} borderRadius="lg" borderWidth="2px" borderColor="blue.300">
          <HStack mb={4}>
            <Icon as={User} color="blue.500" boxSize={5} />
            <Heading size="md" color={labelColor}>Müşteri Tipi</Heading>
          </HStack>
          
          <FormControl isRequired>
            <Select
              value={formData.customer_type}
              onChange={(e) => handleInputChange('customer_type', e.target.value)}
              bg={inputBg}
              size="lg"
              fontWeight="semibold"
            >
              <option value="buyer">🏠 Alıcı</option>
              <option value="seller">💰 Satıcı</option>
              <option value="tenant">🔑 Kiracı</option>
              <option value="landlord">🏢 Ev Sahibi</option>
            </Select>
            <FormHelperText fontSize="xs">
              Müşteri tipine göre form alanları değişecektir
            </FormHelperText>
          </FormControl>
        </Box>

        {/* 2) KİŞİSEL BİLGİLER */}
        <Box bg={sectionBg} p={6} borderRadius="lg">
          <HStack mb={4}>
            <Icon as={User} color="blue.500" boxSize={5} />
            <Heading size="md" color={labelColor}>Kişisel Bilgiler</Heading>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Ad Soyad</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                bg={inputBg}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Telefon</FormLabel>
              <InputGroup>
                <InputLeftAddon bg={inputBg}>+90</InputLeftAddon>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(5xx) xxx xx xx"
                  bg={inputBg}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">E-posta</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Mail} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="ornek@email.com"
                  type="email"
                  bg={inputBg}
                />
              </InputGroup>
              <FormHelperText fontSize="xs">Opsiyonel</FormHelperText>
            </FormControl>

            {isTenant && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">Meslek</FormLabel>
                <Input
                  value={formData.tenant_occupation}
                  onChange={(e) => handleInputChange('tenant_occupation', e.target.value)}
                  placeholder="Örn: Yazılım Geliştirici"
                  bg={inputBg}
                />
                <FormHelperText fontSize="xs">Kiracı müşteriler için önemli</FormHelperText>
              </FormControl>
            )}

            {isLandlord && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">TC Kimlik No</FormLabel>
                <Input
                  value={formData.landlord_id_number}
                  onChange={(e) => handleInputChange('landlord_id_number', e.target.value)}
                  placeholder="11 haneli TC Kimlik No"
                  maxLength={11}
                  bg={inputBg}
                />
                <FormHelperText fontSize="xs">Opsiyonel - Resmi sözleşmeler için</FormHelperText>
              </FormControl>
            )}
          </SimpleGrid>
        </Box>

        {/* 3) MÜŞTERİ DURUMU (PIPELINE) */}
        <Box bg={sectionBg} p={6} borderRadius="lg">
          <HStack mb={4}>
            <Icon as={TrendingUp} color="blue.500" boxSize={5} />
            <Heading size="md" color={labelColor}>Müşteri Durumu</Heading>
          </HStack>
          
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Durum</FormLabel>
            <Select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              bg={inputBg}
            >
              {(isBuyer ? buyerStatusOptions : isSeller ? sellerStatusOptions : isTenant ? tenantStatusOptions : landlordStatusOptions).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </FormControl>

          {isBuyer && (
            <FormControl mt={4}>
              <FormLabel fontSize="sm" fontWeight="medium">Müşteri Kaynağı</FormLabel>
              <Select
                value={formData.buyer_source}
                onChange={(e) => handleInputChange('buyer_source', e.target.value)}
                placeholder="Seçiniz"
                bg={inputBg}
              >
                {buyerSourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* ALICI İÇİN ÖZEL BÖLÜMLER */}
        {isBuyer && (
          <>
            {/* BÜTÇE & BÖLGELER */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={DollarSign} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Bütçe & Bölgeler</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Maksimum Bütçe</FormLabel>
                  <InputGroup>
                    <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                    <NumberInput
                      value={formData.buyer_max_budget}
                      onChange={(val) => handleInputChange('buyer_max_budget', Number(val))}
                      min={0}
                      w="100%"
                    >
                      <NumberInputField bg={inputBg} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Bölgeler</FormLabel>
                  <HStack>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={MapPin} color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                        placeholder="Bölge ekle (örn: Kadıköy)"
                        bg={inputBg}
                      />
                    </InputGroup>
                    <Button onClick={addLocation} colorScheme="blue" size="md">Ekle</Button>
                  </HStack>
                  <Wrap mt={3} spacing={2}>
                    {formData.buyer_preferred_locations.map((loc, idx) => (
                      <WrapItem key={idx}>
                        <Tag size="lg" colorScheme="blue" borderRadius="full">
                          <TagLabel>{loc}</TagLabel>
                          <TagCloseButton onClick={() => removeLocation(loc)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
              </VStack>
            </Box>

            {/* ARADIĞI EMLAK ÖZELLİKLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Home} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Aradığı Emlak Özellikleri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Emlak Tipi</FormLabel>
                    <Select
                      value={formData.buyer_property_type}
                      onChange={(e) => handleInputChange('buyer_property_type', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bina Yaşı</FormLabel>
                    <Select
                      value={formData.buyer_building_age}
                      onChange={(e) => handleInputChange('buyer_building_age', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {buildingAgeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Oda Sayısı</FormLabel>
                  <CheckboxGroup
                    value={formData.buyer_room_count}
                    onChange={(val) => handleInputChange('buyer_room_count', val)}
                  >
                    <Wrap spacing={3}>
                      {roomOptions.map(room => (
                        <WrapItem key={room}>
                          <Checkbox value={room} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{room}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Minimum Metrekare</FormLabel>
                    <NumberInput
                      value={formData.buyer_area_min}
                      onChange={(val) => handleInputChange('buyer_area_min', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Maksimum Metrekare</FormLabel>
                    <NumberInput
                      value={formData.buyer_area_max}
                      onChange={(val) => handleInputChange('buyer_area_max', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Kat Tercihi</FormLabel>
                  <CheckboxGroup
                    value={formData.buyer_floor_preference}
                    onChange={(val) => handleInputChange('buyer_floor_preference', val)}
                  >
                    <Wrap spacing={3}>
                      {floorOptions.map(floor => (
                        <WrapItem key={floor}>
                          <Checkbox value={floor} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{floor}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Özellikler</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Checkbox
                      isChecked={formData.buyer_features.in_site}
                      onChange={(e) => handleBuyerFeatureChange('in_site', e.target.checked)}
                      colorScheme="blue"
                    >
                      Site içinde olsun
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.buyer_features.parking}
                      onChange={(e) => handleBuyerFeatureChange('parking', e.target.checked)}
                      colorScheme="blue"
                    >
                      Otopark
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.buyer_features.elevator}
                      onChange={(e) => handleBuyerFeatureChange('elevator', e.target.checked)}
                      colorScheme="blue"
                    >
                      Asansör
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.buyer_features.balcony}
                      onChange={(e) => handleBuyerFeatureChange('balcony', e.target.checked)}
                      colorScheme="blue"
                    >
                      Balkon
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.buyer_features.view}
                      onChange={(e) => handleBuyerFeatureChange('view', e.target.checked)}
                      colorScheme="blue"
                    >
                      Manzara
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.buyer_features.furnished}
                      onChange={(e) => handleBuyerFeatureChange('furnished', e.target.checked)}
                      colorScheme="blue"
                    >
                      Eşyalı olabilir
                    </Checkbox>
                  </SimpleGrid>
                </FormControl>
              </VStack>
            </Box>

            {/* İLETİŞİM MÜSAİTLİĞİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Calendar} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>İletişim Müsaitliği</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Tercih edilen iletişim yöntemi</FormLabel>
                  <RadioGroup
                    value={formData.buyer_preferred_contact_method}
                    onChange={(val) => handleInputChange('buyer_preferred_contact_method', val)}
                  >
                    <Stack direction="row" spacing={5}>
                      <Radio value="phone" colorScheme="blue">Telefon</Radio>
                      <Radio value="whatsapp" colorScheme="blue">WhatsApp</Radio>
                      <Radio value="email" colorScheme="blue">E-posta</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Gösterim için uygun günler</FormLabel>
                  <CheckboxGroup
                    value={formData.buyer_available_days}
                    onChange={(val) => handleInputChange('buyer_available_days', val)}
                  >
                    <Wrap spacing={3}>
                      {weekDays.map(day => (
                        <WrapItem key={day}>
                          <Checkbox value={day} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{day}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Uygun saat başlangıç</FormLabel>
                    <Select
                      value={formData.buyer_available_time_start}
                      onChange={(e) => handleInputChange('buyer_available_time_start', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Uygun saat bitiş</FormLabel>
                    <Select
                      value={formData.buyer_available_time_end}
                      onChange={(e) => handleInputChange('buyer_available_time_end', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>
          </>
        )}

        {/* SATICI İÇİN ÖZEL BÖLÜMLER */}
        {isSeller && (
          <>
            {/* 4) MÜLK BİLGİLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Home} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Mülk Bilgileri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Mülk Adresi</FormLabel>
                  <Textarea
                    value={formData.seller_property_address}
                    onChange={(e) => handleInputChange('seller_property_address', e.target.value)}
                    placeholder="Tam adres veya kısmi adres bilgisi"
                    rows={2}
                    bg={inputBg}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Emlak Tipi</FormLabel>
                    <Select
                      value={formData.seller_property_type}
                      onChange={(e) => handleInputChange('seller_property_type', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {propertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Oda Sayısı</FormLabel>
                    <Select
                      value={formData.seller_room_count}
                      onChange={(e) => handleInputChange('seller_room_count', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {roomOptions.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Net Metrekare</FormLabel>
                    <NumberInput
                      value={formData.seller_area_net}
                      onChange={(val) => handleInputChange('seller_area_net', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Brüt Metrekare</FormLabel>
                    <NumberInput
                      value={formData.seller_area_gross}
                      onChange={(val) => handleInputChange('seller_area_gross', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bina Yaşı</FormLabel>
                    <Select
                      value={formData.seller_building_age}
                      onChange={(e) => handleInputChange('seller_building_age', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {buildingAgeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bulunduğu Kat</FormLabel>
                    <Select
                      value={formData.seller_floor}
                      onChange={(e) => handleInputChange('seller_floor', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {floorOptions.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Toplam Kat Sayısı</FormLabel>
                    <NumberInput
                      value={formData.seller_total_floors}
                      onChange={(val) => handleInputChange('seller_total_floors', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Isıtma Sistemi</FormLabel>
                    <Select
                      value={formData.seller_heating}
                      onChange={(e) => handleInputChange('seller_heating', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {heatingOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="seller_in_site" mb="0" fontSize="sm" fontWeight="medium">
                    Site içinde mi?
                  </FormLabel>
                  <Checkbox
                    id="seller_in_site"
                    isChecked={formData.seller_in_site}
                    onChange={(e) => handleInputChange('seller_in_site', e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Özellikler</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Checkbox
                      isChecked={formData.seller_features.balcony}
                      onChange={(e) => handleSellerFeatureChange('balcony', e.target.checked)}
                      colorScheme="blue"
                    >
                      Balkon
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.seller_features.parking}
                      onChange={(e) => handleSellerFeatureChange('parking', e.target.checked)}
                      colorScheme="blue"
                    >
                      Otopark
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.seller_features.elevator}
                      onChange={(e) => handleSellerFeatureChange('elevator', e.target.checked)}
                      colorScheme="blue"
                    >
                      Asansör
                    </Checkbox>
                  </SimpleGrid>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Tapu Durumu</FormLabel>
                    <Select
                      value={formData.seller_deed_status}
                      onChange={(e) => handleInputChange('seller_deed_status', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {deedStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Kira Getirisi (Opsiyonel)</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                      <NumberInput
                        value={formData.seller_rental_income}
                        onChange={(val) => handleInputChange('seller_rental_income', Number(val))}
                        min={0}
                        w="100%"
                      >
                        <NumberInputField bg={inputBg} />
                      </NumberInput>
                    </InputGroup>
                    <FormHelperText fontSize="xs">Aylık kira geliri varsa</FormHelperText>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* 5) SATIŞ BEKLENTİSİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={DollarSign} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Satış Beklentisi</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">Beklenen Satış Fiyatı</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                      <NumberInput
                        value={formData.seller_expected_price}
                        onChange={(val) => handleInputChange('seller_expected_price', Number(val))}
                        min={0}
                        w="100%"
                      >
                        <NumberInputField bg={inputBg} />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Minimum Kabul Edilen Fiyat</FormLabel>
                    <InputGroup>
                      <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                      <NumberInput
                        value={formData.seller_min_price}
                        onChange={(val) => handleInputChange('seller_min_price', Number(val))}
                        min={0}
                        w="100%"
                      >
                        <NumberInputField bg={inputBg} />
                      </NumberInput>
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Satış Aciliyeti</FormLabel>
                    <Select
                      value={formData.seller_urgency}
                      onChange={(e) => handleInputChange('seller_urgency', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {urgencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Satış Nedeni</FormLabel>
                    <Select
                      value={formData.seller_reason}
                      onChange={(e) => handleInputChange('seller_reason', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {saleReasonOptions.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* 6) YETKİ DURUMU */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Award} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Yetki Durumu</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Yetki Türü</FormLabel>
                  <Select
                    value={formData.seller_authorization_type}
                    onChange={(e) => handleInputChange('seller_authorization_type', e.target.value)}
                    placeholder="Seçiniz"
                    bg={inputBg}
                  >
                    {authorizationTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Yetki Başlangıç Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.seller_authorization_start}
                      onChange={(e) => handleInputChange('seller_authorization_start', e.target.value)}
                      bg={inputBg}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Yetki Bitiş Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.seller_authorization_end}
                      onChange={(e) => handleInputChange('seller_authorization_end', e.target.value)}
                      bg={inputBg}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Yetki Sözleşmesi</FormLabel>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    bg={inputBg}
                    pt={1}
                  />
                  <FormHelperText fontSize="xs">Yetki sözleşmesi dosyası yükleyin (opsiyonel)</FormHelperText>
                </FormControl>
              </VStack>
            </Box>

            {/* 7) MÜLK HAZIRLIK & PAZARLAMA */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={ImageIcon} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Mülk Hazırlık & Pazarlama</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">İlan Durumu</FormLabel>
                  <Select
                    value={formData.seller_listing_status}
                    onChange={(e) => handleInputChange('seller_listing_status', e.target.value)}
                    placeholder="Seçiniz"
                    bg={inputBg}
                  >
                    {listingStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Checkbox
                    isChecked={formData.seller_photo_video_done}
                    onChange={(e) => handleInputChange('seller_photo_video_done', e.target.checked)}
                    colorScheme="blue"
                  >
                    Fotoğraf/Video çekildi mi?
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.seller_virtual_tour}
                    onChange={(e) => handleInputChange('seller_virtual_tour', e.target.checked)}
                    colorScheme="blue"
                  >
                    3D sanal tur / Drone çekimi
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.seller_description_ready}
                    onChange={(e) => handleInputChange('seller_description_ready', e.target.checked)}
                    colorScheme="blue"
                  >
                    Açıklama metni hazır mı?
                  </Checkbox>
                </SimpleGrid>
              </VStack>
            </Box>
          </>
        )}

        {/* KİRACI İÇİN ÖZEL BÖLÜMLER */}
        {isTenant && (
          <>
            {/* 3) KİRA BÜTÇESİ & BÖLGELER */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={DollarSign} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Kira Bütçesi & Bölgeler</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Maksimum Kira Bütçesi</FormLabel>
                  <InputGroup>
                    <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                    <NumberInput
                      value={formData.tenant_max_rent_budget}
                      onChange={(val) => handleInputChange('tenant_max_rent_budget', Number(val))}
                      min={0}
                      w="100%"
                    >
                      <NumberInputField bg={inputBg} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">İlgilendiği Bölgeler</FormLabel>
                  <HStack>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={MapPin} color="gray.400" boxSize={4} />
                      </InputLeftElement>
                      <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                        placeholder="Bölge ekle (örn: Kadıköy)"
                        bg={inputBg}
                      />
                    </InputGroup>
                    <Button onClick={addLocation} colorScheme="blue" size="md">Ekle</Button>
                  </HStack>
                  <Wrap mt={3} spacing={2}>
                    {formData.tenant_preferred_locations.map((loc, idx) => (
                      <WrapItem key={idx}>
                        <Tag size="lg" colorScheme="blue" borderRadius="full">
                          <TagLabel>{loc}</TagLabel>
                          <TagCloseButton onClick={() => removeLocation(loc)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>
              </VStack>
            </Box>

            {/* 4) ARADIĞI MÜLK ÖZELLİKLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Home} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Aradığı Mülk Özellikleri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Emlak Tipi</FormLabel>
                    <Select
                      value={formData.tenant_property_type}
                      onChange={(e) => handleInputChange('tenant_property_type', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {tenantPropertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bina Yaşı</FormLabel>
                    <Select
                      value={formData.tenant_building_age}
                      onChange={(e) => handleInputChange('tenant_building_age', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {buildingAgeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Isıtma Tipi</FormLabel>
                    <Select
                      value={formData.tenant_heating}
                      onChange={(e) => handleInputChange('tenant_heating', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {heatingOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Oda Sayısı</FormLabel>
                  <CheckboxGroup
                    value={formData.tenant_room_count}
                    onChange={(val) => handleInputChange('tenant_room_count', val)}
                  >
                    <Wrap spacing={3}>
                      {roomOptions.map(room => (
                        <WrapItem key={room}>
                          <Checkbox value={room} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{room}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Minimum Metrekare</FormLabel>
                    <NumberInput
                      value={formData.tenant_area_min}
                      onChange={(val) => handleInputChange('tenant_area_min', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Maksimum Metrekare</FormLabel>
                    <NumberInput
                      value={formData.tenant_area_max}
                      onChange={(val) => handleInputChange('tenant_area_max', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Kat Tercihi</FormLabel>
                  <CheckboxGroup
                    value={formData.tenant_floor_preference}
                    onChange={(val) => handleInputChange('tenant_floor_preference', val)}
                  >
                    <Wrap spacing={3}>
                      {floorOptions.map(floor => (
                        <WrapItem key={floor}>
                          <Checkbox value={floor} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{floor}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Özellikler</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Checkbox
                      isChecked={formData.tenant_features.furnished}
                      onChange={(e) => handleTenantFeatureChange('furnished', e.target.checked)}
                      colorScheme="blue"
                    >
                      Eşyalı olsun
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.unfurnished}
                      onChange={(e) => handleTenantFeatureChange('unfurnished', e.target.checked)}
                      colorScheme="blue"
                    >
                      Eşyasız olsun
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.in_site}
                      onChange={(e) => handleTenantFeatureChange('in_site', e.target.checked)}
                      colorScheme="blue"
                    >
                      Sitede olsun
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.balcony}
                      onChange={(e) => handleTenantFeatureChange('balcony', e.target.checked)}
                      colorScheme="blue"
                    >
                      Balkon
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.parking}
                      onChange={(e) => handleTenantFeatureChange('parking', e.target.checked)}
                      colorScheme="blue"
                    >
                      Otopark
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.elevator}
                      onChange={(e) => handleTenantFeatureChange('elevator', e.target.checked)}
                      colorScheme="blue"
                    >
                      Asansör
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.pet_friendly}
                      onChange={(e) => handleTenantFeatureChange('pet_friendly', e.target.checked)}
                      colorScheme="blue"
                    >
                      Evcil hayvana uygun
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.tenant_features.family_friendly}
                      onChange={(e) => handleTenantFeatureChange('family_friendly', e.target.checked)}
                      colorScheme="blue"
                    >
                      Çocuklu aileye uygun
                    </Checkbox>
                  </SimpleGrid>
                </FormControl>
              </VStack>
            </Box>

            {/* 5) KİRA GİRİŞ TARİHİ & SÜRE */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Calendar} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Kira Giriş Tarihi & Süre</Heading>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Taşınmak İstediği Tarih</FormLabel>
                  <Input
                    type="date"
                    value={formData.tenant_move_in_date}
                    onChange={(e) => handleInputChange('tenant_move_in_date', e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Kira Süresi Tercihi</FormLabel>
                  <Select
                    value={formData.tenant_lease_duration}
                    onChange={(e) => handleInputChange('tenant_lease_duration', e.target.value)}
                    placeholder="Seçiniz"
                    bg={inputBg}
                  >
                    {leaseDurationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* 6) GELİR & UYGUNLUK BİLGİLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={TrendingUp} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Gelir & Uygunluk Bilgileri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Aylık Gelir Aralığı</FormLabel>
                    <Select
                      value={formData.tenant_monthly_income}
                      onChange={(e) => handleInputChange('tenant_monthly_income', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {incomeRangeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                    <FormHelperText fontSize="xs">Opsiyonel</FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Çalışma Durumu</FormLabel>
                    <Select
                      value={formData.tenant_employment_status}
                      onChange={(e) => handleInputChange('tenant_employment_status', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {employmentStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Kaç Kişi Yaşayacak?</FormLabel>
                    <Select
                      value={formData.tenant_occupants_count}
                      onChange={(e) => handleInputChange('tenant_occupants_count', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {occupantsCountOptions.map(count => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="tenant_has_pets" mb="0" fontSize="sm" fontWeight="medium">
                      Evcil Hayvan Var mı?
                    </FormLabel>
                    <Checkbox
                      id="tenant_has_pets"
                      isChecked={formData.tenant_has_pets}
                      onChange={(e) => handleInputChange('tenant_has_pets', e.target.checked)}
                      colorScheme="blue"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* 7) İLETİŞİM MÜSAİTLİĞİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Clock} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>İletişim Müsaitliği</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Tercih edilen iletişim yöntemi</FormLabel>
                  <RadioGroup
                    value={formData.tenant_preferred_contact_method}
                    onChange={(val) => handleInputChange('tenant_preferred_contact_method', val)}
                  >
                    <Stack direction="row" spacing={5}>
                      <Radio value="phone" colorScheme="blue">Telefon</Radio>
                      <Radio value="whatsapp" colorScheme="blue">WhatsApp</Radio>
                      <Radio value="email" colorScheme="blue">E-posta</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Müsait Günler</FormLabel>
                  <CheckboxGroup
                    value={formData.tenant_available_days}
                    onChange={(val) => handleInputChange('tenant_available_days', val)}
                  >
                    <Wrap spacing={3}>
                      {availableDaysOptions.map(opt => (
                        <WrapItem key={opt.value}>
                          <Checkbox value={opt.value} colorScheme="blue">
                            <Badge colorScheme="gray" fontSize="sm">{opt.label}</Badge>
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </CheckboxGroup>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Müsait Saat Başlangıç</FormLabel>
                    <Select
                      value={formData.tenant_available_time_start}
                      onChange={(e) => handleInputChange('tenant_available_time_start', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Müsait Saat Bitiş</FormLabel>
                    <Select
                      value={formData.tenant_available_time_end}
                      onChange={(e) => handleInputChange('tenant_available_time_end', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>
          </>
        )}

        {/* EV SAHİBİ İÇİN ÖZEL BÖLÜMLER */}
        {isLandlord && (
          <>
            {/* 3) MÜLK BİLGİLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Home} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Mülk Bilgileri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium">Mülk Adresi</FormLabel>
                  <Textarea
                    value={formData.landlord_property_address}
                    onChange={(e) => handleInputChange('landlord_property_address', e.target.value)}
                    placeholder="Tam adres bilgisi"
                    rows={2}
                    bg={inputBg}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Emlak Tipi</FormLabel>
                    <Select
                      value={formData.landlord_property_type}
                      onChange={(e) => handleInputChange('landlord_property_type', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {landlordPropertyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Oda Sayısı</FormLabel>
                    <Select
                      value={formData.landlord_room_count}
                      onChange={(e) => handleInputChange('landlord_room_count', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {roomOptions.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Net Metrekare</FormLabel>
                    <NumberInput
                      value={formData.landlord_area_net}
                      onChange={(val) => handleInputChange('landlord_area_net', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Brüt Metrekare</FormLabel>
                    <NumberInput
                      value={formData.landlord_area_gross}
                      onChange={(val) => handleInputChange('landlord_area_gross', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} placeholder="m²" />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bina Yaşı</FormLabel>
                    <Select
                      value={formData.landlord_building_age}
                      onChange={(e) => handleInputChange('landlord_building_age', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {buildingAgeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Bulunduğu Kat</FormLabel>
                    <Select
                      value={formData.landlord_floor}
                      onChange={(e) => handleInputChange('landlord_floor', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {floorOptions.map(floor => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Toplam Kat Sayısı</FormLabel>
                    <NumberInput
                      value={formData.landlord_total_floors}
                      onChange={(val) => handleInputChange('landlord_total_floors', Number(val))}
                      min={0}
                    >
                      <NumberInputField bg={inputBg} />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Isıtma Tipi</FormLabel>
                    <Select
                      value={formData.landlord_heating}
                      onChange={(e) => handleInputChange('landlord_heating', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {heatingOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="landlord_in_site" mb="0" fontSize="sm" fontWeight="medium">
                    Site içinde mi?
                  </FormLabel>
                  <Checkbox
                    id="landlord_in_site"
                    isChecked={formData.landlord_in_site}
                    onChange={(e) => handleInputChange('landlord_in_site', e.target.checked)}
                    colorScheme="blue"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Özellikler</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    <Checkbox
                      isChecked={formData.landlord_features.balcony}
                      onChange={(e) => handleLandlordFeatureChange('balcony', e.target.checked)}
                      colorScheme="blue"
                    >
                      Balkon
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.landlord_features.parking}
                      onChange={(e) => handleLandlordFeatureChange('parking', e.target.checked)}
                      colorScheme="blue"
                    >
                      Otopark
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.landlord_features.elevator}
                      onChange={(e) => handleLandlordFeatureChange('elevator', e.target.checked)}
                      colorScheme="blue"
                    >
                      Asansör
                    </Checkbox>
                  </SimpleGrid>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Tapu Türü</FormLabel>
                    <Select
                      value={formData.landlord_deed_type}
                      onChange={(e) => handleInputChange('landlord_deed_type', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {deedTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Mülk Durumu</FormLabel>
                    <Select
                      value={formData.landlord_property_status}
                      onChange={(e) => handleInputChange('landlord_property_status', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {propertyStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {formData.landlord_property_status === 'rented' && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Mevcut Kira Bedeli</FormLabel>
                      <InputGroup>
                        <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                        <NumberInput
                          value={formData.landlord_current_rent}
                          onChange={(val) => handleInputChange('landlord_current_rent', Number(val))}
                          min={0}
                          w="100%"
                        >
                          <NumberInputField bg={inputBg} />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Kiracı Çıkış Tarihi</FormLabel>
                      <Input
                        type="date"
                        value={formData.landlord_tenant_exit_date}
                        onChange={(e) => handleInputChange('landlord_tenant_exit_date', e.target.value)}
                        bg={inputBg}
                      />
                    </FormControl>
                  </SimpleGrid>
                )}
              </VStack>
            </Box>

            {/* 4) EV SAHİBİNİN TALEBİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={TrendingUp} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Ev Sahibinin Talebi</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Talebi</FormLabel>
                  <Select
                    value={formData.landlord_request_type}
                    onChange={(e) => handleInputChange('landlord_request_type', e.target.value)}
                    placeholder="Seçiniz"
                    bg={inputBg}
                  >
                    {requestTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {(formData.landlord_request_type === 'sell' || formData.landlord_request_type === 'both') && (
                    <>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">Beklediği Satış Fiyatı</FormLabel>
                        <InputGroup>
                          <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                          <NumberInput
                            value={formData.landlord_expected_sale_price}
                            onChange={(val) => handleInputChange('landlord_expected_sale_price', Number(val))}
                            min={0}
                            w="100%"
                          >
                            <NumberInputField bg={inputBg} />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="medium">Minimum Kabul Edilen Fiyat</FormLabel>
                        <InputGroup>
                          <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                          <NumberInput
                            value={formData.landlord_min_price}
                            onChange={(val) => handleInputChange('landlord_min_price', Number(val))}
                            min={0}
                            w="100%"
                          >
                            <NumberInputField bg={inputBg} />
                          </NumberInput>
                        </InputGroup>
                      </FormControl>
                    </>
                  )}

                  {(formData.landlord_request_type === 'rent' || formData.landlord_request_type === 'both') && (
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Beklenen Kira</FormLabel>
                      <InputGroup>
                        <InputLeftAddon bg={inputBg}>₺</InputLeftAddon>
                        <NumberInput
                          value={formData.landlord_expected_rent}
                          onChange={(val) => handleInputChange('landlord_expected_rent', Number(val))}
                          min={0}
                          w="100%"
                        >
                          <NumberInputField bg={inputBg} />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Satış/Kiralama Aciliyeti</FormLabel>
                    <Select
                      value={formData.landlord_urgency}
                      onChange={(e) => handleInputChange('landlord_urgency', e.target.value)}
                      placeholder="Seçiniz"
                      bg={inputBg}
                    >
                      {urgencyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Talep Açıklaması</FormLabel>
                  <Textarea
                    value={formData.landlord_request_description}
                    onChange={(e) => handleInputChange('landlord_request_description', e.target.value)}
                    placeholder="Ev sahibinin özel talepleri, beklentileri..."
                    rows={3}
                    bg={inputBg}
                  />
                </FormControl>
              </VStack>
            </Box>

            {/* 5) YETKİ DURUMU */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={Award} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Yetki Durumu</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Yetki Türü</FormLabel>
                  <Select
                    value={formData.landlord_authorization_type}
                    onChange={(e) => handleInputChange('landlord_authorization_type', e.target.value)}
                    placeholder="Seçiniz"
                    bg={inputBg}
                  >
                    {authorizationTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Yetki Başlangıç Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.landlord_authorization_start}
                      onChange={(e) => handleInputChange('landlord_authorization_start', e.target.value)}
                      bg={inputBg}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">Yetki Bitiş Tarihi</FormLabel>
                    <Input
                      type="date"
                      value={formData.landlord_authorization_end}
                      onChange={(e) => handleInputChange('landlord_authorization_end', e.target.value)}
                      bg={inputBg}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Sözleşme Dosyası</FormLabel>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    bg={inputBg}
                    pt={1}
                  />
                  <FormHelperText fontSize="xs">PDF veya JPG formatında yükleyin</FormHelperText>
                </FormControl>
              </VStack>
            </Box>

            {/* 6) PAZARLAMA BİLGİLERİ */}
            <Box bg={sectionBg} p={6} borderRadius="lg">
              <HStack mb={4}>
                <Icon as={ImageIcon} color="blue.500" boxSize={5} />
                <Heading size="md" color={labelColor}>Pazarlama Bilgileri</Heading>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Checkbox
                    isChecked={formData.landlord_photo_video_done}
                    onChange={(e) => handleInputChange('landlord_photo_video_done', e.target.checked)}
                    colorScheme="blue"
                  >
                    Fotoğraf/Video çekildi mi?
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.landlord_listing_live}
                    onChange={(e) => handleInputChange('landlord_listing_live', e.target.checked)}
                    colorScheme="blue"
                  >
                    İlan yayında mı?
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.landlord_description_ready}
                    onChange={(e) => handleInputChange('landlord_description_ready', e.target.checked)}
                    colorScheme="blue"
                  >
                    Açıklama metni hazır mı?
                  </Checkbox>

                  <Checkbox
                    isChecked={formData.landlord_virtual_tour}
                    onChange={(e) => handleInputChange('landlord_virtual_tour', e.target.checked)}
                    colorScheme="blue"
                  >
                    3D çekim / Drone çekimi
                  </Checkbox>
                </SimpleGrid>
              </VStack>
            </Box>
          </>
        )}

        {/* 8) NOTLAR */}
        <Box bg={sectionBg} p={6} borderRadius="lg">
          <HStack mb={4}>
            <Icon as={FileText} color="blue.500" boxSize={5} />
            <Heading size="md" color={labelColor}>Notlar</Heading>
          </HStack>
          
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Önemli Not</FormLabel>
              <Input
                value={formData.important_note}
                onChange={(e) => handleInputChange('important_note', e.target.value)}
                placeholder="Kısa ve önemli bilgi"
                bg={inputBg}
              />
              <FormHelperText fontSize="xs">Hızlı hatırlatma için kısa not</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Detaylı Notlar</FormLabel>
              <Textarea
                value={formData.detailed_notes}
                onChange={(e) => handleInputChange('detailed_notes', e.target.value)}
                placeholder="Müşteri hakkında detaylı bilgiler, tercihler, özel istekler..."
                rows={5}
                bg={inputBg}
                resize="vertical"
              />
              <FormHelperText fontSize="xs">
                Müşteri ile ilgili tüm detayları buraya yazabilirsiniz
              </FormHelperText>
            </FormControl>
          </VStack>
        </Box>

        {/* 9) SORUMLU DANIŞMAN (İZOLASYON) */}
        <Box bg={sectionBg} p={6} borderRadius="lg" borderWidth="2px" borderColor="blue.200">
          <HStack mb={4}>
            <Icon as={User} color="blue.500" boxSize={5} />
            <Heading size="md" color={labelColor}>Sorumlu Danışman</Heading>
          </HStack>
          
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Danışman</FormLabel>
            <Input
              value={user?.email || 'Giriş yapan kullanıcı'}
              isReadOnly
              bg="blue.50"
              fontWeight="semibold"
              color="blue.700"
            />
            <FormHelperText fontSize="xs" color="blue.600">
              Bu müşteri sadece size özeldir. Başka hiçbir danışman bu müşteriyi göremez.
            </FormHelperText>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Flex justify="flex-end" gap={3} pt={4}>
          <Button
            variant="ghost"
            onClick={onCancel}
            leftIcon={<X size={18} />}
            size="lg"
          >
            İptal
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText={customer?.id ? 'Güncelleniyor...' : 'Ekleniyor...'}
            leftIcon={<Check size={18} />}
            size="lg"
            px={8}
          >
            {customer?.id ? 'Güncelle' : 'Müşteri Ekle'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default CustomerForm;
