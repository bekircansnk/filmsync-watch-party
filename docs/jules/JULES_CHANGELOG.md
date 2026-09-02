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

## [02.09.2026] - Firebase Dinleyici Bellek Sızıntısı Düzeltmesi (Jules)
- **Hata Düzeltmeleri:**
  - `extension/content.js` içerisindeki `cleanupFirebase` fonksiyonu güncellendi.
  - `hostId` ve `hostOnly` dinleyicilerinin temizlenmemesinden kaynaklanan bellek sızıntısı giderildi.
  - Firebase'de `.limitToLast()` gibi türetilmiş sorgulara eklenen dinleyicilerin (`messages` ve `reactions`), sadece kök referans üzerinden çağrılan `.off()` ile kapanmadığı tespit edildi. Bu hata düzeltilerek, temizleme işlemi sırasında doğrudan sorgu objesi üzerinden `.off()` çağrılması sağlandı. Bu sayede uzun süreli video oturumlarındaki Firebase dinleyici bellek sızıntıları ve performans düşüşleri önlendi.
