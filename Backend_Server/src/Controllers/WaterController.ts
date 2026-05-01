import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Log water intake (add glasses)
export const logWater = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { amount_ml } = req.body;
  if (!amount_ml || isNaN(Number(amount_ml))) {
    return res.status(400).json({ message: "amount_ml is required" });
  }

  const { data, error } = await supabase
    .from("water_intake")
    .insert({ user_id, amount_ml: Number(amount_ml) })
    .select()
    .single();

  if (error) return next(error);
  res.status(201).json({ message: "Water logged", entry: data });
};

// Get today's water intake for a user
export const getTodayWater = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("water_intake")
    .select("*")
    .eq("user_id", user_id)
    .gte("logged_at", todayStart.toISOString())
    .lte("logged_at", todayEnd.toISOString())
    .order("logged_at", { ascending: true });

  if (error) return next(error);

  const totalMl = (data || []).reduce((sum: number, r: any) => sum + (r.amount_ml || 0), 0);
  res.json({ entries: data || [], totalMl });
};

// Reset today's water intake
export const resetTodayWater = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { error } = await supabase
    .from("water_intake")
    .delete()
    .eq("user_id", user_id)
    .gte("logged_at", todayStart.toISOString());

  if (error) return next(error);
  res.json({ message: "Water intake reset for today" });
};
