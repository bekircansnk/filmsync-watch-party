1. **Refactor Play Command Sync Reset**
   Modify `applyRemoteState` so that when a normal play command is received (and large drift is not present), the debounce lock uses the shared `syncSafetyTimer` and resets all sync flags using `finishProgrammaticSync()` instead of just locally clearing `isSyncing` via an unmanaged timeout.

2. **Refactor Pause Command Sync Reset**
   Modify `applyRemoteState` so that when a normal pause command is received, it also manages the lock safely using `syncSafetyTimer` and `finishProgrammaticSync()`.

3. **Refactor Seek Event Early Unlock**
   In `handleSeekEvent`, when an event is swallowed because it was programmatically triggered, the code currently schedules an unmanaged timeout to call `finishProgrammaticSync()` after 600ms. I'll modify this to use and manage the global `syncSafetyTimer`, so it doesn't overwrite a newly created lock.

4. **Verify changes**
   Use node syntax check on `extension/content.js`.

5. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

6. **Update Changelog**
   Document the changes autonomously in Turkish within the `docs/jules/JULES_CHANGELOG.md` file.

7. **Submit Changes**
   Submit the changes describing the fix for race conditions during synchronization events.
