import type { VResult } from './types';
import { t } from './i18n';
import { cfg } from './currency';

export const OK: VResult = { valid: true };

export function vAge(str: string, max: number): VResult {
  if (str === '') return { valid: false, error: t().vEnter };
  if (!/^\d+$/.test(str)) return { valid: false, error: t().vPosInt };
  const v = parseInt(str, 10);
  if (v < 1 || v > max) return { valid: false, error: t().vRange(max) };
  return OK;
}

export function vPercent(str: string): VResult {
  if (str === '') return { valid: false, error: t().vEnter };
  if (!/^\d+(\.\d{0,2})?$/.test(str)) return { valid: false, error: t().vPercent };
  const v = parseFloat(str);
  if (v < 0 || v > 100) return { valid: false, error: t().vPercent };
  return OK;
}

export function vMoney(str: string): VResult {
  const err = cfg().validateMoney(str);
  return err ? { valid: false, error: err } : OK;
}
