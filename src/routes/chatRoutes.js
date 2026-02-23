import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { db } from "../config/firebase.js";
import { getAIResponse } from "../services/openaiService.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    //  Get user transactions
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

    // Build structured context
    const context = `
User Financial Summary:
Total Income: ${income}
Total Expense: ${expense}
Balance: ${income - expense}

User Question:
${message}
`;

    //  Send to OpenAI
    const aiResponse = await getAIResponse(context);

    res.json({ reply: aiResponse });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;