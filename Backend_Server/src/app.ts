import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import healthInsightRoutes from "./Controllers/HealthInsightRoutes";
import ingredientRoutes from "./Controllers/IngredientRoutes";
import mealPlanRoutes from "./Controllers/MealPlanRoutes";
import mealTrackerRoutes from "./Controllers/MealTrackerRoutes";
import profileRoutes from "./Controllers/ProfileRoutes";
import progressRoutes from "./Controllers/ProgressRoutes";
import streakRoutes from "./Controllers/StreakRoutes";
import waterRoutes from "./Controllers/WaterRoutes";
import userRoutes from "./Registrations/userRoutes";

const app = express();

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/users", userRoutes);          // POST /users/register  POST /users/login  GET /users/mealplan
app.use("/api", profileRoutes);         // GET/PUT /api/profile
app.use("/api", mealTrackerRoutes);     // GET/POST/PUT/DELETE /api/meals
app.use("/api", mealPlanRoutes);        // POST /api/mealplan/save  GET /api/mealplan/latest
app.use("/api", waterRoutes);           // POST /api/water  GET /api/water/today  DELETE /api/water/reset  GET|PUT /api/water/goal
app.use("/api", streakRoutes);          // GET/PUT /api/streak  POST /api/streak/reset
app.use("/api", progressRoutes);        // GET/POST /api/progress/weight  GET/POST /api/progress/nutrition/today
app.use("/api", healthInsightRoutes);   // GET/POST /api/reports  DELETE /api/reports/:id
app.use("/api", ingredientRoutes);      // POST /api/ingredients/suggest

app.get("/", (_req, res) => res.send("BiteRight API running ✅"));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
