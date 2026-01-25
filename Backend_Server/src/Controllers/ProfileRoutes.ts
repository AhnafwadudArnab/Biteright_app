import { Router } from "express";
import { getProfile, upsertProfile } from "../Controllers/ProfileControllers";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", upsertProfile);

export default router;
