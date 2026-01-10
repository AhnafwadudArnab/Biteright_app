import express from 'express';
import { getUserProfile, loginUser, signupUser } from './userController';

const router = express.Router();

// Route for user registration
router.post('/register', signupUser);

// Route for user login
router.post('/login', loginUser);

// Route for getting user profile
router.get('/profile', getUserProfile);

export default router;