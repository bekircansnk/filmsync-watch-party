# [0] BAŞMÜHENDİS, YEREL ALT AJAN (SUB-AGENT) VE OTONOM İCRA PROTOKOLÜ (P0++)
1. YEREL ALT AJAN ÖNCELİĞİ: Karmaşık olmayan veya standart işlerde harici bağımsız süreçler (agy-dispatch) tetiklenmez. Sistem içerisinde doğrudan model çağrılarıyla çalışan yerel alt ajan yapısı (`invoke_subagent`, `define_subagent`, `manage_subagents` veya odaklı araştırma alt ajanı) öncelikli olarak kullanılır.
2. BAŞMÜHENDİS ORKESTRASYON REFLEKSİ: Aktif oturum Başmühendis/Orkestratördür. Karmaşık konularda tek başına körlemesine tüm kodları taramak yerine işi yerel alt ajanlara böler, inceler ve doğrular.
3. HARİCİ İZOLE WORKER (OPSİYONEL): Ağır batch, harici kota koruması veya 50+ sayfalık derin dış araştırma hallerinde terminalden izole worker havuzuna (`agy-dispatch`) görev devredilebilir; ancak standart süreçlerde yerel alt ajan mekanizması esastır.
4. OTONOM İCRA & OTOMATİK ÖN-ONAY (HITL ESNEKLİĞİ - P0++): Kullanıcı bir sorundan, hatadan veya geliştirme talebinden bahsettiğinde bu talep peşin ve doğrudan onay kabul edilir. Ajan plan sunup onay beklemez; doğrudan kodlamaya geçer, derleme/testleri tamamlar ve sonucu raporlar. Yalnızca canlı DB veri silme, `git push --force` ve yetkisiz canlı prod yayınında açık onay istenir.
5. SIFIR-BLOKLAMA VE SINIRSIZ PARALELLEŞTİRME STANDARDI (P0++): Ajanlar veya otomasyon sistemleri işleri asla tek tek yapamaz. API limitleri veya donanımın elverdiği en yüksek paralel iş parçacığı/chunk boyutu ile çalışmak, ağır işleri arka plana devretmek ve kullanıcıyı 0 saniye bekletmek anayasal zorunluluktur.
6. SIFIR UNUTULAN ARKA PLAN GÖREVİ & ZOMBIE TASK REAPER (P0++): Kodlama veya analiz tamamlandığında arka planda çalışan `grep`, `rg`, `find` veya geçici görev bırakmak KESİNLİKLE YASAKTIR. Tur bitiminde açık kalan geçici görevler `manage_task(Action='list')` + `manage_task(Action='kill')` ve `stop_task_reaper.py` (`Stop` Hook) ile derhal sonlandırılır.

---

## [0a2] Otonom Beceri & Niyet Keşfi (auto_discover_skill.py)
Kullanıcı istemi geldiğinde niyet, bilişsel kapı ve beceri yönlendirmesi `python3 /Users/bekir/.gemini/maestro/scripts/auto_discover_skill.py` üzerinden otonom işletilir.

---

# 📖 BAĞIMSIZ WORKSPACE VE AJAN REHBERİ (P0++ - EN ÜST ÖNCELİK)

Bu proje, ana monorepodan tamamen ayrıştırılmış ve **kendi başına bağımsız bir pnpm workspace** olarak yapılandırılmıştır. Tüm yapay zeka ajanları geliştirme yaparken bu rehberi mutlak kural olarak uygulamak zorundadır.

---

## 🏗️ 1. Proje Çalışma Yapısı
- Proje Workspace Dizin Kökeni: `/Users/bekir/Uygulamalarım/12-FilmSync/`
- Bu proje kendi bağımsız `pnpm-workspace.yaml` ve `pnpm-lock.yaml` dosyalarına sahiptir.
- Bağımlılık kurulumu (`pnpm install`) ve derleme (`pnpm build`) işlemleri **SADECE** bu dizin içerisinde çalıştırılmalıdır. Ana `/Users/bekir` dizininde herhangi bir kurulum çalıştırılamaz.

## ⚙️ 2. Geliştirme ve Kurulum Protokolü
1. **Bağımlılık Yükleme:**
   ```bash
   cd "/Users/bekir/Uygulamalarım/12-FilmSync"
   pnpm install
   ```
2. **Post-install ve Build İzinleri (pnpm v11+):**
   - pnpm v11+ sürümü gereği, güvenlik amacıyla üçüncü parti derleme scriptleri varsayılan olarak engellenmiştir.
   - Bu projenin kendi dizinindeki `pnpm-workspace.yaml` dosyası, `allowBuilds` haritası ile gerekli izinleri (esbuild, sharp vb.) yerel olarak tanımlamaktadır. Başka bir yere izin eklemeyiniz.

## 📦 3. Yardımcı ve Ortak Kod Paylaşımı
- `@shared/ortak-yapi` (monorepo symlink) bağımlılığı **tamamen kaldırılmıştır** ve kullanılması yasaktır.
- Ortak kod veya yardımcı araçlar (Örn: Excel, PDF dışa aktarma vb.) gerekirse doğrudan bu projenin kendi yerel dizinine (`src/utils/` veya muadili) kopyalanarak yerel import ile kullanılmalıdır.

## 🚨 4. Temizlik ve Kalıntı Kuralları (P0)
- Proje altında oluşan yerel `node_modules` ve `.next` klasörleri normaldir ve silinmemelidir.
- **Silme Yasağı:** Proje içerisindeki gereksiz/atıl dosyalar silinmez, doğrudan ortak çöp kutusu dizini olan `/Users/bekir/silinecekler_cop_kutusu/12-FilmSync/` altına taşınır.

## 🔗 5. Canlı Veritabanı ve Entegrasyonlar
- Tüm canlı veritabanı şifreleri, API bağlantıları ve gizli anahtarlar doğrudan [global-connections.md](file:///Users/bekir/.gemini/maestro/rules/global-connections.md) dosyasından okunmalıdır. Kod içerisine hardcoded yazılması kesinlikle yasaktır.