import { Box, Image, Badge, Text, Stack, Heading, Flex, IconButton, Menu, MenuButton, MenuList, MenuItem, Icon, useColorModeValue, Portal, Divider } from '@chakra-ui/react';
import { MoreVertical, Edit, Trash2, Eye, MessageSquare, Share2, UserX, UserCheck } from 'react-feather';

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
  onView: () => void;
  onGenerateAIText: () => void;
  onGenerateQRCode: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
}

const PropertyCard = ({ property, onEdit, onDelete, onView, onGenerateAIText, onGenerateQRCode, onDeactivate, onActivate }: PropertyCardProps) => {
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
      <Image 
        src={property.image} 
        alt={property.title} 
        height="200px" 
        width="100%" 
        objectFit="cover" 
        cursor="pointer"
        onClick={onView}
        _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
      />
      
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
        <Box display="flex" alignItems="baseline">
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

        <Heading 
          size="md" 
          mt="2" 
          mb="2" 
          isTruncated
          cursor="pointer"
          onClick={onView}
          _hover={{ color: 'blue.500', transition: 'color 0.2s' }}
        >
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
              onClick={onView}
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
          
          <Menu strategy="fixed">
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<Icon as={MoreVertical} />}
              variant="ghost"
              size="sm"
            />
            <Portal>
              <MenuList zIndex={9999}>
                <MenuItem icon={<Icon as={MessageSquare} />} onClick={onGenerateAIText}>
                  AI Metin Oluştur
                </MenuItem>
                <MenuItem icon={<Icon as={Share2} />} onClick={onGenerateQRCode}>
                  QR Kod Oluştur
                </MenuItem>
                <Divider />
                <MenuItem icon={<Icon as={Trash2} />} color="red.500" onClick={onDelete}>
                  Sil
                </MenuItem>
                <Divider />
                {property.status === 'Aktif' ? (
                  onDeactivate && (
                    <MenuItem icon={<Icon as={UserX} />} color="orange.500" onClick={onDeactivate}>
                      Pasife Al
                    </MenuItem>
                  )
                ) : (
                  onActivate && (
                    <MenuItem icon={<Icon as={UserCheck} />} color="green.500" onClick={onActivate}>
                      Aktife Al
                    </MenuItem>
                  )
                )}
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Box>
    </Box>
  );
};

export default PropertyCard;