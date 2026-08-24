# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [24.08.2026] - Senkronizasyon Kilitleri ve Medya İyileştirmeleri
- **Senkronizasyon (isSyncing) Kilit Döngüsü Düzeltmesi:** Uzak durum (`applyRemoteState`) ve zorunlu senkronizasyon (`forceSync`) sırasında `ensureVideoReady` asenkron kontrolüne girilmeden *önce* eşitleme kilidinin (`isSyncing = true`) senkron olarak ayarlanması sağlandı. Bu, asenkron bekleme sırasında kullanıcı eylemlerinin (oynat, duraklat, sar) veya yeni gelen uzak durumların yanlışlıkla tetiklenmesini/yutulmasını ve senkronizasyon döngülerine girmesini engeller. Kilit kalktığında (başarılı veya zaman aşımı) bekleyen durum (`pendingState`) işlenmeye devam eder.
- **Medya Oynatma Çökme Koruması:** `PlayerAdapter.play()` içinde yerel video oynatma (`videoElement.play()`) işlemi çağrılırken döndürülen Promise güvenli bir şekilde kontrol edildi. Standart dışı özel oynatıcılara sahip platformlarda (Netflix, Disney+, YouTube vb.) dönen nesnede `.catch` bulunmaması durumunda uzantının çökmesini önleyen koruma eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
