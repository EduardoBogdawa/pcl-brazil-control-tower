// CSV for Excel (pt-BR): ";" separator, CRLF rows and a BOM so accents and columns open correctly.

// Spreadsheets evaluate cells whose first visible character is a formula trigger, even after leading
// whitespace/control characters. Fullwidth variants are included because some spreadsheet apps normalize them.
const FORMULA_START = /^[\u0000-\u0020\u007f]*[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/;
const CONTROL_START = /^[\u0000-\u001f\u007f]/;

export function csvCell(v) {
  // Real numbers (e.g. -3) are data, not formulas; keep them numeric.
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  let s = Array.isArray(v) ? v.join(', ') : String(v == null ? '' : v);
  // OWASP CSV-injection guidance: a leading apostrophe makes the spreadsheet treat the cell as text.
  if (FORMULA_START.test(s) || CONTROL_START.test(s)) s = "'" + s;
  return /[";\n\r\t]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCsv(header, rows) {
  return '\uFEFF' + [header].concat(rows).map((r) => r.map(csvCell).join(';')).join('\r\n');
}
