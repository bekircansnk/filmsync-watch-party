# FilmSync Değişiklik Günlüğü (Changelog)

## Performans ve Bellek Sızıntısı Optimizasyonları
- Firebase canlı bağlantı dinleyicilerindeki (`.on()` ve `.off()`) sızıntılar, sorgu referansları tutularak ve çıkışlarda kesin olarak temizlenerek giderildi.
- Kapatma ve yönlendirme işlemleri sırasında eski dinleyicilerin aktif kalmasını engellemek için `beforeunload` ve `pagehide` olayları dinlenerek Firebase bağlantı koparma mekanizmaları (teardown) güçlendirildi.
- `setInterval` kullanan arkaplan döngülerinin (video takip, drift düzeltme, UI koruma) üst üste binmesini engelleyecek şekilde yeniden başlatılmadan önce temizlenmesi sağlandı.
- Tam ekran olayı dinleyicisinin (fullscreen event) sayfaya birden fazla kez eklenmesi önlendi.
- Uzantı ayarları güncellendiğinde veya başka bir odaya geçildiğinde sayfa yenilemeye gerek kalmadan tüm arkaplan görevleri ve Firebase dinleyicilerinin temiz bir şekilde sıfırlanması (graceful teardown) sağlandı.
