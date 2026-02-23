import { db } from "../config/firebase.js";
import { calculateSummary } from "./financialEngine/summaryService.js";
import { calculateComparison } from "./financialEngine/comparisonService.js";
import { generateInsights } from "./financialEngine/insightService.js";
import { calculateTrends } from "./financialEngine/trendService.js";

export async function generateSummary(userId, startDate, endDate, prevStartDate, prevEndDate) {

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("transactions")
    .where("createdAt", ">=", startDate)
    .where("createdAt", "<=", endDate)
    .get();

  const transactions = snapshot.docs.map(doc => doc.data());

  const { income, expense, categoryMap } =
    calculateSummary(transactions);

  // previous period
  let prevExpense = 0;

  if (prevStartDate && prevEndDate) {
    const prevSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .where("createdAt", ">=", prevStartDate)
      .where("createdAt", "<=", prevEndDate)
      .get();

    prevSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === "expense") prevExpense += data.amount;
    });
  }

  const comparison =
    calculateComparison(expense, prevExpense);

  const insights =
    generateInsights(income, expense, categoryMap);

  return {
    income,
    expense,
    balance: income - expense,
    categoryBreakdown: categoryMap,
    ...comparison,
    insights
  };
}