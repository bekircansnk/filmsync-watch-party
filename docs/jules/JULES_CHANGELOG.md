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

## [11.09.2026] - XSS Güvenlik Açığı Giderme (DOM Sanitizasyonu)
- **Güvenlik İyileştirmeleri:**
  - `extension/content.js` dosyasında `showAutoJoinOverlay` ve `showNamePromptModal` fonksiyonlarında kullanıcı tarafından belirlenen `roomName` değişkeninin doğrudan `innerHTML` ile DOM'a enjekte edilmesi engellendi. Olası XSS (Cross-Site Scripting) saldırılarını önlemek amacıyla bu değişkenler güvenli olan `textContent` özelliği ile sayfaya eklenecek şekilde yeniden yapılandırıldı.
  - `extension/popup.js` dosyasındaki açık odaların listelendiği `publicRoomList` içerisinde `roomId`, `platformName` ve `displayUsersText` değişkenlerinin `innerHTML` içerisine doğrudan yerleştirilmesi engellendi. Verilerin tümü DOM elementleri (örn. `span`) ve `dataset` nitelikleri oluşturulup `textContent` aracılığıyla güvenli bir biçimde sayfaya yansıtıldı.
  - Elementlerin attribute bazlı XSS enjeksiyon zafiyetleri de engellenerek verilerin `dataset.room` veya `dataset.code` özelliklerine güvenle atanması sağlandı.
  - Form giriş alanlarına screen reader uyumluluğunu artırmak adına `aria-label` ve `<label for="...">` gibi erişilebilirlik (A11y) düzenlemeleri eklendi.
