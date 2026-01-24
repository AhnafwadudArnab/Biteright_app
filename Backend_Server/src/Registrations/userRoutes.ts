import express from 'express';
import { getMealPlanByBmi } from './mealPlanController';
import { loginUser, signupUser } from './userController';

const router = express.Router();

// Route for user registration
router.post('/register', signupUser);

// Route for user login
router.post('/login', loginUser);
// Route for fetching meal plan by BMI
router.get('/mealplan', getMealPlanByBmi);

export default router;