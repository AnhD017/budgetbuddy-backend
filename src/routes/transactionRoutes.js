import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


// CREATE TRANSACTION
router.post("/", verifyToken, async (req, res) => {
  try {
    const { amount, category, type } = req.body;

    const userId = req.user.uid;

    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .add({
        amount,
        category,
        type, // income or expense
        createdAt: new Date()
      });

    res.status(201).json({
      message: "Transaction added",
      id: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL TRANSACTIONS
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Time filtering 
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period, start, end } = req.query;

    let startDate, endDate;
    const now = new Date();

    if (period === "daily") {
      startDate = new Date(now.setHours(0,0,0,0));
      endDate = new Date();
    } 
    else if (period === "weekly") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      endDate = new Date();
    } 
    else if (period === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
    } 
    else if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
    }

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .get();

    let income = 0;
    let expense = 0;
    const categoryMap = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === "income") income += data.amount;
      if (data.type === "expense") {
        expense += data.amount;
        categoryMap[data.category] = 
          (categoryMap[data.category] || 0) + data.amount;
      }
    });

    const overspending = expense > income * 0.9;

    res.json({
      period,
      income,
      expense,
      balance: income - expense,
      overspending, 
      categoryBreakdown: categoryMap
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/trends", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { period } = req.query;

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .get();

    const trendMap = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt.toDate();

      let key;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        key = date.toISOString().split("T")[0];
      }

      if (!trendMap[key]) {
        trendMap[key] = 0;
      }

      if (data.type === "expense") {
        trendMap[key] += data.amount;
      }
    });

    const result = Object.keys(trendMap).map(key => ({
      period: key,
      expense: trendMap[key]
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;