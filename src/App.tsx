import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PortfolioManagement from './pages/PortfolioManagement';
import CustomerManagement from './pages/CustomerManagement';
import DocumentManagement from './pages/DocumentManagement';
import MyAppointments from './pages/MyAppointments';
import Notifications from './pages/Notifications';

import Reporting from './pages/Reporting';
import Settings from './pages/Settings';
import MainLayout from './layouts/MainLayout';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Auth/Login';
import { AuthProvider } from './context/AuthContext';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChakraProvider>
          <Router>
            <Box minH="100vh">
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}> 
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="portfolio" element={<PortfolioManagement />} />
                    <Route path="customers" element={<CustomerManagement />} />
                    <Route path="my-appointments" element={<MyAppointments />} />
                    <Route path="documents" element={<DocumentManagement />} />
                    <Route path="notifications" element={<Notifications />} />
    

                    <Route element={<RoleProtectedRoute allowed={["admin"]} />}>
                      <Route path="reports" element={<Reporting />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </Box>
          </Router>
        </ChakraProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
