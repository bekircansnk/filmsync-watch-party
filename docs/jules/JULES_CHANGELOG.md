# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## 2026-08-05 - Güvenlik İyileştirmesi (XSS Önlemi)
**Vulnerability:** extension/content.js ve extension/popup.js dosyalarında DOM elementlerine (`innerHTML` üzerinden) doğrudan dinamik değişkenler eklenerek XSS (Cross-Site Scripting) zafiyeti oluşturuluyordu.
**Learning:** `innerHTML` üzerinden dinamik kullanıcı veya veri atamaları yapmak zararlı kod enjeksiyonlarına yol açabilir.
**Action/Prevention:**
- `extension/content.js` dosyasında 'showAutoJoinOverlay' ve 'showNamePromptModal' fonksiyonları statik HTML kalıpları içerecek şekilde düzenlendi ve dinamik oda isimleri güvenli bir şekilde `textContent` kullanılarak yerleştirildi. (Ayrıca alakasız bir regular expression sözdizimi hatası düzeltildi).
- `extension/popup.js` dosyasında açık odaları yüklerken oda kartı (`card`) DOM elemanlarına dinamik bilgiler `textContent` kullanılarak atandı, `data-*` nitelikleri güvenli şekilde `dataset` üzerinden bağlandı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
