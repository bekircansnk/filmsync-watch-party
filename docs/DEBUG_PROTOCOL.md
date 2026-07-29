# 🐞 DEBUG PROTOCOL & HATA ÇÖZÜM GÜNLÜĞÜ

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
