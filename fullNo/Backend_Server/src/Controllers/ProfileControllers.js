"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertProfile = exports.getProfile = void 0;
const supabase_1 = require("../../../../Backend_Server/src/lib/supabase");
// GET profile (real user)
const getProfile = async (req, res, next) => {
    const user_id = req.user?.id || req.query.user_id;
    if (!user_id)
        return res.status(401).json({ message: "Unauthorized" });
    const { data, error } = await supabase_1.supabase
        .from('profileUser')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();
    if (error)
        return next(error);
    if (!data)
        return res.status(404).json({ message: "Profile not found" });
    res.json({
        ...data,
        diet: data.diet ? JSON.parse(data.diet) : [],
        activity: data.activity ? JSON.parse(data.activity) : [],
    });
};
exports.getProfile = getProfile;
// CREATE or UPDATE profile
const upsertProfile = async (req, res, next) => {
    const user_id = req.user?.id || req.body.user_id;
    if (!user_id)
        return res.status(401).json({ message: "Unauthorized" });
    const payload = {
        ...req.body,
        diet: JSON.stringify(req.body.diet || []),
        activity: JSON.stringify(req.body.activity || []),
        user_id,
    };
    const { data: profile, error } = await supabase_1.supabase
        .from('profileUser')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();
    if (error)
        return next(error);
    res.json({ message: "Profile saved", profile });
};
exports.upsertProfile = upsertProfile;
exports.default = { getProfile: exports.getProfile, upsertProfile: exports.upsertProfile };
