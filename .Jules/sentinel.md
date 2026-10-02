## 2026-10-02 - DOM tabanlı XSS zafiyetleri düzeltildi
**Vulnerability:** innerHTML kullanılarak ekrana yazdırılan dinamik veriler (roomName, roomId, platformName vb.) sanitize edilmeden eklendiği için DOM tabanlı XSS açıklarına neden oluyordu.
**Learning:** Kullanıcı kontrollü veya API üzerinden alınan değişkenler doğrudan innerHTML ile şablon içine gömülmemelidir. Bunun yerine XSS payload'larını önlemek adına veriler kaçış işlemine tabi tutulmalıdır (escaping) veya textContent kullanılmalıdır.
**Prevention:** Her bir script içerisine escapeHTML yardımcı fonksiyonu eklenerek bu kritik değişkenlerin render öncesinde filtrelenmesi sağlandı. Ayrıca fonksiyon içerisinde type-juggling açıklarını engellemek adına doğrudan string dönüşümü uygulandı.
