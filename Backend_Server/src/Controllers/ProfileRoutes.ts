import { Router } from "express";
import { getProfile, upsertProfile } from "../Controllers/ProfileControllers";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upsertProfile);

export default router;
