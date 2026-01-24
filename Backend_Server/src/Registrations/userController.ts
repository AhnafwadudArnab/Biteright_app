import { Request, Response } from "express";
import User from "../models/userModel";
import ProfileUser from "../models/Profileuser";
import { v4 as uuidv4 } from "uuid";

// Register new user
export const registerUser = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    gender,
    age,
    height_cm,
    weight_kg,
    activity_level,
  }: {
    name?: string;
    email?: string;
    password?: string;
    gender?: string;
    age?: string | number;
    height_cm?: string | number;
    weight_kg?: string | number;
    activity_level?: string;
  } = req.body;

  if (!name || !email || !password || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const parsedAge =
    age !== undefined && age !== null && age !== "" ? Number(age) : undefined;
  const parsedHeight =
    height_cm !== undefined && height_cm !== null && height_cm !== ""
      ? Number(height_cm)
      : undefined;
  const parsedWeight =
    weight_kg !== undefined && weight_kg !== null && weight_kg !== ""
      ? Number(weight_kg)
      : undefined;

  if (
    (parsedAge !== undefined && isNaN(parsedAge)) ||
    (parsedHeight !== undefined && isNaN(parsedHeight)) ||
    (parsedWeight !== undefined && isNaN(parsedWeight))
  ) {
    return res
      .status(400)
      .json({ message: "Age, height, and weight must be numbers" });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Generate UUID for user id
    const userId = uuidv4();

    // Store password as plain text (not recommended for production)
    const newUser: User = await User.create({
      id: userId,
      name,
      email,
      password, // Store plain password
      gender,
      age: parsedAge,
      height_cm: parsedHeight,
      weight_kg: parsedWeight,
      activity_level,
    });

    // Create profileUser row for this user
    await ProfileUser.create({
      user_id: userId,
      age: parsedAge || 0,
      avatar: null,
      height_cm: parsedHeight || 0,
      start_weight_kg: parsedWeight || 0,
      current_weight_kg: parsedWeight || 0,
      target_weight_kg: 0,
      goal: "Maintain Weight",
      diet: null,
      activity: null,
    });

    const { password: _pw, ...safeUser } = newUser.toJSON();

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
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

    // Compare plain text passwords
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const { password: _pw, ...safeUser } = user.toJSON();

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
