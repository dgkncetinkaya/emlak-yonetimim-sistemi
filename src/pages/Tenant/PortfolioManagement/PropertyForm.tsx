import { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Select, Textarea, SimpleGrid,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Flex, Button, Icon, Text, VStack, HStack, Image,
  useToast, Divider, useColorModeValue, Switch, InputGroup, InputRightAddon,
  Heading, Badge
} from '@chakra-ui/react';
import { Upload, X as FiX, Save, Home } from 'react-feather';
import { useMutation } from '@tanstack/react-query';
import { propertiesService } from '../../../services/propertiesService';

interface PropertyFormProps {
  property?: any;
  onChange?: (data: any) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PropertyForm = ({ property, onChange, onSuccess, onCancel }: PropertyFormProps) => {
  const toast = useToast();
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Normalize rooms value
  const normalizeRooms = (rooms: string | undefined): string => {
    if (!rooms) return '';
    const cleaned = rooms.replace(/\s/g, '');
    if (['1+0', '1+1', '2+1', '3+1', '4+1', '5+1'].includes(cleaned)) {
      return cleaned;
    }
    const match = cleaned.match(/(\d)\+(\d)/);
    if (match) {
      return `${match[1]}+${match[2]}`;
    }
    return cleaned;
  };

  const [form, setForm] = useState<any>({
    // Temel Bilgiler
    title: property?.title || '',
    listing_type: property?.listing_type || 'for_sale',
    price: property?.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
    property_type: property?.property_type || 'apartment',
    property_subtype: property?.property_subtype || '',
    
    // Alan ve Oda
    area: property?.area || property?.area_gross || 0,
    rooms: normalizeRooms(property?.rooms),
    
    // Bina Bilgileri
    building_age: property?.building_age || 0,
    floor: property?.floor || 0,
    total_floors: property?.total_floors || 0,
    
    // Isıtma ve Özellikler
    heating: property?.heating || '',
    bathrooms: property?.bathrooms || 1,
    kitchen_type: property?.kitchen_type || '',
    balcony: property?.balcony || false,
    elevator: property?.elevator || false,
    parking: property?.parking || '',
    furnished: property?.furnished || false,
    usage_status: property?.usage_status || '',
    
    // Site Bilgileri
    in_site: property?.in_site || false,
    site_name: property?.site_name || '',
    dues: property?.dues || 0,
    
    // Tapu ve Kredi
    suitable_for_credit: property?.suitable_for_credit || false,
    deed_status: property?.deed_status || '',
    exchange: property?.exchange || false,
    
    // Kiralık için Depozito
    deposit: property?.deposit || 0,
    
    // Konum
    city: property?.city || '',
    district: property?.district || '',
    neighborhood: property?.neighborhood || '',
    address: property?.address || '',
    
    // Müşteri Bilgileri (İzole)
    customer_name: property?.customer_name || '',
    customer_phone: property?.customer_phone || '',
    customer_email: property?.customer_email || '',
    customer_notes: property?.customer_notes || '',
    
    // Açıklama
    description: property?.description || '',
    status: property?.status || 'active',
  });
  
  const [images, setImages] = useState<string[]>(property?.images || property?.image_urls || []);

  // Update form when property changes
  useEffect(() => {
    if (property) {
      console.log('🔄 Updating form with property:', property);
      setForm({
        title: property.title || '',
        listing_type: property.listing_type || 'for_sale',
        price: property.price ? (typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : property.price) : 0,
        property_type: property.property_type || 'apartment',
        property_subtype: property.property_subtype || '',
        area: property.area || property.area_gross || 0,
        rooms: normalizeRooms(property.rooms),
        building_age: property.building_age || 0,
        floor: property.floor || 0,
        total_floors: property.total_floors || 0,
        heating: property.heating || '',
        bathrooms: property.bathrooms || 1,
        kitchen_type: property.kitchen_type || '',
        balcony: property.balcony || false,
        elevator: property.elevator || false,
        parking: property.parking || '',
        furnished: property.furnished || false,
        usage_status: property.usage_status || '',
        in_site: property.in_site || false,
        site_name: property.site_name || '',
        dues: property.dues || 0,
        suitable_for_credit: property.suitable_for_credit || false,
        deed_status: property.deed_status || '',
        exchange: property.exchange || false,
        deposit: property.deposit || 0,
        city: property.city || '',
        district: property.district || '',
        neighborhood: property.neighborhood || '',
        address: property.address || '',
        customer_name: property.customer_name || '',
        customer_phone: property.customer_phone || '',
        customer_email: property.customer_email || '',
        customer_notes: property.customer_notes || '',
        description: property.description || '',
        status: property.status || 'active',
      });
      setImages(property.images || property.image_urls || []);
      console.log('✅ Form updated');
    }
  }, [property]);

  useEffect(() => {
    onChange?.({ ...form, images });
  }, [form, images]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (property?.id) {
        return propertiesService.updateProperty(property.id, data);
      } else {
        return propertiesService.createProperty(data);
      }
    },
    onSuccess: () => {
      toast({
        title: property?.id ? 'İlan güncellendi' : 'İlan eklendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'İşlem sırasında bir hata oluştu',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const handleSubmit = () => {
    if (!form.title || !form.city || !form.district || !form.address) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const dataToSave = {
      ...form,
      images: images,
    };
    
    console.log('💾 Saving property with data:', dataToSave);
    saveMutation.mutate(dataToSave);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Temel Bilgiler */}
        <Box>
          <HStack mb={4}>
            <Icon as={Home} color="blue.500" />
            <Heading size="md" color={labelColor}>Temel Bilgiler</Heading>
          </HStack>
          
          {/* İlan Başlığı - Tek başına üstte */}
          <FormControl isRequired>
            <FormLabel fontSize="sm">İlan Başlığı</FormLabel>
            <Input 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})}
              placeholder="Örn: Merkez Mahallesi 3+1 Daire"
              bg={inputBg}
            />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {/* Emlak Türü */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Emlak Türü</FormLabel>
              <Select 
                value={form.property_type} 
                onChange={(e) => {
                  setForm({...form, property_type: e.target.value, property_subtype: ''});
                }}
                bg={inputBg}
              >
                <option value="apartment">Konut</option>
                <option value="office">İşyeri</option>
                <option value="land">Arsa</option>
                <option value="building">Bina</option>
                <option value="timeshare">Devremülk</option>
                <option value="tourism">Turistik Tesis</option>
              </Select>
            </FormControl>

            {/* İlan Tipi */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">İlan Tipi</FormLabel>
              <Select 
                value={form.listing_type} 
                onChange={(e) => {
                  // İlan tipi değiştiğinde alt kategoriyi sıfırla (işyeri için)
                  if (form.property_type === 'office') {
                    setForm({...form, listing_type: e.target.value, property_subtype: ''});
                  } else {
                    setForm({...form, listing_type: e.target.value});
                  }
                }}
                bg={inputBg}
              >
                <option value="for_sale">Satılık</option>
                <option value="for_rent">Kiralık</option>
                {/* İşyeri seçiliyse devren seçenekleri ekle */}
                {form.property_type === 'office' && (
                  <>
                    <option value="for_sale_transfer">Devren Satılık</option>
                    <option value="for_rent_transfer">Devren Kiralık</option>
                  </>
                )}
                {/* Arsa seçiliyse kat karşılığı seçeneği ekle */}
                {form.property_type === 'land' && (
                  <option value="for_sale_floor_share">Kat Karşılığı Satılık</option>
                )}
              </Select>
            </FormControl>

            {/* Alt Kategori - Konut */}
            {form.property_type === 'apartment' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Konut Tipi</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="daire">Daire</option>
                  <option value="rezidans">Rezidans</option>
                  <option value="mustakil_ev">Müstakil Ev</option>
                  <option value="villa">Villa</option>
                  <option value="ciftlik_evi">Çiftlik Evi</option>
                  <option value="kosk_konak">Köşk & Konak</option>
                  <option value="yali">Yalı</option>
                  <option value="yali_dairesi">Yalı Dairesi</option>
                  <option value="yazlik">Yazlık</option>
                  <option value="kooperatif">Kooperatif</option>
                </Select>
              </FormControl>
            )}

            {/* Alt Kategori - İşyeri Satılık */}
            {form.property_type === 'office' && form.listing_type === 'for_sale' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">İşyeri Tipi</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="akaryakit_istasyonu">Akaryakıt İstasyonu</option>
                  <option value="apartman_dairesi">Apartman Dairesi</option>
                  <option value="atolye">Atölye</option>
                  <option value="avm">AVM</option>
                  <option value="bufe">Büfe</option>
                  <option value="buro_ofis">Büro & Ofis</option>
                  <option value="ciftlik">Çiftlik</option>
                  <option value="depo_antrepo">Depo & Antrepo</option>
                  <option value="dugun_salonu">Düğün Salonu</option>
                  <option value="dukkan_magaza">Dükkan & Mağaza</option>
                  <option value="enerji_santrali">Enerji Santrali</option>
                  <option value="fabrika_uretim_tesisi">Fabrika & Üretim Tesisi</option>
                  <option value="garaj_park_yeri">Garaj & Park Yeri</option>
                  <option value="imalathane">İmalathane</option>
                  <option value="is_hani_kati_ofisi">İş Hanı Katı & Ofisi</option>
                  <option value="kafe_bar">Kafe & Bar</option>
                  <option value="kantin">Kantin</option>
                  <option value="kir_kahvalti_bahcesi">Kır & Kahvaltı Bahçesi</option>
                  <option value="kiraathane">Kıraathane</option>
                  <option value="komple_bina">Komple Bina</option>
                  <option value="maden_ocagi">Maden Ocağı</option>
                  <option value="otopark_garaj">Otopark & Garaj</option>
                  <option value="oto_yikama_kuafor">Oto Yıkama & Kuaför</option>
                  <option value="pastane_firin_tatlici">Pastane, Fırın & Tatlıcı</option>
                  <option value="pazar_yeri">Pazar Yeri</option>
                  <option value="plaza">Plaza</option>
                  <option value="plaza_kati_ofisi">Plaza Katı & Ofisi</option>
                  <option value="radyo_istasyonu_tv_kanali">Radyo İstasyonu & TV Kanalı</option>
                  <option value="restoran_lokanta">Restoran & Lokanta</option>
                  <option value="rezidans_kati_ofisi">Rezidans Katı & Ofisi</option>
                  <option value="saglik_merkezi">Sağlık Merkezi</option>
                  <option value="sinema_konferans_salonu">Sinema & Konferans Salonu</option>
                  <option value="spa_hamam_sauna">SPA, Hamam & Sauna</option>
                  <option value="spor_tesisi">Spor Tesisi</option>
                  <option value="yurt">Yurt</option>
                </Select>
              </FormControl>
            )}

            {/* Alt Kategori - İşyeri Devren (Satılık veya Kiralık) */}
            {form.property_type === 'office' && (form.listing_type === 'for_sale_transfer' || form.listing_type === 'for_rent_transfer') && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">İşyeri Tipi (Devren)</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="acente">Acente</option>
                  <option value="akaryakit_istasyonu">Akaryakıt İstasyonu</option>
                  <option value="aktar_baharatci">Aktar & Baharatçı</option>
                  <option value="anaokulu_kres">Anaokulu & Kreş</option>
                  <option value="apartman_dairesi">Apartman Dairesi</option>
                  <option value="arac_showroom_servis">Araç Showroom & Servis</option>
                  <option value="atolye">Atölye</option>
                  <option value="avm_standi">AVM Standı</option>
                  <option value="balikci">Balıkçı</option>
                  <option value="bar">Bar</option>
                  <option value="bijuteri">Bijuteri</option>
                  <option value="borekci">Börekçi</option>
                  <option value="bufe">Büfe</option>
                  <option value="buro_ofis">Büro & Ofis</option>
                  <option value="cep_telefonu_dukkani">Cep Telefonu Dükkanı</option>
                  <option value="camasirhane">Çamaşırhane</option>
                  <option value="cay_ocagi">Çay Ocağı</option>
                  <option value="cicekci_fidanlik">Çiçekçi & Fidanlık</option>
                  <option value="ciftlik">Çiftlik</option>
                  <option value="depo_antrepo">Depo & Antrepo</option>
                  <option value="dugun_salonu">Düğün Salonu</option>
                  <option value="dukkan_magaza">Dükkan & Mağaza</option>
                  <option value="eczane_medikal">Eczane & Medikal</option>
                  <option value="elektrikci_hirdavatci">Elektrikçi & Hırdavatçı</option>
                  <option value="elektronik_magazasi">Elektronik Mağazası</option>
                  <option value="enerji_santrali">Enerji Santrali</option>
                  <option value="etkinlik_performans_salonu">Etkinlik & Performans Salonu</option>
                  <option value="fabrika_uretim_tesisi">Fabrika & Üretim Tesisi</option>
                  <option value="fatura_merkezi">Fatura Merkezi</option>
                  <option value="fotograf_studyosu">Fotoğraf Stüdyosu</option>
                  <option value="gece_kulubu_disko">Gece Kulübü & Disko</option>
                  <option value="giyim_magazasi">Giyim Mağazası</option>
                  <option value="gozlukcu">Gözlükçü</option>
                  <option value="hali_yikama">Halı Yıkama</option>
                  <option value="huzur_evi">Huzur Evi</option>
                  <option value="imalathane">İmalathane</option>
                  <option value="internet_oyun_kafe">İnternet & Oyun Kafe</option>
                  <option value="is_hani">İş Hanı</option>
                  <option value="is_hani_kati_ofisi">İş Hanı Katı & Ofisi</option>
                  <option value="kafe">Kafe</option>
                  <option value="kantin">Kantin</option>
                  <option value="kasap">Kasap</option>
                  <option value="kir_kahvalti_bahcesi">Kır & Kahvaltı Bahçesi</option>
                  <option value="kiraathane">Kıraathane</option>
                  <option value="kirtasiye">Kırtasiye</option>
                  <option value="kozmetik_magazasi">Kozmetik Mağazası</option>
                  <option value="kuafor_guzellik_merkezi">Kuaför & Güzellik Merkezi</option>
                  <option value="kurs_egitim_merkezi">Kurs & Eğitim Merkezi</option>
                  <option value="kuru_temizleme">Kuru Temizleme</option>
                  <option value="kuruyemisci">Kuruyemişçi</option>
                  <option value="kuyumcu">Kuyumcu</option>
                  <option value="lunapark">Lunapark</option>
                  <option value="maden_ocagi">Maden Ocağı</option>
                  <option value="manav">Manav</option>
                  <option value="market">Market</option>
                  <option value="matbaa">Matbaa</option>
                  <option value="modaevi">Modaevi</option>
                  <option value="muayenehane">Muayenehane</option>
                  <option value="nakliyat_kargo">Nakliyat & Kargo</option>
                  <option value="nalbur">Nalbur</option>
                  <option value="okul_kurs">Okul & Kurs</option>
                  <option value="otopark_garaj">Otopark / Garaj</option>
                  <option value="oto_servis_bakim">Oto Servis & Bakım</option>
                  <option value="oto_yedek_parca">Oto Yedek Parça</option>
                  <option value="oto_yikama_kuafor">Oto Yıkama & Kuaför</option>
                  <option value="ogrenci_yurdu">Öğrenci Yurdu</option>
                  <option value="pastane_firin_tatlici">Pastane, Fırın & Tatlıcı</option>
                  <option value="pazar_yeri">Pazar Yeri</option>
                  <option value="pet_shop">Pet Shop</option>
                  <option value="plaza">Plaza</option>
                  <option value="plaza_kati_ofisi">Plaza Katı & Ofisi</option>
                  <option value="prova_kayit_studyosu">Prova & Kayıt Stüdyosu</option>
                  <option value="radyo_istasyonu_tv_kanali">Radyo İstasyonu & TV Kanalı</option>
                  <option value="restoran_lokanta">Restoran & Lokanta</option>
                  <option value="rezidans_kati_ofisi">Rezidans Katı & Ofisi</option>
                  <option value="saat_magazasi">Saat Mağazası</option>
                  <option value="saglik_merkezi">Sağlık Merkezi</option>
                  <option value="sebze_meyve_hali">Sebze & Meyve Hali</option>
                  <option value="sinema_konferans_salonu">Sinema & Konferans Salonu</option>
                  <option value="soguk_hava_deposu">Soğuk Hava Deposu</option>
                  <option value="spa_hamam_sauna">SPA, Hamam & Sauna</option>
                  <option value="spor_tesisi">Spor Tesisi</option>
                  <option value="su_tup_bayi">Su & Tüp Bayi</option>
                  <option value="sans_oyunlari_bayisi">Şans Oyunları Bayisi</option>
                  <option value="sarkuteri">Şarküteri</option>
                  <option value="taksi_duragi">Taksi Durağı</option>
                  <option value="tamirhane">Tamirhane</option>
                  <option value="tekel_bayi">Tekel Bayi</option>
                  <option value="teknik_servis">Teknik Servis</option>
                  <option value="terzi">Terzi</option>
                  <option value="tuhafiye">Tuhafiye</option>
                  <option value="tuvalet">Tuvalet</option>
                  <option value="veteriner">Veteriner</option>
                  <option value="zuccaciye">Züccaciye</option>
                </Select>
              </FormControl>
            )}

            {/* Alt Kategori - Turistik Tesis Satılık */}
            {form.property_type === 'tourism' && form.listing_type === 'for_sale' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Turistik Tesis Tipi</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="otel">Otel</option>
                  <option value="apart_otel">Apart Otel</option>
                  <option value="butik_otel">Butik Otel</option>
                  <option value="motel">Motel</option>
                  <option value="pansiyon">Pansiyon</option>
                  <option value="kamp_yeri">Kamp Yeri (Mocamp)</option>
                  <option value="tatil_koyu">Tatil Köyü</option>
                </Select>
              </FormControl>
            )}

            {/* Alt Kategori - Turistik Tesis Kiralık */}
            {form.property_type === 'tourism' && form.listing_type === 'for_rent' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">Turistik Tesis Tipi</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="otel">Otel</option>
                  <option value="apart_otel">Apart Otel</option>
                  <option value="butik_otel">Butik Otel</option>
                  <option value="motel">Motel</option>
                  <option value="pansiyon">Pansiyon</option>
                  <option value="kamp_yeri">Kamp Yeri (Mocamp)</option>
                  <option value="tatil_koyu">Tatil Köyü</option>
                  <option value="plaj">Plaj</option>
                </Select>
              </FormControl>
            )}

            {/* Alt Kategori - İşyeri Kiralık (Normal) */}
            {form.property_type === 'office' && form.listing_type === 'for_rent' && (
              <FormControl isRequired>
                <FormLabel fontSize="sm">İşyeri Tipi</FormLabel>
                <Select 
                  value={form.property_subtype} 
                  onChange={(e) => setForm({...form, property_subtype: e.target.value})}
                  bg={inputBg}
                  placeholder="Seçiniz"
                >
                  <option value="akaryakit_istasyonu">Akaryakıt İstasyonu</option>
                  <option value="apartman_dairesi">Apartman Dairesi</option>
                  <option value="atolye">Atölye</option>
                  <option value="avm">AVM</option>
                  <option value="bufe">Büfe</option>
                  <option value="buro_ofis">Büro & Ofis</option>
                  <option value="ciftlik">Çiftlik</option>
                  <option value="depo_antrepo">Depo & Antrepo</option>
                  <option value="dugun_salonu">Düğün Salonu</option>
                  <option value="dukkan_magaza">Dükkan & Mağaza</option>
                  <option value="eczane_medikal">Eczane & Medikal</option>
                  <option value="fabrika_uretim_tesisi">Fabrika & Üretim Tesisi</option>
                  <option value="fotograf_studyosu">Fotoğraf Stüdyosu</option>
                  <option value="garaj_park_yeri">Garaj & Park Yeri</option>
                  <option value="hazir_sanal_ofis">Hazır & Sanal Ofis</option>
                  <option value="imalathane">İmalathane</option>
                  <option value="is_hani_kati_ofisi">İş Hanı Katı & Ofisi</option>
                  <option value="kafe_bar">Kafe & Bar</option>
                  <option value="kantin">Kantin</option>
                  <option value="kir_kahvalti_bahcesi">Kır & Kahvaltı Bahçesi</option>
                  <option value="kiraathane">Kıraathane</option>
                  <option value="komple_bina">Komple Bina</option>
                  <option value="kuafor_guzellik_merkezi">Kuaför & Güzellik Merkezi</option>
                  <option value="maden_ocagi">Maden Ocağı</option>
                  <option value="market">Market</option>
                  <option value="muayenehane">Muayenehane</option>
                  <option value="okul_kurs">Okul & Kurs</option>
                  <option value="otopark">Otopark</option>
                  <option value="oto_yikama_kuafor">Oto Yıkama & Kuaför</option>
                  <option value="pastane_firin_tatlici">Pastane & Fırın & Tatlıcı</option>
                  <option value="pazar_yeri">Pazar Yeri</option>
                  <option value="plaza">Plaza</option>
                  <option value="plaza_kati_ofisi">Plaza Katı & Ofisi</option>
                  <option value="prova_kayit_studyosu">Prova & Kayıt Stüdyosu</option>
                  <option value="radyo_istasyonu_tv_kanali">Radyo İstasyonu & TV Kanalı</option>
                  <option value="restoran_lokanta">Restoran & Lokanta</option>
                  <option value="rezidans_kati_ofisi">Rezidans Katı & Ofisi</option>
                  <option value="saglik_merkezi">Sağlık Merkezi</option>
                  <option value="sinema_konferans_salonu">Sinema & Konferans Salonu</option>
                  <option value="spa_hamam_sauna">Spa, Hamam & Sauna</option>
                  <option value="spor_tesisi">Spor Tesisi</option>
                  <option value="taksi_duragi">Taksi Durağı</option>
                  <option value="tamirhane">Tamirhane</option>
                  <option value="villa">Villa</option>
                  <option value="yurt">Yurt</option>
                </Select>
              </FormControl>
            )}

            {/* Fiyat */}
            <FormControl isRequired>
              <FormLabel fontSize="sm">Fiyat</FormLabel>
              <InputGroup>
                <NumberInput 
                  value={form.price} 
                  onChange={(val) => setForm({...form, price: Number(val)})}
                  min={0}
                  w="100%"
                >
                  <NumberInputField bg={inputBg} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <InputRightAddon>TL</InputRightAddon>
              </InputGroup>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Alan ve Oda Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Alan ve Oda Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">Alan (m²)</FormLabel>
              <NumberInput 
                value={form.area} 
                onChange={(val) => setForm({...form, area: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">Oda Sayısı</FormLabel>
              <Select 
                value={form.rooms} 
                onChange={(e) => setForm({...form, rooms: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="1+0">1+0</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="5+1">5+1</option>
                <option value="6+">6+</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Bina Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Bina Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Bina Yaşı</FormLabel>
              <Input
                type="text"
                value={form.building_age}
                onChange={(e) => setForm({...form, building_age: e.target.value})}
                placeholder="Örn: 0 (Oturuma Hazır), 5, 10"
                bg={inputBg}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Bulunduğu Kat</FormLabel>
              <NumberInput 
                value={form.floor} 
                onChange={(val) => setForm({...form, floor: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Kat Sayısı</FormLabel>
              <NumberInput 
                value={form.total_floors} 
                onChange={(val) => setForm({...form, total_floors: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Özellikler */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Özellikler</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Isıtma</FormLabel>
              <Select 
                value={form.heating} 
                onChange={(e) => setForm({...form, heating: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Kombi (Doğalgaz)">Kombi (Doğalgaz)</option>
                <option value="Merkezi Sistem">Merkezi Sistem</option>
                <option value="Yerden Isıtma">Yerden Isıtma</option>
                <option value="Klima">Klima</option>
                <option value="Soba">Soba</option>
                <option value="Yok">Yok</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Banyo Sayısı</FormLabel>
              <NumberInput 
                value={form.bathrooms} 
                onChange={(val) => setForm({...form, bathrooms: Number(val)})}
                min={1}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Mutfak</FormLabel>
              <Select 
                value={form.kitchen_type} 
                onChange={(e) => setForm({...form, kitchen_type: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Açık (Amerikan)">Açık (Amerikan)</option>
                <option value="Kapalı">Kapalı</option>
                <option value="Ankastre">Ankastre</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Otopark</FormLabel>
              <Select 
                value={form.parking} 
                onChange={(e) => setForm({...form, parking: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Yok">Yok</option>
                <option value="Açık Otopark">Açık Otopark</option>
                <option value="Kapalı Otopark">Kapalı Otopark</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Kullanım Durumu</FormLabel>
              <Select 
                value={form.usage_status} 
                onChange={(e) => setForm({...form, usage_status: e.target.value})}
                bg={inputBg}
              >
                <option value="">Seçiniz</option>
                <option value="Boş">Boş</option>
                <option value="Dolu">Dolu</option>
                <option value="Kiracılı">Kiracılı</option>
                <option value="Mülk Sahibi">Mülk Sahibi</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="balcony" mb="0" fontSize="sm">
                Balkon
              </FormLabel>
              <Switch 
                id="balcony"
                isChecked={form.balcony}
                onChange={(e) => setForm({...form, balcony: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="elevator" mb="0" fontSize="sm">
                Asansör
              </FormLabel>
              <Switch 
                id="elevator"
                isChecked={form.elevator}
                onChange={(e) => setForm({...form, elevator: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="furnished" mb="0" fontSize="sm">
                Eşyalı
              </FormLabel>
              <Switch 
                id="furnished"
                isChecked={form.furnished}
                onChange={(e) => setForm({...form, furnished: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            {/* Takas - Sadece Konut Satılık için */}
            {form.property_type === 'apartment' && form.listing_type === 'for_sale' && (
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="exchange" mb="0" fontSize="sm">
                  Takas
                </FormLabel>
                <Switch 
                  id="exchange"
                  isChecked={form.exchange}
                  onChange={(e) => setForm({...form, exchange: e.target.checked})}
                  colorScheme="blue"
                />
              </FormControl>
            )}
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Site Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Site Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="in_site" mb="0" fontSize="sm">
                Site İçerisinde
              </FormLabel>
              <Switch 
                id="in_site"
                isChecked={form.in_site}
                onChange={(e) => setForm({...form, in_site: e.target.checked})}
                colorScheme="blue"
              />
            </FormControl>

            {form.in_site && (
              <FormControl>
                <FormLabel fontSize="sm">Site Adı</FormLabel>
                <Input 
                  value={form.site_name} 
                  onChange={(e) => setForm({...form, site_name: e.target.value})}
                  placeholder="Site adı"
                  bg={inputBg}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Aidat (TL)</FormLabel>
              <NumberInput 
                value={form.dues} 
                onChange={(val) => setForm({...form, dues: Number(val)})}
                min={0}
              >
                <NumberInputField bg={inputBg} />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Tapu ve Kredi - Konut Satılık için */}
        {form.property_type === 'apartment' && form.listing_type === 'for_sale' && (
          <Box>
            <Heading size="md" color={labelColor} mb={4}>Tapu ve Kredi</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Tapu Durumu</FormLabel>
                <Select 
                  value={form.deed_status} 
                  onChange={(e) => setForm({...form, deed_status: e.target.value})}
                  bg={inputBg}
                >
                  <option value="">Seçiniz</option>
                  <option value="clear">Temiz (Kat Mülkiyetli)</option>
                  <option value="mortgage">İpotekli</option>
                  <option value="disputed">İhtilaf Var</option>
                </Select>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="suitable_for_credit" mb="0" fontSize="sm">
                  Krediye Uygun
                </FormLabel>
                <Switch 
                  id="suitable_for_credit"
                  isChecked={form.suitable_for_credit}
                  onChange={(e) => setForm({...form, suitable_for_credit: e.target.checked})}
                  colorScheme="blue"
                />
              </FormControl>
            </SimpleGrid>
          </Box>
        )}

        {/* Depozito - Konut Kiralık için */}
        {form.property_type === 'apartment' && form.listing_type === 'for_rent' && (
          <Box>
            <Heading size="md" color={labelColor} mb={4}>Depozito</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Depozito (TL)</FormLabel>
                <NumberInput 
                  value={form.deposit} 
                  onChange={(val) => setForm({...form, deposit: Number(val)})}
                  min={0}
                >
                  <NumberInputField bg={inputBg} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </Box>
        )}

        <Divider />

        {/* Konum */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Konum Bilgileri</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm">İl</FormLabel>
              <Input 
                value={form.city} 
                onChange={(e) => setForm({...form, city: e.target.value})} 
                placeholder="İl"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel fontSize="sm">İlçe</FormLabel>
              <Input 
                value={form.district} 
                onChange={(e) => setForm({...form, district: e.target.value})} 
                placeholder="İlçe"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Mahalle</FormLabel>
              <Input 
                value={form.neighborhood} 
                onChange={(e) => setForm({...form, neighborhood: e.target.value})} 
                placeholder="Mahalle"
                bg={inputBg}
              />
            </FormControl>
          </SimpleGrid>

          <FormControl mt={4} isRequired>
            <FormLabel fontSize="sm">Adres</FormLabel>
            <Textarea 
              value={form.address} 
              onChange={(e) => setForm({...form, address: e.target.value})} 
              placeholder="Tam adres"
              rows={2}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Açıklama */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Açıklama</Heading>
          <FormControl>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Gayrimenkul hakkında detaylı açıklama"
              rows={6}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Müşteri Bilgileri */}
        <Box>
          <Heading size="md" color={labelColor} mb={2}>Müşteri İletişim Bilgileri</Heading>
          <Text fontSize="sm" color="orange.500" mb={4}>
            ⚠️ Bu bilgiler sadece sizin tarafınızdan görülebilir. Ofis içinde bile paylaşılmaz.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Müşteri Adı Soyadı</FormLabel>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({...form, customer_name: e.target.value})}
                placeholder="Örn: Ahmet Yılmaz"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Telefon</FormLabel>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({...form, customer_phone: e.target.value})}
                placeholder="Örn: 0532 123 45 67"
                bg={inputBg}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">E-posta</FormLabel>
              <Input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({...form, customer_email: e.target.value})}
                placeholder="Örn: ahmet@example.com"
                bg={inputBg}
              />
            </FormControl>
          </SimpleGrid>
          
          <FormControl mt={4}>
            <FormLabel fontSize="sm">Müşteri Notları</FormLabel>
            <Textarea
              value={form.customer_notes}
              onChange={(e) => setForm({...form, customer_notes: e.target.value})}
              placeholder="Müşteri hakkında özel notlar (sadece siz görebilirsiniz)"
              rows={3}
              bg={inputBg}
            />
          </FormControl>
        </Box>

        <Divider />
        
        {/* Fotoğraflar */}
        <Box>
          <Heading size="md" color={labelColor} mb={4}>Fotoğraflar</Heading>
          <Flex flexWrap="wrap" gap={4}>
            {images.map((image, index) => (
              <Box key={index} position="relative">
                <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  boxSize="100px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Button
                  size="xs"
                  position="absolute"
                  top="-2"
                  right="-2"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => removeImage(index)}
                >
                  <Icon as={FiX} />
                </Button>
              </Box>
            ))}
            
            <Flex
              as="label"
              htmlFor="image-upload"
              boxSize="100px"
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
            >
              <VStack spacing={1}>
                <Icon as={Upload} />
                <Text fontSize="xs">Fotoğraf Ekle</Text>
              </VStack>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                display="none"
              />
            </Flex>
          </Flex>
        </Box>

        {/* Action Buttons */}
        <HStack mt={8} spacing={4} justify="flex-end">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            İptal
          </Button>
          <Button
            leftIcon={<Save />}
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={saveMutation.isPending}
            size="lg"
          >
            {property?.id ? 'Güncelle' : 'Kaydet'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PropertyForm;
