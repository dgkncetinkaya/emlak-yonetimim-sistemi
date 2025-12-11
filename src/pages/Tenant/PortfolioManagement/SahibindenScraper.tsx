import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Image,
  SimpleGrid,
  IconButton,
  Progress,
  HStack,
  Badge,
  Divider
} from '@chakra-ui/react';
import { Download, Upload, X, Image as ImageIcon } from 'react-feather';
import Tesseract from 'tesseract.js';

interface SahibindenScraperProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (propertyData: any) => void;
}

interface ExtractedData {
  title: string;
  price: number;
  city: string;
  district: string;
  neighborhood: string;
  area_net: number;
  area_gross: number;
  rooms: string;
  floor: string;
  total_floors: string;
  building_age: string;
  heating: string;
  bathrooms: number;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  listing_type: 'for_sale' | 'for_rent';
  description: string;
  images: string[];
}

const SahibindenScraper: React.FC<SahibindenScraperProps> = ({ isOpen, onClose, onImport }) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedImages(prev => [...prev, ...newFiles]);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const parseOCRText = (text: string): ExtractedData => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Clean text - OCR often misreads characters
    const cleanText = text
      .replace(/[|]/g, 'I')
      .replace(/[oO]da/g, 'Oda')
      .replace(/[0O]\s*\(/g, '0 (');
    
    console.log('Cleaned OCR Text:', cleanText);
    
    // Initialize data
    const data: ExtractedData = {
      title: '',
      price: 0,
      city: '',
      district: '',
      neighborhood: '',
      area_net: 0,
      area_gross: 0,
      rooms: '',
      floor: '',
      total_floors: '',
      building_age: '',
      heating: '',
      bathrooms: 1,
      balcony: false,
      elevator: false,
      parking: false,
      furnished: false,
      listing_type: 'for_sale',
      description: '',
      images: []
    };

    // Parse price (look for TL pattern) - multiple formats
    const pricePatterns = [
      /(\d{1,3}(?:[.,]\d{3})*)\s*TL/i,
      /(\d+[.,]?\d*[.,]?\d*)\s*TL/i,
      /TL\s*(\d{1,3}(?:[.,]\d{3})*)/i
    ];
    for (const pattern of pricePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.price = parseInt(match[1].replace(/[.,\s]/g, '')) || 0;
        if (data.price > 0) break;
      }
    }

    // Parse location (İstanbul / Esenyurt / Sultaniye pattern)
    const locationPatterns = [
      /([İiIıA-Za-zÇĞÖŞÜçğöşü]+)\s*[\/|]\s*([İiIıA-Za-zÇĞÖŞÜçğöşü]+)\s*[\/|]\s*([İiIıA-Za-zÇĞÖŞÜçğöşü\s.]+?)(?:\n|İlan)/i,
      /([İiIıA-Za-zÇĞÖŞÜçğöşü]+)\s*[\/|]\s*([İiIıA-Za-zÇĞÖŞÜçğöşü]+)\s*[\/|]\s*([İiIıA-Za-zÇĞÖŞÜçğöşü\s.]+)/i
    ];
    for (const pattern of locationPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.city = match[1].trim();
        data.district = match[2].trim();
        data.neighborhood = match[3].trim().replace(/\s+/g, ' ');
        break;
      }
    }

    // Parse m² values - multiple patterns for OCR variations
    // Brüt
    const brutPatterns = [
      /m[²2°]\s*\(?[Bb]r[üuÜU]t\)?\s*(\d+)/i,
      /[Bb]r[üuÜU]t\)?\s*(\d+)/i,
      /(\d+)\s*m[²2°]?\s*\(?[Bb]r[üuÜU]t/i,
      /m[²2°]\s*\([Bb]r[üuÜU]t\)\s*(\d+)/i
    ];
    for (const pattern of brutPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.area_gross = parseInt(match[1]) || 0;
        if (data.area_gross > 0) break;
      }
    }

    // Net
    const netPatterns = [
      /m[²2°]\s*\(?[Nn]et\)?\s*(\d+)/i,
      /[Nn]et\)?\s*(\d+)/i,
      /(\d+)\s*m[²2°]?\s*\(?[Nn]et/i,
      /m[²2°]\s*\([Nn]et\)\s*(\d+)/i
    ];
    for (const pattern of netPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.area_net = parseInt(match[1]) || 0;
        if (data.area_net > 0) break;
      }
    }

    // Also try to find standalone numbers near m² keywords
    if (data.area_gross === 0) {
      const brutLineMatch = cleanText.match(/[Bb]r[üuÜU]t[^\d]*(\d{2,4})/);
      if (brutLineMatch) data.area_gross = parseInt(brutLineMatch[1]) || 0;
    }
    if (data.area_net === 0) {
      const netLineMatch = cleanText.match(/[Nn]et[^\d]*(\d{2,4})/);
      if (netLineMatch) data.area_net = parseInt(netLineMatch[1]) || 0;
    }

    // Parse room count - look for patterns like "2+1", "Oda Sayısı 2+1"
    const roomPatterns = [
      /[Oo]da\s*[Ss]ay[ıiİI]s[ıiİI]\s*(\d\s*[\+\-]\s*\d)/i,
      /(\d\s*[\+\-]\s*\d)\s*[Oo]da/i,
      /(\d\s*[\+\-]\s*\d)\s*asans/i,
      /(\d\s*[\+\-]\s*\d)\s*[Bb]alkon/i,
      /[Ss]at[ıiİI]l[ıiİI]k\s*[Dd]aire[^\d]*(\d\s*[\+\-]\s*\d)/i,
      /[Kk]iral[ıiİI]k\s*[Dd]aire[^\d]*(\d\s*[\+\-]\s*\d)/i,
      /(\d)\s*[\+\-]\s*(\d)/
    ];
    for (const pattern of roomPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        if (match[2]) {
          // Pattern with two capture groups
          data.rooms = `${match[1]}+${match[2]}`;
        } else {
          data.rooms = match[1].replace(/\s/g, '').replace('-', '+');
        }
        console.log('Found rooms:', data.rooms);
        break;
      }
    }

    // Parse floor
    const floorPatterns = [
      /[Bb]ulundu[ğgĞ]u\s*[Kk]at\s*(\d+)/i,
      /[Kk]at\s*(\d+)\s*[\/|]/i
    ];
    for (const pattern of floorPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.floor = match[1];
        break;
      }
    }

    // Total floors
    const totalFloorPatterns = [
      /[Kk]at\s*[Ss]ay[ıiİI]s[ıiİI]\s*(\d+)/i,
      /[\/|]\s*(\d+)\s*[Kk]at/i
    ];
    for (const pattern of totalFloorPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.total_floors = match[1];
        break;
      }
    }

    // Parse building age - multiple patterns
    const agePatterns = [
      /[Bb]ina\s*[Yy]a[şsŞS][ıiİI]\s*(\d+)/i,
      /[Bb]ina\s*[Yy]a[şsŞS][ıiİI]\s*[0O]\s*\([Oo]turuma/i,
      /[Yy]a[şsŞS][ıiİI]\s*(\d+)/i,
      /(\d+)\s*\([Oo]turuma\s*[Hh]az[ıiİI]r\)/i,
      /[0O]\s*\([Oo]turuma/i
    ];
    for (const pattern of agePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        if (match[1]) {
          data.building_age = match[1];
        } else {
          data.building_age = '0';
        }
        break;
      }
    }
    // Check for "Sıfır" or "0 (Oturuma Hazır)"
    if (/[Ss][ıiİI]f[ıiİI]r|0\s*\([Oo]turuma/i.test(cleanText)) {
      data.building_age = '0';
    }

    // Parse heating
    const heatingPatterns = [
      /[İiIı]s[ıiİI]tma\s*([A-Za-zÇĞİÖŞÜçğıöşü\s()]+?)(?:\n|[Bb]anyo|[Mm]utfak)/i,
      /[Kk]ombi\s*\([Dd]o[ğgĞ]algaz\)/i,
      /[Kk]ombi/i
    ];
    for (const pattern of heatingPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.heating = match[1] ? match[1].trim() : match[0].trim();
        break;
      }
    }

    // Parse bathrooms
    const bathPatterns = [
      /[Bb]anyo\s*[Ss]ay[ıiİI]s[ıiİI]\s*(\d+)/i,
      /(\d+)\s*[Bb]anyo/i
    ];
    for (const pattern of bathPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.bathrooms = parseInt(match[1]) || 1;
        break;
      }
    }

    // Parse boolean values - more flexible patterns
    data.balcony = /[Bb]alkon\s*[Vv]ar/i.test(cleanText);
    data.elevator = /[Aa]sans[öoÖO]r\s*[Vv]ar/i.test(cleanText);
    data.parking = /[Oo]topark\s*[Vv]ar/i.test(cleanText) || /[Oo]topark\s*[Yy]ok/i.test(cleanText) === false;
    data.furnished = /[Ee][şsŞS]yal[ıiİI]\s*[Ee]vet/i.test(cleanText);

    // Determine listing type
    data.listing_type = /[Kk]iral[ıiİI]k/i.test(cleanText) ? 'for_rent' : 'for_sale';

    // Try to extract title
    const titlePatterns = [
      /SAH[İiIı]B[İiIı]NDEN\s+(.+?)(?:\n|$)/i,
      /^([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜa-zçğıöşü0-9\s\+\-!]+)$/m
    ];
    for (const pattern of titlePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1] && match[1].length > 10) {
        data.title = match[1].trim();
        break;
      }
    }
    
    // Fallback title
    if (!data.title) {
      for (const line of lines) {
        if (line.length > 15 && line.length < 150 && !line.includes('TL') && !/^\d+$/.test(line)) {
          data.title = line;
          break;
        }
      }
    }

    console.log('Parsed Data:', data);
    return data;
  };

  const handleProcessImages = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: 'Hata',
        description: 'Lütfen en az bir ekran görüntüsü yükleyin',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setProgressText('OCR başlatılıyor...');

    try {
      let allText = '';
      
      for (let i = 0; i < uploadedImages.length; i++) {
        setProgressText(`Görüntü ${i + 1}/${uploadedImages.length} işleniyor...`);
        
        const result = await Tesseract.recognize(
          uploadedImages[i],
          'tur', // Turkish language
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                const baseProgress = (i / uploadedImages.length) * 100;
                const imageProgress = (m.progress * 100) / uploadedImages.length;
                setProgress(Math.round(baseProgress + imageProgress));
              }
            }
          }
        );
        
        allText += result.data.text + '\n';
      }

      console.log('OCR Result:', allText);
      
      const data = parseOCRText(allText);
      setExtractedData(data);
      
      toast({
        title: 'Başarılı',
        description: 'Görüntüler işlendi, bilgiler çıkarıldı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('OCR Error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Görüntüler işlenirken bir hata oluştu',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const handleImport = () => {
    if (!extractedData) return;

    const propertyData = {
      title: extractedData.title || 'Sahibinden İlan',
      description: extractedData.description,
      price: extractedData.price,
      city: extractedData.city,
      district: extractedData.district,
      neighborhood: extractedData.neighborhood,
      address: `${extractedData.neighborhood}, ${extractedData.district}, ${extractedData.city}`,
      area: extractedData.area_net || extractedData.area_gross,
      rooms: extractedData.rooms,
      floor: parseInt(extractedData.floor) || 0,
      building_age: parseInt(extractedData.building_age) || 0,
      heating: extractedData.heating,
      furnished: extractedData.furnished,
      listing_type: extractedData.listing_type,
      property_type: 'apartment',
      status: 'active',
      image_urls: extractedData.images,
      images: extractedData.images,
      features: []
    };

    onImport(propertyData);
    handleClose();
  };

  const handleClose = () => {
    setUploadedImages([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setExtractedData(null);
    setProgress(0);
    setProgressText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="5xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>Sahibinden.com'dan İlan Çek</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold">Nasıl kullanılır?</Text>
                <VStack align="start" spacing={1} mt={2} fontSize="sm">
                  <Text>1. Sahibinden.com'da ilanın detay sayfasına gidin</Text>
                  <Text>2. Sayfanın ekran görüntüsünü alın (tüm bilgilerin görünmesi için birden fazla alabilirsiniz)</Text>
                  <Text>3. Ekran görüntülerini aşağıya yükleyin</Text>
                  <Text>4. "Bilgileri Çıkar" butonuna tıklayın</Text>
                </VStack>
              </Box>
            </Alert>

            <FormControl>
              <FormLabel>Ekran Görüntüleri</FormLabel>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                display="none"
              />
              <Button
                leftIcon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
                w="full"
                variant="outline"
                colorScheme="blue"
                size="lg"
                h="100px"
                borderStyle="dashed"
                borderWidth="2px"
              >
                <VStack spacing={1}>
                  <ImageIcon size={24} />
                  <Text>Ekran Görüntüsü Yükle</Text>
                  <Text fontSize="xs" color="gray.500">PNG, JPG, JPEG</Text>
                </VStack>
              </Button>
              <FormHelperText>
                İlan detay sayfasının ekran görüntüsünü yükleyin (birden fazla seçebilirsiniz)
              </FormHelperText>
            </FormControl>

            {previewUrls.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>Yüklenen Görüntüler ({previewUrls.length})</Text>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                  {previewUrls.map((url, idx) => (
                    <Box key={idx} position="relative" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                      <Image
                        src={url}
                        alt={`Screenshot ${idx + 1}`}
                        objectFit="cover"
                        h="150px"
                        w="100%"
                      />
                      <IconButton
                        aria-label="Sil"
                        icon={<X size={14} />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => handleRemoveImage(idx)}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {isLoading && (
              <Box>
                <Text mb={2} fontSize="sm" color="gray.600">{progressText}</Text>
                <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
              </Box>
            )}

            {previewUrls.length > 0 && !extractedData && (
              <Button
                colorScheme="blue"
                onClick={handleProcessImages}
                isLoading={isLoading}
                loadingText="İşleniyor..."
                leftIcon={<Download size={18} />}
                size="lg"
              >
                Bilgileri Çıkar (OCR)
              </Button>
            )}

            {extractedData && (
              <Box>
                <Divider mb={4} />
                <Text fontWeight="bold" fontSize="lg" mb={4}>Çıkarılan Bilgiler</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Başlık</Text>
                    <Text fontWeight="semibold">{extractedData.title || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Fiyat</Text>
                    <Text fontWeight="bold" color="green.500">
                      {extractedData.price > 0 ? `${extractedData.price.toLocaleString('tr-TR')} TL` : '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Konum</Text>
                    <Text>{extractedData.city} / {extractedData.district} / {extractedData.neighborhood || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Alan</Text>
                    <Text>Brüt: {extractedData.area_gross || '-'} m² / Net: {extractedData.area_net || '-'} m²</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Oda Sayısı</Text>
                    <Text>{extractedData.rooms || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Kat</Text>
                    <Text>{extractedData.floor || '-'} / {extractedData.total_floors || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Bina Yaşı</Text>
                    <Text>{extractedData.building_age || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Isıtma</Text>
                    <Text>{extractedData.heating || '-'}</Text>
                  </Box>
                </SimpleGrid>

                <HStack mt={4} spacing={2} flexWrap="wrap">
                  <Badge colorScheme={extractedData.listing_type === 'for_sale' ? 'green' : 'blue'}>
                    {extractedData.listing_type === 'for_sale' ? 'Satılık' : 'Kiralık'}
                  </Badge>
                  {extractedData.balcony && <Badge colorScheme="purple">Balkon</Badge>}
                  {extractedData.elevator && <Badge colorScheme="purple">Asansör</Badge>}
                  {extractedData.parking && <Badge colorScheme="purple">Otopark</Badge>}
                  {extractedData.furnished && <Badge colorScheme="purple">Eşyalı</Badge>}
                </HStack>

                <Alert status="warning" mt={4} borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    OCR ile çıkarılan bilgileri kontrol edin. Eksik veya hatalı bilgileri düzenleyebilirsiniz.
                  </Text>
                </Alert>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            İptal
          </Button>
          {extractedData && (
            <Button colorScheme="blue" onClick={handleImport}>
              İlanı İçe Aktar
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SahibindenScraper;
