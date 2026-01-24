import { Request, Response } from "express";
import DietMeal from "../models/dietMealModel";

// Update (edit) a diet meal by ID
export const updateDietMeal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { meal_type, eaten_at } = req.body;
  try {
    const meal = await DietMeal.findByPk(id);
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }
    meal.meal_type = meal_type ?? meal.meal_type;
    meal.eaten_at = eaten_at ?? meal.eaten_at;
    await meal.save();
    res.json({ message: "Meal updated successfully", meal });
  } catch (error) {
    res.status(500).json({ message: "Error updating meal", error });
  }
};

// Add a new diet meal
export const addDietMeal = async (req: Request, res: Response) => {
  const { user_id, meal_type, eaten_at } = req.body;
  try {
    const meal = await DietMeal.create({ user_id, meal_type, eaten_at });
    res.status(201).json({ message: "Meal added successfully", meal });
  } catch (error) {
    res.status(500).json({ message: "Error adding meal", error });
  }
};
