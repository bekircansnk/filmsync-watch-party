# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [21.07.2026] - XSS Güvenlik İyileştirmeleri
- **Güvenlik İyileştirmeleri (XSS Önlemleri):**
  - `extension/content.js` dosyasındaki dinamik UI oluşturma kısımlarında (örneğin oda kodunun ekrana basıldığı `showAutoJoinOverlay` ve `showNamePromptModal` metotları) `innerHTML` kullanımı sınırlandırıldı. Kullanıcı tarafından sağlanan değerler artık `textContent` ile güvenli şekilde DOM'a ekleniyor.
  - Hızlı liste temizlik işlemlerinde (örn. `messageList.innerHTML = ''` veya `userListDisplay.innerHTML = ''`) olası zafiyetleri ve gereksiz render maliyetlerini engellemek için `textContent = ''` yöntemine geçiş yapıldı.
  - `extension/popup.js` içerisinde kullanıcı listesinin temizlendiği noktada (`activeUsersList.innerHTML = ''`) benzer şekilde `textContent = ''` ile değişiklik yapıldı.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
