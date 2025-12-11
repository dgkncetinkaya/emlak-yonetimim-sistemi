import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from '@chakra-ui/react';

export default function ProtectedRoute() {
  const location = useLocation();
  const auth = useAuth();

  // AuthContext artık her zaman güvenli değer döndürüyor
  const { isAuthenticated, isLoading } = auth;

  if (isLoading) {
    return (
      <Center minH="60vh">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}