import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getTodayWater, getWaterGoal, logWater, resetTodayWater, setWaterGoal } from "./WaterController";

const router = Router();

router.post("/water", authMiddleware, logWater);
router.get("/water/today", authMiddleware, getTodayWater);
router.delete("/water/reset", authMiddleware, resetTodayWater);
router.get("/water/goal", authMiddleware, getWaterGoal);
router.put("/water/goal", authMiddleware, setWaterGoal);

export default router;
