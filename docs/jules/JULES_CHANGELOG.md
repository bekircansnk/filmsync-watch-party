# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.08.2026] - Video Senkronizasyonu Tolerans İyileştirmesi
- **Geliştirme:**
  - `extension/content.js` dosyasındaki `startDriftCorrection` fonksiyonunda kullanılan sabit 2.5 saniyelik sapma toleransı (drift threshold) dinamik hale getirildi.
  - Ağ gecikmesi (`timeDiff`) ve oynatma durumu (`playStateMismatch`) baz alınarak esnek bir senkronizasyon eşiği hesaplanması sağlandı, böylece gereksiz yeniden senkronizasyon döngülerinin önüne geçildi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
