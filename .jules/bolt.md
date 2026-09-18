## 2026-09-18 - Firebase Listener Cleanup Memory Leaks
**Learning:** When unsubscribing from Firebase Realtime Database query listeners in the V8 SDK (e.g., `.limitToLast(n).on(...)`), calling `.off()` on the base reference is insufficient. You must append the exact query parameters to the `.off()` call to properly detach the listener and prevent memory leaks.
**Action:** Updated `cleanupFirebase()` in `extension/content.js` to include exact query parameters (`.limitToLast(50).off()` and `.limitToLast(5).off()`) and added missing `.off()` calls for `hostId` and `hostOnly` listeners.
