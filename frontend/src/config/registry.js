import employeesGridConfig from './example.config.js';

/**
 * Add one entry per resource you register on the backend
 * (see backend/src/modules/datagrid/datagrid.registry.js).
 */
export const gridConfigRegistry = {
  employees: employeesGridConfig,
};

export function getGridConfig(resource) {
  return gridConfigRegistry[resource];
}

export function listGridConfigs() {
  return Object.values(gridConfigRegistry);
}

export default gridConfigRegistry;
