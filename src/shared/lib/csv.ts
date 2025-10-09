export type CsvValue = string | number | boolean | Date | null | undefined;

export interface CsvColumn<T = any> {
  key: keyof T | string;
  header: string;
  format?: (value: any, row: T) => string;
}

function escapeCsv(value: string): string {
  // Escape double quotes by doubling them; wrap in quotes if contains delimiter/newline/quote
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function toCsv<T = any>(rows: T[], columns: CsvColumn<T>[], delimiter = ','): string {
  const headers = columns.map(c => escapeCsv(c.header)).join(delimiter);
  const lines = rows.map(row => {
    const cells = columns.map(col => {
      const raw = typeof col.key === 'string' ? (row as any)[col.key] : (row as any)[col.key as any];
      const formatted = col.format ? col.format(raw, row) : raw;
      let str: string;
      if (formatted instanceof Date) str = formatted.toISOString();
      else if (formatted === null || formatted === undefined) str = '';
      else str = String(formatted);
      return escapeCsv(str);
    });
    return cells.join(delimiter);
  });
  return [headers, ...lines].join('\n');
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
