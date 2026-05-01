import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createReport, deleteReport, getReports } from "./HealthInsightController";

const router = Router();

router.get("/reports", authMiddleware, getReports);
router.post("/reports", authMiddleware, createReport);
router.delete("/reports/:id", authMiddleware, deleteReport);

export default router;
