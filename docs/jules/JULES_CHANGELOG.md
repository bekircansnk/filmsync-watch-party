# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [Güncel] - Yarış Durumu (Race Condition) Çözümü ve PlayerAdapter İyileştirmesi
- **Hata Düzeltmeleri ve Optimizasyonlar:**
  - Global `isSyncing` zaman aşımı kilit mekanizması kaldırılarak yerine doğrudan `PlayerAdapter` içine entegre edilmiş olay kilitleme/debounce (`lockEvents`) sistemi getirildi. Bu sayede manuel kullanıcı hareketleri (oynat/duraklat/ilerlet) ile uzak `applyRemoteState` çağrıları arasındaki senkronizasyon döngüleri ve kekelemeler önlendi.
  - Olası tarayıcı eklentisi çökmelerini engellemek amacıyla `videoElement.play()` çağrılarına Promise `.catch()` hata ayıklama blokları eklendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
