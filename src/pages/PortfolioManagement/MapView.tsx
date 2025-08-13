import { useEffect, useState } from 'react';
import { Box, Text, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapViewProps {
  properties: any[];
}

interface PropertyWithCoords extends Record<string, any> {
  coords: [number, number];
}

const MapView = ({ properties }: MapViewProps) => {
  const [propertiesWithCoords, setPropertiesWithCoords] = useState<PropertyWithCoords[]>([]);
  
  // In a real application, you would have actual coordinates for each property
  // Here we're generating random coordinates around Istanbul for demonstration
  useEffect(() => {
    const getRandomCoords = (baseCoords: [number, number], range: number): [number, number] => {
      return [
        baseCoords[0] + (Math.random() - 0.5) * range,
        baseCoords[1] + (Math.random() - 0.5) * range,
      ];
    };
    
    // Istanbul coordinates as base
    const istanbulCoords: [number, number] = [41.0082, 28.9784];
    
    const propsWithCoords = properties.map(property => ({
      ...property,
      coords: getRandomCoords(istanbulCoords, 0.1),
    }));
    
    setPropertiesWithCoords(propsWithCoords);
  }, [properties]);
  
  if (propertiesWithCoords.length === 0) {
    return <Box>Harita yükleniyor...</Box>;
  }
  
  // Find center of the map based on property coordinates
  const center: [number, number] = propertiesWithCoords.length > 0
    ? propertiesWithCoords[0].coords
    : [41.0082, 28.9784]; // Default to Istanbul
  
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {propertiesWithCoords.map((property) => (
        <Marker key={property.id} position={property.coords}>
          <Popup>
            <Box width="200px">
              <Text fontWeight="bold" fontSize="md">{property.title}</Text>
              <Text fontSize="lg" color="blue.600" fontWeight="bold">{property.price}</Text>
              <Flex mt={1} mb={1}>
                <Badge
                  colorScheme={property.type === 'Satılık' ? 'green' : 'blue'}
                  mr={2}
                >
                  {property.type}
                </Badge>
                <Text fontSize="sm">{property.rooms} · {property.size}</Text>
              </Flex>
              <Text fontSize="sm" color="gray.600">{property.location}</Text>
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;