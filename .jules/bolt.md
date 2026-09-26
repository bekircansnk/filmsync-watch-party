## 2024-10-25 - Throttle frequent UI updates on mousemove
**Learning:** Attaching heavy UI updates (like visibility manipulation and timer resets) directly to the unthrottled `mousemove` event can cause significant main-thread blocking, particularly in full-screen video contexts where frame drops are highly visible.
**Action:** Always throttle or debounce frequent event listeners like `mousemove` or `scroll` when they trigger DOM reflows or timer resets, to preserve CPU cycles and maintain a smooth frame rate.
