export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250, 500];

export const DENSITY_OPTIONS = [
  { value: 'compact', label: 'Compact', rowHeight: 32 },
  { value: 'comfortable', label: 'Comfortable', rowHeight: 44 },
  { value: 'spacious', label: 'Spacious', rowHeight: 56 },
];

export const FILTER_OPERATORS = {
  string: [
    { value: 'eq', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'ne', label: 'Not equal' },
  ],
  number: [
    { value: 'eq', label: 'Equals' },
    { value: 'gt', label: 'Greater than' },
    { value: 'gte', label: 'Greater or equal' },
    { value: 'lt', label: 'Less than' },
    { value: 'lte', label: 'Less or equal' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'eq', label: 'On' },
    { value: 'gte', label: 'After' },
    { value: 'lte', label: 'Before' },
    { value: 'between', label: 'Between' },
  ],
  boolean: [{ value: 'eq', label: 'Is' }],
};

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', icon: 'bi-filetype-csv' },
  { value: 'xlsx', label: 'Excel', icon: 'bi-filetype-xlsx' },
  { value: 'json', label: 'JSON', icon: 'bi-filetype-json' },
];

export default { PAGE_SIZE_OPTIONS, DENSITY_OPTIONS, FILTER_OPERATORS, EXPORT_FORMATS };
