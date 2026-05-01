import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Update (edit) a diet meal by ID
export const updateDietMeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { meal_type, eaten_at } = req.body;
  try {
    const { data, error } = await supabase
      .from("meals")
      .update({ meal_type, eaten_at })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.json({ message: "Meal updated successfully", meal: data });
  } catch (error) {
    next(error);
  }
};

// Add a new diet meal
export const addDietMeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_id, meal_type, eaten_at } = req.body;
  try {
    const { data, error } = await supabase
      .from("meals")
      .insert({ user_id, meal_type, eaten_at })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Meal added successfully", meal: data });
  } catch (error) {
    next(error);
  }
};
