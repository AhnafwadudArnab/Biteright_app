import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getStreak, resetStreak, upsertStreak } from "./StreakController";

const router = Router();

router.get("/streak", authMiddleware, getStreak);
router.put("/streak", authMiddleware, upsertStreak);
router.post("/streak/reset", authMiddleware, resetStreak);

export default router;
