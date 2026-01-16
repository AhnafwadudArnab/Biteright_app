import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import db from "../models/db";

// Fetch meal plan by gender and BMI
export const getMealPlanByBmi = async (req: Request, res: Response) => {
  const { gender, bmi } = req.query;
  if (!gender || !bmi) {
    return res.status(400).json({ message: "Gender and BMI are required" });
  }
  try {
    // Find the closest matching BMI range for the gender
    const rows = (await db.query(
      `SELECT bmi_range, category, daily_calories, doctor_focus, meal_type, meal_name, meal_kcal
       FROM doctor_bmi_mealplans
       WHERE gender = :gender`,
      {
        replacements: { gender },
        type: QueryTypes.SELECT,
      }
    )) as any[];
    if (!rows.length) {
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
      // fallback: closest
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
    res
      .status(500)
      .json({
        message: "Server error fetching meal plan.",
        error: error instanceof Error ? error.message : error,
      });
  }
};
