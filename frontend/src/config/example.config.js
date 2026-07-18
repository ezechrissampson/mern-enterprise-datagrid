/**
 * Example DataGrid configuration object.
 *
 * This is the ONLY file a developer needs to write per-table on the
 * frontend. Pass it to <DataGrid config={employeesGridConfig} /> and every
 * feature (pagination, sorting, filtering, search, columns, export, bulk
 * actions, row actions, permissions) is wired automatically.
 */
export const employeesGridConfig = {
  // Matches the backend registry key: registerResource('employees', ...)
  resource: 'employees',

  // localStorage key for persisting column/filter/sort/density preferences.
  storageKey: 'datagrid:employees:v1',

  title: 'Employees',
  description: 'Manage employee records across the organization.',

  defaultPageSize: 25,
  defaultSort: [{ id: 'hireDate', desc: true }],
  defaultFilters: {},

  emptyState: {
    icon: 'bi-people',
    title: 'No employees found',
    description: 'Try adjusting your filters or search term.',
  },

  columns: [
    { key: 'firstName', label: 'First Name', type: 'string', sortable: true, filterable: true, pinnable: true },
    { key: 'lastName', label: 'Last Name', type: 'string', sortable: true, filterable: true },
    { key: 'email', label: 'Email', type: 'string', sortable: true, filterable: true },
    {
      key: 'department',
      label: 'Department',
      type: 'string',
      sortable: true,
      filterable: true,
      filterType: 'select',
      options: ['Engineering', 'Sales', 'Support', 'HR', 'Finance'],
    },
    { key: 'role', label: 'Role', type: 'string', sortable: true, filterable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'string',
      sortable: true,
      filterable: true,
      filterType: 'select',
      options: ['active', 'inactive', 'archived'],
      badge: {
        active: 'success',
        inactive: 'warning',
        archived: 'secondary',
      },
    },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true, filterable: true, align: 'end', format: 'currency' },
    { key: 'hireDate', label: 'Hire Date', type: 'date', sortable: true, filterable: true, format: 'date' },
    { key: 'isRemote', label: 'Remote', type: 'boolean', sortable: false, filterable: true, filterType: 'boolean' },
  ],

  searchPlaceholder: 'Search employees by name or email…',

  // Maps to backend permission strings: `${resource}:${action}`
  permissions: {
    read: 'employees:read',
    create: 'employees:create',
    update: 'employees:update',
    delete: 'employees:delete',
    bulkDelete: 'employees:bulkDelete',
    bulkUpdate: 'employees:bulkUpdate',
    export: 'employees:export',
  },

  rowActions: [
    { key: 'view', label: 'View', icon: 'bi-eye' },
    { key: 'edit', label: 'Edit', icon: 'bi-pencil' },
    { key: 'duplicate', label: 'Duplicate', icon: 'bi-files' },
    { key: 'delete', label: 'Delete', icon: 'bi-trash', variant: 'danger', confirm: true },
  ],

  bulkActions: [
    { key: 'export', label: 'Export selected', icon: 'bi-download' },
    { key: 'archive', label: 'Archive', icon: 'bi-archive', patch: { status: 'archived' } },
    { key: 'delete', label: 'Delete', icon: 'bi-trash', variant: 'danger', confirm: true },
  ],

  exportFormats: ['csv', 'xlsx', 'json'],
};

export default employeesGridConfig;
