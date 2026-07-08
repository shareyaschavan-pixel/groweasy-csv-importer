const express = require('express');
const multer = require('multer');
const { parseCsvBuffer } = require('../utils/csvParser');
const { extractCRMRecords } = require('../services/aiService');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
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

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
