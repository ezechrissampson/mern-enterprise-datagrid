import { registerResource } from '../datagrid/datagrid.registry.js';
import Employee from './employee.model.js';

/**
 * This is ALL the backend code required to expose a new collection through
 * the generic DataGrid API. No routes, controllers, or repositories to write.
 */
registerResource('employees', {
  model: Employee,
  fieldsConfig: {
    firstName: { path: 'firstName', type: 'string', filterable: true, sortable: true, searchable: true, label: 'First Name' },
    lastName: { path: 'lastName', type: 'string', filterable: true, sortable: true, searchable: true, label: 'Last Name' },
    email: { path: 'email', type: 'string', filterable: true, sortable: true, searchable: true, label: 'Email' },
    department: { path: 'department', type: 'string', filterable: true, sortable: true, searchable: false, label: 'Department' },
    role: { path: 'role', type: 'string', filterable: true, sortable: true, searchable: true, label: 'Role' },
    status: { path: 'status', type: 'string', filterable: true, sortable: true, searchable: false, label: 'Status' },
    salary: { path: 'salary', type: 'number', filterable: true, sortable: true, searchable: false, label: 'Salary' },
    hireDate: { path: 'hireDate', type: 'date', filterable: true, sortable: true, searchable: false, label: 'Hire Date', defaultSort: 'desc' },
    isRemote: { path: 'isRemote', type: 'boolean', filterable: true, sortable: false, searchable: false, label: 'Remote' },
    createdAt: { path: 'createdAt', type: 'date', filterable: true, sortable: true, searchable: false, label: 'Created' },
  },
  populate: [],
  bulkActions: ['delete', 'archive', 'export', 'updateDepartment'],
  rowActions: ['view', 'edit', 'delete', 'duplicate'],
});

export default Employee;
