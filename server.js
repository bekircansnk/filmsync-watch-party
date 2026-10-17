const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve the web landing page and documentation assets from /docs
app.use(express.static(path.join(__dirname, 'docs')));

// Also expose /extension static files for previewing popup/icons
app.use('/extension', express.static(path.join(__dirname, 'extension')));

// Fallback to docs/index.html for SPA/query routes (e.g., /?join=ABCD)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[FilmSync] Server running at http://${HOST}:${PORT}`);
});
