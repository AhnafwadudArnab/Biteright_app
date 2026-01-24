import { Request, Response } from "express";
import MealItem from "../models/mealItemModel";

// Add a food item to a meal
export const addMealItem = async (req: Request, res: Response) => {
  const { meal_id, food_id, quantity, calories } = req.body;
  try {
    const item = await MealItem.create({
      meal_id,
      food_id,
      quantity,
      calories,
    });
    res.status(201).json({ message: "Meal item added successfully", item });
  } catch (error) {
    res.status(500).json({ message: "Error adding meal item", error });
  }
};

// Update a food item in a meal
export const updateMealItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, calories } = req.body;
  try {
    const item = await MealItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Meal item not found" });
    }
    item.quantity = quantity ?? item.quantity;
    item.calories = calories ?? item.calories;
    await item.save();
    res.json({ message: "Meal item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: "Error updating meal item", error });
  }
};
