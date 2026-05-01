"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProfileControllers_1 = require("../Controllers/ProfileControllers");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/profile", auth_1.authMiddleware, ProfileControllers_1.getProfile);
router.put("/profile", auth_1.authMiddleware, ProfileControllers_1.upsertProfile);
exports.default = router;
