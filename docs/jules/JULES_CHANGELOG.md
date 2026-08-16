# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [16.08.2026] - Güvenlik Güncellemesi (XSS Düzeltmeleri)
- **Güvenlik (XSS) Düzeltmeleri:**
  - \`extension/content.js\` içindeki \`showAutoJoinOverlay\` ve \`showNamePromptModal\` fonksiyonlarında oda isminin (\`roomName\`) dinamik olarak DOM'a \`innerHTML\` ile eklenmesinden kaynaklanan Cross-Site Scripting (XSS) açığı giderildi. Oda isimleri artık güvenli bir şekilde \`textContent\` kullanılarak eklenmektedir.
  - \`extension/popup.js\` içindeki \`loadPublicRooms\` fonksiyonunda genel odalar listelenirken, dinamik değişkenlerin (\`roomId\`, \`platformName\`, \`displayUsersText\`) doğrudan \`innerHTML\` içine eklenmesinden kaynaklanan XSS zafiyeti düzeltildi. Veriler artık \`textContent\` ve \`dataset\` (veri özellikleri) aracılığıyla atanarak güvenli hale getirildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
