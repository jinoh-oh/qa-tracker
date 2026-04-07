const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const mongoose = require('mongoose');

console.log('[QMS] Server starting process...');

const PORT = process.env.PORT || 3001;
const DIST_PATH = path.resolve(__dirname, '../dist');
const DB_LOCAL_PATH = path.resolve(__dirname, 'db.json');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://qa8724_db:VCTz64F7x0UfKY7p@cluster0.4m2jlf8.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('[QMS] 🍃 MongoDB Connected successfully'))
  .catch(err => console.error('[QMS] ❌ MongoDB Connection Error:', err));

// Single Schema for entire App Data (Legacy Sync Pattern Compatibility)
const AppDataSchema = new mongoose.Schema({
  testCasesData: { type: Object, default: {} },
  screenRulesData: { type: Object, default: {} }, // Added for SCREEN_RULE persistence
  modules: { type: Array, default: [] },
  accounts: { type: Array, default: [] },
  defectsData: { type: Array, default: [] },
  notificationsData: { type: Array, default: [] },
  depthOptions: { type: Array, default: [] },
  lastUpdated: { type: Date, default: Date.now }
});

const AppData = mongoose.model('AppData', AppDataSchema);

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));

// Static Files (Frontend)
app.use(express.static(DIST_PATH));

// Helper Functions (Modified for MongoDB)
async function readDB() {
  try {
    let data = await AppData.findOne().sort({ lastUpdated: -1 });
    
    // Auto-Migration from local db.json if MongoDB is empty
    if (!data) {
      console.log('[QMS] DB is empty. Checking local migration...');
      try {
        const localRaw = await fs.readFile(DB_LOCAL_PATH, 'utf8');
        const localData = JSON.parse(localRaw);
        data = new AppData({ ...localData });
        await data.save();
        console.log('[QMS] ✅ Migration from db.json to MongoDB successful!');
      } catch (err) {
        console.warn('[QMS] No local db.json found. Initializing empty DB.');
        data = new AppData({});
        await data.save();
      }
    }
    return data;
  } catch (err) {
    console.error('[QMS] DB Read Error:', err);
    return {};
  }
}

// API Routes
app.get('/api/all', async (req, res) => {
  const db = await readDB();
  res.json(db);
});

app.post('/api/sync', async (req, res) => {
  try {
    const newData = req.body;
    await AppData.findOneAndUpdate({}, 
      { ...newData, lastUpdated: Date.now() }, 
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[QMS] Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Wildcard for SPA (React Router)
app.use((req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[QMS] 🚀 Server is successfully running at port ${PORT}`);
});

server.on('error', (err) => {
  console.error('[QMS] Server startup error:', err);
});
