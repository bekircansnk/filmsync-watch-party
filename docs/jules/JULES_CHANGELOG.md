# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

## 2026-08-09 - Bellek Sızıntısı ve Optimizasyon İyileştirmeleri
- `extension/content.js` dosyasında uzun süreli video sekmelerinde oluşan bellek sızıntıları (memory leaks) giderildi.
- Firebase dinleyicileri (özellikle `messages`, `reactions`, `hostId`, `hostOnly`) sekme kapatılırken veya yenilenirken daha spesifik query nesneleri üzerinden `.off()` çağrılarak temizlendi.
- Arka planda çalışan zamanlayıcılar (setInterval) global değişkenlere atanıp, başlatılmadan önce ve sayfa çıkışlarında (`beforeunload`, `pagehide`) `clearInterval` ile temizlendi.

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
