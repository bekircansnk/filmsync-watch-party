# ⚡ Bolt - Performance Agent Journal

## 2026-07-21 - Video Player Iframe Resizing Layout Bottleneck

**Learning:** Animating the `width` of the `body` (or specific video player container classes like `.watch-video`, `#ytd-player`) via CSS transitions (e.g., `transition: width 0.3s`) during sidebar injection triggers severe, continuous DOM reflows and layout recalculations. Since the browser attempts to resize the highly complex internal video elements (especially `video` tags or `iframes`) at 60fps during this transition, it heavily bottlenecks the main thread, resulting in noticeable frame drops and stuttering in video playback on platforms like Netflix, Disney+, and YouTube.

**Action:** Replaced `transition: width 0.3s ease;` with an instant width reduction on the `.filmsync-sidebar-open` class. The sidebar injection now shrinks the video player frame instantaneously, avoiding continuous reflows, while other UI elements (like the sidebar sliding in) use GPU-accelerated `transform: translateX` instead of layout-triggering properties to maintain 60fps performance without stalling the main thread.
