1. **Fix memory leak by clearing intervals**: Store `setInterval` references in variables (`videoTrackingInterval`, `driftCorrectionInterval`, `uiKeeperInterval`, `iframeFullscreenKeeperInterval`) and clear them in `cleanupFirebase()` and window unload events.
2. **Fix Firebase Listener Cleanup**:
    - The code currently uses `.off()` on base `.ref()` like `db.ref(\`rooms/${roomId}/messages\`).off()`.
    - Memory states: "When detaching Firebase Realtime Database listeners attached to queries (e.g., .limitToLast()), .off() must be called on the exact query instance rather than the base database reference to properly detach callbacks and prevent memory leaks."
    - We must change it to `db.ref(\`rooms/${roomId}/messages\`).limitToLast(50).off()` and `db.ref(\`rooms/${roomId}/reactions\`).limitToLast(5).off()`.
    - Same for `hostId` and `hostOnly`. These are missing in `cleanupFirebase()`.
3. **Update Changelog**: Add the entry in Turkish to `docs/jules/JULES_CHANGELOG.md`.
4. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done**.
5. **Submit**.
