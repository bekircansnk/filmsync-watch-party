# FilmSync Değişiklik Günlüğü (Changelog)

## Performans Optimizasyonları (Performance Optimizations)

- **Sohbet Paneli Animasyonu (Chat Panel Animation):**
  Sohbet panelinin ve bildirim pencerelerinin animasyonlarında CPU tabanlı `right` özelliği değiştirilerek GPU hızlandırmalı (GPU-accelerated) `transform: translateX` mantığına geçildi. Bu sayede animasyon sırasında oluşabilen DOM reflow işlemi azaltıldı ve video izleme partilerinde kare hızının (frame-rate) yüksek kalması sağlandı.

- **Video Oynatıcı Boyutlandırması (Video Player Frame Reductions):**
  Sohbet paneli açıldığında Netflix, Disney+ ve YouTube gibi platformların video oynatıcı alanları, `body.filmsync-sidebar-open` class'ı tetiklenerek `width: calc(100% - 320px)` olarak dinamik yeniden boyutlandırılacak şekilde ayarlandı. Bu işlem, arayüzün videonun üstüne binmesini engellerken performansı yüksek tutacak biçimde tasarlandı.
