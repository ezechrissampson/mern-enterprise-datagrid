import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DataGridPage from './pages/DataGridPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import { OfflinePage, MaintenancePage } from './pages/StatusPages.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/datagrid/:resource" element={<DataGridPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
