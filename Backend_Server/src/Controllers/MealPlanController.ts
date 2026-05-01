import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Save a generated meal plan + its daily meals to DB
export const saveMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { bmi, gender, category, daily_calories, doctor_focus, meals, source } = req.body;

  // Insert plan header
  const { data: plan, error: planErr } = await supabase
    .from("meal_plans")
    .insert({ user_id, bmi, gender, category, daily_calories, doctor_focus: JSON.stringify(doctor_focus || []), source: source || "ai" })
    .select()
    .single();

  if (planErr) return next(planErr);

  // Insert each meal as day_index 0 (daily plan — all meals for today)
  if (Array.isArray(meals) && meals.length > 0) {
    const rows = meals.map((m: any, i: number) => ({
      plan_id: plan.id,
      day_index: 0,
      meal_type: m.type,
      meal_name: m.name,
      meal_kcal: m.kcal,
    }));
    const { error: daysErr } = await supabase.from("meal_plan_days").insert(rows);
    if (daysErr) return next(daysErr);
  }

  res.status(201).json({ message: "Meal plan saved", plan_id: plan.id });
};

// Get the latest saved meal plan for a user
export const getLatestMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data: plan, error: planErr } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planErr) return next(planErr);
  if (!plan) return res.status(404).json({ message: "No saved plan found" });

  const { data: days, error: daysErr } = await supabase
    .from("meal_plan_days")
    .select("*")
    .eq("plan_id", plan.id)
    .order("day_index", { ascending: true });

  if (daysErr) return next(daysErr);

  res.json({
    ...plan,
    doctor_focus: plan.doctor_focus ? JSON.parse(plan.doctor_focus) : [],
    meals: (days || []).map((d: any) => ({ type: d.meal_type, name: d.meal_name, kcal: d.meal_kcal })),
  });
};
