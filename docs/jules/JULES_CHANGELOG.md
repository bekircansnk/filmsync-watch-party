# JULES_CHANGELOG

## Değişiklikler

### Yapısal (Structured) Loglama Eklendi
- `extension/content.js` ve `extension/popup.js` dosyalarına, çıktıyı daha düzenli hale getiren `Logger` nesnesi (`info`, `warn`, `error`) eklendi.
- Kod içerisindeki tüm düz `console.log` ve `console.error` çağrıları `Logger.info` ve `Logger.error` ile değiştirildi. Bu sayede gelecekte logların filtrelenmesi veya kapatılması kolaylaştırıldı.

### Hata Yakalama (Try-Catch) Blokları ile API Kancaları Güçlendirildi
- `extension/content.js` dosyasındaki video izleme mantığını çalıştıran `startVideoTracking` metodunun içerisi `try-catch` blokları ile sarmalandı. Bu sayede Netflix, Disney+, YouTube gibi platformlardaki karmaşık video oynatıcılarından kaynaklı, tarayıcı eklentisini çökertebilecek hataların (crash) önüne geçildi.
- Video olay dinleyicileri (`handlePlayEvent`, `handlePauseEvent`, `handleSeekEvent`) ve senkronizasyonu zorlayan `forceSync` işlevleri `try-catch` bloklarıyla korumaya alındı.
- Herhangi bir hata oluştuğunda, eklentinin tamamen durması yerine `Logger.error` kullanılarak konsolda sadece hata mesajı (log) verilmesi sağlandı.
