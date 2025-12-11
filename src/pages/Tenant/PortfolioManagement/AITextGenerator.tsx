import { useState } from 'react';
import {
  Box, VStack, Text, Textarea, Button, Radio, RadioGroup, Stack,
  useToast
} from '@chakra-ui/react';

interface AITextGeneratorProps {
  property: any;
}

const AITextGenerator = ({ property }: AITextGeneratorProps) => {
  const [style, setStyle] = useState('standard');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Dummy function to simulate AI text generation
  const generateText = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let text = '';
      
      if (style === 'standard') {
        text = `${property.title} konumunda yer alan bu ${property.rooms} ${property.type.toLowerCase()} gayrimenkul, ${property.size} kullanım alanına sahiptir. ${property.location} adresinde bulunan mülk, modern yaşamın tüm gereksinimlerini karşılayacak özelliklere sahiptir.`;
      } else if (style === 'luxury') {
        text = `Prestijli ${property.location} bölgesinde konumlanan bu eşsiz ${property.rooms} ${property.type.toLowerCase()} mülk, ${property.size} geniş yaşam alanı sunmaktadır. Seçkin detaylar ve lüks dokunuşlarla tasarlanan bu özel gayrimenkul, ayrıcalıklı bir yaşam tarzı arayanlar için mükemmel bir fırsattır.`;
      } else if (style === 'persuasive') {
        text = `Harika bir fırsat! ${property.location} konumundaki bu ${property.rooms} ${property.type.toLowerCase()} gayrimenkul, ${property.size} kullanım alanıyla tam aradığınız özelliklere sahip. Bu kaçırılmayacak fırsatı değerlendirmek ve daha fazla bilgi almak için hemen iletişime geçin!`;
      }
      
      setGeneratedText(text);
      setIsLoading(false);
      
      toast({
        title: 'Metin oluşturuldu',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 1500);
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">İlan Stili Seçin</Text>
        
        <RadioGroup onChange={setStyle} value={style}>
          <Stack direction="row">
            <Radio value="standard">Standart</Radio>
            <Radio value="luxury">Lüks</Radio>
            <Radio value="persuasive">İkna Edici</Radio>
          </Stack>
        </RadioGroup>
        
        <Button
          colorScheme="blue"
          onClick={generateText}
          isLoading={isLoading}
          loadingText="Oluşturuluyor..."
        >
          AI Metin Oluştur
        </Button>
        
        {generatedText && (
          <Box>
            <Text mb={2} fontWeight="bold">Oluşturulan Metin:</Text>
            <Textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              rows={8}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AITextGenerator;