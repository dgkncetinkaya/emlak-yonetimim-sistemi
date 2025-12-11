import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';

const faqs = [
    {
        question: 'Ücretsiz deneme süresi ne kadar?',
        answer:
            'Tüm özelliklerimizi 14 gün boyunca ücretsiz deneyebilirsiniz. Deneme süresi boyunca kredi kartı bilgisi girmeniz gerekmez. Memnun kalmazsanız herhangi bir ücret ödemeden kullanımı sonlandırabilirsiniz.',
    },
    {
        question: 'Kurulum ücreti var mı?',
        answer:
            'Hayır, Emlak Yönetim Sistemi bulut tabanlı bir hizmettir. Herhangi bir kurulum, sunucu veya lisans ücreti ödemezsiniz. Sadece seçtiğiniz paketin aylık veya yıllık ücretini ödersiniz.',
    },
    {
        question: 'İstediğim zaman paketi iptal edebilir miyim?',
        answer:
            'Evet, aboneliğinizi dilediğiniz zaman iptal edebilirsiniz. İptal durumunda, ödenmiş dönem sonuna kadar sistemi kullanmaya devam edebilirsiniz. Taahhüt veya cayma bedeli yoktur.',
    },
    {
        question: 'Verilerim güvende mi?',
        answer:
            'Kesinlikle. Verileriniz endüstri standardı şifreleme yöntemleri ile korunmakta ve düzenli olarak yedeklenmektedir. KVKK uyumlu altyapımız ile müşteri ve portföy verilerinizin güvenliği en üst düzeyde sağlanır.',
    },
    {
        question: 'Mobil uygulama var mı?',
        answer:
            'Evet, sistemimiz tamamen mobil uyumludur (Responsive). Ayrıca Starter paketi ve üzeri kullanıcılarımız için iOS ve Android uygulamalarımız mevcuttur. Sahada portföy ekleyebilir ve müşteri yönetebilirsiniz.',
    },
    {
        question: 'Farklı bir yazılımdan geçiş yapabilir miyim?',
        answer:
            'Evet, Excel veya diğer formatlardaki portföy ve müşteri verilerinizi sistemimize kolayca aktarabilirsiniz. Toplu veri aktarımı konusunda destek ekibimiz size yardımcı olmaktan memnuniyet duyacaktır.',
    },
];

const FAQ = () => {
    return (
        <Box py={24} bg="gray.800" id="faq">
            <Container maxW="container.md">
                <Stack spacing={16}>
                    <Stack spacing={4} textAlign="center">
                        <Text color="blue.400" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            SSS
                        </Text>
                        <Heading size="2xl" fontWeight="bold" color="white">
                            Sıkça Sorulan Sorular
                        </Heading>
                        <Text color="gray.400" fontSize="xl">
                            Aklınıza takılan soruların cevaplarını burada bulabilirsiniz.
                        </Text>
                    </Stack>

                    <Accordion allowToggle allowMultiple>
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} border="none" mb={4}>
                                <h2>
                                    <AccordionButton
                                        py={6}
                                        px={6}
                                        bg="gray.900"
                                        _hover={{ bg: 'gray.700' }}
                                        borderRadius="lg"
                                        _expanded={{ bg: 'blue.900', color: 'blue.200' }}
                                        color="white"
                                    >
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                            {faq.question}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4} px={6} color="gray.400" lineHeight="relaxed" bg="gray.800">
                                    {faq.answer}
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Stack>
            </Container>
        </Box>
    );
};

export default FAQ;
