import express from "express";
import { authMiddleware } from "../middleware/auth";
import { addMeal, deleteMeal, getMealsByUser, updateMeal } from "./MealTrackerController";

const router = express.Router();

router.post("/meals", authMiddleware, addMeal);
router.get("/meals/:user_id", authMiddleware, getMealsByUser);
router.put("/meals/:meal_id", authMiddleware, updateMeal);
router.delete("/meals/:meal_id", authMiddleware, deleteMeal);

export default router;
