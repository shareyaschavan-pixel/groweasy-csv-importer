const express = require('express');
const multer = require('multer');
const { parseCsvBuffer } = require('../utils/csvParser');
const { extractCRMRecords } = require('../services/aiService');

const router = express.Router();

// multer 2.x: fileFilter uses Promise-based rejection instead of cb(new Error())
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      // multer 2.x: pass error as first argument to reject
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

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// multer 2.x error handler for this router
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `File upload error: ${err.message}` });
  }
  next(err);
});

module.exports = router;
