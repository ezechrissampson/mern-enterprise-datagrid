import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/datagrid/employees', label: 'Employees Grid', icon: 'bi-table' },
  { to: '/saved-views', label: 'Saved Views', icon: 'bi-bookmark' },
  { to: '/exports', label: 'Exports', icon: 'bi-download' },
  { to: '/settings', label: 'Settings', icon: 'bi-gear' },
];

/**
 * Example shell layout. In a real host application, this is replaced by
 * your existing app shell — just add a nav item that links to your
 * DataGrid page (see NAV_ITEMS above for the shape).
 */
export function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <aside className="border-end" style={{ width: 240, background: 'var(--dg-surface)' }}>
        <div className="p-3 border-bottom">
          <span className="fw-bold" style={{ color: 'var(--dg-primary-dark)' }}>
            <i className="bi bi-grid-3x3-gap me-2" />
            Enterprise Grid
          </span>
        </div>
        <nav className="nav flex-column p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link d-flex align-items-center gap-2 rounded-2 px-3 py-2 mb-1 ${isActive ? 'text-white' : 'text-body'}`}
              style={({ isActive }) => (isActive ? { background: 'var(--dg-primary)' } : undefined)}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-grow-1" style={{ background: 'var(--dg-background)' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
