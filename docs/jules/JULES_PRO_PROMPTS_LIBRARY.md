# 📚 FilmSync Watch Party - Jules Otonom Prompt Kütüphanesi

Bu kütüphane, FilmSync Chrome Eklentisi üzerinde periyodik olarak koşturulacak otonom optimizasyon, hata giderme ve güvenlik görevlerinin promptlarını içerir.

---

## 🔒 1. GÜVENLİK (Security & Credential Audit)
### `PROMPT-SEC-001`: Firebase Config & Key Leak Denetimi
```markdown
Analyze the extension configuration files (manifest.json, content.js, popup.js, background.js) for hardcoded secrets, database write rules, or unsafe credential leakage. 
Specifically, check the Firebase API keys and permissions.
Ensure no administrative credentials or sensitive database write accesses are exposed.
Update docs/jules/JULES_CHANGELOG.md in Turkish detailing any security improvements made.
```

### `PROMPT-SEC-002`: DOM Injection & XSS Audit (Sidebar & Chat)
```markdown
Review extension/content.js and extension/popup.js to inspect how messages, user-entered room names, and text variables are parsed and rendered in the DOM.
Ensure all HTML injections are sanitized or replaced with safe textContent/innerText implementations to prevent Cross-Site Scripting (XSS).
Update docs/jules/JULES_CHANGELOG.md in Turkish with findings and fixes.
```

---

## ⚡ 2. PERFORMANS VE BELLEK OPTİMİZASYONU
### `PROMPT-PERF-001`: Firebase Listener Leak Analizi
```markdown
Inspect extension/content.js for Firebase realtime database realtime database listener registrations (.on() calls).
Verify that cleanupFirebase() and other teardown functions correctly unsubscribe from all active listeners (.off() calls) upon tab navigation, iframe reload, or room changes.
Optimize performance to prevent memory leaks in long-running video tabs.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### `PROMPT-PERF-002`: DOM Reflow & Resize Optimizasyonu
```markdown
Analyze the sidebar injection and resizing logic in extension/content.js (body.filmsync-sidebar-open and video player frame reductions).
Refactor layouts to minimize DOM reflow overhead and ensure high-frame-rate video playback during watch parties on Netflix, Disney+, and YouTube.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 🛠️ 3. SENKRONİZASYON VE HATA AYIKLAMA (E2E & Drift)
### `PROMPT-SYNC-001`: Race Condition ve Oynatıcı Kararlılık Denetimi
```markdown
Analyze PlayerAdapter and ensureVideoReady in extension/content.js.
Identify potential race conditions between remote applyRemoteState calls and user manual actions (play, pause, seek).
Refactor debounce or lock timers if necessary to avoid synchronization loops or video stuttering.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

### `PROMPT-SYNC-002`: Drift Correction Algoritma İyileştirmesi
```markdown
Review the drift correction logic in startDriftCorrection in extension/content.js.
Enhance the thresholding logic (currently 2.5s) to dynamically adjust based on network latency or user play state mismatches, ensuring seamless synchronization.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```

---

## 📦 4. KOD KALİTESİ VE REFACTORING
### `PROMPT-CODE-001`: Console Log Temizliği ve Yapısal Hata Yönetimi
```markdown
Scan extension/content.js and extension/popup.js.
Replace plain console.log outputs with a structured logger or clean them up.
Add robust try-catch blocks to API hooks (Netflix, Disney+, YouTube) to prevent browser extension crashes.
Update docs/jules/JULES_CHANGELOG.md in Turkish.
```
