export function formatDateVI(date: Date | string): string {
  const d = new Date(date)
  return `${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`
}

export function formatDateShortVI(date: Date | string): string {
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
