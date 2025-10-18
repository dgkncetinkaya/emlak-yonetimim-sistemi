import React from 'react';
import { Box, Text, Flex, Badge, useColorModeValue, useColorMode } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different property types
const saleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const rentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  properties: any[];
}

interface PropertyWithCoords extends Record<string, any> {
  coords: [number, number]; // Leaflet uses [lat, lng] format
}

const MapView = ({ properties }: MapViewProps) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { colorMode } = useColorMode();
  
  // Different tile layers for light and dark modes
  const tileUrl = colorMode === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
  const attribution = colorMode === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Generate random coordinates around Istanbul for demo
  const propertiesWithCoords: PropertyWithCoords[] = properties.map((property, index) => ({
    ...property,
    coords: [
      41.0082 + (Math.random() - 0.5) * 0.1, // Latitude around Istanbul
      28.9784 + (Math.random() - 0.5) * 0.1  // Longitude around Istanbul
    ] as [number, number]
  }));

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      height="600px"
    >
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <Text fontSize="lg" fontWeight="semibold">
          Harita Görünümü
        </Text>
        <Text fontSize="sm" color="gray.500">
          {properties.length} ilan gösteriliyor
        </Text>
      </Box>
      
      <Box height="calc(100% - 80px)" position="relative">
        <MapContainer
          center={[41.0082, 28.9784]} // Istanbul center
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution={attribution}
            url={tileUrl}
          />
          
          {propertiesWithCoords.map((property, index) => (
            <Marker
              key={index}
              position={[property.coords[0], property.coords[1]]}
              icon={property.type === 'Satılık' ? saleIcon : rentIcon}
            >
              <Popup>
                <Box p={2} minW="200px">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {property.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {property.location}
                  </Text>
                  <Flex align="center" gap={2}>
                    <Badge
                      colorScheme={property.type === 'Satılık' ? 'green' : 'blue'}
                      variant="solid"
                    >
                      {property.type}
                    </Badge>
                    <Text fontWeight="bold" fontSize="md">
                      {property.price}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {property.rooms} · {property.size}
                  </Text>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapView;