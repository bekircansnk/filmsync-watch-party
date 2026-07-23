## 2024-06-25 - Throttle High-Frequency Global Events Over Video Players
**Learning:** Global events like `mousemove` firing on every frame over full-screen video players cause massive main thread contention (recalculation storms and excessive DOM lookups), heavily degrading video playback performance.
**Action:** Always throttle continuous global events (e.g., `mousemove`, `scroll`, `resize`) using a timestamp-based approach (e.g., 250ms) to ensure smooth playback and limit UI reflows.
