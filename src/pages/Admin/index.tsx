import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Webhook as WebhookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const adminMenuItems = [
    {
      title: 'Dashboard',
      description: 'Genel sistem durumu ve istatistikler',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      color: '#1976d2'
    },
    {
      title: 'Müşteri Yönetimi',
      description: 'Kullanıcılar ve abonelikler',
      icon: <PeopleIcon />,
      path: '/admin/customers',
      color: '#388e3c'
    },
    {
      title: 'Ödeme Yönetimi',
      description: 'Faturalar, ödemeler ve kuponlar',
      icon: <PaymentIcon />,
      path: '/admin/payments',
      color: '#f57c00'
    },
    {
      title: 'Webhook Yönetimi',
      description: 'Webhook eventleri ve işlem kuyruğu',
      icon: <WebhookIcon />,
      path: '/admin/webhooks',
      color: '#7b1fa2'
    },
    {
      title: 'Dunning Yönetimi',
      description: 'Başarısız ödeme takibi ve retry işlemleri',
      icon: <NotificationsIcon />,
      path: '/admin/dunning',
      color: '#d32f2f'
    },
    {
      title: 'Raporlar',
      description: 'Gelir, kullanım ve performans raporları',
      icon: <AssessmentIcon />,
      path: '/admin/reports',
      color: '#0288d1'
    },
    {
      title: 'Sistem Ayarları',
      description: 'Genel sistem konfigürasyonu',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      color: '#5d4037'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Paneli
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Sistem yönetimi ve operasyonel işlemler için admin paneline hoş geldiniz.
      </Typography>

      <Grid container spacing={3}>
        {adminMenuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      mr: 2
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h3">
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Hızlı İstatistikler
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Aktif Abonelikler
                </Typography>
                <Typography variant="h4" color="primary">
                  1,234
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Aylık Gelir
                </Typography>
                <Typography variant="h4" color="success.main">
                  ₺45,678
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Bekleyen Ödemeler
                </Typography>
                <Typography variant="h4" color="warning.main">
                  23
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Sistem Durumu
                </Typography>
                <Typography variant="h4" color="success.main">
                  ✓ Sağlıklı
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminPanel;