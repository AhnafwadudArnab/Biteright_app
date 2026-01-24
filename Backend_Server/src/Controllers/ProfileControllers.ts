import ProfileUser from "../models/Profileuser";
import { Request, Response } from "express";

// GET profile handler
export const getProfile = async (req: Request, res: Response) => {
  try {
    // For demonstration, assuming user_id is provided in query
    const user_id = req.query.user_id;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }
    const profile = await ProfileUser.findOne({ where: { user_id } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({
      ...profile.toJSON(),
      diet: profile.diet ? JSON.parse(profile.diet) : [],
      activity: profile.activity ? JSON.parse(profile.activity) : [],
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
};

// UPDATE profile handler
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user_id = req.body.user_id;
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }
    const profile = await ProfileUser.findOne({ where: { user_id } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    // Update fields explicitly
    if (req.body.age !== undefined) profile.age = req.body.age;
    if (req.body.avatar !== undefined) profile.avatar = req.body.avatar;
    if (req.body.height_cm !== undefined)
      profile.height_cm = req.body.height_cm;
    if (req.body.start_weight_kg !== undefined)
      profile.start_weight_kg = req.body.start_weight_kg;
    if (req.body.current_weight_kg !== undefined)
      profile.current_weight_kg = req.body.current_weight_kg;
    if (req.body.target_weight_kg !== undefined)
      profile.target_weight_kg = req.body.target_weight_kg;
    if (req.body.goal !== undefined) profile.goal = req.body.goal;
    if (req.body.diet !== undefined)
      profile.diet = JSON.stringify(req.body.diet);
    if (req.body.activity !== undefined)
      profile.activity = JSON.stringify(req.body.activity);
    await profile.save();
    res.json({ message: "Profile updated", profile });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error });
  }
};
