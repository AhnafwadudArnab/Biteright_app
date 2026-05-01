"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDietMeal = exports.updateDietMeal = void 0;
const supabase_1 = require("../../../../Backend_Server/src/lib/supabase");
// Update (edit) a diet meal by ID
const updateDietMeal = async (req, res, next) => {
    const { id } = req.params;
    const { meal_type, eaten_at } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from("meals")
            .update({ meal_type, eaten_at })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            return res.status(404).json({ message: "Meal not found" });
        }
        res.json({ message: "Meal updated successfully", meal: data });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDietMeal = updateDietMeal;
// Add a new diet meal
const addDietMeal = async (req, res, next) => {
    const { user_id, meal_type, eaten_at } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from("meals")
            .insert({ user_id, meal_type, eaten_at })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({ message: "Meal added successfully", meal: data });
    }
    catch (error) {
        next(error);
    }
};
exports.addDietMeal = addDietMeal;
