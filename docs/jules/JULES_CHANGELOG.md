# FilmSync Değişiklik Günlüğü (Jules Tarafından)

## Tarih: 2026-07-19
- `extension/content.js` dosyasındaki `startDriftCorrection` fonksiyonunda senkronizasyon düzeltme mantığı iyileştirildi.
- Video süresi senkronizasyonu için önceden sabit olan 3 saniyelik sapma eşiği dinamik hale getirildi.
- Ağ gecikmesi (`networkLatency`) hesaba katılarak dinamik bir eşik değeri (`dynamicThreshold = 2.5 + networkLatency`) oluşturuldu.
- Tekrarlanan senkronizasyon kayıplarını veya sapmalarını daha agresif bir şekilde düzeltmek için `mismatchCount` (uyumsuzluk sayısı) eklendi. Peş peşe gelen eşitsizliklerde eşik değeri düşürülerek daha hızlı müdahale edilmesi sağlandı.
- Değişiklikler sayesinde ağ koşullarına bağlı olarak senkronizasyon çok daha pürüzsüz ve hassas hale getirildi.
