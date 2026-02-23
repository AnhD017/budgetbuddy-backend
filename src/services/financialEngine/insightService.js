export function generateInsights(income, expense, categoryMap) {
  const insights = [];

  if (income === 0 && expense > 0) {
    insights.push("You have expenses but no recorded income.");
  } else {
    const ratio = income > 0 ? expense / income : 0;

    if (ratio > 0.9) {
      insights.push("Your expenses are very close to your income.");
    } else if (ratio > 0.75) {
      insights.push("You are spending a large portion of your income.");
    } else {
      insights.push("Your spending level appears healthy.");
    }
  }

  let topCategory = null;
  let maxAmount = 0;

  for (const category in categoryMap) {
    if (categoryMap[category] > maxAmount) {
      maxAmount = categoryMap[category];
      topCategory = category;
    }
  }

  if (topCategory) {
    insights.push(`Your highest spending category is ${topCategory}.`);
  }

  return insights;
}