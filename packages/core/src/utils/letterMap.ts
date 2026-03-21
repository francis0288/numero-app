export const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

export function getLetterValue(char: string): number {
  return PYTHAGOREAN_MAP[char.toUpperCase()] ?? 0
}

export function isVowel(char: string): boolean {
  return VOWELS.has(char.toUpperCase())
}

export function isConsonant(char: string): boolean {
  const upper = char.toUpperCase()
  return upper in PYTHAGOREAN_MAP && !VOWELS.has(upper)
}

const VI_MAP: Record<string, string> = {
  à:'a',á:'a',â:'a',ã:'a',ä:'a',å:'a',ā:'a',ă:'a',ạ:'a',ả:'a',ấ:'a',ầ:'a',ẩ:'a',ẫ:'a',ậ:'a',ắ:'a',ằ:'a',ẳ:'a',ẵ:'a',ặ:'a',
  è:'e',é:'e',ê:'e',ë:'e',ē:'e',ĕ:'e',ę:'e',ẹ:'e',ẻ:'e',ẽ:'e',ế:'e',ề:'e',ể:'e',ễ:'e',ệ:'e',
  ì:'i',í:'i',î:'i',ï:'i',ī:'i',ĭ:'i',į:'i',ị:'i',ỉ:'i',ĩ:'i',
  ò:'o',ó:'o',ô:'o',õ:'o',ö:'o',ō:'o',ŏ:'o',ơ:'o',ọ:'o',ỏ:'o',ố:'o',ồ:'o',ổ:'o',ỗ:'o',ộ:'o',ớ:'o',ờ:'o',ở:'o',ỡ:'o',ợ:'o',
  ù:'u',ú:'u',û:'u',ü:'u',ū:'u',ŭ:'u',ů:'u',ư:'u',ụ:'u',ủ:'u',ứ:'u',ừ:'u',ử:'u',ữ:'u',ự:'u',ũ:'u',
  ỳ:'y',ý:'y',ÿ:'y',ỵ:'y',ỷ:'y',ỹ:'y',
  đ:'d',
}

export function stripVietnamese(name: string): string {
  return name
    .split('')
    .map(c => VI_MAP[c] ?? VI_MAP[c.toLowerCase()]?.toUpperCase() ?? c)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
