import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// ── helpers ───────────────────────────────────────────────────────────────────

// Sync nutrition summary — runs in background, never blocks response
function syncDailyNutritionBg(user_id: string) {
  const today = new Date().toISOString().split("T")[0];
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd   = `${today}T23:59:59.999Z`;

  supabase
    .from("meals")
    .select("meal_items(calories)")
    .eq("user_id", user_id)
    .gte("eaten_at", todayStart)
    .lte("eaten_at", todayEnd)
    .then(({ data: meals }) => {
      let total_calories = 0;
      for (const meal of meals || []) {
        for (const item of (meal as any).meal_items || []) {
          total_calories += item.calories || 0;
        }
      }
      return supabase
        .from("daily_nutrition_summary")
        .upsert(
          { user_id, date: today, total_calories, protein_g: 0, carbs_g: 0, fats_g: 0 },
          { onConflict: "user_id,date" }
        );
    })
    .catch(() => {}); // silent — non-critical
}

// Increment streak — runs in background, never blocks response
function incrementMealsLoggedBg(user_id: string) {
  supabase
    .from("user_streaks")
    .select("current_streak,total_points,meals_logged_week,last_logged_date")
    .eq("user_id", user_id)
    .maybeSingle()
    .then(({ data: existing }) => {
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = existing?.last_logged_date !== today;
      return supabase.from("user_streaks").upsert(
        {
          user_id,
          current_streak: isNewDay
            ? (existing?.current_streak ?? 0) + 1
            : (existing?.current_streak ?? 0),
          total_points: (existing?.total_points ?? 0) + 10,
          meals_logged_week: (existing?.meals_logged_week ?? 0) + 1,
          last_logged_date: isNewDay ? today : existing?.last_logged_date,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    })
    .catch(() => {});
}

// ── Add a new meal ────────────────────────────────────────────────────────────
export const addMeal = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id, meal_type, eaten_at, items } = req.body;

  // 1. Insert meal
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({ user_id, meal_type, eaten_at })
    .select("id")
    .single();

  if (mealError) return next(mealError);

  // 2. Bulk insert all items in ONE query instead of N queries
  if (Array.isArray(items) && items.length > 0) {
    const rows = items.map(({ food_id, quantity, calories }: any) => ({
      meal_id: meal.id,
      food_id,
      quantity,
      calories,
    }));
    const { error: itemError } = await supabase.from("meal_items").insert(rows);
    if (itemError) return next(itemError);
  }

  // 3. Fire-and-forget side effects — don't await, respond immediately
  syncDailyNutritionBg(user_id);
  incrementMealsLoggedBg(user_id);

  res.status(201).json({ message: "Meal added successfully", mealId: meal.id });
};

// ── Get all meals for a user ──────────────────────────────────────────────────
export const getMealsByUser = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.params;

  // Limit to today's meals by default for speed; pass ?all=1 for full history
  const all = req.query.all === "1";
  let query = supabase
    .from("meals")
    .select("id, meal_type, eaten_at, meal_items(id, calories, quantity, food_id, foods(name))")
    .eq("user_id", user_id)
    .order("eaten_at", { ascending: false });

  if (!all) {
    const today = new Date().toISOString().split("T")[0];
    query = query
      .gte("eaten_at", `${today}T00:00:00.000Z`)
      .lte("eaten_at", `${today}T23:59:59.999Z`);
  }

  const { data: meals, error } = await query.limit(50);
  if (error) return next(error);
  res.json(meals);
};

// ── Update a meal ─────────────────────────────────────────────────────────────
export const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  const { meal_id } = req.params;
  const { meal_type, eaten_at, items, user_id } = req.body;

  const { error: mealErr } = await supabase
    .from("meals")
    .update({ meal_type, eaten_at })
    .eq("id", meal_id);

  if (mealErr) return next(mealErr);

  if (Array.isArray(items)) {
    // Delete old + bulk insert new in parallel
    await supabase.from("meal_items").delete().eq("meal_id", meal_id);
    if (items.length > 0) {
      const rows = items.map(({ food_id, quantity, calories }: any) => ({
        meal_id, food_id, quantity, calories,
      }));
      const { error: itemErr } = await supabase.from("meal_items").insert(rows);
      if (itemErr) return next(itemErr);
    }
  }

  if (user_id) syncDailyNutritionBg(user_id);

  res.json({ message: "Meal updated successfully" });
};

// ── Delete a meal ─────────────────────────────────────────────────────────────
export const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  const { meal_id } = req.params;
  const user_id = req.user?.id;

  const { error } = await supabase.from("meals").delete().eq("id", meal_id);
  if (error) return next(error);

  if (user_id) syncDailyNutritionBg(user_id);

  res.json({ message: "Meal deleted successfully" });
};
