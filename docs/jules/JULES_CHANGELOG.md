# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [14.09.2026] - Sidebar Optimizasyonu
- **Hata Düzeltmeleri:**
  - `extension/content.js` içindeki RegExp bayrağı sözdizimi hatası (`Invalid regular expression flags`) giderildi.

- **Performans İyileştirmeleri:**
  - Sidebar açılıp kapanırken `body.filmsync-sidebar-open` sınıfındaki `transition: width` CSS kuralı kaldırılarak DOM reflow yükü azaltıldı.
  - Netflix, YouTube ve Disney+ üzerinde yüksek kare hızlı (high-frame-rate) video oynatımında yaşanan performans sorunlarını çözmek amacıyla, sidebar'ın yüklenme (`createChatUI`) ve kaldırılma (`removeChatUI`) durumlarında sayfa yerleşiminin (layout) doğru hesaplanması için `window.dispatchEvent(new Event('resize'))` tetikleyicisi eklendi.



## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
