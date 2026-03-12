import type { SimulationInput, SimulationResult } from './types';

export function simulate(input: SimulationInput): SimulationResult {
  const { currentAge, retirementAge, targetAge, currentNetWorth, cagr, annualIncome, incomeIncrease, annualExpense, expenseIncrease } = input;

  const ages: string[] = [];
  const netWorths: number[] = [];
  const incomes: number[] = [];
  const expenses: number[] = [];

  let nw = currentNetWorth;
  let income = annualIncome;
  let expense = annualExpense;
  let brokeAge: number | null = null;

  for (let age = currentAge; age <= targetAge; age++) {
    ages.push(age.toString());
    netWorths.push(Math.round(nw));
    incomes.push(Math.round(age < retirementAge ? income : 0));
    expenses.push(Math.round(expense));

    if (brokeAge === null && age > currentAge && nw <= 0) {
      brokeAge = age;
    }

    const returns = nw > 0 ? nw * cagr : 0;
    if (age < retirementAge) {
      nw = nw + returns + income - expense;
    } else {
      nw = nw + returns - expense;
    }

    income = income * (1 + incomeIncrease);
    expense = expense * (1 + expenseIncrease);
  }

  // Financial freedom age
  let freedomAge: number | null = null;
  for (let startAge = currentAge; startAge <= targetAge; startAge++) {
    const idx = startAge - currentAge;
    if (idx >= netWorths.length) break;
    let simNw = netWorths[idx];
    let simExpense = annualExpense * Math.pow(1 + expenseIncrease, idx);
    let survived = true;
    for (let age = startAge; age < targetAge; age++) {
      simNw = simNw + (simNw > 0 ? simNw * cagr : 0) - simExpense;
      simExpense = simExpense * (1 + expenseIncrease);
      if (simNw < 0) { survived = false; break; }
    }
    if (survived && simNw >= 0) {
      freedomAge = startAge;
      break;
    }
  }

  const endNetWorth = netWorths.length > 0 ? netWorths[netWorths.length - 1] : 0;
  const freedomAchieved = endNetWorth >= 0;
  const retirementIdx = Math.min(Math.max(retirementAge - currentAge, 0), netWorths.length - 1);

  return { ages, netWorths, incomes, expenses, brokeAge, freedomAge, endNetWorth, freedomAchieved, retirementIdx };
}
