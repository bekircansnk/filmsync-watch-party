# ⚙️ Jules Otomasyon Kayıt Defteri (JULES_AUTOMATION_REGISTRY.md)

Bu dosya, jules.google.com arayüzünde "Scheduled Tasks" sekmesinde kurulması planlanan zamanlanmış görevlerin konfigürasyonunu ve eşleştirmelerini tanımlar.

---

## 📅 Zamanlanmış Görev Tanımları

### 1. Haftalık Senkronizasyon Kararlılık Analizi
- **Görev Adı:** `FilmSync Sync Stability Audit`
- **Zamanlama (Cron):** `0 9 * * 1` (Her Pazartesi 09:00)
- **Tetiklenecek Prompt:** `PROMPT-SYNC-001` (JULES_PRO_PROMPTS_LIBRARY.md'den)

### 2. Haftalık Hata Yakalama ve Log Optimizasyonu
- **Görev Adı:** `FilmSync Error Catching & Log Audit`
- **Zamanlama (Cron):** `0 10 * * 3` (Her Çarşamba 10:00)
- **Tetiklenecek Prompt:** `PROMPT-CODE-001` (JULES_PRO_PROMPTS_LIBRARY.md'den)

### 3. Haftalık Realtime DB Dinleyici Temizliği
- **Görev Adı:** `FilmSync Firebase Listener Performance`
- **Zamanlama (Cron):** `0 11 * * 5` (Her Cuma 11:00)
- **Tetiklenecek Prompt:** `PROMPT-PERF-001` (JULES_PRO_PROMPTS_LIBRARY.md'den)

### 4. İki Haftalık Güvenlik ve Leak Taraması
- **Görev Adı:** `FilmSync Security & Credential Audit`
- **Zamanlama (Cron):** `0 14 */14 * *` (2 haftada bir Pazartesi 14:00)
- **Tetiklenecek Prompt:** `PROMPT-SEC-001` (JULES_PRO_PROMPTS_LIBRARY.md'den)

---

## 🛠️ Jules Yürütme Talimatları
Jules bir görevi devraldığında:
1. `docs/jules/JULES_PRO_PROMPTS_LIBRARY.md` dosyasını referans almalıdır.
2. Değişiklikleri yaptıktan sonra `docs/jules/JULES_CHANGELOG.md` dosyasını Türkçe olarak güncellemelidir.
3. Çalışmanın çıktısını ve durumunu `docs/jules/JULES_TASKS_REPORT.md` dosyasına işlemelidir.
