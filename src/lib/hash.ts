export const FIELD_ORDER = [
  'currentAge', 'retirementAge', 'targetAge',
  'currentNetWorth', 'cagr',
  'annualIncome', 'incomeIncrease',
  'annualExpense', 'expenseIncrease',
] as const;

export function toBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): string {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return atob(b);
}

export function encodeState(
  lang: string,
  currency: string,
  fieldValues: Record<string, string>,
): string {
  const parts = ['1', lang, currency];
  for (const key of FIELD_ORDER) {
    parts.push((fieldValues[key] || '').replace(/,/g, ''));
  }
  return '#' + toBase64Url(parts.join('|'));
}

export function decodeState(hash: string): { lang: string; currency: string; fields: Record<string, string> } | null {
  if (!hash) return null;
  try {
    const decoded = fromBase64Url(hash);
    const parts = decoded.split('|');
    if (parts[0] !== '1') return null;
    const fields: Record<string, string> = {};
    for (let i = 0; i < FIELD_ORDER.length; i++) {
      const val = parts[3 + i];
      if (val !== undefined && val !== '') {
        fields[FIELD_ORDER[i]] = val;
      }
    }
    return { lang: parts[1], currency: parts[2], fields };
  } catch { return null; }
}
