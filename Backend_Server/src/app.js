"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const MealTrackerRoutes_1 = __importDefault(require("./Controllers/MealTrackerRoutes"));
const ProfileRoutes_1 = __importDefault(require("./Controllers/ProfileRoutes"));
const userRoutes_1 = __importDefault(require("./Registrations/userRoutes"));
const app = (0, express_1.default)();
// Load .env — works for both ts-node (src/) and compiled (dist/)
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../../.env") });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
dotenv_1.default.config(); // fallback: Backend_Server/.env
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/users", userRoutes_1.default);
app.use("/api", ProfileRoutes_1.default);
// Meal tracker endpoints
app.use("/api", MealTrackerRoutes_1.default);
app.get("/", (_req, res) => {
    res.send("Hello Express!");
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
exports.default = app;
