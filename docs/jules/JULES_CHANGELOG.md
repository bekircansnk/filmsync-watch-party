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

## [22.07.2026] - Güvenlik ve Gizlilik Denetimi (Sentinel)
- **Güvenlik Denetimi:**
  - Eklentinin yapılandırma dosyaları (`manifest.json`, `content.js`, `popup.js`, `background.js`) sızdırılmış kimlik bilgileri, idari ayrıcalıklı anahtarlar veya hassas veritabanı kuralları açısından detaylı olarak analiz edildi.
  - İstemci tarafında gömülü bulunan Firebase API anahtarlarının sunucu tabansız (serverless) istemci mimarisi bağlamında standart ve beklenen bir durum olduğu doğrulandı.
  - Kaynak kodları içerisinde herhangi bir idari yetkiye (admin access) sahip gizli anahtar (service account vb.) tespit edilmedi ve Firebase veritabanı okuma/yazma izinlerinin genel istemci yetkilerini aşacak düzeyde olmadığı teyit edildi.
