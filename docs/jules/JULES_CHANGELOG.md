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

## [16.09.2026] - Performans İyileştirmeleri ve Sayfa Reflow Optimizasyonu
- **Performans Optimizasyonu:**
  - `extension/content.js` içerisinde, DOM reflow yükünü azaltmak ve Netflix, Disney+ ve YouTube üzerinde yüksek kare hızlı (high-frame-rate) video oynatımını sağlamak amacıyla `body.filmsync-sidebar-open` sınıfından `transition: width` özelliği kaldırıldı.
  - Yan panelin (sidebar) açılması veya kapanması (ör. `createChatUI`, `removeChatUI`) sırasında, host platformların video oynatıcı boyutlarını doğru bir şekilde yeniden hesaplamasını sağlamak için hemen ardından `window.dispatchEvent(new Event('resize'))` olayı tetiklenmesi garanti altına alındı.
