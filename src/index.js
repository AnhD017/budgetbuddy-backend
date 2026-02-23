import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import { db } from "./config/firebase.js";
import authRoutes from "./routes/authRoutes.js";
import verifyToken from "./middleware/verifyToken.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// temporary for development 
import { admin } from "./config/firebase.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user.uid
  });
});
app.use("/transactions", transactionRoutes);



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

// temporary
app.get("/dev-token/:uid", async (req, res) => {
  const token = await admin.auth().createCustomToken(req.params.uid);
  res.json({ token });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use("/chat", chatRoutes);

app.get("/env-test", (req, res) => {
  res.json({ keyLoaded: !!process.env.OPENAI_API_KEY });
});