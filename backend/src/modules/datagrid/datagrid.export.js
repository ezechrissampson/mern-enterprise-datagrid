import fs from 'fs';
import { format as fastCsvFormat } from 'fast-csv';
import ExcelJS from 'exceljs';
import { ensureExportsDir, buildStoredFilename, resolveStoredPath } from '../exports/storage.js';

/**
 * Generates an export file on disk (instead of streaming straight to the
 * HTTP response) so it can be recorded in Export History and re-downloaded
 * later. The caller streams the resulting file back to the client.
 */
export async function writeExportFile(format, rows, columns) {
  ensureExportsDir();
  const extension = format === 'xlsx' ? 'xlsx' : format === 'json' ? 'json' : 'csv';
  const storedFilename = buildStoredFilename(extension);
  const filePath = resolveStoredPath(storedFilename);

  if (format === 'xlsx') {
    await writeExcelFile(filePath, rows, columns);
  } else if (format === 'json') {
    await fs.promises.writeFile(filePath, JSON.stringify(rows, null, 2), 'utf-8');
  } else {
    await writeCsvFile(filePath, rows, columns);
  }

  const { size } = await fs.promises.stat(filePath);
  return { storedFilename, filePath, sizeBytes: size, extension };
}

function writeCsvFile(filePath, rows, columns) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    const csvStream = fastCsvFormat({ headers: columns.map((c) => c.label) });
    csvStream.pipe(writeStream);
    for (const row of rows) csvStream.write(columns.map((c) => flatten(row, c.key)));
    csvStream.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    csvStream.on('error', reject);
  });
}

async function writeExcelFile(filePath, rows, columns) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: filePath, useStyles: true });
  const sheet = workbook.addWorksheet('Export');
  sheet.columns = columns.map((c) => ({ header: c.label, key: c.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };

  for (const row of rows) {
    const record = {};
    for (const c of columns) record[c.key] = flatten(row, c.key);
    sheet.addRow(record).commit();
  }
  sheet.commit();
  await workbook.commit();
}

function flatten(obj, fieldPath) {
  const value = fieldPath.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

export function contentTypeFor(format) {
  if (format === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (format === 'json') return 'application/json; charset=utf-8';
  return 'text/csv; charset=utf-8';
}

/** Streams an already-generated file on disk back to the client. */
export function streamFileDownload(res, filePath, downloadName, contentType) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.status(404).end('File not found');
  });
  stream.pipe(res);
}

export default { writeExportFile, contentTypeFor, streamFileDownload };
