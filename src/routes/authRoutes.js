import express from "express";
import { admin, db } from "../config/firebase.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Store user in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;