import { Box, Image, Badge, Text, Stack, Heading, Flex, IconButton, Menu, MenuButton, MenuList, MenuItem, Icon, useColorModeValue } from '@chakra-ui/react';
import { MoreVertical, Edit, Trash2, Eye, MessageSquare, Share2 } from 'react-feather';

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    price: string;
    location: string;
    type: string;
    size: string;
    rooms: string;
    status: string;
    image: string;
    date: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onGenerateAIText: () => void;
  onGenerateQRCode: () => void;
}

const PropertyCard = ({ property, onEdit, onDelete, onGenerateAIText, onGenerateQRCode }: PropertyCardProps) => {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={useColorModeValue('white', 'gray.700')}
      boxShadow="md"
      position="relative"
    >
      <Image src={property.image} alt={property.title} height="200px" width="100%" objectFit="cover" />
      
      <Badge
        position="absolute"
        top="3"
        right="3"
        colorScheme={property.type === 'Satılık' ? 'green' : 'blue'}
        fontSize="0.8em"
        px="2"
        py="1"
        borderRadius="md"
      >
        {property.type}
      </Badge>
      
      <Box p="6">
        <Box d="flex" alignItems="baseline">
          <Badge borderRadius="full" px="2" colorScheme="teal">
            {property.status}
          </Badge>
          <Box
            color="gray.500"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            {property.rooms} · {property.size}
          </Box>
        </Box>

        <Heading size="md" mt="2" mb="2" isTruncated>
          {property.title}
        </Heading>

        <Text fontSize="xl" fontWeight="bold" color="blue.600">
          {property.price}
        </Text>

        <Text mt="2" color="gray.600" fontSize="sm" isTruncated>
          {property.location}
        </Text>

        <Text mt="2" fontSize="sm" color="gray.500">
          Eklenme: {property.date}
        </Text>

        <Flex mt="4" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing="2">
            <IconButton
              aria-label="View property"
              icon={<Icon as={Eye} />}
              size="sm"
              variant="ghost"
            />
            <IconButton
              aria-label="Edit property"
              icon={<Icon as={Edit} />}
              size="sm"
              variant="ghost"
              onClick={onEdit}
            />
            <IconButton
              aria-label="Delete property"
              icon={<Icon as={Trash2} />}
              size="sm"
              variant="ghost"
              onClick={onDelete}
            />
          </Stack>
          
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<Icon as={MoreVertical} />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem icon={<Icon as={MessageSquare} />} onClick={onGenerateAIText}>
                AI Metin Oluştur
              </MenuItem>
              <MenuItem icon={<Icon as={Share2} />} onClick={onGenerateQRCode}>
                QR Kod Oluştur
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    </Box>
  );
};

export default PropertyCard;