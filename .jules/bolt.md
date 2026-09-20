## 2024-05-24 - [Throttle Fullscreen Idle Detector]
**Learning:** Unthrottled 'mousemove' and 'keydown' event listeners on the document can cause high-frequency CPU spikes and slow down video playback, particularly on resource-intensive streaming sites when in fullscreen mode.
**Action:** Throttle the execution frequency of high-frequency DOM event handlers (like mousemove) to a maximum of once every 250 milliseconds using a simple timestamp check to preserve performance.
