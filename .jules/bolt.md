## 2024-10-12 - Optimize Sidebar Resizing
**Learning:** Animating the width property on the body or large container elements during video playback causes severe DOM reflow overhead and dropped frames on streaming platforms.
**Action:** Always avoid CSS transitions on layout properties like width for video containers; favor instantaneous changes or transform to preserve high-frame-rate playback.
