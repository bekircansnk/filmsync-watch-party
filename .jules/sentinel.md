## 2024-05-18 - Fix Stored XSS and Arbitrary Write in Room Cards
**Vulnerability:** Room cards in the popup were constructed using `innerHTML` with data fetched from Firebase, creating a Stored XSS vulnerability. Additionally, administrative `DELETE` calls were being made from the client side.
**Learning:** Never use `innerHTML` to render dynamic data from an external source. Administrative operations should not be performed directly from client-side code to avoid arbitrary write vulnerabilities.
**Prevention:** Use safe DOM manipulation methods like `document.createElement` and `textContent`. Keep administrative operations on the server side.
