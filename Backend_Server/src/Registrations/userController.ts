import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase";

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, gender, age, height_cm, weight_kg, activity_level } = req.body;

  if (!name || !email || !password || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const parsedAge    = age        != null && age        !== "" ? Number(age)        : undefined;
  const parsedHeight = height_cm  != null && height_cm  !== "" ? Number(height_cm)  : undefined;
  const parsedWeight = weight_kg  != null && weight_kg  !== "" ? Number(weight_kg)  : undefined;

  if (
    (parsedAge    !== undefined && isNaN(parsedAge))    ||
    (parsedHeight !== undefined && isNaN(parsedHeight)) ||
    (parsedWeight !== undefined && isNaN(parsedWeight))
  ) {
    return res.status(400).json({ message: "Age, height, and weight must be numbers" });
  }

  try {
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ name, email, password: hashedPassword, gender, age: parsedAge, height_cm: parsedHeight, weight_kg: parsedWeight, activity_level })
      .select()
      .single();

    if (insertError) return next(insertError);

    await supabase.from("profileUser").insert({
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

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({ message: "User registered successfully", user: safeUser });
  } catch (error) {
    return next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
    if (error) return next(error);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return res.status(200).json({ message: "Login successful", token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return next(error);
  }
};

// ── Forgot Password — send OTP code ──────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const { data: user } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    // Always return success to prevent email enumeration
    if (!user) return res.status(200).json({ message: "If this email exists, a reset code has been sent." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    // Store OTP in password_resets table
    await supabase.from("password_resets").upsert(
      { email, otp, expires_at: expiresAt },
      { onConflict: "email" }
    );

    // In production: send email via SendGrid/Resend/etc.
    // For now, return OTP in response (dev mode only)
    const isDev = process.env.NODE_ENV !== "production";
    return res.status(200).json({
      message: "Reset code sent to your email.",
      ...(isDev ? { otp } : {}), // only expose in dev
    });
  } catch (error) {
    return next(error);
  }
};

// ── Reset Password — verify OTP + set new password ───────────────────────────
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "email, otp, and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const { data: record } = await supabase
      .from("password_resets")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .maybeSingle();

    if (!record) return res.status(400).json({ message: "Invalid or expired reset code" });
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await supabase.from("users").update({ password: hashed }).eq("email", email);
    await supabase.from("password_resets").delete().eq("email", email);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return next(error);
  }
};

// ── Avatar upload URL — returns Supabase Storage signed upload URL ────────────
export const getAvatarUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { fileExt = "jpg" } = req.body;
  const filePath = `avatars/${user_id}.${fileExt}`;

  try {
    // Ensure bucket exists — create if missing
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "avatars");
    if (!bucketExists) {
      const { error: createErr } = await supabase.storage.createBucket("avatars", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });
      if (createErr) return next(createErr);
    }

    const { data, error } = await supabase.storage
      .from("avatars")
      .createSignedUploadUrl(filePath);

    if (error) return next(error);

    // Public URL for reading
    const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return res.json({ uploadUrl: data.signedUrl, publicUrl: publicData.publicUrl, filePath });
  } catch (error) {
    return next(error);
  }
};

// ── Save avatar URL to profileUser ────────────────────────────────────────────
export const saveAvatarUrl = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { avatar_url } = req.body;
  if (!avatar_url) return res.status(400).json({ message: "avatar_url is required" });

  try {
    const { error } = await supabase
      .from("profileUser")
      .update({ avatar: avatar_url })
      .eq("user_id", user_id);

    if (error) return next(error);
    return res.json({ message: "Avatar updated", avatar_url });
  } catch (error) {
    return next(error);
  }
};
