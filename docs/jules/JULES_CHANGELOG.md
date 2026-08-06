# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [06.08.2026] - Dinamik Sapma (Drift) Toleransı ve Ağ Gecikmesi Hesaplama
- **Hata Düzeltmeleri ve İyileştirmeler:**
  - `startDriftCorrection` içerisinde Firebase üzerinden host'un son durumunu çekerken geçen süre hesaplanarak ağ gecikmesi ölçüldü (`networkLatencySec`).
  - Eşitleme sapma toleransı statik (2.5s) bir değerden, ağ gecikmesine bağlı olarak değişen dinamik bir değere (`Math.max(1.5, baseThreshold + networkLatencySec)`) dönüştürüldü.
  - Video oynatma-durdurma durum uyumsuzluğunda, tolerans doğrudan 0.5s gibi sıkı bir değere çekilerek tepki hızı artırıldı.
  - Kod kalitesini bozmadan `replace_with_git_merge_diff` kullanılarak eşitleme doğruluğu artırıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
