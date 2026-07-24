import React, { useEffect, useState } from 'react';
import exportHistoryService from '../services/exportHistoryService.js';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

const FORMAT_ICON = { csv: 'bi-filetype-csv', xlsx: 'bi-filetype-xlsx', json: 'bi-filetype-json' };

export function ExportsPage() {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    exportHistoryService
      .list({ page, limit: 25 })
      .then((res) => {
        setRecords(res.data);
        setMeta(res.meta);
      })
      .catch((err) => setError(err?.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(record) {
    if (!window.confirm(`Delete export "${record.filename}"? The file will be removed and can no longer be re-downloaded.`)) return;
    await exportHistoryService.remove(record._id);
    load();
  }

  return (
    <div className="container-fluid py-4">
      <h4 className="mb-1">Export History</h4>
      <p className="text-secondary small mb-4">
        Every export generated from a DataGrid is kept here so the original file can be re-downloaded later, without regenerating it.
      </p>

      {loading && <div className="text-secondary small">Loading export history…</div>}
      {error && <div className="alert alert-danger small">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive border rounded-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>File</th>
                <th>Resource</th>
                <th>Scope</th>
                <th>Rows</th>
                <th>Size</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>
                    <i className={`bi ${FORMAT_ICON[record.format] || 'bi-file-earmark'} me-2`} />
                    {record.filename}
                  </td>
                  <td className="text-capitalize">{record.resource}</td>
                  <td className="text-capitalize">{record.scope}</td>
                  <td>{record.rowCount?.toLocaleString()}</td>
                  <td>{formatBytes(record.sizeBytes)}</td>
                  <td className="small text-secondary">{new Date(record.createdAt).toLocaleString()}</td>
                  <td className="text-end">
                    <a
                      className="btn btn-sm btn-outline-primary me-1"
                      href={exportHistoryService.downloadUrl(record._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-download me-1" /> Download
                    </a>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-4">
                    No exports yet. Exports generated from any DataGrid will show up here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <nav className="mt-3">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage((p) => p - 1)}>‹</button>
            </li>
            <li className="page-item disabled"><span className="page-link">Page {meta.page} of {meta.totalPages}</span></li>
            <li className={`page-item ${page >= meta.totalPages ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPage((p) => p + 1)}>›</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default ExportsPage;
