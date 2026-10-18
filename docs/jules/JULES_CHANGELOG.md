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
## 2026-07-29

### Performans ve Video Oynatıcı İzolasyonu İyileştirmeleri
- `extension/content.js` içerisinde sohbet paneli açıldığında (body `filmsync-sidebar-open` class'ını aldığında) Netflix, YouTube, Disney+ vb. popüler platformların video oynatıcılarına (`.watch-video`, `.nf-player-container`, `#ytd-player`, `disney-web-player`, vs.) özel css kuralları eklendi.
- Sohbet paneli ile video ekranının çakışmaması ve videonun sol panele düzgün oturması için bu elementlere `width: calc(100% - 390px) !important;` ve `max-width: calc(100% - 390px) !important;` kuralları uygulandı.
- Yüksek kare hızında (high-frame-rate) video oynatımında DOM reflow (yeniden hesaplama) kaynaklı takılma ve performans kayıplarını en aza indirmek için bu layout değişikliklerinde CSS geçişleri (`transition: none !important;`) tamamen devre dışı bırakıldı. Bu sayede paneli açıp kapatırken veya pencere boyutu değiştiğinde video kare düşmeleri engellendi.
