export function formatCell(value, column) {
  if (value === null || value === undefined || value === '') return '—';

  switch (column.format) {
    case 'currency':
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
    case 'date':
      return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
}

export function highlightMatch(text, term) {
  if (!term || text == null) return text;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return str;
  return {
    before: str.slice(0, idx),
    match: str.slice(idx, idx + term.length),
    after: str.slice(idx + term.length),
  };
}

export default { formatCell, highlightMatch };
