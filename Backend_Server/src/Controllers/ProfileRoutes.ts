import { Router } from "express";
import { getProfile, upsertProfile } from "../controllers/ProfileControllers";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", upsertProfile);

export default router;
