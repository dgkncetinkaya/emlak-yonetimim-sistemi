import { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';

interface PropertyMapProps {
  address: string;
  city: string;
  district: string;
  neighborhood?: string;
  title: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCD5MZvIvI7-6JdFCtHd8-8ja3xLJ_DK3Y';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

const defaultCenter = {
  lat: 41.0082, // İstanbul default
  lng: 28.9784,
};



const PropertyMap = ({ address, city, district, neighborhood, title }: PropertyMapProps) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const geocodeAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Tam adresi oluştur
        const fullAddress = [neighborhood, district, city, 'Türkiye']
          .filter(Boolean)
          .join(', ');

        // Google Geocoding API kullan
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            fullAddress
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          console.log('📍 Geocoding başarılı:', location);
          setCoordinates({
            lat: location.lat,
            lng: location.lng,
          });
        } else {
          console.log('⚠️ Geocoding başarısız:', data.status);
          // Geocoding başarısız olursa şehir merkezini göster
          console.warn('Geocoding failed, using city center');
          setError('Tam konum bulunamadı, yaklaşık konum gösteriliyor');
          
          // Şehir merkezlerini göster
          const cityCoordinates: Record<string, { lat: number; lng: number }> = {
            'İstanbul': { lat: 41.0082, lng: 28.9784 },
            'Ankara': { lat: 39.9334, lng: 32.8597 },
            'İzmir': { lat: 38.4237, lng: 27.1428 },
            'Antalya': { lat: 36.8969, lng: 30.7133 },
            'Bursa': { lat: 40.1826, lng: 29.0665 },
          };
          
          setCoordinates(cityCoordinates[city] || defaultCenter);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Konum yüklenirken hata oluştu');
        setCoordinates(defaultCenter);
      } finally {
        setIsLoading(false);
      }
    };

    if (address || (city && district)) {
      geocodeAddress();
    } else {
      setIsLoading(false);
      setError('Adres bilgisi eksik');
    }
  }, [address, city, district, neighborhood]);

  if (isLoading) {
    return (
      <Center h="400px" bg="gray.50" borderRadius="xl">
        <VStack spacing={3}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="sm" color="gray.600">Konum yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  if (!coordinates) {
    return (
      <Center h="400px" bg="gray.50" borderRadius="xl">
        <Text fontSize="sm" color="gray.600">Konum bilgisi bulunamadı</Text>
      </Center>
    );
  }

  console.log('🗺️ Harita render ediliyor, coordinates:', coordinates);
  console.log('🗺️ isLoaded:', isLoaded);

  if (!isLoaded) {
    return (
      <Center h="400px" bg="gray.50" borderRadius="xl">
        <VStack spacing={3}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="sm" color="gray.600">Google Maps yükleniyor...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box position="relative">
      {error && (
        <Box
          position="absolute"
          top={2}
          left={2}
          right={2}
          bg="orange.100"
          color="orange.800"
          px={3}
          py={2}
          borderRadius="md"
          fontSize="xs"
          zIndex={1}
        >
          {error}
        </Box>
      )}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coordinates}
        zoom={15}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={() => console.log('✅ GoogleMap component yüklendi')}
      >
        <Marker
          position={coordinates}
          title={title}
          onLoad={() => console.log('✅ Marker yüklendi')}
        />
      </GoogleMap>
    </Box>
  );
};

export default PropertyMap;
