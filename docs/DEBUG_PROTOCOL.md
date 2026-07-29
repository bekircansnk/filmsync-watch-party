# 🐞 DEBUG PROTOCOL & HATA ÇÖZÜM GÜNLÜĞÜ

## [29.07.2026] Kompakt Apple-Style UI & 50+ Zengin Dinamik Emoji Avatar Sistemi

### 1. Gereksiz Metin Temizliği ve Zero-Scroll Layout Optimization
- **Kök Neden:** Arayüzdeki kalabalık açıklama metinleri ve sabit dikey yükseklik nedeniyle sayfa aşağı kayıyor ve gözü yoruyordu.
- **Çözüm:** `popup.html` içerisindeki tüm gereksiz yönlendirme/açıklama metinleri kaldırıldı. Sayfa dikey yüksekliği `520px` seviyesinde dondurularak `overflow: hidden` ve modüler glassmorphic dikey yerleşim uygulandı.

### 2. Büyük Logo ve Minimal Status Indicator
- **Çözüm:** Logo imajı `52px` boyutuna büyütüldü ve neon red-purple glow gölge eklendi. Metinsel "Bağlantı Yok" yazısı kaldırılıp sadece parlak neon yeşil/kırmızı gösterge noktası bırakıldı.

### 3. 50+ Zengin Dinamik Sinema/Animasyon Emoji Havuzu
- **Çözüm:** Sabit 6 emoji seçici silindi. `getRandomMovieAvatar` fonksiyonu ile 50+ sinema ve eğlenceli karakter emojisi havuzu oluşturuldu. Kullanıcı adı yazıldığında veya rozete tıklandığında otomatik profil avatarı atanması sağlandı.

## [29.07.2026] Dizipal Otomatik Güncel Adres Yönlendirici

### 1. Dinamik URL Değişimi ve Otomatik Adres Tespiti
- **Kök Neden:** Dizipal gibi sitelerin alan adları sürekli değiştiği için kullanıcılar `t.ly/dizipalgiris` adresine girdiğinde Google arama sonuçlarına düşmektedir.
- **Çözüm:** `extension/content.js` içerisine Google Arama Yönlendirici motoru entegre edildi. `google.com/search?q=dizipal...` açıldığında DOM üzerindeki en üstteki organik geçerli Dizipal bağlantısı tespit edilir, saniyeler içinde ekran üstü yönlendirme bildirimiyle güncel adrese aktarım tamamlanır.

### 2. Servis Kartları Filtreleme
- **Çözüm:** `popup.html` ve `popup.js` üzerindeki servis kartları sadeleştirilerek sadece **Netflix**, **HDFilmCehennemi** ve **Dizipal** kartları bırakıldı.

## [29.07.2026] Aktif Odalar Rehberi ve Otomatik Oda İmha Sistemi

### 1. Açık Odalar Canlı Rehberi (Public Rooms Listing)
- **Tasarım & Mantık:** Eklenti açıldığında oda kodu kopyalayıp paylaşma zorunluluğunu ortadan kaldırmak için `popup.html` ve `popup.js` üzerine canlı `publicRoomsSection` bileşeni eklendi.
- **Detaylar:** Firebase `rooms` düğümü canlı olarak dinlenerek o andaki açık oda sayısı, oda kodları, izlenen platform (Netflix, YouTube, Disney+ vb.) ve odadaki kişilerin isimleri liste olarak kartlar halinde gösterilmektedir. Tek tıkla "Odaya Katıl" butonu ile doğrudan film sayfasına aktarım sağlanmaktadır.

### 2. Otomatik Oda İmha / Zaman Aşımı (Room Auto-Cleanup Rules)
- **3 Saat İnaktiflik:** Odada hiç aktif üye olmadığında veya son hareket üzerinden 3 saat geçtiğinde oda Firebase Realtime Database üzerinden otomatik silinir (`db.ref('rooms/' + roomId).remove()`).
- **24 Saat Max TTL:** Bir oda ne durumda olursa olsun ilk oluşturulduğu andan itibaren 24 saat (86.400.000 ms) geçtiğinde sistem tarafından otomatik imha edilmektedir.

## [29.07.2026] Netflix Arayüzü & Oda Kodu Katılım Sorunları

### 1. Netflix Sohbet Yazı Boyutu (Font Scaling Issue)
- **Kök Neden:** Netflix Web Player (`netflix.com/watch`) responsive oynatıcı ölçeklendirmesi için `html` kök elemanının `font-size` değerini düşürmektedir. Sohbet paneli içerisindeki fontlar `rem` birimleri ile tanımlandığı için Netflix üzerinde mikroskobik boyutlara küçülmekteydi.
- **Çözüm:** `extension/content.js` içerisindeki tüm sohbet paneli bileşenlerinin font boyutları (`font-size`) `rem` birimlerinden bağımsız `px` (`12px`, `13px`, `14px`, `16px`) birimlerine çevrildi ve `#filmsync-chat-panel *` için font izolasyonu sağlandı.

### 2. Netflix Çifte Ekran / Yan Boşluk (Double Calc Width Shift)
- **Kök Neden:** Sohbet paneli açıldığında `body.filmsync-sidebar-open` genişliğine `calc(100% - 270px)` verilirken, child olan `.nf-player-container` / `.watch-video` elementine de tekrar `calc(100% - 270px)` verilmekteydi. Bu durum video ile panel arasında fazladan 270px boş siyah alan oluşmasına neden oluyordu.
- **Çözüm:** İç player container elemanlarının genişliği `width: 100% !important; max-width: 100% !important;` olarak güncellendi. Body daraltıldığında video ekranı sohbet paneline tam oturtuldu.

### 3. Oda Kodu ile Giriş ve Tarayıcı Yeniden Başlatma Pasifleşmesi (Tab Recovery & Persistent Rooms)
- **Kök Neden:** 
  1. Popup üzerinden 4 haneli oda kodu ile girildiğinde sekme odadaki aktif film URL'sine (`lastState.url`) yönlendirilmiyordu.
  2. Kullanıcı tarayıcıyı veya sekmesini kapatıp açtığında Chrome sekme ID'leri sıfırlandığı için `activeTabId` eşleşmiyor ve eklenti kendini pasife alıyordu.
- **Çözüm:** 
  1. `popup.js` içerisindeki `joinRoomWithCode` fonksiyonuna otomatik sekme yönlendirmesi eklendi. Oda koduyla girildiğinde kullanıcı o an o sayfada değilse doğrudan film sayfasına aktarılıyor.
  2. `content.js` içerisine film sayfası ve video tespiti ile `activeTabId` sekme kurtarma (Tab Recovery) mekanizması eklendi. Tarayıcı yeniden açılsa dahi film sayfasında sekme id'si otomatik güncellenerek odaya sorunsuz bağlanması sağlandı.
  3. Odadan ayrılma/kapatma durumunda Firebase'deki oda kodları ve durumları muhafaza edilecek şekilde kalıcı oda yapısı garanti altına alındı.
