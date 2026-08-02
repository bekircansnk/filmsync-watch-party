# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [02.08.2026] - Arayüz ve Animasyon Optimizasyonu
- **Performans İyileştirmeleri:**
  - `extension/content.js` içerisinde Netflix, Disney+ ve YouTube video oynatıcı çerçeve küçültme ve yan menü yerleşim mantığı (DOM reflow) daha yüksek kare hızları sağlamak adına optimize edildi.
  - `body.filmsync-sidebar-open` elementinden düzene yeniden hesaplama yükü bindiren `transition: width 0.3s ease;` özelliği çıkarıldı.
  - Genel `transition: all` kuralları; `.filmsync-tool-btn`, `.filmsync-input-area input`, `.filmsync-send-btn`, `#filmsync-mini-toolbar` ve `.filmsync-netflix-start-btn` öğelerinde spesifik ve GPU ivmeli (transform, opacity gibi) animasyon değerleri ile değiştirildi ve uygun yerlere `will-change` (donanım hızlandırma talimatı) eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
