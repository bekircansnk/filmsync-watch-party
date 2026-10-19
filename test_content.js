const fs = require('fs');
const content = fs.readFileSync('extension/content.js', 'utf8');

// Find all usages of setTimeout related to user actions/debounce.
const debounceUsages = content.match(/setTimeout\([^)]+\)/g);
// console.log(debounceUsages);

const functionSignatures = content.match(/function [a-zA-Z0-9_]+\([^)]*\)/g);
console.log(functionSignatures);
