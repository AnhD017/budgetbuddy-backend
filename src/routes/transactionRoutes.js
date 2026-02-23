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

// MONTHLY SUMMARY
router.get("/summary/monthly", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .get();

    let income = 0;
    let expense = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === "income") income += data.amount;
      if (data.type === "expense") expense += data.amount;
    });

    res.json({
      income,
      expense,
      balance: income - expense
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;