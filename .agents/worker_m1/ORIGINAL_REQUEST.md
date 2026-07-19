## 2026-07-12T19:57:19+03:00

**GÖREV**:
Sen FilmSync projesi için bir Worker ajanısın (kimliğin: worker_m1). Çalışma dizinin: /Users/bekir/Uygulamalarım/12-FilmSync/.agents/worker_m1.
Görevin, Milestone 1 (Çoklu Oynatıcı Adaptörleri) kapsamında Netflix, YouTube, Disney+ ve Genel HTML5 oynatıcı entegrasyonunu kod tabanına uygulamaktır.

**KAYNAKLAR VE GİRDİLER**:
Aşağıdaki Explorer analiz raporlarını ve handoff dosyalarını oku ve uygula:
- Rapor 1: /Users/bekir/Uygulamalarım/12-FilmSync/.agents/explorer_m1_3/analysis.md
- Rapor 2: /Users/bekir/Uygulamalarım/12-FilmSync/.agents/explorer_m1_2/analysis.md
- Handoff 1: /Users/bekir/Uygulamalarım/12-FilmSync/.agents/explorer_m1_3/handoff.md

**YAPILACAK KOD DEĞİŞİKLİKLERİ**:
1. **`extension/inject.js` Güncellemesi**:
   - Netflix, Disney+ ve YouTube sayfalarında enjekte edildiğinde ilgili oynatıcı API'lerini (Netflix Cadmium, Disney+ MediaPlayer, YouTube HTML5 player API) dinleyip play/pause/seek işlemlerini gerçekleştirmesini sağla.
   - Disney+ için MediaPlayer nesnesine erişilemezse Shadow DOM buton tıklama ve mouse PointerEvent (seek bar için) fallback'lerini yerleştir.
   - Kod tabanında değişken ve fonksiyon isimlerini İngilizce yaz, ancak Türkçe yorum satırları ekle.
2. **`extension/content.js` Güncellemesi**:
   - Sayfa yüklendiğinde Netflix, Disney+ ve YouTube sitelerinden birindeyse `inject.js` scriptini enjekte etmesini sağla.
   - `PlayerAdapter` nesnesinin `play`, `pause` ve `seek` metotlarını; Netflix, Disney+ veya YouTube üzerindeyken `window.postMessage` ile `inject.js`'e komut gönderecek şekilde güncelle. Diğer sitelerde ise doğrudan standart `<video>` elementine müdahale etmeye devam etsin.
3. **`extension/manifest.json` Güncellemesi**:
   - `web_accessible_resources` altındaki `inject.js` bölümünün `matches` dizisine `*://*.netflix.com/*`, `*://*.disneyplus.com/*` ve `*://*.youtube.com/*` maskelerini ekle.

**KRİTİK KISITLAMALAR VE KURALLAR**:
- **Sıkı Monorepo Disiplini**: Proje dizininde (`/Users/bekir/Uygulamalarım/12-FilmSync`) hiçbir şekilde bağımsız `node_modules`, `pnpm-lock.yaml`, `package-lock.json` veya yerel `pnpm-workspace.yaml` bulunmamalıdır. Eğer varsa bunları hemen `/Users/bekir/silinecekler_cop_kutusu/12-FilmSync/` dizinine taşı.
- **Canlı DB Bağlantısı**: committed kodlarda kesinlikle mock/yerel DB bağlantısı veya mockup testi bulunmamalı, her zaman canlı Firebase Realtime Database bağlantısı korunmalıdır.
- **Zaman/Tarih Formatı**: UI tarafında görüntülenecek tüm tarihler/saatler Türkçe yerel formatında (`DD.MM.YYYY` veya `DD.MM.YYYY HH:mm:ss`) olmalıdır.
- **İletişim Dili**: Koordinasyon ve handoff dosyaların tamamen Türkçe olmalıdır.

**ÇIKTI VE TAMAMLANMA KRİTERİ**:
- Değişiklikleri yaptıktan sonra eklentinin hata vermeden yüklenebildiğini kontrol et.
- Çalışma dizininde yaptığın değişiklikleri, test adımlarını ve build/çalışma durumunu bildiren detaylı bir `handoff.md` oluştur.
- İşin bittiğinde ana ajana (fbdf0505-25fd-44a6-adfa-0f3564f412f8) `send_message` ile raporunun yolunu içeren bir handoff mesajı gönder.
