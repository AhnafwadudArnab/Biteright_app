import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Add a food item to a meal
export const addMealItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { meal_id, food_id, quantity, calories } = req.body;
  try {
    const { data, error } = await supabase
      .from("meal_items")
      .insert({ meal_id, food_id, quantity, calories })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Meal item added successfully", item: data });
  } catch (error) {
    next(error);
  }
};

// Update a food item in a meal
export const updateMealItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { quantity, calories } = req.body;
  try {
    const { data, error } = await supabase
      .from("meal_items")
      .update({ quantity, calories })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Meal item not found" });
    }

    res.json({ message: "Meal item updated successfully", item: data });
  } catch (error) {
    next(error);
  }
};
