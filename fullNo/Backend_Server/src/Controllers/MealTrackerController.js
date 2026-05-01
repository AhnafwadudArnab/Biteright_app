"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeal = exports.getMealsByUser = exports.addMeal = void 0;
const supabase_1 = require("../../../../Backend_Server/src/lib/supabase");
// Add a new meal for a user
const addMeal = async (req, res, next) => {
    const { user_id, meal_type, eaten_at, items } = req.body;
    // Insert meal row — let gen_random_uuid() handle the ID in the DB
    const { data: meal, error: mealError } = await supabase_1.supabase
        .from("meals")
        .insert({ user_id, meal_type, eaten_at })
        .select()
        .single();
    if (mealError)
        return next(mealError);
    // Insert each meal item
    for (const item of items) {
        const { food_id, quantity, calories } = item;
        const { error: itemError } = await supabase_1.supabase
            .from("meal_items")
            .insert({ meal_id: meal.id, food_id, quantity, calories });
        if (itemError)
            return next(itemError);
    }
    res.status(201).json({ message: "Meal added successfully", mealId: meal.id });
};
exports.addMeal = addMeal;
// Get all meals for a user (with items and food names)
const getMealsByUser = async (req, res, next) => {
    const { user_id } = req.params;
    const { data: meals, error } = await supabase_1.supabase
        .from("meals")
        .select("*, meal_items(*, foods(name))")
        .eq("user_id", user_id)
        .order("eaten_at", { ascending: false });
    if (error)
        return next(error);
    res.json(meals);
};
exports.getMealsByUser = getMealsByUser;
// Delete a meal
const deleteMeal = async (req, res, next) => {
    const { meal_id } = req.params;
    const { error } = await supabase_1.supabase
        .from("meals")
        .delete()
        .eq("id", meal_id);
    if (error)
        return next(error);
    res.json({ message: "Meal deleted successfully" });
};
exports.deleteMeal = deleteMeal;
