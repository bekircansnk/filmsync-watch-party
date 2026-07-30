# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [20.07.2026] - Güvenlik İyileştirmeleri (Path Traversal)
- **Güvenlik Analizi:**
  - `manifest.json`, `content.js`, `popup.js` ve `background.js` yapılandırmaları incelendi. `firebaseConfig` değişkeninde sadece istemci (client-side) tarafında yer alan izinli API anahtarları olduğu, herhangi bir administrative key (yönetici/servis hesap anahtarı) veya hassas sızma barındırmadığı onaylandı. Build/env sistemi bulunmayan mimarilerde bu anahtarların kod içine gömülmesi uygun görüldü.
- **Hata Düzeltmeleri & Güvenlik:**
  - `background.js` içerisindeki REST API (`fetch`) sorgularında Chrome mesajlarından alınan parametrelerin (örn. `roomId`, `userId`) URL'ye doğrudan eklenmesi nedeniyle oluşan Path Traversal (dizin atlama) güvenlik açıklarını gidermek için; dışarıdan gelen bu parametrelere regex filtrelemesi (`/^[a-zA-Z0-9_-]+$/`) eklendi ve güvenli olmayan karakterlerin API isteklerine geçmesi engellendi.

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.
