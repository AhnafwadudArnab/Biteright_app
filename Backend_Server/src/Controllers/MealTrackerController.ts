// Backend_Server/src/Controllers/MealTrackerController.ts
import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

interface Meal {
  id: string;
  user_id: string;
  meal_type: string;
  eaten_at: string;
  items?: any[];
  [key: string]: any;
}

// Add a new meal for a user
export const addMeal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user_id, meal_type, eaten_at, items } = req.body;

  // Insert meal row — let gen_random_uuid() handle the ID in the DB
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({ user_id, meal_type, eaten_at })
    .select()
    .single();

  if (mealError) return next(mealError);

  // Insert each meal item
  for (const item of items) {
    const { food_id, quantity, calories } = item;
    const { error: itemError } = await supabase
      .from("meal_items")
      .insert({ meal_id: meal.id, food_id, quantity, calories });

    if (itemError) return next(itemError);
  }

  res.status(201).json({ message: "Meal added successfully", mealId: meal.id });
};

// Get all meals for a user (with items and food names)
export const getMealsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user_id } = req.params;

  const { data: meals, error } = await supabase
    .from("meals")
    .select("*, meal_items(*, foods(name))")
    .eq("user_id", user_id)
    .order("eaten_at", { ascending: false });

  if (error) return next(error);

  res.json(meals);
};

// Delete a meal
export const deleteMeal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { meal_id } = req.params;

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", meal_id);

  if (error) return next(error);

  res.json({ message: "Meal deleted successfully" });
};
