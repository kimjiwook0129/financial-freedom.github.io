export type Lang = 'ko' | 'en';
export type CurrencyCode = 'KRW' | 'USD';
export type VResult = { valid: boolean; error?: string };

export interface SimulationInput {
  currentAge: number;
  retirementAge: number;
  targetAge: number;
  currentNetWorth: number;
  cagr: number;
  annualIncome: number;
  incomeIncrease: number;
  annualExpense: number;
  expenseIncrease: number;
}

export interface SimulationResult {
  ages: string[];
  netWorths: number[];
  incomes: number[];
  expenses: number[];
  brokeAge: number | null;
  freedomAge: number | null;
  endNetWorth: number;
  freedomAchieved: boolean;
  retirementIdx: number;
}
