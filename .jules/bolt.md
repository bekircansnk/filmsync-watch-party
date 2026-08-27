## 2026-08-27 - Sidebar Reflow Optimization
**Learning:** Animating width/height dimensions on large container elements containing video players triggers continuous layout calculations (DOM reflow) on every frame.
**Action:** Removed width transitions on the sidebar body container to ensure instant dimension switching and preserve video framerates during resize events.
