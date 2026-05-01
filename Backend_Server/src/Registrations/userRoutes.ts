import express from "express";
import { authMiddleware } from "../middleware/auth";
import { addDietMeal, updateDietMeal } from "./dietMealController";
import { addMealItem, updateMealItem } from "./mealItemController";
import { getMealPlanByBmi } from "./mealPlanController";
import {
    forgotPassword,
    getAvatarUploadUrl,
    loginUser,
    registerUser,
    resetPassword,
    saveAvatarUrl,
} from "./userController";

const router = express.Router();

router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.get("/mealplan",         getMealPlanByBmi);

// Password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Avatar
router.post("/avatar/upload-url", authMiddleware, getAvatarUploadUrl);
router.put("/avatar",             authMiddleware, saveAvatarUrl);

// Diet meal
router.post("/dietmeal",        addDietMeal);
router.put("/dietmeal/:id",     updateDietMeal);

// Meal item
router.post("/mealitem",        addMealItem);
router.put("/mealitem/:id",     updateMealItem);

export default router;
