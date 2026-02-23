import { generateSummary } from "../services/financeService.js";

router.get("/summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const now = new Date();

    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date();

    const prevStartDate =
      new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const prevEndDate =
      new Date(now.getFullYear(), now.getMonth(), 0);

    const result = await generateSummary(
      userId,
      startDate,
      endDate,
      prevStartDate,
      prevEndDate
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});