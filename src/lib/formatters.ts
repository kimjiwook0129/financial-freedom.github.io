import { lang } from './i18n';

const KO_UNITS: [number, string][] = [
  [1e68, '무량대수'], [1e64, '불가사의'], [1e60, '나유타'], [1e56, '아승기'], [1e52, '항하사'],
  [1e48, '극'], [1e44, '재'], [1e40, '정'], [1e36, '간'], [1e32, '구'], [1e28, '양'],
  [1e24, '자'], [1e20, '해'], [1e16, '경'], [1e12, '조'], [1e8, '억'], [1e4, '만'],
];

const EN_UNITS_FULL: [number, string][] = [
  [1e69, 'Duovigintillion'], [1e66, 'Unvigintillion'], [1e63, 'Vigintillion'],
  [1e60, 'Novemdecillion'], [1e57, 'Octodecillion'], [1e54, 'Septendecillion'],
  [1e51, 'Sexdecillion'], [1e48, 'Quindecillion'], [1e45, 'Quattuordecillion'],
  [1e42, 'Tredecillion'], [1e39, 'Duodecillion'], [1e36, 'Undecillion'],
  [1e33, 'Decillion'], [1e30, 'Nonillion'], [1e27, 'Octillion'], [1e24, 'Septillion'],
  [1e21, 'Sextillion'], [1e18, 'Quintillion'], [1e15, 'Quadrillion'], [1e12, 'Trillion'],
  [1e9, 'Billion'], [1e6, 'Million'],
];

const EN_UNITS_SHORT: [number, string][] = [
  [1e69, 'DVg'], [1e66, 'UVg'], [1e63, 'Vg'], [1e60, 'NoDc'], [1e57, 'OcDc'], [1e54, 'SpDc'],
  [1e51, 'SxDc'], [1e48, 'QiDc'], [1e45, 'QaDc'], [1e42, 'TDc'], [1e39, 'DDc'], [1e36, 'UDc'],
  [1e33, 'Dc'], [1e30, 'No'], [1e27, 'Oc'], [1e24, 'Sp'], [1e21, 'Sx'], [1e18, 'Qn'],
  [1e15, 'Qd'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K'],
];

export function formatLargeKo(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  for (const [threshold, unit] of KO_UNITS) {
    if (abs >= threshold) return sign + (abs / threshold).toFixed(1) + ' ' + unit;
  }
  return value.toLocaleString('ko-KR');
}

export function formatLargeEn(value: number, withDollar = true): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = withDollar ? '$' : '';
  for (const [threshold, unit] of EN_UNITS_FULL) {
    if (abs >= threshold) return sign + prefix + (abs / threshold).toFixed(1) + ' ' + unit;
  }
  return prefix + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatMoneyShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (lang === 'ko') {
    for (const [threshold, unit] of KO_UNITS) {
      if (abs >= threshold) return sign + (abs / threshold).toFixed(1) + unit;
    }
    return value.toLocaleString('ko-KR');
  } else {
    for (const [threshold, unit] of EN_UNITS_SHORT) {
      if (abs >= threshold) return sign + (abs / threshold).toFixed(1) + unit;
    }
    return sign + abs.toFixed(0);
  }
}
