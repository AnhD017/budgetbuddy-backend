export function calculateSummary(transactions) {
  let income = 0;
  let expense = 0;
  const categoryMap = {};

  transactions.forEach(data => {
    if (data.type === "income") income += data.amount;

    if (data.type === "expense") {
      expense += data.amount;
      categoryMap[data.category] =
        (categoryMap[data.category] || 0) + data.amount;
    }
  });

  return { income, expense, categoryMap };
}