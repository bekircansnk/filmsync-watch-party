## 2026-10-19 - Toast Bildirim XSS Zafiyeti
**Vulnerability:** extension/content.js içindeki updateToastContent metodunda dinamik targetTitle verisi doğrudan innerHTML'e şablon string kullanılarak ekleniyordu. extension/popup.js'de de benzer dinamik text içeren HTML'in hatalı kullanımı mevcuttu (düzeltildi, template literal ' ' olarak değiştirildi).
**Learning:** Kullanıcı verisi barındırabilecek stringler asla innerHTML ile kullanılmamalı, her zaman önce yapı kurulup textContent ile data set edilmeli.
**Prevention:** Her DOM update'te eğer veri barındırıyorsa HTML şablonlarında placeholder span'ler oluşturulup sonrasında textContent kullanmak standart olmalı.
