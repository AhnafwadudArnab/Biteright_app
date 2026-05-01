import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Get all health reports for a user
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from("health_reports")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return next(error);
  res.json(data || []);
};

// Create a new health report
export const createReport = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { date_range, avg_calories, status } = req.body;
  if (!date_range || !avg_calories) {
    return res.status(400).json({ message: "date_range and avg_calories are required" });
  }

  const { data, error } = await supabase
    .from("health_reports")
    .insert({ user_id, date_range, avg_calories: Number(avg_calories), status: status || "On Track" })
    .select()
    .single();

  if (error) return next(error);
  res.status(201).json({ message: "Report created", report: data });
};

// Delete a health report
export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;

  // Ensure the report belongs to this user
  const { data: existing, error: fetchErr } = await supabase
    .from("health_reports")
    .select("id")
    .eq("id", id)
    .eq("user_id", user_id)
    .maybeSingle();

  if (fetchErr) return next(fetchErr);
  if (!existing) return res.status(404).json({ message: "Report not found" });

  const { error } = await supabase.from("health_reports").delete().eq("id", id);
  if (error) return next(error);

  res.json({ message: "Report deleted" });
};
