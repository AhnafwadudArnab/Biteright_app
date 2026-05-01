"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Backend_Server/src/Controllers/MealTrackerRoutes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../../Backend_Server/src/middleware/auth");
const MealTrackerController_1 = require("../../../../Backend_Server/src/Controllers/MealTrackerController");
const router = express_1.default.Router();
// Add a meal
router.post("/meals", auth_1.authMiddleware, MealTrackerController_1.addMeal);
// Get all meals for a user
router.get("/meals/:user_id", auth_1.authMiddleware, MealTrackerController_1.getMealsByUser);
// Delete a meal
router.delete("/meals/:meal_id", auth_1.authMiddleware, MealTrackerController_1.deleteMeal);
exports.default = router;
