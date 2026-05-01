import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import mealTrackerRoutes from "./Controllers/MealTrackerRoutes";
import profileRoutes from "./Controllers/ProfileRoutes";
import userRoutes from "./Registrations/userRoutes";

const app = express();
// Load .env — works for both ts-node (src/) and compiled (dist/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback: Backend_Server/.env

// Middleware
app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/api", profileRoutes);

// Meal tracker endpoints
app.use("/api", mealTrackerRoutes);

app.get("/", (_req: any, res: { send: (arg0: string) => void }) => {
  res.send("Hello Express!");
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
