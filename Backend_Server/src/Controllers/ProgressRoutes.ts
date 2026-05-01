import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
    addWeightEntry,
    getTodayNutrition,
    getWeightHistory,
    upsertTodayNutrition,
} from "./ProgressController";

const router = Router();

router.get("/progress/weight", authMiddleware, getWeightHistory);
router.post("/progress/weight", authMiddleware, addWeightEntry);
router.get("/progress/nutrition/today", authMiddleware, getTodayNutrition);
router.post("/progress/nutrition/today", authMiddleware, upsertTodayNutrition);

export default router;
