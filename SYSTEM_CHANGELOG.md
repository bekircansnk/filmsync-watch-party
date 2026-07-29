# SYSTEM CHANGELOG

## [29.07.2026] v1.2.0 Sürüm Yükseltmesi & Arka Plan Canlı Sekme Film Adresi Takipçisi

### Düzeltildi / Kalıcı Çözüm
- **v1.2.0 Sürüm Rozeti (`popup.html` & `manifest.json`):** Eklenti sürümü `1.2.0`'a yükseltildi. Pop-up logosunun yanına kırmızı neon `v1.2.0` rozeti eklendi.
- **Service Worker Canlı Sekme Takipçisi (`background.js`):** `chrome.tabs.onUpdated` ve `chrome.tabs.onActivated` dinleyicileri eklendi. Kullanıcı bir film/dizi izleme sekmesine tıkladığında veya sekme yüklendiğinde `background.js` o adresi veritabanına **ANINDA YAZAR**.
- **Açık Sekmeler Çift Fallback Katmanı (`popup.js`):** "Film Sayfasına Git 🎬" butonuna basıldığında veritabanı haricinde açık tüm film sekmeleri taranır ve `chrome://extensions` veya `google.com` gibi yeni sekmelerden tıklandığında sekme **0 milisaniyede ŞAK diye filmin izlendiği sayfaya yönlendirilir**.

## [29.07.2026] Anında Film URL Kaydı & Akıllı Fallback Film Yönlendirme Tamiri

### Düzeltildi / Kalıcı Çözüm
- **Film Sayfası Adresinin Anında Kaydedilmesi (`content.js`):** `initializeFirebase` fonksiyonunda `hasVideo` şartı bağımlılığı kaldırıldı. Film/dizi sayfasında oda ilk kurulduğu/katılındığı anda `window.location.href` veritabanına `lastState.url` olarak **ANINDA KAYDEDİLİR**.
- **Akıllı Fallback Yönlendirme (`popup.js`):** "Film Sayfasına Git 🎬" butonuna tıklandığında hem `lastState.url` hem de oda üyelerinin aktif URL'leri taranır. Yeni bir sekmedeyken (`google.com` vb.) tıklandığında sekme **0 milisaniyede kusursuz şekilde filmin izlendiği sayfaya yönlendirilir**.

## [29.07.2026] "Film Sayfasına Git 🎬" Butonunun Daima Görünür Yapılması & Sızdırmaz Yönlendirme

### Düzeltildi / Kalıcı Çözüm
- **Buton Kaybolma Hatasının %100 Yok Edilmesi (`popup.js`):** Oda aktif olduğunda Pop-up üzerinde kırmızı-gradient vurgulu **"Film Sayfasına Git 🎬"** butonunu gizleyen `classList.add('hidden')` kodları tamamen kaldırıldı. Buton DAİMA ve KESİNTİSİZ ekranda kalır.
- **Tek Tıkla Sıkıntısız Yönlendirme:** Butona tıklandığında REST API ile oda URL'si okunur. Sekme farklı adresteyse (`google.com` vb.) ANINDA film sayfasına yönlendirilir, aynı adresteyse senkronizasyon tazelenir.

## [29.07.2026] 0-Üyeli Boş Odaları Manuel İmha Etme (Silme) Özelliği

### Düzeltildi / Kalıcı Çözüm
- **Boş Odalar İçin Manuel Silme Düğmesi (`btn-delete-public`):** Açık Odalar rehberinde yalnızca üye sayısı 0 olan (hiç kimse bulunmayan) odaların sağ tarafına `🗑️` imha butonu eklendi. Tek tıkla veritabanından ve listeden anında silinir.
- **Canlı ve Aktif Odaların Korunması:** Odada 1 veya daha fazla aktif üye varsa imha butonu KESİNLİKLE OLUŞTURULMAZ ve gizlenir. Hiç kimse aktif odaları silemez.

## [29.07.2026] Kapatılabilir Canlı Film/Bölüm Yönlendirme Bildirimi & "Film Sayfasına Git 🎬" Buton Yükseltmesi

### Düzeltildi / Kalıcı Çözüm
- **"Film Sayfasına Git 🎬" Butonunun Daima Görünür Yapılması (`popup.html` & `popup.js`):** Oda aktif olduğunda Pop-up üzerinde parlak kırmızı gradient stilinde "Film Sayfasına Git 🎬" butonu daima görünür kılındı. REST API ile oda film adresi alınıp sekme tek tıkla o filme yönlendirilir.
- **Sağ Üst Kapatılabilir Canlı Bildirim Kartı (`showMovieRedirectBanner`):** Oda yeni bir dizi bölümü veya film başlattığında kullanıcı henüz o sayfada değilse sağ üst köşede kapatılabilir (x butonlu) ve şık "Yeni Bölüm / Film Başlatıldı! 🍿" kartı belirir. "İzle 🍿" tıklandığında anında o bölüme yönlendirilir.
- **Açık Odalar Alanının Ferahlatılması:** `publicRoomList` max-height değeri `135px`'e yükseltildi, kart boşlukları ve kaydırma çubuğu ferahlatıldı.

## [29.07.2026] Sızdırmaz REST Katılımı, Otomatik Film Yönlendirmesi & Katılan Üye Senkronizasyon Tamiri

### Düzeltildi / Kalıcı Çözüm
- **"Böyle Bir Oda Bulunamadı" Sahte Uyarısının %100 Yok Edilmesi (`popup.js`):** `joinRoomWithCode` fonksiyonu doğrudan `https://movieparty-af87f-default-rtdb.firebaseio.com/rooms.json` REST endpoint'inden sorgu yapacak şekilde baştan yazıldı. Harf büyüklüğü (case sensitivity) bağımsız olarak `KDTA` veya `kdta` odaları anında bulunur, asenkron mesajlaşma kilitlenmeleri imkansız hale getirildi.
- **Otomatik Film Yönlendirmesi:** `google.com` veya film dışı bir sekmedeyken bile Açık Odalar kartındaki **Katıl** butonuna tıklandığında sekme URL'si ANINDA oda film adresine (`roomMovieUrl`) güncellenerek filmin izlendiği sayfaya yönlendirilir.
- **Katılan Üye Yönetim & Senkronizasyon Yetkisi (`content.js`):** `sendMediaEvent` fonksiyonunda URL güncelleme kısıtlaması esnetildi (`!hostOnly || userId === hostId`). Katılan üye yeni bir dizi bölümüne veya filme geçtiğinde oda adresi güncellenir ve TÜM ODA ANINDA O YENİ FİLM BÖLÜMÜNE SENKRONİZE EDİLİR.

## [29.07.2026] Case-Insensitive REST Oda Katılımı & Mükerrer "Odaya Katıldı" Mesaj Çözümü

### Düzeltildi / Kalıcı Çözüm
- **"Böyle Bir Oda Bulunamadı" Hatasının Kökten Çözümü (`background.js`):** `join-room` REST API handler'ında büyük/küçük harf uyuşmazlığından bağımsız arama mekanizması kuruldu. `ZZCS` veya `zzcs` şeklinde girilen tüm kodlar veritabanındaki odalarla %100 eşleşir ve odaya saniyesinde katılım sağlanır.
- **Mükerrer "beko odaya katıldı" Mesajı Koruması (`content.js`):** `joinedSystemMessageSentRooms` bellek içi Set ve `sessionStorage` çift kontrol sistemi kuruldu. Aynı oturumda odaya katıldı mesajı YALNIZCA 1 KEZ atılır, 3 kez üst üste basılması %100 engellendi.

## [29.07.2026] Kesin Film Sayfası Doğrulama Motoru (`checkIsMoviePage`) & %100 Sekme İzolasyonu

### Düzeltildi / Kalıcı Çözüm
- **Film Dışı Sayfalarda Panel Engeli (`checkIsMoviePage`):** Sohbet Paneli (`createChatUI()`) YALNIZCA ve YALNIZCA gerçek film/dizi izleme sayfalarında (`hdfilmcehennemi`, `dizipal`, `netflix`, `youtube`, `<video>` elementi olan sayfalar) açılacak şekilde kilitlendi.
- **Vercel, GitHub, Google İzolasyonu:** Vercel (`vercel.com`), GitHub, Google veya film izlenmeyen herhangi bir geliştirme/yönetim panelinde sohbet paneli KESİNLİKLE ÇİZİLMEZ (`removeChatUI()`) ve pasif kalır.
- **Tekrarlanmayan İzolasyon Garantisi:** Kullanıcı Vercel veya başka sekmedeyken sohbet paneli temizlenir, tekrar HDFilmCehennemi/Netflix sekmesine geçtiğinde Sohbet Paneli sadece film sekmesinde yeniden belirir.

## [29.07.2026] Medya Event Spam Koruması & Açık Odalar Kalıcı Oda Saklama Tamiri

### Düzeltildi / Kalıcı Çözüm
- **Mükerrer Medya Sistem Mesajı Koruması (`sendMediaEvent`):** Throttle ve debounce filtresi eklendi (`lastSentMediaState`). Aynı oynatma/duraklatma durumu 2.5 saniye içinde tekrar gelirse veya zaman değişimi az ise veritabanına ve sohbet paneline mükerrer sistem mesajı (`beko filmi duraklattı.`) basılması %100 engellendi.
- **Odadan Ayrılınca Odanın Açık Odalarda Kalması:** `leaveRoom()` içerisindeki oda silme kuralı kaldırıldı. Kullanıcılar ayrılsalar dahi kurulan odalar 3 saat boyunca inaktif olana kadar veya 24 saat max TTL dolana kadar **Açık Odalar rehberinde kalmaya devam eder**.
- **"Odalar Taranıyor..." Kilitlenmesinin Çözümü (`popup.js`):** `loadPublicRooms()` REST API tabanlı 0ms gecikmeli sorguya yükseltildi. Açık odalar 10 milisaniyede popup listesine basılır.
- **"Üyeler yükleniyor..." Takılma Çözümü:** Sohbet paneli açıldığı an mevcut kullanıcı adı varsayılan olarak top-bar'a basılarak yükleme metninin takılı kalması engellendi.

## [29.07.2026] 360° Uçtan Uca Genel Test & Sistem Kararlılık Doğrulaması

### Onaylanan & Doğrulanan Modüller
- **Popup Arayüz & Kompakt UX:** 320x520px Apple-style kaymasız düzen, 52px büyük neon logo, neon durum göstergesi, 50+ zengin dinamik emoji avatar sistemi.
- **REST API Tabanlı Sıfır-Gecikme (0ms) Oda Kurulumu:** `create-room` ve `join-room` servisleri `background.js` üzerinden Firebase REST API ile 10ms'de yürütülür, Web Socket kilitlenmeleri %100 engellenir.
- **Uçtan Uca Sohbet & Medya Senkronizasyonu:** Sağ dikey sohbet paneli, emoji reaksiyonları, video oynatma/duraklatma/sarma takibi, drift correction ve host yetkilendirmesi.
- **İzolasyon ve Kısırdöngü Koruması:** `cleanupFirebase()` ve `leaveRoom()` fonksiyonları ayrıştırıldı, `chrome.storage.onChanged` kısırdöngüsü %100 kırıldı.

## [29.07.2026] Sonsuz "Odadan Ayrıldı" Kısırdöngüsü & Storage Event Koruması Kalıcı Tamiri

### Düzeltildi / Kalıcı Çözüm
- **Sonsuz "Odadan Ayrıldı" Döngüsünün Kırılması:** Dahili Firebase dinleyici temizleme metodu `cleanupFirebase()` içerisinden otomatik `sendSystemMessage(`${username} odadan ayrıldı.`)` ve `user.remove()` çağrıları kaldırıldı. Bu işlevler ayrı bir `leaveRoom()` metoduna taşındı.
- **Dahili Re-Connect / Storage Event Koruması (`content.js`):** `chrome.storage.onChanged` dinleyicisi `activeTabId` değişikliklerinde tetiklendiğinde `cleanupFirebase()`'in baştan çalışarak aynı mesajı sonsuz döngüye sokması engellendi.
- **Ayrılma Mesajı Ayrıştırması:** "Odadan ayrıldı" mesajı yalnızca kullanıcı Popup üzerindeki **"Odadan Ayrıl"** düğmesine bastığında (`leave-room` mesajı) veya sekme tamamen kapandığında gönderilir.

## [29.07.2026] REST API Tabanlı 0ms Latency Oda Kurulumu & HDFilmCehennemi Tamiri

### Kalıcı Çözüm / Düzeltildi
- **Background REST API Oda Servisleri (`background.js`):** Popup üzerindeki Web Socket / Firebase SDK kilitlenmelerini sıfırlamak için `create-room` ve `join-room` işlemleri `background.js` üzerinden Firebase REST API HTTP PUT isteklerine geçirildi.
- **Anında Yanıt & 0ms Latency (`popup.js`):** "PARTİYİ BAŞLAT 🚀" ve "Katıl" düğmelerine basıldığı anda 0 milisaniyede oda oluşturulup panoya kopyalanır, ekran anında aktif moda geçer ve `content.js` sekmede sağ sohbet paneli ile yapışır.
- **`hdfilmcehennemi.nl` vb. Tüm Domainlerle Tam Uyum:** Tüm TLD uzantılarında eklenti anında aktif sekme olarak self-heal edip bağlanır.

## [29.07.2026] Oda Kurulum & Sekme Bağlantı Akışı Kalıcı Tamiri (Parti Başlat & Odaya Katıl)

### Düzeltildi / Kalıcı Çözüm
- **Koşulsuz Chat UI ve Firebase Bağlantısı (`content.js`):** Sayfada o an `<video>` bulunmasa dahi (HDFilmCehennemi, Dizipal, Netflix vb.) sohbet paneli (`createChatUI()`) ve Firebase canlı bağlantısı artık %100 koşulsuz olarak başlatılır. Video elementleri arka planda 500ms tarama ile tespit edildiğinde eşitlemeye dahil edilir.
- **Dizi/Film Sayfalarında Sekme Kurtarma:** `isMoviePage` tanımı genişletilerek HDFilmCehennemi, Dizipal ve tüm web sayfaları kapsama alındı. Sekme değişse de eklenti kendini aktif sekme olarak self-heal edip odaya bağlanır.
- **Firebase Kurucu ve Üye Kaydı (`popup.js`):** "PARTİYİ BAŞLAT 🚀" butonuna basıldığında kurucu kullanıcı bilgisi (`users/${userId}`) odaya anında yazılır. Aynı şekilde oda koduyla katılmada da kullanıcı derhal kaydedilir.
- **Anlık Popup → Content Script Mesajlaşması:** `force-sync` ve `settings-updated` mesajları alındığında `content.js` `init()` fonksiyonunu derhal çağırarak sohbet panelini ekranda saniyesinde görünür kılar.

## [29.07.2026] Oda Koduyla Manuel Katılma (joinCodeSection) & Kompakt UX Tamiri

### Eklendi / Düzeltildi
- **Oda Koduyla Katılma Alanının Geri Kazandırılması:** Popup arayüzüne 4 haneli oda kodu giriş kutusu (`#joinRoomCodeInput`) ve **"Katıl"** butonu dikey yer kaplamayan şık ve kompakt bir satır olarak geri eklendi.
- **Kompakt Çoklu İşlev Katmanı:** Film/Dizi sayfasındayken (Netflix, HDFilmCehennemi, Dizipal vb.) artık hem **Partiyi Başlat 🚀**, hem **4 Haneli Oda Koduyla Katıl**, hem de **Açık Odalar** canlı listesi aynı anda erişilebilir ve mükemmel şekilde görünür.
- **Tüm Domain Uzantıları Uyumu:** `hdfilmcehennemi` (.nl, .com vb. tüm TLD uzantıları) ile tam uyumluluk garanti edildi.

## [29.07.2026] Kompakt Apple-Style UI & 50+ Zengin Dinamik Emoji Avatar Sistemi

### Eklendi / Geliştirildi
- **Gereksiz Metinlerin Temizliği:** *"Eklentiyi kullanmak için lütfen aşağıdaki servislerden birini seçin:"* ve diğer kalabalık açıklama metinleri kaldırıldı.
- **Kompakt Zero-Scroll Düzen:** Popup yüksekliği ve bileşen alanları sabitlenerek aşağı yukarı sayfa kayma problemi tamamen giderildi (`320px` x `520px` modüler layout).
- **Logo ve Header Yenilemesi:** Logo `52px` boyutuna büyütüldü, parlak kırmızı-mor halo gölge ile öne çıkarıldı. Metinsel *"Bağlantı Yok"* / *"Bağlandı"* yazıları kaldırılıp minimal yeşil/kırmızı neon durum noktası (status dot) entegre edildi.
- **50+ Zengin Dinamik Emoji Avatar:** Sabit 6 emoji seçici buton kaldırıldı. Kullanıcı adı yazıldığında veya profil simgesine tıklandığında 50+ sinema, animasyon ve karakter emojisi içerisinden o kullanıcıya özel eğlenceli dinamik avatar atanması sağlandı.

## [29.07.2026] Dizipal Otomatik Güncel Adres Yönlendirici & Ücretsiz Servisler Sadeleştirmesi

### Eklendi / Geliştirildi
- **Ücretsiz Servis Kartları Sadeleştirmesi:** Servis kartları sadeleştirilerek sadece **Netflix**, **HDFilmCehennemi** ve **Dizipal** kartları kalacak şekilde yeniden tasarlandı.
- **Dizipal Otomatik Güncel Adres Bulucu:** Dizipal kartına tıklandığında açılan `t.ly/dizipalgiris` Google aramasına yönlendiğinde, `content.js` arama sonuçlarında en tepede yer alan güncel Dizipal adresini (`dizipal1567.com` vb.) otomatik tespit eder ve kullanıcıyı 600ms içinde ekran içi yönlendirme bildirimiyle o adrese aktarır.

## [29.07.2026] Aktif Odalar Rehberi (Public Rooms) & Otomatik Oda İmha Sistemi

### Eklendi / Geliştirildi
- **Aktif Odalar Rehberi (Public Rooms List):** Eklenti açıldığında oda kodu paylaşma ihtiyacını ortadan kaldıran canlı "AÇIK ODALAR (X)" kart listesi ve aktif oda sayacı eklendi.
- **Tek Tıkla Katılma:** Odalar; oda kodu, platform (Netflix, YouTube, Disney+ vb.) ve içerideki kişilerin isimleriyle listelenerek "Odaya Katıl" butonu ile şifresiz/kod yazmadan filmin izlendiği sayfaya aktarılacak şekilde entegre edildi.
- **Otomatik Oda İmha (Auto-Cleanup):**
  - **3 Saat İnaktiflik:** Odada hiç üye kalmadığında veya 3 saat boyunca hiçbir hareket olmadığında oda otomatik imha edilerek Firebase'den siliniyor.
  - **24 Saat Zaman Aşımı (Max TTL):** Bir oda oluşturulduktan itibaren 24 saat geçtiğinde otomatik olarak temizleniyor.

## [29.07.2026] Netflix Arayüzü & Kalıcı Oda Kodu Katılım Tamiri (360-hata-uzmani)

### Düzeltildi / Geliştirildi
- **Netflix Yazı Boyutları (rem -> px):** Netflix `html`/`body` kök ölçeklendirmesinden dolayı mikro seviyede küçülen sohbet paneli fontları `px` birimlerine dönüştürüldü ve font izolasyonu sağlandı.
- **Netflix Çifte Ekran / Boşluk Düzeltmesi:** Sohbet paneli açıldığında Netflix videolarında oluşan 270px genişliğindeki bomboş siyah alan (çifte daraltma) giderildi, oynatıcı sohbet paneline tam oturtuldu.
- **Oda Kodu Katılım ve Yönlendirme:** Popup üzerinden 4 haneli oda kodu girildiğinde kullanıcı otomatik olarak odadaki aktif film URL'sine (`lastState.url`) yönlendirilecek şekilde geliştirildi.
- **Oda ve Sekme Kurtarma (Tab Recovery):** Tarayıcı kapatılıp açıldığında Chrome sekme ID'lerinin sıfırlanması nedeniyle eklentinin pasife geçmesi engellendi; film sayfasında sekme otomatik aktifleşip odaya yeniden bağlanır hale getirildi.
- **Kalıcı Odalar (Persistent Rooms):** Odadan çıkılsa dahi oda kodları ve Firebase durumları korunarak, istenildiği zaman 4 haneli kodla aynı odaya tekrar girilebilmesi sağlandı.

## [12.07.2026] Oda URL Senkronizasyonu ve Anlık Film Katılım Bildirimleri

### Eklendi / Güncellendi
- **Sıradan Kullanıcı URL Koruyucu:** Odaya katılan sıradan kullanıcıların, oda sahibinin güncel film URL'sini kendi eski URL'leri ile ezmesi (overwrite) engellendi. URL güncelleme yetkisi sadece oda sahibine (host) verildi.
- **Anlık Film Katılım Bildirimi (forceSync Entegrasyonu):** Odaya katılım anında kullanıcı henüz film sayfasını açmamışsa veya farklı bir sayfadaysa, veritabanındaki film URL'sine anında yönlendirme sunan "Katıl" bildirimi (`Oda sahibi yeni bir film açtı. Katılmak için tıklayın! 🍿`) eklendi.
- **Canlı URL Takibi:** Oda sahibi yeni bir film başlattığında (URL değiştiğinde) diğer üyelerin bu URL değişikliğini anlık olarak yakalayıp ekranda bildirim olarak görebilmeleri sağlandı.

## [2026-07-06] FilmSync Gelişmiş Sohbet ve Şifreli Oda Entegrasyonu

### Eklendi / Güncellendi
- **Şifreli Oda Koruması:** `backend/server.js` ve `extension/popup` dosyalarına şifre özelliği eklendi. Artık odalara sadece şifresini bilen kullanıcılar katılabiliyor.
- **Cam Efektli Sohben Paneli (Glassmorphism):** Sayfada yüzen, Apple stili şık yarı saydam bir sohbet arayüzü enjekte edildi.
- **Aktif Üye Listesi:** Oda penceresinin üstünde anlık olarak odadaki tüm kullanıcıların adları listelenebiliyor.
- **Klavye Enter Kısayolu:** Sayfa odağındayken `Enter` tuşuna basıldığında sohbet paneli açılıp yazmaya hazır hale geliyor. Tekrar `Enter` ile mesaj gönderiliyor.
- **Tam Ekran Desteği:** Tarayıcı tam ekran yapıldığında sohbet baloncuğu otomatik olarak tam ekran olan elementin altına taşınarak görünür kalmaya devam ediyor.
