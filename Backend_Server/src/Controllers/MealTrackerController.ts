// Backend_Server/src/Controllers/MealTrackerController.ts
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../models/db";
import { QueryTypes } from "sequelize";

interface Meal {
  id: string;
  user_id: string;
  meal_type: string;
  eaten_at: string;
  items?: any[];
  [key: string]: any;
}

// Add a new meal for a user
export const addMeal = async (req: Request, res: Response) => {
  try {
    const { user_id, meal_type, eaten_at, items } = req.body;
    const mealId = uuidv4();
    await db.query(
      "INSERT INTO meals (id, user_id, meal_type, eaten_at) VALUES (?, ?, ?, ?)",
      {
        replacements: [mealId, user_id, meal_type, eaten_at],
        type: QueryTypes.INSERT,
      },
    );
    // items: [{ food_id, quantity, calories }]
    for (const item of items) {
      await db.query(
        "INSERT INTO meal_items (id, meal_id, food_id, quantity, calories) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [
            uuidv4(),
            mealId,
            item.food_id,
            item.quantity,
            item.calories,
          ],
          type: QueryTypes.INSERT,
        },
      );
    }
    res.status(201).json({ message: "Meal added successfully", mealId });
  } catch (error) {
    res.status(500).json({ error: "Failed to add meal", details: error });
  }
};

// Get all meals for a user (with items)
export const getMealsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const mealsResult = await db.query(
      "SELECT * FROM meals WHERE user_id = ? ORDER BY eaten_at DESC",
      {
        replacements: [user_id],
        type: QueryTypes.SELECT,
      },
    );
    const meals: Meal[] = Array.isArray(mealsResult)
      ? (mealsResult as Meal[])
      : [];
    for (const meal of meals) {
      const itemsResult = await db.query(
        "SELECT mi.*, f.name as food_name FROM meal_items mi JOIN foods f ON mi.food_id = f.id WHERE meal_id = ?",
        {
          replacements: [meal.id],
          type: QueryTypes.SELECT,
        },
      );
      meal.items = Array.isArray(itemsResult) ? itemsResult : [];
    }
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch meals", details: error });
  }
};

// Delete a meal
export const deleteMeal = async (req: Request, res: Response) => {
  try {
    const { meal_id } = req.params;
    await db.query("DELETE FROM meals WHERE id = ?", {
      replacements: [meal_id],
      type: QueryTypes.DELETE,
    });
    res.json({ message: "Meal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete meal", details: error });
  }
};
