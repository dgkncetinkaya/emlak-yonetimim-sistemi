# Backend Auto-Start Sistemi

Bu sistem, frontend uygulaması çalıştığında backend servislerinin otomatik olarak devreye girmesini sağlar.

## Özellikler

### 1. Otomatik Backend Başlatma
- Frontend başlatıldığında backend otomatik olarak çalışır
- Vite plugin sistemi ile entegre
- Health check mekanizması ile backend durumu kontrol edilir

### 2. Health Check Sistemi
- **Backend Endpoint**: `/api/health`
- **Frontend Hook**: `useBackendHealth`
- **UI Göstergesi**: `BackendHealthIndicator` komponenti
- Gerçek zamanlı durum takibi

### 3. Error Handling ve Retry Mekanizması
- Circuit breaker pattern implementasyonu
- Otomatik retry mekanizması (max 3 deneme)
- Exponential backoff stratejisi
- Timeout kontrolü (10 saniye)

## Kullanım

### Geliştirme Ortamı
```bash
# Frontend ve backend'i birlikte başlat
npm run dev

# Sadece frontend
npm run dev:frontend

# Sadece backend
npm run dev:backend
```

### Prodüksiyon Ortamı
```bash
# Build ve start
npm run build
npm start
```

## Sistem Bileşenleri

### 1. Package.json Scripts
- `dev`: Concurrently ile frontend ve backend başlatır
- `dev:frontend`: Sadece Vite dev server
- `dev:backend`: Sadece backend (nodemon ile)
- `start`: Prodüksiyon için build edilmiş uygulamayı başlatır

### 2. Vite Plugin (vite-backend-autostart.ts)
- Backend process yönetimi
- Health check kontrolü
- Otomatik restart mekanizması
- Error handling

### 3. Frontend Health Check
- **Hook**: `src/hooks/useBackendHealth.ts`
- **Component**: `src/components/BackendHealthIndicator.tsx`
- 30 saniyede bir otomatik kontrol
- Görsel durum göstergesi

### 4. Backend Health Endpoint
- **URL**: `http://localhost:3001/api/health`
- **Response**: JSON formatında sistem durumu
- Uptime, environment, version bilgileri
- Database ve API servis durumları

### 5. Gelişmiş API Client
- Circuit breaker pattern
- Retry mekanizması
- Timeout kontrolü
- Error handling

## Konfigürasyon

### Vite Config
```typescript
backendAutostart({
  command: 'node',
  args: ['server/index.js'],
  cwd: process.cwd(),
  healthCheckUrl: 'http://localhost:3001/api/health',
  healthCheckInterval: 5000,
  maxRetries: 3
})
```

### Health Check Hook
```typescript
const {
  isHealthy,
  lastChecked,
  retryCount,
  checkHealth
} = useBackendHealth();
```

## Hata Durumları ve Çözümler

### Backend Başlatılamıyor
1. Port 3001'in kullanımda olup olmadığını kontrol edin
2. Node.js ve npm versiyonlarını kontrol edin
3. Dependencies'lerin yüklendiğinden emin olun

### Health Check Başarısız
1. Backend'in çalışır durumda olduğunu kontrol edin
2. CORS ayarlarını kontrol edin
3. Firewall/antivirus ayarlarını kontrol edin

### Circuit Breaker Açık
1. Backend servisini yeniden başlatın
2. Network bağlantısını kontrol edin
3. 30 saniye bekleyip otomatik recovery'yi bekleyin

## Monitoring ve Debugging

### Console Logs
- Vite plugin: Backend başlatma/durdurma logları
- Health check: Durum kontrol logları
- API client: Request/response logları

### UI Göstergeleri
- Yeşil: Backend sağlıklı
- Sarı: Backend kontrol ediliyor
- Kırmızı: Backend erişilemez
- Gri: Bilinmeyen durum

## Güvenlik

- Environment-specific error messages
- Sensitive data masking
- Rate limiting (circuit breaker ile)
- CORS configuration
- JWT authentication korundu

## Performans

- Lazy loading için React.lazy kullanımı
- Debounced health checks
- Efficient retry strategies
- Memory leak prevention

## Gelecek Geliştirmeler

- [ ] Docker container support
- [ ] Multiple backend services support
- [ ] Advanced monitoring dashboard
- [ ] Automated testing integration
- [ ] Production deployment scripts