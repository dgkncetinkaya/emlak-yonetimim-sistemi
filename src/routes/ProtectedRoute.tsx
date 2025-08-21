import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute: isLoading:', isLoading);
  console.log('🛡️ ProtectedRoute: isAuthenticated:', isAuthenticated);
  console.log('🛡️ ProtectedRoute: user:', user);
  console.log('🛡️ ProtectedRoute: location:', location.pathname);

  if (isLoading) {
    console.log('🛡️ ProtectedRoute: Showing loading spinner');
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  console.log('🛡️ ProtectedRoute: Authenticated, rendering protected content');
  return <Outlet />;
}