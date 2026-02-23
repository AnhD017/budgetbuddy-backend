export function calculateComparison(currentExpense, prevExpense) {
  if (prevExpense === 0) {
    return {
      expenseChangePercent: 0,
      comparisonInsight: "No previous data available."
    };
  }

  const percent =
    ((currentExpense - prevExpense) / prevExpense) * 100;

  let insight;

  if (percent > 0) {
    insight =
      `Spending increased by ${percent.toFixed(1)}% compared to previous period.`;
  } else if (percent < 0) {
    insight =
      `Spending decreased by ${Math.abs(percent).toFixed(1)}% compared to previous period.`;
  } else {
    insight = "Spending is unchanged compared to previous period.";
  }

  return {
    expenseChangePercent: percent,
    comparisonInsight: insight
  };
}