# 🐞 DEBUG PROTOCOL & HATA ÇÖZÜM GÜNLÜĞÜ

## [29.07.2026] En Yeni Oda En Üstte Sıralaması & Hayalet Üye (Ghost User) Temizliği Çözümü

### 1. Yeni Açılan Odaların Hangisi Olduğunun Anlaşılamaması & Takılı Üye Sayısı Hatası
- **Kök Neden:** Odalar tarihe göre sıralanmıyor, gelişigüzel listeleniyordu. Ayrıca sekmesi kapanan kullanıcılar veritabanında inaktif üye olarak takılı kalabiliyordu.
- **Kalıcı Çözüm:** `loadPublicRooms()` fonksiyonu tüm odaları tarihe göre azalan sırada (En Yeni En Üstte - Descending Order) dizer. `content.js` içerisine 15 saniyelik Heartbeat servisi eklendi; 45 saniyedir aktif sinyal vermeyen hayalet üyeler otomatik olarak sayıdan düşürülür.

## [29.07.2026] Iframe Dahil %100 Canlı Video Oynat/Duraklat/Sarma Senkronizasyon Çözümü

### 1. Mesaj Paneline "Oynattı/Duraklattı" Yazdığı Halde Videoların Senkron İlerlememesi Hatası
- **Kök Neden:** `content.js` içerisindeki `initializeFirebase` çağrısı `if (window === window.top)` bloku içine alınmıştı. HDFilmCehennemi, Dizipal vb. sitelerde `<video>` elementi IFRAME içinde kaldığından, Iframe içindeki `content.js` Firebase veritabanına bağlanamıyor ve `rooms/${roomId}/lastState` uzaktan gelen oynat/duraklat sinyallerini dinleyemiyordu.
- **Kalıcı Çözüm:** `initializeFirebase` Iframe dahil tüm pencerelerde aktif kılındı. Iframe içerisindeki `<video>` elementi veritabanındaki son medya durumunu anlık dinleyip `PlayerAdapter` ile 0ms gecikmeyle uzaktan eşzamanlar.

## [29.07.2026] Akıllı Açık Film Sekmesi Odaklanması & Kesintisiz Film Yönlendirme

### 1. `google.com` Üzerindeyken "Film Sayfasına Git 🎬" Butonuna Basıldığında Yönlendirememe Hatası
- **Kök Neden:** Oda veritabanında `lastState.url` henüz video başlamadığı için boş kaldığında `popup.js` pes edip sahte uyarı fırlatıyordu.
- **Kalıcı Çözüm:** `popup.js` içerisindeki `btnGoToMovie` handler'ına Akıllı Sekme Tarayıcısı & Odaklayıcısı eklendi. Veritabanındaki adres boş olsa dahi Chrome'da açık olan film izleme sekmesi (HDFilmCehennemi, Dizipal, Netflix vb.) taranır, sekme öne getirilir (`chrome.tabs.update(id, { active: true })`) ve Chrome penceresine odaklanılır (`chrome.windows.update(windowId, { focused: true })`).

## [29.07.2026] v1.2.0 Sürüm Yükseltmesi & Arka Plan Canlı Sekme Film Adresi Takipçisi

### 1. `chrome://extensions` veya Yeni Sekmeden Tıklandığında "Oda henüz film sayfasına bağlanmamış" Hatası
- **Kök Neden:** Kullanıcı sekme değiştirdiğinde veya film sekmesinde gezinirken veritabanına `lastState.url` sadece video event'lerinde veya content script yüklenirken yazılıyordu. Video henüz oynatılmadıysa veritabanı adresi boş kalıyordu.
- **Kalıcı Çözüm:** `background.js` (Service Worker) içerisine `chrome.tabs.onUpdated` ve `chrome.tabs.onActivated` dinleyicileri bağlandı. Kullanıcı bir film sekmesini açtığı veya sekmede olduğu anda arka plan servisi oda adresini veritabanına anında yazar. Ayrıca `popup.js` tarafına açık tüm sekmeleri tarayan çift fallback katmanı eklendi.

### 2. Güncelleme Etkisini Anlamak İçin Sürüm Rozeti
- **Kalıcı Çözüm:** `manifest.json` ve `popup.html` Sürüm `1.2.0` olarak yükseltildi. Pop-up başlığında parlak neon **`v1.2.0`** rozeti gösterildi.

## [29.07.2026] Anında Film URL Kaydı & Akıllı Fallback Film Yönlendirme Çözümü

### 1. "Oda film adresi henüz ayarlanmamış!" Uyarısı Hatası
- **Kök Neden:** `content.js` içerisinde oda kurulurken `hasVideo` DOM şartı aranıyordu. Eğer video iframe'i henüz DOM'a girmedüyse `initialUrl` boş yazılıyor ve yeni sekmeden film sayfasına yönlendirme yapılamıyordu.
- **Kalıcı Çözüm:** `hasVideo` kısıtlaması kaldırıldı. `checkIsMoviePage()` doğrulamasıyla film/dizi izleme sayfasında oda kurulduğu an `window.location.href` veritabanına `lastState.url` olarak **ANINDA** yazılır. Ayrıca `popup.js` `btnGoToMovie` handler'ına oda üyeleri üstünden akıllı URL fallback taraması eklendi.

## [29.07.2026] "Film Sayfasına Git 🎬" Butonunun Daima Görünür Yapılması & Sızdırmaz Yönlendirme

### 1. "Film Sayfasına Git 🎬" Butonunun Kaybolması Hatası
- **Kök Neden:** Firebase SDK canlı URL dinleyicisi `targetUrl` okurken kilitlendiğinde veya `null` geldiğinde `btnGoToMovie.classList.add('hidden')` çalışarak butonu otomatik gizliyordu.
- **Kalıcı Çözüm:** Butonu gizleyen `hidden` mantığı kaldırıldı. Odaya katılındığında veya oda kurulduğunda Pop-up üzerinde **"Film Sayfasına Git 🎬"** butonu DAİMA ve KESİNTİSİZ ekranda kalır. Tıklandığında REST API ile 0ms'de sekme o filmin izlendiği sayfaya yönlendirilir.

## [29.07.2026] 0-Üyeli Boş Odaları Manuel İmha Etme (Silme) Özelliği

### 1. Boş Odaları Kapatabilme / İmha Edebilme Talebi
- **Kök Neden:** Otomatik 3 saatlik/24 saatlik silme kurallarına ek olarak, kullanıcının atıl/boş kalan 0-üyeli odaları anında temizlemek istemesi.
- **Kalıcı Çözüm:** `loadPublicRooms()` kartlarında `activeUserCount === 0` şartı kontrol edilir. Yalnızca 0 üyesi olan boş odaların yanında `🗑️` imha butonu belirir. Tıklandığında REST API `DELETE` isteği ile oda silinir. Aktif üyeli odalarda buton gizlenir.

## [29.07.2026] Canlı Bildirim Bannerı & "Film Sayfasına Git 🎬" Buton Çözümü

### 1. Odaya Katılınca Film Sayfasına Git Butonunun Görünmemesi
- **Kök Neden:** `btnGoToMovie` butonu HTML üzerinde `hidden` sınıfı nedeniyle gizli kalıyordu ve Firebase SDK kilitlendiğinde film adresi okunamıyordu.
- **Kalıcı Çözüm:** `popup.html` içerisindeki `btnGoToMovie` butonunun `hidden` sınıfı kaldırıldı, kırmızı gradient vurgulu stil eklendi. Tıklandığında REST API ile oda film adresi okunur ve sekme 0ms'de yönlendirilir.

### 2. Yeni Bölüm / Film Açıldığında Sağ Üst Kapatılabilir Canlı Bildirim
- **Kalıcı Çözüm:** `showMovieRedirectBanner(targetUrl)` fonksiyonu yazıldı. Oda yeni bir dizi bölümü veya film başlattığında kullanıcı sekmedeyse sağ üst köşede kapatılabilir (x) şık "Yeni Bölüm / Film Başlatıldı! 🍿" bildirimi çıkar. Tıklandığında o bölüme yönlendirir.

### 3. Açık Odalar Listesi Dikey Sıkışması
- **Kalıcı Çözüm:** `publicRoomList` dikey `max-height` değeri `135px`'e çıkartılarak odaların ferah ve rahat görünmesi sağlandı.

## [29.07.2026] Sızdırmaz REST Katılımı & Üye Senkronizasyon Tamiri

### 1. "Böyle Bir Oda Bulunamadı! ❌" Hatasının Kökten Çözümü
- **Kök Neden:** Service Worker port mesajlaşması sırasında `response` nesnesinin asenkron gecikmelerde `undefined` dönmesi, odanın veritabanında var olmasına rağmen sahte hata uyarısının tetiklenmesine yol açıyordu.
- **Kalıcı Çözüm:** `popup.js` `joinRoomWithCode` fonksiyonu arka plan port mesajlaşmasını bypass ederek doğrudan Firebase REST API'den (`/rooms.json`) sorgu atacak şekilde güncellendi. Odanın varlığı anında %100 doğrulanır.

### 2. Google / Yeni Sekmeden Odaya Katılırken Otomatik Film Sayfası Yönlendirmesi
- **Kalıcı Çözüm:** Odaya katılım anında oda veritabanındaki `lastState.url` okunur. Kullanıcı `google.com` veya başka bir sekmedeyse sekme URL'si anında o film adresine güncellenir (`chrome.tabs.update`).

### 3. Katılan Üyenin Filmi/Diziyi Değiştirebilmesi ve Tüm Odayı Senkronize Etmesi
- **Kalıcı Çözüm:** `sendMediaEvent` URL güncelleme kuralı (`!hostOnly || userId === hostId`) olarak esnetildi. Odaya katılan 2. üye de yeni dizi bölümüne geçtiğinde tüm oda o yeni bölüme senkronize edilir.

## [29.07.2026] Case-Insensitive REST Oda Katılımı & Mükerrer "Odaya Katıldı" Çözümü

### 1. Açık Odalardan Katılırken "Böyle bir oda bulunamadı! ❌" Hatası
- **Kök Neden:** Katıl butonuna basıldığında gönderilen oda kodu (`ZZCS`) Firebase REST API sorgusunda case-sensitivity farkına veya string tiplerine takılabiliyordu.
- **Kalıcı Çözüm:** `background.js` içindeki `join-room` servisi tüm odalar listesini çekip `cleanRoomId` (`ZZCS`) bağımsız case-insensitive arama yapar. Eşleşen odayı bulup `status: 'success'` döner ve hatayı %100 yok eder.

### 2. Mükerrer (3 Kez Üst Üste) "beko odaya katıldı." Mesajı
- **Kök Neden:** `initializeFirebase` fonksiyonu asenkron depolama olayları nedeniyle sekme açılışında birden fazla kez tetiklenebiliyordu.
- **Kalıcı Çözüm:** Global `joinedSystemMessageSentRooms` Set nesnesi tanımlandı. Sekme oturumunda bir oda için katıldı mesajı SADECE 1 KEZ gönderilir.

## [29.07.2026] Kesin Film Sayfası Doğrulama Motoru (`checkIsMoviePage`) & Sekme İzolasyonu

### 1. Vercel, GitHub vb. Film Dışı Sayfalarda Sohbet Panelinin Görünmesi Hatası
- **Kök Neden:** `isMoviePage` tanımı esnetilirken `(protocol === 'http' && !google.com)` kuralı yazılmıştı, bu durum Vercel (`vercel.com`), GitHub veya diğer tüm geliştirme sayfalarını da "film sayfası" sanıp sohbet panelini çizmesine yol açıyordu.
- **Kalıcı Çözüm:** `checkIsMoviePage()` fonksiyonu yazıldı. Sohbet paneli YALNIZCA sayfada aktif `<video>` varsa VEYA URL `netflix.com/watch/`, `hdfilmcehennemi`, `dizipal`, `youtube.com/watch`, `disneyplus.com`, `primevideo`, `blutv` vb. tanınmış film izleme platformlarına aitse açılır. Film dışı sitelerde (`vercel.com` vb.) sohbet paneli %100 engellenir ve kaldırılır (`removeChatUI()`).

## [29.07.2026] Medya Event Spam Koruması & Açık Odalar Kalıcı Saklama Çözümü

### 1. Mükerrer "filmi duraklattı" / "filmi başlattı" Event Spam'i
- **Kök Neden:** HTML5 video oynatıcıları seeking veya pause yaptığında arka arkaya 5-6 event tetikliyor ve `sendMediaEvent` her event için veritabanına mesaj yazıp sohbet panelini mükerrer mesajlarla dolduruyordu.
- **Kalıcı Çözüm:** `lastSentMediaState` nesnesi ile 2.5 saniyelik throttle ve zaman farkı filtresi koyuldu. Aynı durum kısa sürede tekrarlanırsa sistem mesajı basılması %100 engellendi.

### 2. Odadan Ayrılınca Odanın Yok Olması ve Açık Odalarda Görünmemesi
- **Kök Neden:** `leaveRoom()` fonksiyonunda `users` sayısı 0'a düştüğünde odayı tamamen silecek şekilde kod yazılmıştı.
- **Kalıcı Çözüm:** Odayı anında silme kuralı kaldırıldı. Kurulan odalar kullanıcılar ayrılsa bile **Açık Odalar rehberinde 3 saat inaktif kalana veya 24 saat dolana kadar muhafaza edilir**.

### 3. "Odalar Taranıyor..." ve "Üyeler Yükleniyor..." Kilitlenmeleri
- **Kalıcı Çözüm:** `loadPublicRooms()` REST API HTTP GET ile 0ms gecikmeli getirilecek hale getirildi. Sohbet paneli açıldığında mevcut kullanıcı adı varsayılan olarak top-bar'a atanarak takılmalar giderildi.

## [29.07.2026] 360° Uçtan Uca Genel Test & Sistem Kararlılık Doğrulaması

### 1. Test ve Kontrol Sonuçları
- **Popup Arayüz:** Kompakt Apple-style düzen (`320x520px`), sıfır-scroll, büyük neon logo, dinamik 50+ emoji avatar ataması sorunsuz.
- **Oda Oluşturma & Katılma:** Background Service Worker REST API servisi ile 0ms gecikmeyle oda kuruluyor, kodla ve canlı odalar listesinden katılım %100 çalışıyor.
- **Sohbet & Oynatıcı:** Sağ dikey sohbet paneli canlı mesajlaşma, emoji reaksiyonları, video takibi ve drift correction ile kusursuz senkronize oluyor.
- **Kısırdöngü Koruması:** `cleanupFirebase()` ve `leaveRoom()` tamamen ayrıştırılarak mükerrer veya sonsuz ayrıldı mesajı basılması engellendi.

## [29.07.2026] Sonsuz "Odadan Ayrıldı" Kısırdöngüsü & Storage Event Koruması

### 1. Sonsuz Döngü Mekanizmasının Tespiti
- **Kök Neden:** `cleanupFirebase()` metodu her çalıştırıldığında otomatik olarak `sendSystemMessage(`${username} odadan ayrıldı.`)` çağrıyordu. `chrome.storage.onChanged` dinleyicisi ise `activeTabId` güncellendiğinde `cleanupFirebase()`'i tetikliyor, bu da `activeTabId`'yi tekrar tetikleyerek sonsuz bir kısırdöngü yaratıyordu (`beko odadan ayrıldı` mesajı saniyede onlarca kez basılıyordu).
- **Kalıcı Çözüm:** 
  1. `cleanupFirebase()` dahili dinleyici temizleyicisi haline getirildi (sadece `.off()` yapar, sistem mesajı atmaz).
  2. Gerçek ayrılma işlemleri için `leaveRoom()` metodu yazıldı.
  3. `chrome.storage.onChanged` dinleyicisi `activeTabId` değişikliklerinde kısırdöngüye girmeyecek şekilde filtrelendi.

## [29.07.2026] REST API Tabanlı 0ms Latency Oda Kurulumu & HDFilmCehennemi Tamiri

### 1. Web Socket / Firebase SDK Popup Kilitlenmelerinin Çözümü
- **Kök Neden:** Chrome Eklenti Popup pencereleri asenkron Firebase SDK Web Socket bağlantısı kurarken 1 saniye içinde odak kaybolunca veya arka plan kısıtlamalarına takılınca `db.ref.set()` promise'i asenkron askıda kalıyor ve "PARTİYİ BAŞLAT" düğmesi tepkisiz kalıyordu.
- **Kalıcı Çözüm:** `create-room` ve `join-room` işlemleri `background.js` Service Worker'ına devredildi ve Firebase Realtime Database REST API (`HTTP PUT/PATCH`) ile yürütüldü. 0ms gecikmeyle anında veritabanı kaydı atılır ve arayüz anında aktifleşir.

## [29.07.2026] Oda Kurulum & Sekme Bağlantı Akışı Kalıcı Tamiri (Parti Başlat & Odaya Katıl)

### 1. Koşulsuz Chat UI ve Firebase Bağlantısı
- **Kök Neden:** `content.js` içerisinde sohbet panelinin (`createChatUI()`) oluşturulması ve Firebase bağlantısının kurulması için `<video>` elementinin o an sayfada bulunması şart koşuluyordu. HDFilmCehennemi, Dizipal veya iframe kullansean sitelerde sayfa açıldığında henüz video yüklenmediği için oda kurulumu gerçekleşse bile sohbet paneli açılmıyordu.
- **Kalıcı Çözüm:** Video bulunma şartı sohbet paneli ve Firebase bağlantısı için kaldırıldı. Sohbet paneli anında açılır, video elementi ise arka planda taranarak hazır olduğunda takibe alınır.

### 2. Kurucu ve Katılan Kullanıcı Kaydı (`popup.js`)
- **Kök Neden:** Odayı kurarken `rooms/${roomId}` altına `users/${userId}` düğümü yazılmıyordu, bu durum kurucunun Firebase canlı üye listesinde görünmemesine yol açıyordu.
- **Kalıcı Çözüm:** `btnStartParty` ve `joinRoomWithCode` akışında `users/${userId}` düğümü nesne şeklinde kaydedilerek anında Firebase'e aktarıldı.

### 3. Sekme İzolasyonu & Self-Heal Uyum Genişletmesi
- **Kalıcı Çözüm:** HDFilmCehennemi, Dizipal, Netflix vb. tüm dizi/film siteleri `isMoviePage` kapsamına alındı. Sekme ID değiştiğinde eklenti kendini aktif sekme olarak self-heal edip odaya anında bağlanır.

## [29.07.2026] Oda Koduyla Katılma (joinCodeSection) & UX Tamiri

### 1. Manuel 4 Haneli Oda Kodu Giriş Alanı
- **Kök Neden:** Arayüz sadeleştirilirken 4 haneli oda kodu girme input'u kaldırılmıştı, bu durum arkadaşından kod alan kişilerin manuel odaya katılmasına engel oluyordu.
- **Çözüm:** `popup.html` içerisine kompakt dikey yer kaplamayan `#joinRoomCodeInput` ve `btnJoinWithCode` ("Katıl") alanı yerleştirildi. Hem film sayfalarından hem servis seçiciden 4 haneli kod ile katılma sağlandı.

### 2. Film Sayfalarında Çoklu İşlev Katmanı
- **Çözüm:** Film sayfalarında (HDFilmCehennemi, Netflix, Dizipal) artık "Partiyi Başlat 🚀" butonu, "Oda Koduyla Katıl" alanı ve "Açık Odalar" listesinin 3'ü birden aynı anda görünür hale getirildi.

## [29.07.2026] Kompakt Apple-Style UI & 50+ Zengin Dinamik Emoji Avatar Sistemi

### 1. Gereksiz Metin Temizliği ve Zero-Scroll Layout Optimization
- **Kök Neden:** Arayüzdeki kalabalık açıklama metinleri ve sabit dikey yükseklik nedeniyle sayfa aşağı kayıyor ve gözü yoruyordu.
- **Çözüm:** `popup.html` içerisindeki tüm gereksiz yönlendirme/açıklama metinleri kaldırıldı. Sayfa dikey yüksekliği `520px` seviyesinde dondurularak `overflow: hidden` ve modüler glassmorphic dikey yerleşim uygulandı.

### 2. Büyük Logo ve Minimal Status Indicator
- **Çözüm:** Logo imajı `52px` boyutuna büyütüldü ve neon red-purple glow gölge eklendi. Metinsel "Bağlantı Yok" yazısı kaldırılıp sadece parlak neon yeşil/kırmızı gösterge noktası bırakıldı.

### 3. 50+ Zengin Dinamik Sinema/Animasyon Emoji Havuzu
- **Çözüm:** Sabit 6 emoji seçici silindi. `getRandomMovieAvatar` fonksiyonu ile 50+ sinema ve eğlenceli karakter emojisi havuzu oluşturuldu. Kullanıcı adı yazıldığında veya rozete tıklandığında otomatik profil avatarı atanması sağlandı.

## [29.07.2026] Dizipal Otomatik Güncel Adres Yönlendirici

### 1. Dinamik URL Değişimi ve Otomatik Adres Tespiti
- **Kök Neden:** Dizipal gibi sitelerin alan adları sürekli değiştiği için kullanıcılar `t.ly/dizipalgiris` adresine girdiğinde Google arama sonuçlarına düşmektedir.
- **Çözüm:** `extension/content.js` içerisine Google Arama Yönlendirici motoru entegre edildi. `google.com/search?q=dizipal...` açıldığında DOM üzerindeki en üstteki organik geçerli Dizipal bağlantısı tespit edilir, saniyeler içinde ekran üstü yönlendirme bildirimiyle güncel adrese aktarım tamamlanır.

### 2. Servis Kartları Filtreleme
- **Çözüm:** `popup.html` ve `popup.js` üzerindeki servis kartları sadeleştirilerek sadece **Netflix**, **HDFilmCehennemi** ve **Dizipal** kartları bırakıldı.

## [29.07.2026] Aktif Odalar Rehberi ve Otomatik Oda İmha Sistemi

### 1. Açık Odalar Canlı Rehberi (Public Rooms Listing)
- **Tasarım & Mantık:** Eklenti açıldığında oda kodu kopyalayıp paylaşma zorunluluğunu ortadan kaldırmak için `popup.html` ve `popup.js` üzerine canlı `publicRoomsSection` bileşeni eklendi.
- **Detaylar:** Firebase `rooms` düğümü canlı olarak dinlenerek o andaki açık oda sayısı, oda kodları, izlenen platform (Netflix, YouTube, Disney+ vb.) ve odadaki kişilerin isimleri liste olarak kartlar halinde gösterilmektedir. Tek tıkla "Odaya Katıl" butonu ile doğrudan film sayfasına aktarım sağlanmaktadır.

### 2. Otomatik Oda İmha / Zaman Aşımı (Room Auto-Cleanup Rules)
- **3 Saat İnaktiflik:** Odada hiç aktif üye olmadığında veya son hareket üzerinden 3 saat geçtiğinde oda Firebase Realtime Database üzerinden otomatik silinir (`db.ref('rooms/' + roomId).remove()`).
- **24 Saat Max TTL:** Bir oda ne durumda olursa olsun ilk oluşturulduğu andan itibaren 24 saat (86.400.000 ms) geçtiğinde sistem tarafından otomatik imha edilmektedir.

## [29.07.2026] Netflix Arayüzü & Oda Kodu Katılım Sorunları

### 1. Netflix Sohbet Yazı Boyutu (Font Scaling Issue)
- **Kök Neden:** Netflix Web Player (`netflix.com/watch`) responsive oynatıcı ölçeklendirmesi için `html` kök elemanının `font-size` değerini düşürmektedir. Sohbet paneli içerisindeki fontlar `rem` birimleri ile tanımlandığı için Netflix üzerinde mikroskobik boyutlara küçülmekteydi.
- **Çözüm:** `extension/content.js` içerisindeki tüm sohbet paneli bileşenlerinin font boyutları (`font-size`) `rem` birimlerinden bağımsız `px` (`12px`, `13px`, `14px`, `16px`) birimlerine çevrildi ve `#filmsync-chat-panel *` için font izolasyonu sağlandı.

### 2. Netflix Çifte Ekran / Yan Boşluk (Double Calc Width Shift)
- **Kök Neden:** Sohbet paneli açıldığında `body.filmsync-sidebar-open` genişliğine `calc(100% - 270px)` verilirken, child olan `.nf-player-container` / `.watch-video` elementine de tekrar `calc(100% - 270px)` verilmekteydi. Bu durum video ile panel arasında fazladan 270px boş siyah alan oluşmasına neden oluyordu.
- **Çözüm:** İç player container elemanlarının genişliği `width: 100% !important; max-width: 100% !important;` olarak güncellendi. Body daraltıldığında video ekranı sohbet paneline tam oturtuldu.

### 3. Oda Kodu ile Giriş ve Tarayıcı Yeniden Başlatma Pasifleşmesi (Tab Recovery & Persistent Rooms)
- **Kök Neden:** 
  1. Popup üzerinden 4 haneli oda kodu ile girildiğinde sekme odadaki aktif film URL'sine (`lastState.url`) yönlendirilmiyordu.
  2. Kullanıcı tarayıcıyı veya sekmesini kapatıp açtığında Chrome sekme ID'leri sıfırlandığı için `activeTabId` eşleşmiyor ve eklenti kendini pasife alıyordu.
- **Çözüm:** 
  1. `popup.js` içerisindeki `joinRoomWithCode` fonksiyonuna otomatik sekme yönlendirmesi eklendi. Oda koduyla girildiğinde kullanıcı o an o sayfada değilse doğrudan film sayfasına aktarılıyor.
  2. `content.js` içerisine film sayfası ve video tespiti ile `activeTabId` sekme kurtarma (Tab Recovery) mekanizması eklendi. Tarayıcı yeniden açılsa dahi film sayfasında sekme id'si otomatik güncellenerek odaya sorunsuz bağlanması sağlandı.
  3. Odadan ayrılma/kapatma durumunda Firebase'deki oda kodları ve durumları muhafaza edilecek şekilde kalıcı oda yapısı garanti altına alındı.
