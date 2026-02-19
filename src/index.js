import express from "express";
import cors from "cors";
import { db } from "./config/firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  console.log("✅ /health route hit");

  try {
    const doc = await db.collection("test").add({
      message: "Firebase connected",
      createdAt: new Date(),
    });

    res.json({ success: true, id: doc.id });
  } catch (error) {
    console.error("❌ Firebase error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});