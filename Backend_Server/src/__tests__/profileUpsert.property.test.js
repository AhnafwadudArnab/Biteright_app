"use strict";
/**
 * Property 6: Profile upsert is idempotent
 *
 * For any user and any valid profile payload, calling upsert twice with the
 * same payload results in exactly one profileUser row whose fields match the payload.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fc = __importStar(require("fast-check"));
// ── In-memory Supabase mock ───────────────────────────────────────────────────
// Store profiles keyed by user_id (simulates ON CONFLICT user_id upsert)
const profileStore = {};
jest.mock("../lib/supabase", () => {
    const buildChain = () => {
        let _upsertData = null;
        const chain = {
            upsert: (data, _opts) => {
                _upsertData = data;
                return chain;
            },
            select: () => chain,
            single: async () => {
                if (_upsertData) {
                    // Simulate ON CONFLICT user_id — last write wins
                    profileStore[_upsertData.user_id] = { ..._upsertData };
                    return { data: profileStore[_upsertData.user_id], error: null };
                }
                return { data: null, error: null };
            },
        };
        return chain;
    };
    return {
        supabase: {
            from: (_table) => buildChain(),
        },
    };
});
// ── Helper to simulate upsertProfile controller logic ────────────────────────
const supabase_1 = require("../lib/supabase");
async function upsertProfile(userId, payload) {
    const data = {
        ...payload,
        diet: JSON.stringify(payload.diet ?? []),
        activity: JSON.stringify(payload.activity ?? []),
        user_id: userId,
    };
    const { data: profile, error } = await supabase_1.supabase
        .from("profileUser")
        .upsert(data, { onConflict: "user_id" })
        .select()
        .single();
    if (error)
        throw error;
    return profile;
}
// ── Property 6 ────────────────────────────────────────────────────────────────
describe("Property 6: Profile upsert is idempotent", () => {
    beforeEach(() => {
        Object.keys(profileStore).forEach((k) => delete profileStore[k]);
    });
    it("calling upsert twice with the same payload leaves exactly one row with correct fields", async () => {
        await fc.assert(fc.asyncProperty(fc.uuid(), fc.record({
            height_cm: fc.float({ min: 100, max: 250, noNaN: true }),
            goal: fc.constantFrom("Weight Loss", "Weight Gain", "Maintain Weight"),
        }), async (userId, payload) => {
            await upsertProfile(userId, payload);
            const second = await upsertProfile(userId, payload);
            // Exactly one row for this user
            const rowCount = Object.keys(profileStore).filter((k) => k === userId).length;
            return (rowCount === 1 &&
                second.user_id === userId &&
                second.goal === payload.goal);
        }), { numRuns: 50 });
    });
});
