"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMealItem = exports.addMealItem = void 0;
const supabase_1 = require("../../../../Backend_Server/src/lib/supabase");
// Add a food item to a meal
const addMealItem = async (req, res, next) => {
    const { meal_id, food_id, quantity, calories } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from("meal_items")
            .insert({ meal_id, food_id, quantity, calories })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({ message: "Meal item added successfully", item: data });
    }
    catch (error) {
        next(error);
    }
};
exports.addMealItem = addMealItem;
// Update a food item in a meal
const updateMealItem = async (req, res, next) => {
    const { id } = req.params;
    const { quantity, calories } = req.body;
    try {
        const { data, error } = await supabase_1.supabase
            .from("meal_items")
            .update({ quantity, calories })
            .eq("id", id)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            return res.status(404).json({ message: "Meal item not found" });
        }
        res.json({ message: "Meal item updated successfully", item: data });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMealItem = updateMealItem;
