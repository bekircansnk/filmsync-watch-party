const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  content = content.replace(/console\.log\(/g, "Logger.info(");
  content = content.replace(/console\.error\(/g, "Logger.error(");
  content = content.replace(/console\.warn\(/g, "Logger.warn(");

  const loggerCode = '\nconst Logger = {\n' +
  '  info: (msg, ...args) => console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, ...args),\n' +
  '  warn: (msg, ...args) => console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, ...args),\n' +
  '  error: (msg, ...args) => console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, ...args)\n' +
  '};\n';

  content = loggerCode + content;

  fs.writeFileSync(filepath, content);
}

patchFile('extension/content.js');
patchFile('extension/popup.js');
