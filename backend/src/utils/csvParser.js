const { parse } = require('csv-parse/sync');

/**
 * Parses a CSV buffer into an array of record objects.
 * @param {Buffer} buffer
 * @returns {Array<Object>}
 */
function parseCsvBuffer(buffer) {
  const content = buffer.toString('utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  return records;
}

module.exports = { parseCsvBuffer };
