import { db } from "../config/firebase.js";
import { calculateSummary } from "./financialEngine/summaryService.js";
import { calculateComparison } from "./financialEngine/comparisonService.js";
import { generateInsights } from "./financialEngine/insightService.js";
import { calculateTrends } from "./financialEngine/trendService.js";
import { buildFinancialContext }
  from "./financialEngine/contextBuilder.js";
import { calculateHealthScore }
  from "./financialEngine/healthScoreService.js";
import { detectSpendingAnomalies }
  from "./financialEngine/anomalyService.js";

export async function generateSummary(userId, startDate, endDate, prevStartDate, prevEndDate) {

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("transactions")
    .where("createdAt", ">=", startDate)
    .where("createdAt", "<=", endDate)
    .get();

  const transactions = snapshot.docs.map(doc => doc.data());

  const timelineMap = {};

  transactions.forEach((t) => {

    if (t.type !== "expense") return;

    const date = new Date(t.createdAt.toDate())
      .toISOString()
      .slice(0, 10); // YYYY-MM-DD

    if (!timelineMap[date]) {
      timelineMap[date] = {};
    }

    const category = t.category;

    if (!timelineMap[date][category]) {
      timelineMap[date][category] = 0;
    }

    timelineMap[date][category] += t.amount;

  });

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

  const context = buildFinancialContext({
  income,
  expense,
  categoryBreakdown: categoryMap,
  expenseChangePercent: comparison.expenseChangePercent
});

// Fetch budget for this month
const monthKey =
  `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;

const budgetDoc = await db
  .collection("users")
  .doc(userId)
  .collection("budgets")
  .doc(monthKey)
  .get();

let budgetAnalysis = {};

if (budgetDoc.exists) {
  const budgets = budgetDoc.data();

  for (const category in budgets) {
    const spent = categoryMap[category] || 0;
    const limit = budgets[category];

    const percentUsed = (spent / limit) * 100;

    // Forecast logic
const totalDaysInPeriod =
  Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

const today = new Date();
const daysElapsed =
  Math.min(
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1,
    totalDaysInPeriod
  );

let projectedSpend = 0;
let projectedExceeded = false;
let projectedOverAmount = 0;

if (daysElapsed > 0) {
  const dailyAverage = spent / daysElapsed;
  projectedSpend = dailyAverage * totalDaysInPeriod;

  if (projectedSpend > limit) {
    projectedExceeded = true;
    projectedOverAmount = projectedSpend - limit;
  }
}

    budgetAnalysis[category] = {
      budget: limit,
      spent,
      percentUsed: Number(percentUsed.toFixed(1)),
      exceeded: spent > limit,
      warning: percentUsed >= 80 && percentUsed <= 100,

       forecast: {
    projectedSpend: Number(projectedSpend.toFixed(2)),
    projectedExceeded,
    projectedOverAmount: Number(projectedOverAmount.toFixed(2))
  }
    };
  }
}

const healthScoreData = calculateHealthScore({
  income,
  expense,
  balance: income - expense,
  context,
  budgetAnalysis
});

const anomalies =
  detectSpendingAnomalies(transactions);

const spendingTimeline =
  Object.entries(timelineMap).map(([date, categories]) => ({
    date,
    ...categories
  }));

return {
  income,
  expense,
  balance: income - expense,
  categoryBreakdown: categoryMap,
  spendingTimeline,
  ...comparison,
  insights,
  context,
  budgetAnalysis,
  anomalies,
  ...healthScoreData
};
}