## 2026-10-15 - Throttling dynamic DOM queries on continuous events
**Learning:** In architectures where UI elements are frequently destroyed and recreated, caching DOM references globally to avoid getElementById overhead can lead to null references or memory leaks. The bottleneck on continuous events like mousemove must instead be solved by throttling the event handler itself with a leading-edge strategy.
**Action:** Use leading-edge throttling for high-frequency events when manipulating dynamic UI elements, ensuring immediate visual response while dropping subsequent redundant DOM queries.
