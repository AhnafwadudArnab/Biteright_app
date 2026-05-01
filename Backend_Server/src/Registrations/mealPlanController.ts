import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// ── Gemini client (lazy-init) ─────────────────────────────────────────────────
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

// ── BMI category helper ───────────────────────────────────────────────────────
function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}

function dailyCaloriesForBmi(bmi: number, gender: string): number {
  // Rough TDEE estimate (sedentary baseline)
  if (bmi < 18.5) return gender === "female" ? 2200 : 2600;
  if (bmi < 25)   return gender === "female" ? 1900 : 2400;
  if (bmi < 30)   return gender === "female" ? 1600 : 2000;
  return gender === "female" ? 1400 : 1800;
}

// ── AI meal plan generator ────────────────────────────────────────────────────
async function generateAiMealPlan(gender: string, bmi: number) {
  const genAI = getGemini();
  if (!genAI) throw new Error("Gemini API key not configured");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const category = bmiCategory(bmi);
  const dailyCal  = dailyCaloriesForBmi(bmi, gender);

  const prompt = `You are a professional nutritionist. Generate a personalized daily meal plan for a ${gender} with BMI ${bmi.toFixed(1)} (${category}).

Daily calorie target: ${dailyCal} kcal.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "bmi_range": "${bmi.toFixed(1)}",
  "category": "${category}",
  "dailyCalories": ${dailyCal},
  "doctorFocus": ["focus point 1", "focus point 2", "focus point 3"],
  "meals": [
    { "type": "Breakfast", "name": "meal name", "kcal": 400 },
    { "type": "Lunch", "name": "meal name", "kcal": 600 },
    { "type": "Snack", "name": "meal name", "kcal": 200 },
    { "type": "Dinner", "name": "meal name", "kcal": 550 }
  ]
}

Rules:
- Meal kcal values must sum close to ${dailyCal}
- doctorFocus must have exactly 3 specific health tips for ${category} BMI
- Meal names must be real, specific food items (e.g. "Oatmeal with banana and honey")
- Tailor meals to the ${category} goal (${bmi < 18.5 ? "high calorie, nutrient dense" : bmi < 25 ? "balanced, maintenance" : "low calorie, high protein, low carb"})`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ── Supabase fallback ─────────────────────────────────────────────────────────
async function getSupabasePlan(gender: string, bmi: number) {
  const { data: rows, error } = await supabase
    .from("doctor_bmi_mealplans")
    .select("*")
    .eq("gender", gender);

  if (error || !rows?.length) return null;

  const bmiVal = bmi;
  let bestRange: string | null = null;
  let bestDiff = Infinity;

  for (const row of rows) {
    const [min, max] = row.bmi_range.split("-").map(parseFloat);
    if (!isNaN(min) && !isNaN(max) && bmiVal >= min && bmiVal <= max) {
      bestRange = row.bmi_range;
      break;
    }
    const diff = Math.abs((min + max) / 2 - bmiVal);
    if (diff < bestDiff) { bestDiff = diff; bestRange = row.bmi_range; }
  }

  if (!bestRange) return null;

  const planRows = rows.filter((r: any) => r.bmi_range === bestRange);
  if (!planRows.length) return null;

  const { category, daily_calories, doctor_focus } = planRows[0];
  return {
    bmi_range: bestRange,
    category,
    dailyCalories: daily_calories,
    doctorFocus: JSON.parse(doctor_focus),
    meals: planRows.map((r: any) => ({
      type: r.meal_type,
      name: r.meal_name,
      kcal: r.meal_kcal,
    })),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────
export const getMealPlanByBmi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { gender, bmi } = req.query;

  if (!gender || !bmi) {
    return res.status(400).json({ message: "Gender and BMI are required" });
  }

  const bmiVal = parseFloat(bmi as string);
  const genderStr = (gender as string).toLowerCase();

  if (isNaN(bmiVal) || bmiVal <= 0) {
    return res.status(400).json({ message: "Invalid BMI value" });
  }

  try {
    // 1. Try Gemini AI first
    try {
      const aiPlan = await generateAiMealPlan(genderStr, bmiVal);
      return res.json({ ...aiPlan, source: "ai" });
    } catch (aiErr) {
      console.warn("Gemini AI failed, falling back to Supabase:", (aiErr as Error).message);
    }

    // 2. Fallback to Supabase static data
    const staticPlan = await getSupabasePlan(genderStr, bmiVal);
    if (staticPlan) {
      return res.json({ ...staticPlan, source: "static" });
    }

    // 3. Nothing found
    return res.status(404).json({ message: "No meal plan found for this BMI and gender." });

  } catch (error) {
    next(error);
  }
};
