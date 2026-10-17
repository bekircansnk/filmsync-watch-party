# FilmSync Web ve Tarayıcı Eklentisi — Tekrar Eden Çözüm Kalıpları

> Bu dosya FilmSync Web ve Tarayıcı Eklentisi projesinde kullanılan kanıtlanmış çözüm kalıplarını kaydeder.

### P1. Host-Proof Isolated Typography Pattern
- İğnelenen eklenti arayüzlerinde kök etiket (`#filmsync-root`) ve panel bileşenlerinde CSS `rem` yerine mutlak `px` değerleri atanır.
- `font-size: 16px !important`, `line-height: 1.5 !important` ve her alt bileşende kesin pikseller kullanılır.
- Bu kalıp eklentiyi Netflix, Prime Video veya YouTube'un kök `html` font-size manipülasyonlarına karşı %100 bağışık kılar.

### P2. Luminous Translucent Frosted Glass Drawer Pattern
- Panel: `background: rgba(13, 15, 25, 0.45) !important; backdrop-filter: blur(20px) saturate(180%) !important; -webkit-backdrop-filter: blur(20px) saturate(180%) !important; border-left: 1px solid rgba(255, 255, 255, 0.16) !important; box-shadow: -8px 0 36px rgba(0, 0, 0, 0.35), inset 1px 0 0 rgba(255, 255, 255, 0.12) !important;`
- Çocuk mesaj kutusu: `background: transparent !important;`
- Sayfa daraltması yerine video akışının menünün arkasından doğal olarak geçmesine izin verilir (full bleed immersion).
- Çekmece hareketi: `transform: translateX(100%) !important;` (kapalı) -> `transform: translateX(0) !important;` (açık). Panel genişliği değişse dahi hiçbir piksel taşması veya yatay kaydırma çubuğu oluşmaz.

### P3. Dynamic Stacked Large-Format Toast Engine Pattern
- `#filmsync-toast-container`: `top: 24px; right: 24px; display: flex; flex-direction: column; gap: 12px; pointer-events: none;`
- Toast kartları: Genişlik `360px` (1920px+ ekranlarda `390px`), `background: rgba(14, 16, 26, 0.78)`, `backdrop-filter: blur(24px) saturate(170%)`, `border-radius: 18px`.
- Tipografi: Başlık `font-size: 15px !important; font-weight: 800;`, Gövde `font-size: 17px !important; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.6);`.
- Süre: `Math.max(5000, Math.min(12000, text.length * 120))` ile dinamik okunabilirlik garantisi.
- Maksimum 3 kart FIFO yığınlama mantığı ile ekran kirliliği önlenir.

### P4. High-DPI & Fullscreen Responsive Media Query Pattern
- 1080p, 1440p ve 4K ekranlarda sinema/video izlerken arayüzün minikleşmesini önlemek için `@media (min-width: 1920px)` bloğunda panel genişliği `320px`, toast kartları `390px`, mesaj balonları `16.5px`, toast gövdesi `18px` olarak orantılı büyütülür.

### P5. Chat-First Keyboard Priority & Double-Escape Fullscreen Guard Pattern
- **Amaç:** Video izlerken sohbeti birincil etkileşim kanalı haline getirmek, yanlışlıkla video kısayollarına (tam ekran bozma, sessize alma, duraklatma) basılmasını önlemek ve tam ekran izlemede kazara tam ekrandan çıkışları engellemek.
- **Kural 1 (Chat-First Önceliği):** Alfanümerik tuşlar (harfler, rakamlar), noktalama ve Space (`isAlphanumericOrSpace`) document capture fazında (`useCapture: true`) yakalanarak video oynatıcıya ulaşması engellenir (`preventDefault`, `stopPropagation`, `stopImmediatePropagation`). Panel anında açılır, `#filmsyncMsgInput` odaklanır, basılan karakter inputa eklenir ve imleç metnin sonuna (`selectionStart = selectionEnd = length`) yerleştirilir.
- **Kural 2 (Odak İzolasyonu - Sadece Mesaj Girişi Muaf):** Panel açıkken panel içi başka bir öğeye (reaksiyon emojileri, mesaj listesi scrollbarı, header butonları) tıklanmış olsa bile harf/boşluk tuşuna basıldığında premature return yapılmaz; mesaj girişine odaklanılır ve karakter yazılır. Sadece `activeElement === messageInput` iken tarayıcının doğal input yazımına izin verilir.
- **Kural 3 (Ok Tuşları İstisnası):** Sadece `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown` tuşları video oynatıcıya serbestçe geçirilir (sarma ve ses seviyesi kontrolü). Mesaj girişi içindeyken ise ok tuşları mesaj içi imleç hareketi için input içinde tutulur (`stopPropagation`).
- **Kural 4 (Double-Escape Fullscreen Guard & Keyboard Lock):** Panel açıkken veya input odaktayken Escape tuşuna ilk basışta sadece sohbet gizlenir/kapatılır ve tam ekrandan çıkış engellenir (`lastEscapeTime = Date.now()`). Tam ekranda Chromium seviyesinde kaçışları önlemek için `navigator.keyboard.lock(['Escape'])` kullanılır. Panel kapandıktan sonra 1000ms içinde ikinci kez Escape'e basılırsa klavye kilidi açılır (`unlock()`), `document.exitFullscreen()` çağrılır ve tam ekrandan çıkışa serbestçe izin verilir.


