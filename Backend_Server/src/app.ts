import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";

import healthInsightRoutes from "./Controllers/HealthInsightRoutes";
import mealTrackerRoutes from "./Controllers/MealTrackerRoutes";
import profileRoutes from "./Controllers/ProfileRoutes";
import progressRoutes from "./Controllers/ProgressRoutes";
import streakRoutes from "./Controllers/StreakRoutes";
import waterRoutes from "./Controllers/WaterRoutes";
import userRoutes from "./Registrations/userRoutes";

const app = express();

// Load .env — works for both ts-node (src/) and compiled (dist/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);          // /users/register, /users/login, /users/mealplan
app.use("/api", profileRoutes);         // /api/profile
app.use("/api", mealTrackerRoutes);     // /api/meals
app.use("/api", waterRoutes);           // /api/water
app.use("/api", streakRoutes);          // /api/streak
app.use("/api", progressRoutes);        // /api/progress/weight, /api/progress/nutrition/today
app.use("/api", healthInsightRoutes);   // /api/reports

app.get("/", (_req, res) => res.send("BiteRight API running ✅"));

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
