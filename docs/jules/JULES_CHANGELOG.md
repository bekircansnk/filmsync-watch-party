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

## [23.09.2026] - Performans ve Layout İyileştirmeleri
- **Performans:**
  - Sidebar açılıp kapanırken yaşanan DOM reflow yükünü azaltmak için, `body.filmsync-sidebar-open` css kuralından `transition: width 0.3s ease;` kaldırıldı.
  - Netflix, YouTube ve Disney+ platformlarında yüksek kare hızında video oynatımını sağlamak için layout güncellemeleri anlık hale getirildi.
- **Hata Düzeltmeleri:**
  - Sidebar arayüzü yaratıldığında (`createChatUI`) ve silindiğinde (`removeChatUI`) host video oynatıcılarının doğru boyutlandırılması için anında `window.dispatchEvent(new Event('resize'));` tetiklenmesi eklendi.
  - `extension/content.js` içerisindeki geçersiz regex syntax hatası (`/\\/$/`) `/\/$/` şeklinde düzeltildi.
