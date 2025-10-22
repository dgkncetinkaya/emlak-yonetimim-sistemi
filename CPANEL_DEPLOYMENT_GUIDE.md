# cPanel Deployment Rehberi

## 🚀 Deployment Adımları

### 1. Dosyaları Hazırlama
```bash
# Build oluştur (eğer henüz yapmadıysanız)
npm run build
```

### 2. cPanel'e Yükleme
1. cPanel File Manager'ı açın
2. `public_html` klasörüne gidin
3. Mevcut dosyaları temizleyin (varsa)
4. `dist` klasöründeki TÜM dosyaları `public_html`'e yükleyin:
   - `index.html`
   - `assets/` klasörü
   - `templates/` klasörü
   - `favicon.svg`
   - `vite.svg`
   - `.htaccess`
   - `.env`
   - `supabase-config.js`

### 3. Dosya İzinleri
- `.htaccess` dosyası için: 644
- Diğer dosyalar için: 644
- Klasörler için: 755

## 🔧 Sorun Giderme

### Problem 1: "Bir şeyler ters gitti" Hatası
**Çözüm:**
1. Browser Developer Tools'u açın (F12)
2. Console sekmesine bakın
3. Kırmızı hatalar varsa, bunları kontrol edin

### Problem 2: WebSocket Hatası
**Çözüm:**
1. Bu normal bir durumdur (cPanel'de WebSocket desteği sınırlı)
2. Uygulama çalışmaya devam edecektir
3. Gerçek zamanlı özellikler etkilenebilir

### Problem 3: Supabase Bağlantı Hatası
**Çözüm:**
1. Browser console'da `testSupabaseConnection()` komutunu çalıştırın
2. Hata alırsanız:
   - Supabase URL'ini kontrol edin
   - API Key'in doğru olduğundan emin olun
   - CORS ayarlarını kontrol edin

### Problem 4: 404 Hatası (Sayfa Bulunamadı)
**Çözüm:**
1. `.htaccess` dosyasının `public_html`'de olduğundan emin olun
2. cPanel'de "URL Rewriting" özelliğinin aktif olduğunu kontrol edin
3. Dosya izinlerini kontrol edin

### Problem 5: CSS/JS Dosyaları Yüklenmiyor
**Çözüm:**
1. `assets/` klasörünün doğru yüklendiğini kontrol edin
2. Dosya isimlerinin doğru olduğundan emin olun
3. MIME types ayarlarını kontrol edin

## 🔍 Debug Araçları

### 1. Browser Console Komutları
```javascript
// Supabase bağlantısını test et
testSupabaseConnection()

// Environment değişkenlerini kontrol et
console.log('Environment:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})
```

### 2. Network Sekmesi
- Failed istekleri kontrol edin
- 404, 500 hatalarına dikkat edin
- CORS hatalarını kontrol edin

### 3. Application Sekmesi
- Local Storage'ı kontrol edin
- Session Storage'ı kontrol edin

## 📋 Kontrol Listesi

- [ ] `dist/` klasöründeki tüm dosyalar yüklendi
- [ ] `.htaccess` dosyası `public_html`'de
- [ ] `.env` dosyası `public_html`'de
- [ ] Dosya izinleri doğru ayarlandı
- [ ] Browser console'da hata yok
- [ ] Supabase bağlantısı çalışıyor
- [ ] Login sayfası açılıyor
- [ ] Routing çalışıyor

## 🆘 Acil Durum

Eğer hiçbir şey çalışmıyorsa:

1. **Basit Test:**
   - `public_html`'e sadece `index.html` yükleyin
   - Açılıp açılmadığını kontrol edin

2. **Hata Logları:**
   - cPanel Error Logs'u kontrol edin
   - Browser Network sekmesini kontrol edin

3. **Backup Plan:**
   - Eski dosyaları geri yükleyin
   - Adım adım tekrar deneyin

## 📞 Destek

Sorun devam ederse:
1. Browser console screenshot'ı alın
2. Network sekmesi screenshot'ı alın
3. cPanel error logs'unu kontrol edin

---

**Not:** Bu rehber cPanel shared hosting için optimize edilmiştir. VPS veya dedicated server kullanıyorsanız bazı adımlar farklı olabilir.