# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.

## [06.08.2026] - Jules Görevlerinin Tamamının Durdurulması ve Pasife Alınması
- **Operasyon:**
  - Kullanıcı talimatı doğrultusunda tüm zamanlanmış Jules sidecar görevleri (`/jules-yonet` cron) iptal edildi ve kaldırıldı.
  - Çalışan tüm Jules arka plan süreçleri `pkill` ile sonlandırıldı.
  - Proje dokümantasyonundaki tüm Jules görev durumları pasif/iptal olarak güncellendi.
## [29.07.2026] - Performans ve Video Oynatıcı İzolasyonu İyileştirmeleri
- `extension/content.js` içerisinde sohbet paneli açıldığında (body `filmsync-sidebar-open` class'ını aldığında) Netflix, YouTube, Disney+ vb. popüler platformların video oynatıcılarına (`.watch-video`, `.nf-player-container`, `#ytd-player`, `disney-web-player`, vs.) özel css kuralları eklendi.
- Sohbet paneli ile video ekranının çakışmaması ve videonun sol panele düzgün oturması için bu elementlere `width: calc(100% - 390px) !important;` ve `max-width: calc(100% - 390px) !important;` kuralları uygulandı.
- Yüksek kare hızında (high-frame-rate) video oynatımında DOM reflow (yeniden hesaplama) kaynaklı takılma ve performans kayıplarını en aza indirmek için bu layout değişikliklerinde CSS geçişleri (`transition: none !important;`) tamamen devre dışı bırakıldı. Bu sayede paneli açıp kapatırken veya pencere boyutu değiştiğinde video kare düşmeleri engellendi.

## [11.08.2026] - XSS Açıkları Giderildi
- `extension/content.js` ve `extension/popup.js` içindeki `innerHTML` kullanımları incelendi.
- DOM tabanlı XSS açıklarını (Cross-Site Scripting) engellemek amacıyla, dinamik kullanıcı verilerinin (isim, oda adı, mesajlar vb.) doğrudan `innerHTML` içerisine yazılması engellendi.
- Statik HTML yapısı için `innerHTML` kullanılmaya devam edilirken, kullanıcıdan alınan veriler özel yer tutucu (placeholder) elemanlarına `.textContent` özelliği ile güvenli bir şekilde atandı.

## [18.10.2026] - Firebase Güvenlik İyileştirmesi
- **Güvenlik Düzeltmeleri:**
  - `database.rules.json` dosyasında Firebase Realtime Database okuma kuralları güncellendi.
  - Öncesinde tüm odaların listelenmesine izin veren `rooms` seviyesindeki `".read": true` kuralı kaldırılarak, yalnızca bilinen oda ID'leri ile spesifik odalara erişim sağlayacak şekilde `"$roomId"` seviyesine taşındı. Bu sayede aktif izleme partilerinin hassas verilerinin sızması engellendi.
## [18.10.2026] - Logger Entegrasyonu ve Try-Catch Koruma
- **Hata Düzeltmeleri ve Geliştirmeler:**
  - `extension/content.js` ve `extension/popup.js` içerisindeki standart `console.log`, `console.warn` ve `console.error` çıktıları yapılandırılmış bir `Logger` ile değiştirildi.
  - Netflix, Disney+, YouTube gibi API'lerle etkileşime giren `PlayerAdapter` (`play`, `pause`, `seek`) metotları, eklentinin çökmesini engellemek için `try-catch` blokları ile koruma altına alındı.

## [18.10.2026] - Drift Eşitleme İyileştirmesi
- **İyileştirmeler:**
  - `extension/content.js` dosyasındaki statik sapma eşiği (3.0s) `navigator.connection.rtt` tabanlı ağ gecikmesine göre (1.5s ile 4.0s arasında) dinamik olarak ayarlanacak şekilde güncellendi.
  - Oynatıcı durumu uyumsuzluklarında kesintisiz senkronizasyon için dinamik eşik hesaplama mantığı uygulandı.

## [19.10.2026] - Senkronizasyon Kilit Döngüleri Düzeltmesi
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki `applyRemoteState` metodunda `isSyncing` kilidi erken eklendi.
  - Asenkron `ensureVideoReady` sonrasındaki erken çıkış (early return) senaryolarında oluşan ölü kilitleri engellemek için tüm return öncesi adımlarda kilit serbest bırakıldı.
