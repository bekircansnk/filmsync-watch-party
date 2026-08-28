# 📝 Jules Otonom Görev Değişiklik Günlüğü (JULES_CHANGELOG.md)

Bu dosya, Jules (Google AI Coding Agent) tarafından gerçekleştirilen tüm otonom bakım, iyileştirme ve hata giderme seanslarının kaydını tutar.

---

## [19.07.2026] - Manuel Düzeltmeler ve Jules Entegrasyonu (Başlangıç)
- **Hata Düzeltmeleri:**
  - Video olmayan sayfalarda host'un `lastState` güncellemesi ve film URL'sini ezmesi engellendi.
  - Video elementinin hazır olmasını (readyState >= 1) bekleyen `ensureVideoReady` fonksiyonu entegre edildi.
  - Aynı tarayıcı oturumunda odaya tekrar katılım anında mükerrer "odaya katıldı" mesajlarının fırlatılması `sessionStorage` ile engellendi.
- **Jules Entegrasyonu:**
  - Jules otonom prompt kütüphanesi (`JULES_PRO_PROMPTS_LIBRARY.md`) ve otomasyon planı (`JULES_AUTOMATION_REGISTRY.md`) oluşturuldu.

## [28.08.2026] - 🎨 Palette: Kullanıcı Avatarı Erişilebilirlik İyileştirmesi
- **Erişilebilirlik (A11y):**
  - `userAvatarDisplay` (Profil simgesi) bileşenine ekran okuyucular için `role="button"`, `tabindex="0"` ve `aria-label` nitelikleri eklendi.
  - Avatar değiştirme işlemi için yalnızca fare (click) değil, aynı zamanda klavye navigasyonu (Enter ve Boşluk tuşları) desteği sağlandı.
  - Kullanıcı adı giriş alanına (`usernameInput`) ekran okuyucular için `aria-label` eklendi.
