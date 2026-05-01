import { Router } from "express";
import { suggestMealsFromIngredients } from "./IngredientController";

const router = Router();

// No auth required — public endpoint
router.post("/ingredients/suggest", suggestMealsFromIngredients);

export default router;
