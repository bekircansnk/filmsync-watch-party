## 2024-10-06 - Throttle mousemove events

**Learning:** Unthrottled mousemove events that trigger DOM queries and timer resets cause perceptible UI latency and degrade high-framerate playback on streaming platforms.
**Action:** When handling high-frequency UI events like mousemove for revealing toolbars, implement a leading-edge execution strategy (trigger immediately, drop subsequent events during timeout) rather than unthrottled execution or trailing-edge debouncing, which introduces UI lag.
