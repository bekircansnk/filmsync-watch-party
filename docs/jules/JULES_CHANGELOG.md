# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---


## [10.08.2026] - Drift Correction (Sapma Düzeltme) İyileştirmesi
- **İyileştirmeler:**
  - `extension/content.js` içerisindeki `startDriftCorrection` fonksiyonunda bulunan sabit 2.5 saniyelik sapma eşiği, ağ gecikmesine (`timeDiff`) göre dinamik olarak ayarlanacak şekilde güncellendi. Oynatma durumu uyuşmazlığında eşik bağımsız bırakılırken, normal sapmalarda gecikmeye bağlı olarak (1.5s - 4.0s arası) dinamikleşti.
## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
