## 2024-10-07 - Throttle High-Frequency `mousemove` Events in Content Script
**Learning:** `mousemove` events can fire extremely fast, causing redundant operations. Implementing a leading-edge execution strategy throttles the events while minimizing UI latency.
**Action:** Throttle `mousemove` events for `setupFullscreenIdleDetector` to limit excessive function calls.
