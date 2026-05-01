import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// ── Weight history ────────────────────────────────────────────────────────────

// Get weight history (last 7 entries)
export const getWeightHistory = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from("weight_history")
    .select("*")
    .eq("user_id", user_id)
    .order("recorded_at", { ascending: false })
    .limit(7);

  if (error) return next(error);
  res.json(data || []);
};

// Log a new weight entry
export const addWeightEntry = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { weight_kg } = req.body;
  if (!weight_kg || isNaN(Number(weight_kg))) {
    return res.status(400).json({ message: "weight_kg is required" });
  }

  const { data, error } = await supabase
    .from("weight_history")
    .insert({ user_id, weight_kg: Number(weight_kg) })
    .select()
    .single();

  if (error) return next(error);
  res.status(201).json({ message: "Weight logged", entry: data });
};

// ── Daily nutrition summary ───────────────────────────────────────────────────

// Get today's nutrition summary
export const getTodayNutrition = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_nutrition_summary")
    .select("*")
    .eq("user_id", user_id)
    .eq("date", today)
    .maybeSingle();

  if (error) return next(error);

  if (!data) {
    return res.json({
      user_id,
      date: today,
      total_calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fats_g: 0,
    });
  }

  res.json(data);
};

// Upsert today's nutrition summary
export const upsertTodayNutrition = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const today = new Date().toISOString().split("T")[0];
  const { total_calories, protein_g, carbs_g, fats_g } = req.body;

  const { data, error } = await supabase
    .from("daily_nutrition_summary")
    .upsert(
      { user_id, date: today, total_calories, protein_g, carbs_g, fats_g },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) return next(error);
  res.json({ message: "Nutrition summary saved", data });
};
