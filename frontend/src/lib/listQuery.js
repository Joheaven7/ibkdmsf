/** Default bulk fetch for dashboards (server-side cap). */
export const BULK_LIST_QUERY = 'page=1&limit=250';

export function buildListQuery({ page = 1, limit = 25, search = '', ...filters } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  if (search) params.set('search', search);
  return params.toString();
}

export function monthLabel(entry) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!entry?._id?.month) return '';
  return `${MONTHS[entry._id.month - 1]} ${entry._id.year}`;
}

export function seriesFromMonthly(rows, key = 'count') {
  return (rows ?? []).map((m) => ({
    month: monthLabel(m),
    value: m.count ?? m[key] ?? 0,
  }));
}

export function exportToCsv(filename, rows, columns) {
  const header = columns.map((c) => c.label).join(',');
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = c.get(row);
      const str = val == null ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
