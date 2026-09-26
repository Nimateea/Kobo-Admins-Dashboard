export function toCsv(headers: string[], rows: unknown[][]): string {
  const encode = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return [headers, ...rows].map((row) => row.map(encode).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const blob = new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}