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

## [25.09.2026] - Log Temizliği ve Hata Yakalama
- **İyileştirmeler:**
  - `extension/content.js`, `extension/popup.js` ve `extension/inject.js` içerisindeki düz `console.log` çıktıları `Logger` nesnesi kullanılarak yapılandırılmış loglamaya geçirildi.
- **Güvenlik / Hata Giderme:**
  - Platform API kancalarına (Netflix, Disney+, YouTube) `extension/inject.js` içinde `try-catch` blokları eklendi. Bu sayede platform değişikliklerinden kaynaklı beklemeyen hataların eklentiyi çökertmesi engellendi.
