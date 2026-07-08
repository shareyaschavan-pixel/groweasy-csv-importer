const express = require('express');
const multer = require('multer');
const { parseCsvBuffer } = require('../utils/csvParser');
const { extractCRMRecords } = require('../services/aiService');
const { insertLeads, getAllLeads } = require('../services/supabaseService');

const router = express.Router();

// multer 2.x: fileFilter uses Promise-based rejection instead of cb(new Error())
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only CSV files are allowed'));
    }
  },
});

// POST /api/parse-csv
router.post('/parse-csv', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const records = await parseCsvBuffer(req.file.buffer);

    if (records.length === 0) {
      return res.status(400).json({ success: false, error: 'CSV file is empty or has no valid rows' });
    }

    const result = await extractCRMRecords(records);

    // Persist to Supabase (non-blocking — errors are logged, not thrown)
    const supabaseResult = await insertLeads(result.imported);

    res.json({
      success: true,
      data: result,
      supabase: {
        inserted: supabaseResult.inserted,
        errors: supabaseResult.errors,
        enabled: supabaseResult.inserted > 0 || supabaseResult.errors > 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/export-csv — export all stored leads as CSV download
router.get('/export-csv', async (req, res, next) => {
  try {
    const leads = await getAllLeads();

    if (leads.length === 0) {
      return res.status(404).json({ success: false, error: 'No leads found in database' });
    }

    const fields = [
      'name', 'email', 'country_code', 'mobile', 'company',
      'city', 'state', 'country', 'lead_owner', 'crm_status',
      'crm_note', 'data_source', 'possession_time', 'description',
      'created_at_lead', 'imported_at',
    ];

    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvRows = [
      fields.join(','),
      ...leads.map((row) => fields.map((f) => escape(row[f])).join(',')),
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="groweasy-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});

// multer 2.x error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `File upload error: ${err.message}` });
  }
  next(err);
});

module.exports = router;
