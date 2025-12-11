# Abonelik Yönetimi Sistemi

> **Önemli Not:** Sistemi kullanabilmek için aktif bir aboneliğiniz olması gerekmektedir. Abonelik yönetimi sayfası sadece mevcut abonelik bilgilerinizi görüntüler ve yönetir.

## Yapılan Değişiklikler

### 1. Abonelik Yönetimi Sayfası (SubscriptionManagement)
- Sadece aktif aboneliği olan kullanıcılar sistemi kullanabilir
- Abonelik bilgilerinin detaylı gösterimi
- Görsel ve kullanıcı dostu arayüz
- Responsive tasarım (mobil uyumlu)

### 2. Fatura Geçmişi Bileşeni (SubscriptionHistory.tsx)
- Tüm ödeme geçmişini görüntüleme
- Fatura indirme özelliği
- Ödeme durumu takibi
- Modal popup ile gösterim

## Özellikler

### 📊 Özet Banner
- Mevcut plan adı ve durumu
- Aktif/Pasif durum göstergesi
- Otomatik yenileme bilgisi
- Ödeme tutarı ve döngüsü

### 📈 Hızlı Özet Kartları (4 Kart)
1. **Abonelik Süresi**
   - Kaç aydır abone olduğunuz
   - Toplam gün sayısı
   - Mor renkli ikon

2. **Kalan Süre**
   - Aboneliğin bitmesine kaç gün kaldığı
   - Dairesel ilerleme göstergesi
   - Bitiş tarihi

3. **Sonraki Ödeme**
   - Sonraki ödemeye kaç gün kaldığı
   - Ödeme tarihi
   - Mavi renkli ikon

4. **Ödeme Tutarı**
   - Aylık/Yıllık tutar
   - Ödeme döngüsü bilgisi
   - Yeşil renkli ikon

### 📉 İlerleme Çubuğu
- Abonelik döneminin ne kadarının geçtiğini gösterir
- Başlangıç ve bitiş tarihleri
- Yüzdelik gösterim
- Görsel progress bar

### ⚠️ Akıllı Uyarılar
- **Yaklaşan Ödeme**: Ödeme 7 gün içindeyse sarı uyarı
- **Süre Doluyor**: Abonelik 7 gün içinde bitiyorsa mavi bilgi
- Otomatik yenileme durumu bildirimi

### 📋 Detaylı Bilgiler
- **Mevcut Abonelik Kartı**
  - Plan adı ve durum
  - Ücret ve ödeme döngüsü
  - Başlangıç ve bitiş tarihleri
  
- **Plan Özellikleri Kartı**
  - Planın sunduğu özellikler listesi
  - Plan açıklaması

- **Ödeme Bilgileri Kartı**
  - Ödeme yöntemi
  - Otomatik yenileme durumu
  - Sonraki ödeme tarihi

### 💳 Fatura Geçmişi
- Tüm ödemelerin listesi
- Ödeme tarihi ve tutarı
- Ödeme durumu (Tamamlandı, Beklemede, Başarısız, İade)
- Fatura indirme butonu
- Modal popup ile gösterim

### 🎯 Aksiyon Butonları
- **Fatura Geçmişi**: Tüm faturaları görüntüle
- **Aboneliği İptal Et**: Aktif abonelikleri iptal et

### 🎨 Kullanıcı Deneyimi
- ✅ Responsive tasarım (mobil, tablet, desktop)
- ✅ Dark mode desteği
- ✅ Renk teması entegrasyonu
- ✅ Loading durumları
- ✅ Toast bildirimleri
- ✅ İkonlu gösterimler
- ✅ Hover efektleri

## Kullanım

### Abonelik Yönetimi Sayfası

**Not:** Sistemi kullanabilmek için aktif bir aboneliğiniz olması gerekmektedir.

#### Sayfa Bölümleri

1. **Üst Banner**
   - Mevcut planınızı ve durumunu gösterir
   - Otomatik yenileme bilgisi
   - Ödeme tutarı

2. **Özet Kartları**
   - **Abonelik Süresi**: Kaç aydır abone olduğunuzu gösterir
   - **Kalan Süre**: Aboneliğin bitmesine kaç gün kaldığını gösterir
   - **Sonraki Ödeme**: Sonraki ödemeye kaç gün kaldığını gösterir
   - **Ödeme Tutarı**: Aylık/Yıllık ödeme tutarınızı gösterir

3. **İlerleme Çubuğu**
   - Abonelik döneminin ne kadarının geçtiğini görsel olarak gösterir
   - Başlangıç ve bitiş tarihlerini gösterir

4. **Uyarılar**
   - Ödeme 7 gün içindeyse uyarı gösterir
   - Abonelik süresi dolmak üzereyse bilgi verir

5. **Detaylı Bilgiler**
   - Mevcut abonelik detayları
   - Plan özellikleri
   - Ödeme bilgileri

6. **Aksiyon Butonları**
   - **Fatura Geçmişi**: Tüm ödemelerinizi görüntüleyin
   - **Aboneliği İptal Et**: Aboneliğinizi iptal edin

### Fatura Geçmişi

1. "Fatura Geçmişi" butonuna tıklayın
2. Açılan modal'da tüm ödemelerinizi görün
3. Her ödeme için:
   - Ödeme tarihi
   - Ödeme tutarı
   - Ödeme durumu
   - Fatura indirme butonu (varsa)

### Abonelik İptali

1. "Aboneliği İptal Et" butonuna tıklayın
2. İptal işlemi onaylanır
3. Aboneliğiniz iptal edilir
4. Mevcut dönem sonuna kadar sistemi kullanmaya devam edebilirsiniz

## Teknik Detaylar

### Bileşenler
- `SubscriptionManagement/index.tsx`: Ana abonelik yönetimi sayfası
- `SubscriptionHistory.tsx`: Fatura geçmişi modal bileşeni

### Servisler
- `subscriptionService.ts`: Abonelik işlemleri için API servisi
  - `getCurrentSubscription()`: Mevcut aboneliği getir
  - `cancelSubscription()`: Aboneliği iptal et
  - `getPaymentHistory()`: Ödeme geçmişini getir

### Hesaplamalar
- `getRemainingDays()`: Aboneliğin bitmesine kaç gün kaldığını hesaplar
- `getSubscriptionProgress()`: Abonelik döneminin yüzde kaçının geçtiğini hesaplar
- `getDaysUntilNextPayment()`: Sonraki ödemeye kaç gün kaldığını hesaplar
- `getSubscriptionDuration()`: Kaç aydır abone olduğunu hesaplar

### Özelleştirme
- Renk teması `AppearanceContext` üzerinden yönetiliyor
- Primary color ayarları otomatik uygulanıyor
- Dark mode desteği mevcut
- Responsive tasarım (mobil, tablet, desktop)

### Durum Yönetimi
- React hooks ile state yönetimi
- Loading durumları
- Error handling
- Toast bildirimleri

## Görsel Özellikler

### Renkler
- **Mor**: Abonelik süresi kartı
- **Mavi**: Kalan süre ve sonraki ödeme kartları
- **Yeşil**: Ödeme tutarı kartı ve aktif durum
- **Sarı**: Yaklaşan ödeme uyarısı
- **Kırmızı**: İptal butonu

### İkonlar
- **Clock**: Abonelik süresi
- **CircularProgress**: Kalan süre göstergesi
- **Calendar**: Sonraki ödeme
- **TrendingUp**: Ödeme tutarı
- **Package**: Plan bilgisi
- **CreditCard**: Ödeme yöntemi
- **AlertCircle**: Uyarılar

## Notlar
- Sadece aktif aboneliği olan kullanıcılar sistemi kullanabilir
- Abonelik yoksa bilgilendirme mesajı gösterilir
- Otomatik yenileme durumu takip edilir
- Yaklaşan ödemeler için uyarı sistemi mevcut
- Fatura geçmişi modal ile gösterilir
