import React from 'react';

export function RowActionsMenu({ row, actions = [], onAction }) {
  if (!actions.length) return null;

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-sm btn-icon border-0"
        data-bs-toggle="dropdown"
        aria-label="Row actions"
      >
        <i className="bi bi-three-dots-vertical" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {actions.map((action) => (
          <li key={action.key}>
            <button
              type="button"
              className={`dropdown-item ${action.variant === 'danger' ? 'text-danger' : ''}`}
              onClick={() => onAction(action, row)}
            >
              {action.icon && <i className={`bi ${action.icon} me-2`} />}
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RowActionsMenu;
