import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Get streak & points for a user
export const getStreak = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) return next(error);

  // Return defaults if no record yet
  if (!data) {
    return res.json({
      user_id,
      current_streak: 0,
      total_points: 0,
      last_logged_date: null,
      meals_logged_week: 0,
      water_goal_days_week: 0,
      calorie_goal_days_week: 0,
    });
  }

  res.json(data);
};

// Upsert streak & points
export const upsertStreak = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const {
    current_streak,
    total_points,
    last_logged_date,
    meals_logged_week,
    water_goal_days_week,
    calorie_goal_days_week,
  } = req.body;

  const { data, error } = await supabase
    .from("user_streaks")
    .upsert(
      {
        user_id,
        current_streak,
        total_points,
        last_logged_date,
        meals_logged_week,
        water_goal_days_week,
        calorie_goal_days_week,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return next(error);
  res.json({ message: "Streak updated", data });
};

// Reset streak to 0
export const resetStreak = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from("user_streaks")
    .upsert(
      {
        user_id,
        current_streak: 0,
        last_logged_date: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return next(error);
  res.json({ message: "Streak reset", data });
};
