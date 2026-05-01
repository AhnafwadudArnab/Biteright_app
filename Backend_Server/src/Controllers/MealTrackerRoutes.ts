// Backend_Server/src/Controllers/MealTrackerRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/auth";
import { addMeal, deleteMeal, getMealsByUser } from "./MealTrackerController";

const router = express.Router();

// Add a meal
router.post("/meals", authMiddleware, addMeal);
// Get all meals for a user
router.get("/meals/:user_id", authMiddleware, getMealsByUser);
// Delete a meal
router.delete("/meals/:meal_id", authMiddleware, deleteMeal);

export default router;
