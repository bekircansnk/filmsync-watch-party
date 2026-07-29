# SYSTEM CHANGELOG

## [29.07.2026] Aktif Odalar Rehberi (Public Rooms) & Otomatik Oda İmha Sistemi

### Eklendi / Geliştirildi
- **Aktif Odalar Rehberi (Public Rooms List):** Eklenti açıldığında oda kodu paylaşma ihtiyacını ortadan kaldıran canlı "AÇIK ODALAR (X)" kart listesi ve aktif oda sayacı eklendi.
- **Tek Tıkla Katılma:** Odalar; oda kodu, platform (Netflix, YouTube, Disney+ vb.) ve içerideki kişilerin isimleriyle listelenerek "Odaya Katıl" butonu ile şifresiz/kod yazmadan filmin izlendiği sayfaya aktarılacak şekilde entegre edildi.
- **Otomatik Oda İmha (Auto-Cleanup):**
  - **3 Saat İnaktiflik:** Odada hiç üye kalmadığında veya 3 saat boyunca hiçbir hareket olmadığında oda otomatik imha edilerek Firebase'den siliniyor.
  - **24 Saat Zaman Aşımı (Max TTL):** Bir oda oluşturulduktan itibaren 24 saat geçtiğinde otomatik olarak temizleniyor.

## [29.07.2026] Netflix Arayüzü & Kalıcı Oda Kodu Katılım Tamiri (360-hata-uzmani)

### Düzeltildi / Geliştirildi
- **Netflix Yazı Boyutları (rem -> px):** Netflix `html`/`body` kök ölçeklendirmesinden dolayı mikro seviyede küçülen sohbet paneli fontları `px` birimlerine dönüştürüldü ve font izolasyonu sağlandı.
- **Netflix Çifte Ekran / Boşluk Düzeltmesi:** Sohbet paneli açıldığında Netflix videolarında oluşan 270px genişliğindeki bomboş siyah alan (çifte daraltma) giderildi, oynatıcı sohbet paneline tam oturtuldu.
- **Oda Kodu Katılım ve Yönlendirme:** Popup üzerinden 4 haneli oda kodu girildiğinde kullanıcı otomatik olarak odadaki aktif film URL'sine (`lastState.url`) yönlendirilecek şekilde geliştirildi.
- **Oda ve Sekme Kurtarma (Tab Recovery):** Tarayıcı kapatılıp açıldığında Chrome sekme ID'lerinin sıfırlanması nedeniyle eklentinin pasife geçmesi engellendi; film sayfasında sekme otomatik aktifleşip odaya yeniden bağlanır hale getirildi.
- **Kalıcı Odalar (Persistent Rooms):** Odadan çıkılsa dahi oda kodları ve Firebase durumları korunarak, istenildiği zaman 4 haneli kodla aynı odaya tekrar girilebilmesi sağlandı.

## [12.07.2026] Oda URL Senkronizasyonu ve Anlık Film Katılım Bildirimleri

### Eklendi / Güncellendi
- **Sıradan Kullanıcı URL Koruyucu:** Odaya katılan sıradan kullanıcıların, oda sahibinin güncel film URL'sini kendi eski URL'leri ile ezmesi (overwrite) engellendi. URL güncelleme yetkisi sadece oda sahibine (host) verildi.
- **Anlık Film Katılım Bildirimi (forceSync Entegrasyonu):** Odaya katılım anında kullanıcı henüz film sayfasını açmamışsa veya farklı bir sayfadaysa, veritabanındaki film URL'sine anında yönlendirme sunan "Katıl" bildirimi (`Oda sahibi yeni bir film açtı. Katılmak için tıklayın! 🍿`) eklendi.
- **Canlı URL Takibi:** Oda sahibi yeni bir film başlattığında (URL değiştiğinde) diğer üyelerin bu URL değişikliğini anlık olarak yakalayıp ekranda bildirim olarak görebilmeleri sağlandı.

## [2026-07-06] FilmSync Gelişmiş Sohbet ve Şifreli Oda Entegrasyonu

### Eklendi / Güncellendi
- **Şifreli Oda Koruması:** `backend/server.js` ve `extension/popup` dosyalarına şifre özelliği eklendi. Artık odalara sadece şifresini bilen kullanıcılar katılabiliyor.
- **Cam Efektli Sohben Paneli (Glassmorphism):** Sayfada yüzen, Apple stili şık yarı saydam bir sohbet arayüzü enjekte edildi.
- **Aktif Üye Listesi:** Oda penceresinin üstünde anlık olarak odadaki tüm kullanıcıların adları listelenebiliyor.
- **Klavye Enter Kısayolu:** Sayfa odağındayken `Enter` tuşuna basıldığında sohbet paneli açılıp yazmaya hazır hale geliyor. Tekrar `Enter` ile mesaj gönderiliyor.
- **Tam Ekran Desteği:** Tarayıcı tam ekran yapıldığında sohbet baloncuğu otomatik olarak tam ekran olan elementin altına taşınarak görünür kalmaya devam ediyor.
