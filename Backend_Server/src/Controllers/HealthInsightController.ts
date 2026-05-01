import { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Get all health reports for a user
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { data, error } = await supabase
    .from("health_reports")
    .select("id, date_range, avg_calories, status, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(20); // cap at 20 — no need to return all

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
    .select("id, date_range, avg_calories, status, created_at")
    .single();

  if (error) return next(error);
  res.status(201).json({ message: "Report created", report: data });
};

// Delete a health report — single query with user_id check (no extra SELECT)
export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?.id;
  if (!user_id) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;

  const { error, count } = await supabase
    .from("health_reports")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user_id); // ownership check in same query

  if (error) return next(error);
  if (count === 0) return res.status(404).json({ message: "Report not found" });

  res.json({ message: "Report deleted" });
};
