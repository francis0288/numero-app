export const ORDINAL_VI: Record<number, string> = {
  1: 'Thứ Nhất',
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
}

export function translateOrdinal(label: string | undefined, fallback: string): string {
  if (!label) return fallback
  const map: Record<string, string> = {
    'First': 'Thứ Nhất',
    'Second': 'Thứ Hai',
    'Third': 'Thứ Ba',
    'Fourth (Major)': 'Thứ Tư (Chính)',
    'Fourth': 'Thứ Tư',
  }
  for (const [en, vi] of Object.entries(map)) {
    if (label.startsWith(en)) return label.replace(en, vi)
  }
  return label
}
