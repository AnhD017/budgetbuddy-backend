export function calculateTrends(transactions, period) {
  const trendMap = {};

  transactions.forEach(data => {
    const date = data.createdAt.toDate();
    let key;

    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "monthly") {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    } else {
      key = date.toISOString().split("T")[0];
    }

    if (!trendMap[key]) trendMap[key] = 0;

    if (data.type === "expense") {
      trendMap[key] += data.amount;
    }
  });

  return Object.keys(trendMap).map(key => ({
    period: key,
    expense: trendMap[key]
  }));
}