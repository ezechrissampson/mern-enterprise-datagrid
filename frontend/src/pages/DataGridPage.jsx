import React from 'react';
import { useParams } from 'react-router-dom';
import DataGrid from '../components/DataGrid/DataGrid.jsx';
import { getGridConfig } from '../config/registry.js';
import { NotFoundPage } from './NotFoundPage.jsx';

/**
 * Example integration page. In a real host application, you'd render
 * <DataGrid config={yourConfig} userPermissions={currentUser.permissions} />
 * inside whatever route/layout your app already uses.
 */
export function DataGridPage() {
  const { resource } = useParams();
  const config = getGridConfig(resource);

  if (!config) return <NotFoundPage />;

  return (
    <div className="container-fluid py-4">
      <DataGrid
        config={config}
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
