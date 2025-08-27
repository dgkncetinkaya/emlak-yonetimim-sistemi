import React from 'react';
import {
  Select,
  Box,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
  };

  return (
    <Box position="relative">
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        size="sm"
        width="70px"
        bg={bgColor}
        borderColor={borderColor}
        _hover={{ borderColor: 'blue.300' }}
        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
      >
        <option value="tr">TR</option>
        <option value="en">EN</option>
      </Select>
      <Box
        position="absolute"
        left="8px"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        zIndex={1}
      >
        <Icon as={Globe} boxSize={3} color="gray.500" />
      </Box>
    </Box>
  );
};

export default LanguageSwitcher;