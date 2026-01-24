// Backend_Server/src/Controllers/MealTrackerRoutes.ts
import express from "express";
import { addMeal, getMealsByUser, deleteMeal } from "./MealTrackerController";

const router = express.Router();

// Add a meal
router.post("/meals", addMeal);
// Get all meals for a user
router.get("/meals/:user_id", getMealsByUser);
// Delete a meal
router.delete("/meals/:meal_id", deleteMeal);

export default router;
