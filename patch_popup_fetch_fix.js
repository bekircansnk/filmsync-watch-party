const fs = require('fs');
let content = fs.readFileSync('extension/popup.js', 'utf8');

// There's an issue with duplicate `.then` chains because the previous patch regex was too greedy.
// Let's reset popup.js to original and apply a cleaner fetch patch.
