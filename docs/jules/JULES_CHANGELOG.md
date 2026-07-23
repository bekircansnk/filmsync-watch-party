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

## [23.07.2026] - XSS Güvenlik Zafiyetlerinin Giderilmesi
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında kullanıcı tarafından girilen oda adlarının (`roomName`) doğrudan `innerHTML` ile sayfaya enjekte edilmesinden kaynaklanan XSS (Cross-Site Scripting) zafiyetleri giderildi. Bu kısımlarda `DOMParser` ve güvenli text-bazlı yöntemler (`textContent`, `createElement`) kullanıldı.
  - `extension/content.js` dosyasındaki diğer statik HTML enjeksiyonları (`root.innerHTML`, `chatToggleBtn.innerHTML`, `startBtn.innerHTML`) güvenlik prensiplerine uygun olarak `DOMParser` ve standart DOM metodları (`appendChild`, `createElement`) ile değiştirildi.
  - `extension/content.js` ve `extension/popup.js` içindeki `.innerHTML = ''` kullanımları daha güvenli ve performanslı olan `.textContent = ''` ile değiştirildi.
