import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
import Dashboard from './pages/Tenant/Dashboard'
import PortfolioManagement from './pages/Tenant/PortfolioManagement'
import ListingDetail from './pages/Tenant/PortfolioManagement/ListingDetail'
import CustomerManagement from './pages/Tenant/CustomerManagement'
import CustomerDetailPage from './pages/Tenant/CustomerManagement/CustomerDetailPage'
import DocumentManagement from './pages/Tenant/DocumentManagement'
import MyAppointments from './pages/Tenant/MyAppointments'
import Notifications from './pages/Tenant/Notifications'
import Reporting from './pages/Tenant/Reporting'
import Settings from './pages/Tenant/Settings'
import BrokerSettings from './pages/Tenant/Settings/BrokerSettings'
import BrokerManagement from './pages/Tenant/BrokerManagement'
import SubscriptionManagement from './pages/Tenant/SubscriptionManagement'
import Profile from './pages/Tenant/Profile'
import AdminPanel from './pages/Admin'
import SuperAdminDashboard from './pages/superadmin3537'
import SuperAdminDashboardNew from './pages/superadmin3537/Dashboard'
import TenantManagement from './pages/superadmin3537/TenantManagement'
import TenantDetail from './pages/superadmin3537/TenantManagement/TenantDetail'
import OfficesList from './pages/superadmin3537/Offices'
import OfficeDetail from './pages/superadmin3537/Offices/OfficeDetail'
import PlansList from './pages/superadmin3537/Plans'
import PlanEdit from './pages/superadmin3537/Plans/PlanEdit'
import PaymentsList from './pages/superadmin3537/Payments'
import PaymentDetail from './pages/superadmin3537/Payments/PaymentDetail'
import TicketsList from './pages/superadmin3537/Tickets'
import TicketDetail from './pages/superadmin3537/Tickets/TicketDetail'
import AnnouncementsList from './pages/superadmin3537/Announcements'
import AnnouncementForm from './pages/superadmin3537/Announcements/AnnouncementForm'
import SettingsMain from './pages/superadmin3537/Settings'
import GeneralSettings from './pages/superadmin3537/Settings/GeneralSettings'
import EmailSettings from './pages/superadmin3537/Settings/EmailSettings'
import BillingSettings from './pages/superadmin3537/Settings/BillingSettings'
import BrandingSettings from './pages/superadmin3537/Settings/BrandingSettings'
import SecuritySettings from './pages/superadmin3537/Settings/SecuritySettings'
import UserManagement from './pages/superadmin3537/UserManagement'
import DunningManagement from './pages/Admin/DunningManagement'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import SuperAdminLogin from './pages/Auth/SuperAdminLogin'
import LandingPage from './pages/Landing'

import MainLayout from './layouts/MainLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'
import SuperAdminRoute from './components/SuperAdminRoute'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { AppearanceProvider } from './context/AppearanceContext'
import './App.css'

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AppearanceProvider>
              <NotificationProvider>
                <Box minH="100vh">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/superadmin3537/login" element={<SuperAdminLogin />} />

                  {/* SuperAdmin Protected Routes with Layout */}
                  <Route path="/superadmin3537" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <SuperAdminDashboardNew />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/dashboard" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <SuperAdminDashboardNew />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/tenants" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <TenantManagement />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/tenants/:id" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <TenantDetail />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/offices" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <OfficesList />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/offices/:officeId" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <OfficeDetail />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/plans" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <PlansList />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/plans/:id" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <PlanEdit />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/payments" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <PaymentsList />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/payments/:paymentId" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <PaymentDetail />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <SettingsMain />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings/general" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <GeneralSettings />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings/email" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <EmailSettings />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings/billing" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <BillingSettings />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings/branding" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <BrandingSettings />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/settings/security" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <SecuritySettings />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/tickets" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <TicketsList />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/tickets/:ticketId" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <TicketDetail />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/announcements" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <AnnouncementsList />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/announcements/new" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <AnnouncementForm />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/announcements/:id" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <AnnouncementForm />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />
                  <Route path="/superadmin3537/users" element={
                    <SuperAdminRoute>
                      <SuperAdminLayout>
                        <UserManagement />
                      </SuperAdminLayout>
                    </SuperAdminRoute>
                  } />

                  {/* Regular User Protected Routes */}
                  <Route path="/:tenantName" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="portfoy" element={<PortfolioManagement />} />
                    <Route path="portfoy/ilan/:id" element={<ListingDetail />} />
                    <Route path="musteriler" element={<CustomerManagement />} />
                    <Route path="musteriler/:id" element={<CustomerDetailPage />} />
                    <Route path="randevularim" element={<MyAppointments />} />
                    <Route path="belgeler" element={<DocumentManagement />} />
                    <Route path="bildirimler" element={<Notifications />} />
                    <Route path="raporlar" element={<Reporting />} />
                    <Route path="raporlar/performans" element={<Reporting />} />
                    <Route path="aktiviteler" element={<Notifications />} />
                    <Route path="danisman-ayarlari" element={<BrokerSettings />} />
                    <Route path="danisman-yonetimi" element={<BrokerManagement />} />
                    <Route path="yonetim" element={<AdminPanel />} />
                    <Route path="yonetim/borc-takip" element={<DunningManagement />} />
                    <Route path="broker-ayarlari" element={<BrokerSettings />} />
                    <Route path="abonelik" element={<SubscriptionManagement />} />
                    <Route path="profil" element={<Profile />} />
                    <Route path="ayarlar" element={<Settings />} />
                  </Route>

                  {/* Catch all route - redirect to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Box>
              </NotificationProvider>
            </AppearanceProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

export default App
