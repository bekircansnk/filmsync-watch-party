# FilmSync Watch Party Dönüşüm Planı 🍿

Bu plan, mevcut FilmSync tarayıcı eklentisini Teleparty kaynak kodlarını analiz ederek; gelişmiş çoklu platform oynatıcı desteği, Firebase tabanlı senkronizasyon/drift dengeleme, sağ dikey sohbet sidebarı, buffering/emoji reaksiyonları ve gelişmiş popup kullanıcı arayüzü ile donatılmış tam teşekküllü bir watch party uygulamasına dönüştürmek için hazırlanmıştır.

## Mimari Yaklaşım
FilmSync, Firebase Realtime Database (RTDB) üzerinden gerçek zamanlı veri eşitlemesi gerçekleştirir. Her oda için aşağıdaki veri yapısı kullanılacaktır:
```json
rooms: {
  "<room-id>": {
    "password": "<optional-password>",
    "hostId": "<user-id>",
    "hostOnly": true/false,
    "lastState": {
      "isPlaying": true/false,
      "currentTime": 0.0,
      "url": "<current-video-url>",
      "senderId": "<user-id-who-changed-state>",
      "lastUpdated": 1720800000000
    },
    "users": {
      "<user-id>": {
        "username": "<username>",
        "avatar": "🍿",
        "isBuffering": true/false,
        "lastActive": 1720800000000
      }
    },
    "messages": {
      "<message-id>": {
        "username": "<username>",
        "message": "<text>",
        "timestamp": 1720800000000,
        "isSystem": true/false
      }
    },
    "reactions": {
      "<reaction-id>": {
        "emoji": "🔥",
        "senderId": "<user-id>",
        "timestamp": 1720800000000
      }
    }
  }
}
```

---

## Yol Haritası ve Kilometre Taşları (Milestones)

### 1. Milestone 1: Çoklu Oynatıcı Adaptörleri (Netflix, YouTube, Disney+ ve Genel HTML5)
- **Kapsam:** Eklentinin Netflix (Cadmium API), YouTube (HTML5 Player), Disney+ (Media Bridge/Player API) ve genel HTML5 video elementine sahip web sitelerindeki oynatıcıları tespit etmesi ve tekilleştirilmiş bir Player API (`PlayerAdapter`) üzerinden kontrol edebilmesi.
- **Yapılacak İşler:**
  - `extension/inject.js` dosyasını genişleterek Disney+ player API ve Netflix Cadmium API entegrasyonlarını yerleştirmek.
  - `extension/content.js` içindeki `PlayerAdapter` yapısını Disney+ ve YouTube özel metotlarını da kapsayacak şekilde güncellemek.
  - `manifest.json` içindeki `web_accessible_resources` ve `matches` alanlarını Disney+ ve genel siteleri destekleyecek şekilde genişletmek.
- **Doğrulama:** Netflix, YouTube ve Disney+ üzerinde play/pause/seek komutlarının programatik olarak çalışması.

### 2. Milestone 2: Firebase Eşitleme Motoru, Drift Dengeleme ve Debounce
- **Kapsam:** Odadaki üyelerin video oynatma durumlarını ve zamanlarını Firebase RTDB üzerinden eşitlemek. Zaman sapmalarını (drift) 1.5 saniye hassasiyetle dengelemek ve döngüsel tetiklenmeleri (ping-pong) engellemek.
- **Yapılacak İşler:**
  - `startDriftCorrection` fonksiyonunu 1.5 saniye sapma eşiğine göre yeniden yapılandırmak.
  - Oynatıcı olayları tetiklendiğinde (play/pause/seeked), Firebase'den gelen uzak olaylar ile kullanıcının yerel olaylarını ayırt eden kesin bir kilitleme (`isSyncing` ve `remoteActionLock`) mekanizması kurmak.
  - Sadece Host Kontrolü (`hostOnly`) seçeneği etkin olduğunda, host olmayan üyelerin yerel oynatıcı eylemlerini algılayıp engelleyen ve onları host'un süresine/durumuna geri çeken (`forceSync` ile revert) mantığı eklemek.
- **Doğrulama:** Eşzamanlı iki sekmede birindeki oynatma/durdurma/seek işlemlerinin diğerine 1.5 saniye altında yansıması, ping-pong döngülerinin oluşmaması. Non-host kullanıcının eylemlerinin hostOnly açıkken geri alınması.

### 3. Milestone 3: Sağ Sohbet Sidebarı, Dikey Toolbar ve Sayfa Düzeni Daraltma
- **Kapsam:** Sayfa yapısını bozmadan sağa yerleşen, video boyutunu sola kaydırıp daraltan 330px genişliğinde dikey bir sohbet paneli enjekte etmek ve en sağda mini bir dikey toolbar oluşturmak.
- **Yapılacak İşler:**
  - `content.js` içindeki CSS kurallarını Disney+ oynatıcısını (`disney-web-player`) da daraltacak şekilde güncellemek.
  - Sidebar açılıp kapandığında pencere boyutlandırma olaylarını tetiklemek (`window.dispatchEvent(new Event('resize'))`) böylece oynatıcının kendini yeniden boyutlandırmasını sağlamak.
  - Mini toolbar butonlarını (TP logolu buton, sohbet gizle/göster, link kopyala, çıkış) Teleparty stiline uygun olarak konumlandırmak ve tooltip detaylarını yerleştirmek.
- **Doğrulama:** Sohbet paneli açıldığında video alanının sola kayması, taşma veya düzen bozulması yaşanmaması, kapatıldığında videonun tekrar tam ekranı kaplaması.

### 4. Milestone 4: Buffering Durumu, Yüzen Emojiler ve Netflix Detay Sayfası Butonu
- **Kapsam:** Buffering durumunu Firebase'e yazıp kullanıcı listesinde göstermek, emoji reaksiyon barı ekleyerek video üzerinde uçan emojiler render etmek ve Netflix film kartlarına "Start a FilmSync" butonu eklemek.
- **Yapılacak İşler:**
  - Video buffering durumunu (`waiting` ve `playing` olayları) Firebase RTDB'ye (`isBuffering` alanı) yazmak.
  - Sohbet panelindeki aktif üye listesinde her üyenin avatarını ve buffering durumunu anlık olarak göstermek (`updateUsersDisplay` güncellemesi).
  - Emoji reaksiyon barından gönderilen emojileri Firebase RTDB'den dinleyip video katmanı üzerinde yukarı uçan emojiler olarak render etmek (`spawnFlyingEmoji` optimizasyonu).
  - Netflix film detay sayfalarında "Start a FilmSync" butonunun çıkmasını sağlamak. Tıklandığında her seferinde yeni bir benzersiz oda ID'si oluşturup (`room_xxxx`) filmi başlatması ve otomatik oda kurması.
- **Doğrulama:** Üye buffering durumuna geçtiğinde listede gösterilmesi, emoji tıklamalarında video üzerinde animasyonlu uçuşlar, Netflix detay sayfasındaki butona basıldığında filmin yeni bir oda ile başlaması.

### 5. Milestone 5: Popup Arayüzü Geliştirmesi, Avatar Seçici ve Host Kontrolü
- **Kapsam:** Popup arayüzünü avatar seçici (🍿, 🍕, 🍔, 🍪, 🍩, 🔥) ve "Sadece Host Kontrolü" switch seçeneği ile Firebase RTDB entegrasyonu dahil olacak şekilde güncellemek.
- **Yapılacak İşler:**
  - `popup.html` ve `popup.js` dosyalarını inceleyip, avatar seçimlerinde yerel depolama ve Firebase'deki aktif kullanıcı profilini gerçek zamanlı güncellemesini sağlamak.
  - "Sadece Host Kontrolü" switch düğmesi değiştirildiğinde Firebase'deki oda verisini (`hostOnly`) güncellemek (eğer kullanıcı oda sahibi ise).
  - Arayüzde gösterilen tüm tarihler/saatler için yerel Türkçe formatını (`DD.MM.YYYY` veya `DD.MM.YYYY HH:mm:ss`) entegre etmek.
- **Doğrulama:** Popup arayüzünde avatar değiştiğinde odaya katılan diğer üyelerin bunu görmesi. HostOnly switch açıkken oda ayarlarının Firebase'de güncellenmesi ve kontrolün kilitlenmesi.

---

## Sıkı Monorepo Disiplini ve Güvenlik Kuralları
1. **PNPM Monorepo Disiplini:** `/Users/bekir/Uygulamalarım/12-FilmSync` altında bağımsız `node_modules`, `pnpm-lock.yaml`, `package-lock.json` veya yerel `pnpm-workspace.yaml` kesinlikle oluşturulmayacaktır. Yanlışlıkla veya otomatik araçlarca oluşturulan herhangi bir lockfile/klasör anında `/Users/bekir/silinecekler_cop_kutusu/12-FilmSync/` çöp kutusuna taşınacaktır.
2. **Canlı Firebase Realtime Database:** Mock veya local test yapılandırması commit edilen dosyalarda yer almayacak, her zaman canlı Firebase RTDB bağlantısı korunacaktır.
3. **Zaman Formatı:** Arayüzde yer alan her türlü tarih/saat gösterimi Türkçe formatında (`DD.MM.YYYY` veya `DD.MM.YYYY HH:mm:ss`) olmalıdır.
4. **Kod Dili:** Kod tabanındaki tüm değişkenler, fonksiyonlar ve dosya isimleri İngilizce olmalı, ancak kod içi yorumlar Türkçe yazılmalıdır.
