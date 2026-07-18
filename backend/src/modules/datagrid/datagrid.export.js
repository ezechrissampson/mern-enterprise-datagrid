import { format as fastCsvFormat } from 'fast-csv';
import ExcelJS from 'exceljs';

/**
 * Streams rows as CSV directly to the HTTP response (memory-safe for large exports).
 */
export function streamCsv(res, filename, rows, columns) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

  const csvStream = fastCsvFormat({ headers: columns.map((c) => c.label) });
  csvStream.pipe(res);
  for (const row of rows) {
    csvStream.write(columns.map((c) => flatten(row, c.key)));
  }
  csvStream.end();
}

export async function streamExcel(res, filename, rows, columns) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res, useStyles: true });
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

export function sendJson(res, filename, rows) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
  res.status(200).json(rows);
}

function flatten(obj, path) {
  const value = path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

export default { streamCsv, streamExcel, sendJson };
