const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
console.log('[QMS] Server starting process...');

const PORT = process.env.PORT || 3001;
const DIST_PATH = path.resolve(__dirname, '../dist');
const DB_PATH = path.resolve(__dirname, 'db.json');

console.log(`[QMS] Port: ${PORT}`);
console.log(`[QMS] Dist path: ${DIST_PATH}`);
console.log(`[QMS] DB path: ${DB_PATH}`);

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Static Files (Frontend)
console.log('[QMS] Serving static files from:', DIST_PATH);
app.use(express.static(DIST_PATH));

// Helper Functions
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn('[QMS] DB read error or empty. Initializing empty...');
    return {};
  }
}

async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('[QMS] DB Updated successfully');
  } catch (err) {
    console.error('[QMS] DB Write Error:', err);
  }
}

// API Routes
app.get('/api/all', async (req, res) => {
  console.log('[QMS] GET /api/all requested');
  const db = await readDB();
  res.json(db);
});

app.post('/api/sync', async (req, res) => {
  console.log('[QMS] POST /api/sync requested');
  const newData = req.body;
  const db = await readDB();
  const merged = { ...db, ...newData };
  await writeDB(merged);
  res.json({ success: true });
});

// Wildcard for SPA (React Router) - Catch-all middleware
app.use((req, res) => {
  console.log(`[QMS] Catch-all route reached for: ${req.url}`);
  res.sendFile(path.join(DIST_PATH, 'index.html'), (err) => {
    if (err) {
      console.error('[QMS] Error sending index.html:', err);
      res.status(500).send('Frontend build (dist) not found. Please run build first.');
    }
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[QMS] 🚀 Server is successfully running at port ${PORT}`);
});

server.on('error', (err) => {
  console.error('[QMS] Server startup error:', err);
});
