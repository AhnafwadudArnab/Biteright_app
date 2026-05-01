"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dietMealController_1 = require("../../../../Backend_Server/src/Registrations/dietMealController");
const mealItemController_1 = require("../../../../Backend_Server/src/Registrations/mealItemController");
const mealPlanController_1 = require("../../../../Backend_Server/src/Registrations/mealPlanController");
const userController_1 = require("../../../../Backend_Server/src/Registrations/userController");
const router = express_1.default.Router();
// Route for user registration
router.post("/register", userController_1.registerUser);
// Route for user login
router.post("/login", userController_1.loginUser);
// Route for fetching meal plan by BMI
router.get("/mealplan", mealPlanController_1.getMealPlanByBmi);
// Route to update a diet meal
router.put("/dietmeal/:id", dietMealController_1.updateDietMeal);
// Route to add a new diet meal
router.post("/dietmeal", dietMealController_1.addDietMeal);
// Route to add a food item to a meal
router.post("/mealitem", mealItemController_1.addMealItem);
// Route to update a food item in a meal
router.put("/mealitem/:id", mealItemController_1.updateMealItem);
exports.default = router;
