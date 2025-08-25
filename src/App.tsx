import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PortfolioManagement from './pages/PortfolioManagement';
import ListingDetail from './pages/PortfolioManagement/ListingDetail';
import CustomerManagement from './pages/CustomerManagement';
import DocumentManagement from './pages/DocumentManagement';
import MyAppointments from './pages/MyAppointments';
import Notifications from './pages/Notifications';
import Reporting from './pages/Reporting';
import Settings from './pages/Settings';
import BrokerSettings from './pages/Settings/BrokerSettings';
import BrokerManagement from './pages/BrokerManagement';
import MainLayout from './layouts/MainLayout';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Auth/Login';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ChakraProvider>
          <Router>
            <Box minH="100vh">
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}> 
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="portfolio" element={<PortfolioManagement />} />
                    <Route path="portfolio/listing/:id" element={<ListingDetail />} />
                    <Route path="customers" element={<CustomerManagement />} />
                    <Route path="my-appointments" element={<MyAppointments />} />
                    <Route path="documents" element={<DocumentManagement />} />
                    <Route path="notifications" element={<Notifications />} />

                    <Route element={<RoleProtectedRoute allowed={["admin"]} />}>
                      <Route path="reports" element={<Reporting />} />
                      <Route path="broker-settings" element={<BrokerSettings />} />
                      <Route path="broker-management" element={<BrokerManagement />} />
                    </Route>
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </Box>
          </Router>
          </ChakraProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
