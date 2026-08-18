# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [18.08.2026] - Güvenlik İyileştirmesi (Sentinel)
- **Güvenlik (Path Traversal):**
  - Firebase REST API isteklerinde (\`fetch\`) kullanılan dinamik parametrelerin (\`roomId\` ve \`userId\`) güvenliği sağlandı.
  - \`extension/background.js\` ve \`extension/popup.js\` dosyalarına Regex (\`/^[a-zA-Z0-9_-]+$/\`) doğrulama mantığı eklenerek Path Traversal zafiyeti giderildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
