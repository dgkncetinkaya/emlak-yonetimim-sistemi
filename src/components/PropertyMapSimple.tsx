import { useState, useEffect } from 'react';
import { Box, Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface PropertyMapSimpleProps {
  address: string;
  city: string;
  district: string;
  neighborhood?: string;
  title: string;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCD5MZvIvI7-6JdFCtHd8-8ja3xLJ_DK3Y';

const PropertyMapSimple = ({ address, city, district, neighborhood, title }: PropertyMapSimpleProps) => {
  const [coordinates, setCoordinates] = useState({ lat: 41.0082, lng: 28.9784 }); // İstanbul default
  const [isGeocoding, setIsGeocoding] = useState(true);

  useEffect(() => {
    const geocodeAddress = async () => {
      const fullAddress = [neighborhood, district, city, 'Türkiye']
        .filter(Boolean)
        .join(', ');

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            fullAddress
          )}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          setCoordinates({
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng,
          });
        }
      } catch (error) {
        console.error('Geocoding hatası:', error);
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeAddress();
  }, [address, city, district, neighborhood]);

  return (
    <Box w="100%" h="400px" borderRadius="xl" overflow="hidden">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={coordinates}
          zoom={15}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {!isGeocoding && <Marker position={coordinates} title={title} />}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
};

export default PropertyMapSimple;
