const fs = require('fs');
const popupJs = fs.readFileSync('extension/popup.js', 'utf8');

console.log("XSS analysis popup.js");
const htmlRegex = /\.innerHTML\s*=\s*`([^`]+)`/g;

let match;
while ((match = htmlRegex.exec(popupJs)) !== null) {
     const innerText = match[1];
     if (innerText.includes('${')) {
         console.log(`Possible XSS in innerHTML template literal: ${match[0]}`);
     }
}
