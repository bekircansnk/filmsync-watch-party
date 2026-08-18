const fs = require('fs');

let content = fs.readFileSync('extension/popup.js', 'utf8');

const validationLogic = `
function isValidRoomId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}
`;

content = content.replace(
  "// Toast bildirim fonksiyonu",
  validationLogic + "\n// Toast bildirim fonksiyonu"
);

content = content.replace(
  "fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${matchedRoomId}/users/${userId}.json`, {",
  "if (!isValidRoomId(matchedRoomId) || !isValidRoomId(userId)) return;\n            fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${matchedRoomId}/users/${userId}.json`, {"
);

content = content.replace(
  "fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${currentRoomId}.json`)",
  "if (!isValidRoomId(currentRoomId)) return;\n    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${currentRoomId}.json`)"
);

content = content.replace(
  "fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' }).catch(e => {});",
  "if (isValidRoomId(roomId)) { fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' }).catch(e => {}); }"
);

content = content.replace(
  "fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' })",
  "if (!isValidRoomId(roomId)) return;\n              fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' })"
);

fs.writeFileSync('extension/popup.js', content);
