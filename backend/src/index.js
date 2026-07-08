const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const csvRoutes = require('./routes/csv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Lock CORS to ALLOWED_ORIGIN env var (set in Render dashboard)
// Falls back to '*' if not configured so local dev still works
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GrowEasy AI CSV Importer API',
    version: '1.0.1',
    endpoints: {
      health: 'GET /health',
      parseCSV: 'POST /api/parse-csv',
      exportCSV: 'GET /api/export-csv',
    },
    frontend: 'https://groweasy-csv-importer-ten.vercel.app',
    supabase: process.env.SUPABASE_URL ? 'connected' : 'not configured',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GrowEasy CSV Importer API is running',
    supabase: process.env.SUPABASE_URL ? 'connected' : 'not configured',
  });
});

app.use('/api', csvRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? '✅ connected' : '⚠️  not configured'}`);
  console.log(`CORS origin: ${allowedOrigin}`);
});
