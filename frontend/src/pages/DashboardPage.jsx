import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStats from '../components/DataGrid/DashboardStats.jsx';

export function DashboardPage() {
  return (
    <div className="container-fluid py-4">
      <h4 className="mb-1">DataGrid Dashboard</h4>
      <p className="text-secondary mb-4">Overview of your registered data resources.</p>

      <DashboardStats totalRecords={0} filteredRecords={0} selectedRecords={0} exportCount={0} />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h6 className="mb-2">Get started</h6>
          <p className="small text-secondary mb-3">
            This module ships with an example "employees" resource. Open the DataGrid page to see
            server-side pagination, sorting, filtering, search, columns, exports, and bulk actions
            working end-to-end.
          </p>
          <Link to="/datagrid/employees" className="btn btn-primary btn-sm">
            Open Employees Grid
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
