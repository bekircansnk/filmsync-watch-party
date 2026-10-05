## 2023-10-05 - Throttled Idle Detection
**Learning:** Attaching unthrottled mousemove and keydown event listeners to the document for full-screen idle detection causes excessive DOM queries and timer resets. This leads to main-thread jank on heavy streaming sites.
**Action:** Always wrap high-fire-rate events like mousemove and keydown with a throttle or debounce mechanism (e.g., using setTimeout at 150ms intervals) when tracking idle states on streaming platforms.
