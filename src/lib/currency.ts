import type { CurrencyCode } from './types';
import { lang, t } from './i18n';
import { formatLargeKo, formatLargeEn } from './formatters';

export let currency: CurrencyCode = 'KRW';
export function setCurrencyState(c: CurrencyCode) { currency = c; }

export const CURRENCY = {
  KRW: {
    suffix() { return lang === 'ko' ? '원' : '₩'; },
    defaults: { currentNetWorth: '100000000', annualIncome: '40000000', annualExpense: '30000000' },
    inputMode: 'numeric' as const,
    parseMoney(str: string): number {
      return parseInt(str.replace(/,/g, ''), 10) || 0;
    },
    validateMoney(str: string): string | null {
      const cleaned = str.replace(/,/g, '');
      if (cleaned === '') return null;
      if (!/^\d+$/.test(cleaned)) return t().vKrwInt;
      const val = parseInt(cleaned, 10);
      if (val > 999_999_999_999) return t().vKrwMax;
      return null;
    },
    formatFull(value: number, cap = false): string {
      if (cap && Math.abs(value) > 999_999_999_999) {
        if (lang === 'ko') return formatLargeKo(value) + '원';
        return '₩' + formatLargeEn(value, false);
      }
      if (lang === 'ko') return value.toLocaleString('ko-KR') + '원';
      return '₩' + value.toLocaleString('ko-KR');
    },
  },
  USD: {
    suffix() { return '$'; },
    defaults: { currentNetWorth: '100000.00', annualIncome: '40000.00', annualExpense: '30000.00' },
    inputMode: 'decimal' as const,
    parseMoney(str: string): number {
      return parseFloat(str.replace(/,/g, '')) || 0;
    },
    validateMoney(str: string): string | null {
      const cleaned = str.replace(/,/g, '');
      if (cleaned === '') return null;
      if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return t().vUsdDec;
      const val = parseFloat(cleaned);
      if (val > 999_999_999.99) return t().vUsdMax;
      return null;
    },
    formatFull(value: number, cap = false): string {
      if (cap && Math.abs(value) > 999_999_999_999) {
        if (lang === 'ko') return '$' + formatLargeKo(value);
        return formatLargeEn(value);
      }
      return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
};

export function cfg() { return CURRENCY[currency]; }
export function formatMoneyFull(v: number, cap = false) { return cfg().formatFull(v, cap); }
export function parseMoney(s: string) { return cfg().parseMoney(s); }
