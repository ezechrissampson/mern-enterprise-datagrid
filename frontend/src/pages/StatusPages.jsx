import React from 'react';

export function OfflinePage() {
  return (
    <div className="container-fluid py-5 text-center">
      <i className="bi bi-wifi-off" style={{ fontSize: '3rem', color: 'var(--dg-text-secondary)' }} />
      <h4 className="mt-3 mb-1">You're offline</h4>
      <p className="text-secondary mb-0">Check your connection — the DataGrid will reconnect automatically.</p>
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="container-fluid py-5 text-center">
      <i className="bi bi-tools" style={{ fontSize: '3rem', color: 'var(--dg-warning)' }} />
      <h4 className="mt-3 mb-1">Scheduled maintenance</h4>
      <p className="text-secondary mb-0">This module is temporarily unavailable while we perform maintenance.</p>
    </div>
  );
}

export default OfflinePage;
