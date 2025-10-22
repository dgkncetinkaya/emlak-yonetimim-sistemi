import { useState, useEffect } from 'react'
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import { Session } from '@supabase/supabase-js'

// QueryClient oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 dakika
    },
  },
})

// Pages
import Dashboard from './pages/Dashboard'
import PortfolioManagement from './pages/PortfolioManagement'
import ListingDetail from './pages/PortfolioManagement/ListingDetail'
import CustomerManagement from './pages/CustomerManagement'
import CustomerDetailPage from './pages/CustomerManagement/CustomerDetailPage'
import DocumentManagement from './pages/DocumentManagement'
import MyAppointments from './pages/MyAppointments'
import Notifications from './pages/Notifications'
import Reporting from './pages/Reporting'
import Settings from './pages/Settings'
import BrokerSettings from './pages/Settings/BrokerSettings'
import BrokerManagement from './pages/BrokerManagement'
import AdminPanel from './pages/Admin'
import DunningManagement from './pages/Admin/DunningManagement'
import Login from './pages/Auth/Login'

import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import './App.css'

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Router>
          <Box minH="100vh">
            <Routes>
              {/* Login Route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="portfolio" element={<PortfolioManagement />} />
                <Route path="portfolio/listing/:id" element={<ListingDetail />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="my-appointments" element={<MyAppointments />} />
                <Route path="documents" element={<DocumentManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="reports" element={<Reporting />} />
                <Route path="reports/performance" element={<Reporting />} />
                <Route path="activities" element={<Notifications />} />
                <Route path="broker-settings" element={<BrokerSettings />} />
                <Route path="broker-management" element={<BrokerManagement />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="admin/dunning" element={<DunningManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
