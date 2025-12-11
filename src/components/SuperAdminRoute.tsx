import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { isSuperAdminAuthenticated } from '../lib/superadminAuth';

interface SuperAdminRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route component for SuperAdmin pages
 * Redirects to SuperAdmin login if not authenticated
 */
const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
    const location = useLocation();
    const [checking, setChecking] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    useEffect(() => {
        // Check authentication
        const authenticated = isSuperAdminAuthenticated();
        setIsAuthenticated(authenticated);
        setChecking(false);
    }, []);

    if (checking) {
        return (
            <Box
                minH="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <VStack spacing={4}>
                    <Spinner size="xl" color="red.500" thickness="4px" />
                    <Text color="gray.500">Yetki kontrol ediliyor...</Text>
                </VStack>
            </Box>
        );
    }

    if (!isAuthenticated) {
        // Redirect to SuperAdmin login with return URL
        return <Navigate to="/superadmin3537/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default SuperAdminRoute;
