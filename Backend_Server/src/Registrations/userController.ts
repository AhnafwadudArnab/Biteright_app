import { Request, Response } from "express";
import User from "../models/userModel";

// Signup (Register) a new user
export const signupUser = async (req: Request, res: Response) => {
  const { name, email, password, gender } = req.body;

  // Debug log to verify received data
  console.log('Signup request body:', req.body);
  console.log('Gender received:', gender);

  if (!name || !email || !password || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Password match check is now handled on frontend only

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password before saving (simple hash for demo, use bcrypt in production)
    // const hashedPassword = someHashFunction(password); // Uncomment and implement if needed
    const newUser = await User.create({
      name,
      email,
      password, // Replace with hashedPassword if using hashing
      gender,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Replace this with proper password hashing check in production
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Set session or token here if needed
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Logout user
export const logoutUser = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error });
  }
};
