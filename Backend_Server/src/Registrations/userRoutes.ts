import express from "express";
import { addDietMeal, updateDietMeal } from "./dietMealController";
import { addMealItem, updateMealItem } from "./mealItemController";
import { getMealPlanByBmi } from "./mealPlanController";
import { loginUser, signupUser } from "./userController";

const router = express.Router();

// Route for user registration
router.post("/register", signupUser);

// Route for user login
router.post("/login", loginUser);
// Route for fetching meal plan by BMI
router.get("/mealplan", getMealPlanByBmi);

// Route to update a diet meal
router.put("/dietmeal/:id", updateDietMeal);
// Route to add a new diet meal
router.post("/dietmeal", addDietMeal);

// Route to add a food item to a meal
router.post("/mealitem", addMealItem);
// Route to update a food item in a meal
router.put("/mealitem/:id", updateMealItem);

export default router;
