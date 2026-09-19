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

## [19.09.2026] - Firebase Hafıza Sızıntısı ve Regex Düzeltmesi
- **Performans İyileştirmeleri:**
  - Uzun süreli video sekmelerinde hafıza sızıntılarını önlemek için, sekme gezinmesi, iframe yenilenmesi veya oda değişiklikleri sırasında Firebase Realtime Database bağlantılarındaki eksik \`.off()\` çağrıları eklendi.
  - \`cleanupFirebase()\` fonksiyonunda sorgu parametreli (örn. \`limitToLast(n)\`) ve \`hostId\`, \`hostOnly\` gibi yeni listener'ların abonelikten tam olarak çıkılması sağlandı.
- **Hata Düzeltmeleri:**
  - \`extension/content.js\` içindeki geçersiz Regex yapısı (\`replace(/\\\\/$/, '')\`) düzeltilerek geçerli (\`replace(/\\/$/, '')\`) duruma getirildi.
