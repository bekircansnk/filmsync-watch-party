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

## Cross-Site Scripting (XSS) Zafiyetlerinin Giderilmesi (İçerik Enjeksiyonu)

**Bulgular:**
- `extension/content.js` ve `extension/popup.js` dosyalarında, DOM'a dinamik içerik eklenirken güvenli olmayan `innerHTML` metodunun kullanıldığı tespit edildi.
- Özellikle `roomName` ve kullanıcı listesi gibi verilerin dışarıdan alındığı senaryolarda `innerHTML` kullanımı, kötü niyetli script enjeksiyonlarına (XSS) olanak tanımaktaydı.

**Düzeltmeler:**
- `extension/content.js` dosyasına, statik HTML ve SVG içeriklerini güvenli bir şekilde ayrıştırıp `DocumentFragment` olarak döndüren `stringToHTML` yardımcı fonksiyonu eklendi. Bu fonksiyon `DOMParser` kullanarak içerikleri işler ve doğrudan string olarak DOM'a eklenmesinin önüne geçer.
- `extension/content.js` içerisinde `.innerHTML` ile yapılan tüm DOM manipülasyonları, `.textContent` veya `stringToHTML` kombinasyonları ile güvenli hale getirildi.
- `extension/popup.js` dosyasında kullanıcı listesi sıfırlanırken kullanılan `activeUsersList.innerHTML = ''` ifadesi, güvenli olan `activeUsersList.textContent = ''` ile değiştirildi.
