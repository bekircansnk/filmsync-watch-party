const fs = require('fs');

let content = fs.readFileSync('extension/background.js', 'utf8');

const validationLogic = `
function isValidRoomId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}
`;

content = content.replace(
  "// Sekme Yönlendirme ve Bilgi Dinleyicisi",
  validationLogic + "\n// Sekme Yönlendirme ve Bilgi Dinleyicisi"
);

content = content.replace(
  "    if (roomId && username) {",
  "    if (roomId && isValidRoomId(roomId) && username) {"
);

content = content.replace(
  "    const cleanRoomId = (roomId || '').trim().toUpperCase();",
  "    const cleanRoomId = (roomId || '').trim().toUpperCase();\n    if (!isValidRoomId(cleanRoomId)) { sendResponse({ status: 'error', error: 'Invalid roomId' }); return true; }"
);

// Second replacement since there's two of this exact line:
content = content.replace(
  "    const cleanRoomId = (roomId || '').trim().toUpperCase();",
  "    const cleanRoomId = (roomId || '').trim().toUpperCase();\n    if (!isValidRoomId(cleanRoomId)) { sendResponse({ status: 'error', error: 'Invalid roomId' }); return true; }"
);

content = content.replace(
  "    if (res.roomId) {",
  "    if (res.roomId && isValidRoomId(res.roomId)) {"
);

fs.writeFileSync('extension/background.js', content);
