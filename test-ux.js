const fs = require('fs');
const html = fs.readFileSync('extension/popup.html', 'utf-8');

const regexes = [
  /<span[^>]*id="userAvatarDisplay"[^>]*>/g
];

regexes.forEach(r => {
  const match = html.match(r);
  console.log(r, match);
});
