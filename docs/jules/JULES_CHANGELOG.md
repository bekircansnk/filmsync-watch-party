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

## [11.08.2026] - XSS Açıkları Giderildi
- `extension/content.js` ve `extension/popup.js` içindeki `innerHTML` kullanımları incelendi.
- DOM tabanlı XSS açıklarını (Cross-Site Scripting) engellemek amacıyla, dinamik kullanıcı verilerinin (isim, oda adı, mesajlar vb.) doğrudan `innerHTML` içerisine yazılması engellendi.
- Statik HTML yapısı için `innerHTML` kullanılmaya devam edilirken, kullanıcıdan alınan veriler özel yer tutucu (placeholder) elemanlarına (örn: `<span class="dynamic-text"></span>`) `.textContent` özelliği ile güvenli bir şekilde atandı.
