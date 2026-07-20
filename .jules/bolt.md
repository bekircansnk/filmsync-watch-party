## 2024-05-16 - Prevent Layout Thrashing in Extension Overlays
**Learning:** Animating layout-triggering properties (like `right`, `width`, `top`) in browser extension UI elements (like a chat toggle toolbar) causes heavy DOM reflows. On media-heavy sites (Netflix, YouTube), this severely degrades the main video playback frame rate.
**Action:** Always use GPU-accelerated CSS properties (`transform: translateX/Y`, `opacity`) alongside `will-change` for all UI animations in extensions that overlay on video players.
