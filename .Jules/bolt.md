## 2024-10-24 - Centralize DOM Reflow Avoidance
**Learning:** In contexts with frequent sync loops (like `setInterval` calling DOM reads), inline short-circuit caches (e.g., `cachedElement || lookup()`) prevent performance wins in paths that *don't* use the short circuit.
**Action:** Always centralize the cache validation (`isConnected`, `readyState`) inside the primary lookup function itself. This provides an O(1) fast path for all callers while preventing stale references and completely bypassing redundant DOM layout queries (`getBoundingClientRect()`).
