import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

const LandingPage = () => {
    return (
        <Box minH="100vh">
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <Pricing />
            <FAQ />
            <Footer />
        </Box>
    );
};

export default LandingPage;
