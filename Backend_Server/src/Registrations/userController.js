"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = require("../lib/supabase");
// Register new user
const registerUser = async (req, res, next) => {
    const { name, email, password, gender, age, height_cm, weight_kg, activity_level, } = req.body;
    if (!name || !email || !password || !gender) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const parsedAge = age !== undefined && age !== null && age !== "" ? Number(age) : undefined;
    const parsedHeight = height_cm !== undefined && height_cm !== null && height_cm !== ""
        ? Number(height_cm)
        : undefined;
    const parsedWeight = weight_kg !== undefined && weight_kg !== null && weight_kg !== ""
        ? Number(weight_kg)
        : undefined;
    if ((parsedAge !== undefined && isNaN(parsedAge)) ||
        (parsedHeight !== undefined && isNaN(parsedHeight)) ||
        (parsedWeight !== undefined && isNaN(parsedWeight))) {
        return res
            .status(400)
            .json({ message: "Age, height, and weight must be numbers" });
    }
    try {
        // Check for existing email
        const { data: existingUser, error: lookupError } = await supabase_1.supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();
        if (lookupError)
            return next(lookupError);
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }
        // Hash password before storing
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // Insert new user
        const { data: newUser, error: insertError } = await supabase_1.supabase
            .from("users")
            .insert({
            name,
            email,
            password: hashedPassword,
            gender,
            age: parsedAge,
            height_cm: parsedHeight,
            weight_kg: parsedWeight,
            activity_level,
        })
            .select()
            .single();
        if (insertError)
            return next(insertError);
        // Create profileUser row for this user
        const { error: profileError } = await supabase_1.supabase
            .from("profileUser")
            .insert({
            user_id: newUser.id,
            age: parsedAge ?? 0,
            avatar: null,
            height_cm: parsedHeight ?? 0,
            start_weight_kg: parsedWeight ?? 0,
            current_weight_kg: parsedWeight ?? 0,
            target_weight_kg: 0,
            goal: "Maintain Weight",
            diet: null,
            activity: null,
        });
        if (profileError)
            return next(profileError);
        // Return user without password
        const { password: _pw, ...safeUser } = newUser;
        return res.status(201).json({
            message: "User registered successfully",
            user: safeUser,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.registerUser = registerUser;
// Login user
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        // Fetch user by email
        const { data: user, error: lookupError } = await supabase_1.supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();
        if (lookupError)
            return next(lookupError);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare password with stored hash
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Sign JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.loginUser = loginUser;
