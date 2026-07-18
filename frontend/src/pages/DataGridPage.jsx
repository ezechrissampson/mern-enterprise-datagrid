import React from 'react';
import DataGrid from '../components/DataGrid/DataGrid.jsx';
import employeesGridConfig from '../config/example.config.js';

/**
 * Example integration page. In a real host application, you'd render
 * <DataGrid config={yourConfig} userPermissions={currentUser.permissions} />
 * inside whatever route/layout your app already uses.
 */
export function DataGridPage() {
  return (
    <div className="container-fluid py-4">
      <DataGrid
        config={employeesGridConfig}
        userPermissions={['*']}
        onRowAction={(action, row) => {
          // eslint-disable-next-line no-console
          console.log('row action', action.key, row);
        }}
        onBulkAction={(action, ids) => {
          // eslint-disable-next-line no-console
          console.log('bulk action', action.key, ids);
        }}
      />
    </div>
  );
}

export default DataGridPage;
