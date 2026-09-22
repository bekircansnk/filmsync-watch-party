## $(date +%Y-%m-%d) - XSS Zafiyetleri Giderildi
**Vulnerability:** extension/content.js (showAutoJoinOverlay, showNamePromptModal) and extension/popup.js (loadPublicRooms) were vulnerable to Cross-Site Scripting (XSS) because user-controlled strings like room names were injected directly into innerHTML via string interpolation.
**Learning:** In dynamically generated DOM, injecting potentially malicious input via innerHTML is dangerous. Instead, create placeholder elements in the innerHTML structure and populate them securely using textContent.
**Prevention:** Avoid string interpolation with user input inside innerHTML assignments. Always use textContent or innerText for user-provided data, and setAttribute for attributes.
