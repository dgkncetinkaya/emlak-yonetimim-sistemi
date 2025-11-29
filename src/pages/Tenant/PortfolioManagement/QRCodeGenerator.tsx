import { useState, useEffect } from 'react';
import {
  Box, VStack, Text, Button, Select, Flex, Image,
  useToast, useClipboard
} from '@chakra-ui/react';

interface QRCodeGeneratorProps {
  property: any;
}

const QRCodeGenerator = ({ property }: QRCodeGeneratorProps) => {
  const [qrSize, setQrSize] = useState('200');
  const [qrUrl, setQrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { hasCopied, onCopy } = useClipboard(qrUrl);

  // Generate QR code URL using a free QR code API
  useEffect(() => {
    if (property) {
      // In a real application, this would be your domain with the property ID
      const propertyUrl = `https://emlak-ofisi.com/property/${property.id}`;
      // Using Google Charts API for QR code generation (for demo purposes)
      const url = `https://chart.googleapis.com/chart?cht=qr&chs=${qrSize}x${qrSize}&chl=${encodeURIComponent(propertyUrl)}`;
      setQrUrl(url);
    }
  }, [property, qrSize]);

  const handleGenerateQR = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'QR Kod oluşturuldu',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };

  const handleCopyLink = () => {
    onCopy();
    toast({
      title: 'Link kopyalandı',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">QR Kod Boyutu</Text>
        
        <Select value={qrSize} onChange={(e) => setQrSize(e.target.value)}>
          <option value="100">Küçük (100x100)</option>
          <option value="200">Orta (200x200)</option>
          <option value="300">Büyük (300x300)</option>
        </Select>
        
        <Button
          colorScheme="blue"
          onClick={handleGenerateQR}
          isLoading={isLoading}
          loadingText="Oluşturuluyor..."
        >
          QR Kod Oluştur
        </Button>
        
        {qrUrl && (
          <Flex direction="column" align="center" justify="center" py={4}>
            <Image src={qrUrl} alt="QR Code" mb={4} />
            <Text fontSize="sm" mb={2}>
              {property.title} için QR Kod
            </Text>
            <Flex gap={2}>
              <Button size="sm" onClick={handleCopyLink}>
                {hasCopied ? 'Kopyalandı!' : 'Linki Kopyala'}
              </Button>
              <Button
                size="sm"
                as="a"
                href={qrUrl}
                download={`${property.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`}
              >
                İndir
              </Button>
            </Flex>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default QRCodeGenerator;