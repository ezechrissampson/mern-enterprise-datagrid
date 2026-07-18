import React from 'react';
import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="container-fluid py-5 text-center">
      <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: 'var(--dg-danger)' }} />
      <h4 className="mt-3 mb-1">403 — Access denied</h4>
      <p className="text-secondary mb-3">You don't have permission to view this resource.</p>
      <Link to="/" className="btn btn-primary btn-sm">Back to Dashboard</Link>
    </div>
  );
}

export default ForbiddenPage;
