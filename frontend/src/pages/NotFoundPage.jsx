import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-fluid py-5 text-center">
      <i className="bi bi-signpost-split" style={{ fontSize: '3rem', color: 'var(--dg-text-secondary)' }} />
      <h4 className="mt-3 mb-1">404 — Page not found</h4>
      <p className="text-secondary mb-3">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-sm">Back to Dashboard</Link>
    </div>
  );
}

export default NotFoundPage;
