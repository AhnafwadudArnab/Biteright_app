import { Request, Response } from "express";
// Type-only import for Request augmentation; no runtime import needed
import ProfileUser from "../models/Profileuser";

// GET profile (real user)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id || req.query.user_id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const profile = await ProfileUser.findOne({ where: { user_id } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json({
      ...profile.toJSON(),
      diet: profile.diet ? JSON.parse(profile.diet) : [],
      activity: profile.activity ? JSON.parse(profile.activity) : [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// CREATE or UPDATE profile
export const upsertProfile = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id || req.body.user_id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const payload = {
      ...req.body,
      diet: JSON.stringify(req.body.diet || []),
      activity: JSON.stringify(req.body.activity || []),
      user_id,
    };

    const [profile] = await ProfileUser.upsert(payload);
    res.json({ message: "Profile saved", profile });
  } catch (err) {
    res.status(500).json({ error: "Profile update failed" });
  }
};
export default { getProfile, upsertProfile };
