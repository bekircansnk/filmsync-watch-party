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

## XSS Zafiyet Giderme (DOM Enjeksiyonu)
**Tarih:** 2026-10-04
**Bulgular:** `extension/content.js` ve `extension/popup.js` dosyalarında, `innerHTML` kullanılarak DOM'a eklenen verilerin (örneğin oda isimleri, platform adları vb.) HTML kaçış karakterlerinden geçirilmediği tespit edildi. Bu durum, zararlı olabilecek verilerin doğrudan sayfaya işlenmesine neden olarak XSS (Cross-Site Scripting) zafiyetlerine yol açabilir.
**Düzeltme:** Bir `escapeHTML` fonksiyonu eklendi ve `innerHTML` içindeki şablon değişkenleri (template literals) bu fonksiyon ile sarmalandı (`${escapeHTML(roomName)}` vb.). Böylece potansiyel olarak zararlı HTML etiketlerinin yorumlanmasının önüne geçildi.
