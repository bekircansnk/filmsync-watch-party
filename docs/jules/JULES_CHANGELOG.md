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

## 29.08.2026 - Akıllı Eşitleme (Drift Correction) İyileştirmesi
**Değişiklik:** `startDriftCorrection` fonksiyonundaki sapma eşiği dinamik hale getirildi.
**Detay:** Ağ gecikmesi ve oynatma durumu uyuşmazlıklarına (play/pause state mismatch) göre tolerans (varsayılan 2.5s) dinamik olarak ayarlanacak şekilde (0.5s - 2.5s arası) güncellendi. Bu sayede senkronizasyonun çok daha kusursuz olması sağlandı.
