import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// GET profile (real user)
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id || req.query.user_id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from('profileUser')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle();

  if (error) return next(error);
  if (!data) return res.status(404).json({ message: "Profile not found" });

  res.json({
    ...data,
    diet: data.diet ? JSON.parse(data.diet) : [],
    activity: data.activity ? JSON.parse(data.activity) : [],
  });
};

// CREATE or UPDATE profile
export const upsertProfile = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id || req.body.user_id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const payload = {
    ...req.body,
    diet: JSON.stringify(req.body.diet || []),
    activity: JSON.stringify(req.body.activity || []),
    user_id,
  };

  const { data: profile, error } = await supabase
    .from('profileUser')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return next(error);

  res.json({ message: "Profile saved", profile });
};

export default { getProfile, upsertProfile };
