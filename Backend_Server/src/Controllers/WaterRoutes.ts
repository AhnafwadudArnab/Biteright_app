import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getTodayWater, logWater, resetTodayWater } from "./WaterController";

const router = Router();

router.post("/water", authMiddleware, logWater);
router.get("/water/today", authMiddleware, getTodayWater);
router.delete("/water/reset", authMiddleware, resetTodayWater);

export default router;
