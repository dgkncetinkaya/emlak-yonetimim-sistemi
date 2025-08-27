import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  RestartAlt as RetryIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useAuthApi } from '../../../lib/api';

interface DunningEvent {
  id: string;
  subscription_id: number;
  invoice_id: string;
  status: 'pending' | 'processing' | 'failed' | 'completed' | 'cancelled';
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface DunningStats {
  total_events: number;
  pending_events: number;
  failed_events: number;
  completed_events: number;
  success_rate: number;
  avg_retry_count: number;
}

interface SchedulerStatus {
  isRunning: boolean;
  processingInterval: number;
  cleanupInterval: number;
  lastProcessedAt: string;
  lastCleanupAt: string;
}

const DunningManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const adminApi = useAuthApi();
  const [events, setEvents] = useState<DunningEvent[]>([]);
  const [stats, setStats] = useState<DunningStats | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSubscriptionId, setFilterSubscriptionId] = useState<string>('');
  const [configDialog, setConfigDialog] = useState(false);
  const [newConfig, setNewConfig] = useState({
    processingInterval: 300000, // 5 minutes
    cleanupInterval: 86400000 // 24 hours
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterSubscriptionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEvents(),
        fetchStats(),
        fetchSchedulerStatus()
      ]);
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterSubscriptionId) params.append('subscription_id', filterSubscriptionId);
      
      const response = await adminApi.get(`/dunning/events?${params.toString()}`) as any;
      setEvents(response.data.data);
    } catch (err) {
      console.error('Error fetching dunning events:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.get('/dunning/stats') as any;
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching dunning stats:', err);
    }
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await adminApi.get('/dunning/scheduler/status') as any;
      setSchedulerStatus(response.data.data);
    } catch (err) {
      console.error('Error fetching scheduler status:', err);
    }
  };

  const handleStartScheduler = async () => {
    try {
      await adminApi.post('/dunning/scheduler/start');
      await fetchSchedulerStatus();
    } catch (err) {
      setError('Scheduler başlatılırken hata oluştu');
    }
  };

  const handleStopScheduler = async () => {
    try {
      await adminApi.post('/dunning/scheduler/stop');
      await fetchSchedulerStatus();
    } catch (err) {
      setError('Scheduler durdurulurken hata oluştu');
    }
  };

  const handleForceProcessRetries = async () => {
    try {
      setLoading(true);
      await adminApi.post('/dunning/process-retries');
      await fetchData();
    } catch (err) {
      setError('Retry işlemi başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleForceCleanup = async () => {
    try {
      setLoading(true);
      await adminApi.post('/dunning/cleanup');
      await fetchData();
    } catch (err) {
      setError('Temizlik işlemi başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryEvent = async (eventId: string) => {
    try {
      await adminApi.post(`/dunning/retry/${eventId}`);
      await fetchEvents();
    } catch (err) {
      setError('Event retry edilirken hata oluştu');
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await adminApi.put('/dunning/scheduler/config', newConfig);
      setConfigDialog(false);
      await fetchSchedulerStatus();
    } catch (err) {
      setError('Konfigürasyon güncellenirken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dunning Yönetimi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Toplam Event
                </Typography>
                <Typography variant="h5">
                  {stats.total_events}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Bekleyen
                </Typography>
                <Typography variant="h5" color="info.main">
                  {stats.pending_events}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Başarısız
                </Typography>
                <Typography variant="h5" color="error.main">
                  {stats.failed_events}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tamamlanan
                </Typography>
                <Typography variant="h5" color="success.main">
                  {stats.completed_events}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Başarı Oranı
                </Typography>
                <Typography variant="h5">
                  {stats.success_rate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Ort. Retry
                </Typography>
                <Typography variant="h5">
                  {stats.avg_retry_count.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Scheduler Status */}
      {schedulerStatus && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Scheduler Durumu
              </Typography>
              <Box>
                <IconButton onClick={() => setConfigDialog(true)}>
                  <SettingsIcon />
                </IconButton>
                {schedulerStatus.isRunning ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleStopScheduler}
                    sx={{ ml: 1 }}
                  >
                    Durdur
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PlayIcon />}
                    onClick={handleStartScheduler}
                    sx={{ ml: 1 }}
                  >
                    Başlat
                  </Button>
                )}
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Durum
                </Typography>
                <Chip
                  label={schedulerStatus.isRunning ? 'Çalışıyor' : 'Durdu'}
                  color={schedulerStatus.isRunning ? 'success' : 'error'}
                  size="small"
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  İşlem Aralığı
                </Typography>
                <Typography variant="body1">
                  {Math.round(schedulerStatus.processingInterval / 60000)} dakika
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Son İşlem
                </Typography>
                <Typography variant="body1">
                  {schedulerStatus.lastProcessedAt ? formatDate(schedulerStatus.lastProcessedAt) : 'Henüz yok'}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Son Temizlik
                </Typography>
                <Typography variant="body1">
                  {schedulerStatus.lastCleanupAt ? formatDate(schedulerStatus.lastCleanupAt) : 'Henüz yok'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Yenile
            </Button>
            <Button
              variant="outlined"
              startIcon={<RetryIcon />}
              onClick={handleForceProcessRetries}
              disabled={loading}
            >
              Retry İşlemlerini Başlat
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleForceCleanup}
              disabled={loading}
            >
              Eski Kayıtları Temizle
            </Button>
            
            {/* Filters */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={filterStatus}
                label="Durum"
                onChange={(e: any) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                <MenuItem value="pending">Bekleyen</MenuItem>
                <MenuItem value="processing">İşleniyor</MenuItem>
                <MenuItem value="failed">Başarısız</MenuItem>
                <MenuItem value="completed">Tamamlandı</MenuItem>
                <MenuItem value="cancelled">İptal</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              label="Abonelik ID"
              value={filterSubscriptionId}
              onChange={(e: any) => setFilterSubscriptionId(e.target.value)}
              sx={{ width: 150 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dunning Events
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Abonelik ID</TableCell>
                    <TableCell>Fatura ID</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Retry Sayısı</TableCell>
                    <TableCell>Sonraki Retry</TableCell>
                    <TableCell>Oluşturulma</TableCell>
                    <TableCell>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.id}</TableCell>
                      <TableCell>{event.subscription_id}</TableCell>
                      <TableCell>{event.invoice_id}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.status}
                          color={getStatusColor(event.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {event.retry_count} / {event.max_retries}
                      </TableCell>
                      <TableCell>
                        {event.next_retry_at ? formatDate(event.next_retry_at) : '-'}
                      </TableCell>
                      <TableCell>{formatDate(event.created_at)}</TableCell>
                      <TableCell>
                        {(event.status === 'failed' || event.status === 'pending') && (
                          <IconButton
                            size="small"
                            onClick={() => handleRetryEvent(event.id)}
                            title="Retry"
                          >
                            <RetryIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Henüz dunning event bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Config Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)}>
        <DialogTitle>Scheduler Konfigürasyonu</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="İşlem Aralığı (dakika)"
            type="number"
            value={Math.round(newConfig.processingInterval / 60000)}
            onChange={(e: any) => setNewConfig({
              ...newConfig,
              processingInterval: parseInt(e.target.value) * 60000
            })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Temizlik Aralığı (saat)"
            type="number"
            value={Math.round(newConfig.cleanupInterval / 3600000)}
            onChange={(e: any) => setNewConfig({
              ...newConfig,
              cleanupInterval: parseInt(e.target.value) * 3600000
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>İptal</Button>
          <Button onClick={handleUpdateConfig} variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DunningManagement;