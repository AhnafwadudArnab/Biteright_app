import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextFunction, Request, Response } from "express";

// ── Gemini ────────────────────────────────────────────────────────────────────
async function suggestWithGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini API key not configured");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ── DeepSeek fallback ─────────────────────────────────────────────────────────
async function suggestWithDeepSeek(prompt: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DeepSeek API key not configured");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content.trim();
}

// ── Groq fallback ─────────────────────────────────────────────────────────────
async function suggestWithGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key not configured");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content.trim();
}

// ── Parse raw AI text → meals array ──────────────────────────────────────────
function parseAiResponse(text: string) {
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(clean);
  const usedImages = new Set<string>();
  return (parsed.meals || []).map((meal: any, i: number) => {
    const img = getImageForMeal(meal.name, meal.ingredients || [], usedImages);
    usedImages.add(img);
    return {
      ...meal,
      id: i + 1,
      image: img,
    };
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────
export const suggestMealsFromIngredients = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: "ingredients array is required" });
  }

  const prompt = `You are a professional nutritionist and chef. A user has these ingredients: ${ingredients.join(", ")}.

Suggest 4 healthy meal recipes they can make. Return ONLY valid JSON (no markdown, no explanation):

{
  "meals": [
    {
      "id": 1,
      "name": "Meal Name",
      "calories": 400,
      "protein": 30,
      "carbs": 35,
      "fat": 12,
      "time": "20 min",
      "difficulty": "Easy",
      "servings": 2,
      "tags": ["High Protein", "Quick"],
      "compatible": true,
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "instructions": ["Step 1", "Step 2", "Step 3"]
    }
  ]
}

Rules:
- Use ONLY the provided ingredients (you may add basic pantry items: salt, pepper, oil, water, garlic)
- Each meal must be healthy and nutritious
- compatible: true means it uses most of the provided ingredients
- tags should reflect nutritional properties (High Protein, Low Carb, Vegetarian, Quick, etc.)
- instructions should be clear step-by-step cooking directions
- calories/protein/carbs/fat should be realistic estimates per serving`;

  // Try Gemini → DeepSeek → Groq
  let text: string;
  try {
    text = await suggestWithGemini(prompt);
    console.log("Ingredient suggestion: used Gemini");
  } catch (geminiErr: any) {
    console.warn("Gemini failed, trying DeepSeek:", geminiErr.message);
    try {
      text = await suggestWithDeepSeek(prompt);
      console.log("Ingredient suggestion: used DeepSeek");
    } catch (deepSeekErr: any) {
      console.warn("DeepSeek failed, trying Groq:", deepSeekErr.message);
      try {
        text = await suggestWithGroq(prompt);
        console.log("Ingredient suggestion: used Groq");
      } catch (groqErr: any) {
        console.error("All AI providers failed:", groqErr.message);
        return res.status(500).json({
          message: `AI unavailable: ${groqErr.message}`,
        });
      }
    }
  }

  try {
    const meals = parseAiResponse(text!);
    return res.json({ meals, source: "ai" });
  } catch (parseErr: any) {
    console.error("Failed to parse AI response:", parseErr.message);
    return res.status(500).json({ message: "Failed to parse AI response" });
  }
};

// ── Image helper ──────────────────────────────────────────────────────────────
const MEAL_IMAGES: { keywords: string[]; url: string }[] = [
  { keywords: ["chicken", "grilled chicken", "roast chicken", "chicken breast", "chicken wrap", "chicken curry", "chicken stir"], url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=80" },
  { keywords: ["salmon", "fish", "tuna", "cod", "tilapia", "seafood", "shrimp", "prawn"], url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80" },
  { keywords: ["pasta", "spaghetti", "noodle", "fettuccine", "penne", "linguine", "macaroni"], url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&q=80" },
  { keywords: ["salad", "greens", "lettuce", "caesar", "coleslaw"], url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80" },
  { keywords: ["egg", "omelette", "omelet", "scrambled", "frittata", "quiche", "benedict"], url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80" },
  { keywords: ["rice", "fried rice", "pilaf", "risotto", "biryani"], url: "https://images.unsplash.com/photo-1536304993881-ff86e0c9b1b5?w=600&q=80" },
  { keywords: ["soup", "stew", "broth", "chowder", "bisque", "chili"], url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80" },
  { keywords: ["stir fry", "stir-fry", "wok", "sauté", "saute"], url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80" },
  { keywords: ["bowl", "grain bowl", "buddha", "poke"], url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" },
  { keywords: ["yogurt", "parfait", "smoothie", "smoothie bowl"], url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" },
  { keywords: ["sandwich", "wrap", "toast", "bruschetta", "sub", "burger"], url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80" },
  { keywords: ["pancake", "waffle", "crepe", "french toast"], url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80" },
  { keywords: ["curry", "masala", "tikka", "korma", "dal", "lentil"], url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80" },
  { keywords: ["taco", "burrito", "quesadilla", "fajita", "enchilada", "mexican"], url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80" },
  { keywords: ["pizza", "flatbread", "calzone"], url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80" },
  { keywords: ["beef", "steak", "meatball", "mince", "ground beef", "burger patty"], url: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80" },
  { keywords: ["tofu", "tempeh", "vegan", "vegetarian", "veggie"], url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80" },
  { keywords: ["avocado", "guacamole"], url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80" },
  { keywords: ["oat", "oatmeal", "porridge", "granola", "muesli"], url: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80" },
  { keywords: ["broccoli", "vegetable", "roasted veg", "roasted vegetable"], url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80" },
];

// Fallback pool — used when keyword match is already taken
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80",
];

function getImageForMeal(name: string, ingredients: string[] = [], usedImages?: Set<string>): string {
  const haystack = `${name} ${ingredients.join(" ")}`.toLowerCase();

  for (const entry of MEAL_IMAGES) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) {
      // If this image is already used by a previous meal, skip to next match
      if (usedImages && usedImages.has(entry.url)) continue;
      return entry.url;
    }
  }

  // Pick a fallback that hasn't been used yet
  if (usedImages) {
    for (const fb of FALLBACK_IMAGES) {
      if (!usedImages.has(fb)) return fb;
    }
  }

  return FALLBACK_IMAGES[0];
}
