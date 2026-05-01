import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Fetch meal plan by gender and BMI
export const getMealPlanByBmi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { gender, bmi } = req.query;
  if (!gender || !bmi) {
    return res.status(400).json({ message: "Gender and BMI are required" });
  }
  try {
    // Find the closest matching BMI range for the gender
    const { data: rows, error } = await supabase
      .from("doctor_bmi_mealplans")
      .select("*")
      .eq("gender", gender);

    if (error) {
      return next(error);
    }

    if (!rows || !rows.length) {
      return res
        .status(404)
        .json({ message: "No meal plans available for this gender." });
    }

    const bmiVal = parseFloat(bmi as string);
    let bestRange: string | null = null;
    let bestDiff = Infinity;
    for (const row of rows) {
      const [min, max] = row.bmi_range.split("-").map(parseFloat);
      if (!isNaN(min) && !isNaN(max) && bmiVal >= min && bmiVal <= max) {
        bestRange = row.bmi_range;
        break;
      }
      // fallback: closest midpoint
      const diff = Math.abs((min + max) / 2 - bmiVal);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestRange = row.bmi_range;
      }
    }

    // If BMI is out of all defined ranges, do not return a plan
    if (!bestRange) {
      return res
        .status(404)
        .json({ message: "No plan found for this BMI value." });
    }

    // Filter all rows for the best range
    const planRows = rows.filter((r: any) => r.bmi_range === bestRange);
    if (!planRows.length) {
      return res
        .status(404)
        .json({ message: "No plan found for this BMI range." });
    }

    // Format response
    const { category, daily_calories, doctor_focus } = planRows[0];
    const meals = planRows.map((r: any) => ({
      type: r.meal_type,
      name: r.meal_name,
      kcal: r.meal_kcal,
    }));
    res.json({
      bmi_range: bestRange,
      category,
      dailyCalories: daily_calories,
      doctorFocus: JSON.parse(doctor_focus),
      meals,
    });
  } catch (error) {
    next(error);
  }
};
