const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');
const DIST_PATH = path.join(__dirname, '../dist');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Static Files (Frontend)
app.use(express.static(DIST_PATH));

// Helper to read DB
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.warn('DB read error or empty. Initializing defaults...');
    return {};
  }
}

// Helper to write DB
async function writeDB(data) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('DB Write Error:', err);
  }
}

// API Routes
app.get('/api/all', async (req, res) => {
  const db = await readDB();
  res.json(db);
});

app.post('/api/sync', async (req, res) => {
  const newData = req.body;
  const db = await readDB();
  
  const merged = { ...db, ...newData };
  await writeDB(merged);
  
  res.json({ success: true });
});

// Wildcard for SPA (React Router) - Catch-all middleware
app.use((req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`QMS Shared System running at port ${PORT}`);
});
