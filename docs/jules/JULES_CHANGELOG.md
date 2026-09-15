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

## [15.09.2026] - XSS Zafiyeti Giderme (Jules Otonom)
- **Güvenlik İyileştirmeleri:**
  - \`extension/popup.js\` içinde oda kodu, platform adı ve aktif kullanıcı sayısı gibi dinamik içeriklerin doğrudan \`innerHTML\` kullanılarak yerleştirilmesinden kaynaklanan olası XSS açıkları giderildi. Yerleştirmeler güvenli DOM API'leri (createElement, textContent) ile değiştirildi.
  - \`extension/content.js\` içindeki \`showAutoJoinOverlay\` ve \`showNamePromptModal\` fonksiyonlarında, kullanıcıdan alınan oda isimlerinin (roomName) doğrudan \`innerHTML\` üzerinden enjekte edilmesi engellendi. Metin atamaları \`textContent\` kullanılarak güvenli hale getirildi.
