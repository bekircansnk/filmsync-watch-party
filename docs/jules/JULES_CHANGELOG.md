# JULES_CHANGELOG

## Güvenlik İyileştirmeleri (Security Improvements)

- Eklenti yapılandırma dosyalarında (`extension/content.js` ve `extension/popup.js`) bulunan sabit kodlanmış (hardcoded) Firebase API anahtarları ve proje bilgileri kaldırıldı.
- Güvensiz kimlik bilgisi sızıntısını (credential leakage) ve yetkisiz veritabanı yazma erişimini önlemek amacıyla gerçek Firebase kimlik bilgileri yerine yer tutucu (placeholder) değerler (`YOUR_API_KEY`, `YOUR_PROJECT_ID`, vb.) eklendi.
- Artık kullanıcıların, README dosyasındaki yapılandırma kılavuzunu izleyerek kendi Firebase projelerini oluşturmaları ve bağlamaları gerekmektedir.
