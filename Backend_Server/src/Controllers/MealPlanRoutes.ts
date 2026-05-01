import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getLatestMealPlan, saveMealPlan } from "./MealPlanController";

const router = Router();

router.post("/mealplan/save", authMiddleware, saveMealPlan);
router.get("/mealplan/latest", authMiddleware, getLatestMealPlan);

export default router;
