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

## $(date +%Y-%m-%d) - Dinamik Sapma Düzeltme (Drift Correction) Geliştirmesi
**Ne Yapıldı:**
- \`extension/content.js\` içindeki \`startDriftCorrection\` fonksiyonunda yer alan sabit 2.5 saniyelik sapma eşiği (drift threshold) kaldırıldı.
- Ağ gecikmesini (latency) hesaba katmak için Firebase'den \`serverTimeOffset\` dinleyicisi eklendi.
- \`timeSinceUpdate\` (güncellemeden bu yana geçen süre), \`serverTimeOffset\` kullanılarak daha doğru hesaplanacak şekilde güncellendi.
- Sapma eşiği artık oynatma durumu uyuşmazlığı ve güncelleme süresine bağlı olarak dinamik hesaplanıyor (oynatma uyuşmazlığında 0.5s, normal oynatmada 1.5s - 3.0s arası).
