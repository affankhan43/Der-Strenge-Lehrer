require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');
const apiRouter   = require('./routes/api');
const authRouter  = require('./routes/auth');
const adminRouter = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

// CORS — allow React dev server + S3 + mobile
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

// API routes
app.use('/api/auth',  authRouter);
app.use('/api/admin', adminRouter);
app.use('/api',       apiRouter);

// Serve legacy plain-HTML frontend in dev (will be replaced by React build)
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  // Only fall through for non-API requests
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🎓 Der Strenge Lehrer API  →  http://localhost:${PORT}\n`);
});
