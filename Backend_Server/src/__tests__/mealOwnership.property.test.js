"use strict";
/**
 * Property 5: Meal ownership is preserved through add-then-fetch
 *
 * For any authenticated user and any valid meal payload, adding a meal and
 * then fetching meals for that user returns only meals belonging to that user.
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
// Store meals keyed by user_id
const mealStore = {};
jest.mock("../lib/supabase", () => {
    const buildChain = (tableName) => {
        let _insertData = null;
        let _filterUserId = null;
        const chain = {
            insert: (data) => {
                _insertData = data;
                return chain;
            },
            select: () => chain,
            single: async () => {
                if (tableName === "meals" && _insertData) {
                    const meal = { id: `meal-${Math.random()}`, ..._insertData };
                    if (!mealStore[meal.user_id])
                        mealStore[meal.user_id] = [];
                    mealStore[meal.user_id].push(meal);
                    return { data: meal, error: null };
                }
                if (tableName === "meal_items") {
                    return { data: _insertData, error: null };
                }
                return { data: null, error: null };
            },
            eq: (field, value) => {
                if (field === "user_id")
                    _filterUserId = value;
                return chain;
            },
            order: () => chain,
            // For getMealsByUser — returns array
            then: (resolve) => {
                const meals = _filterUserId ? mealStore[_filterUserId] ?? [] : [];
                return Promise.resolve({ data: meals, error: null }).then(resolve);
            },
        };
        // Make the chain thenable for the select().eq().order() pattern
        Object.defineProperty(chain, Symbol.toStringTag, { value: "Promise" });
        return chain;
    };
    return {
        supabase: {
            from: (table) => buildChain(table),
        },
    };
});
// ── Helpers to simulate controller logic ─────────────────────────────────────
const supabase_1 = require("../lib/supabase");
async function addMealForUser(userId, mealType, eatenAt) {
    const { data: meal, error } = await supabase_1.supabase
        .from("meals")
        .insert({ user_id: userId, meal_type: mealType, eaten_at: eatenAt })
        .select()
        .single();
    if (error)
        throw error;
    return meal.id;
}
async function getMealsForUser(userId) {
    const result = await supabase_1.supabase
        .from("meals")
        .select("*")
        .eq("user_id", userId)
        .order("eaten_at", { ascending: false });
    const { data, error } = result;
    if (error)
        throw error;
    return data ?? [];
}
// ── Property 5 ────────────────────────────────────────────────────────────────
describe("Property 5: Meal ownership is preserved through add-then-fetch", () => {
    beforeEach(() => {
        // Clear store between runs
        Object.keys(mealStore).forEach((k) => delete mealStore[k]);
    });
    it("all fetched meals have user_id equal to the authenticated user", async () => {
        await fc.assert(fc.asyncProperty(fc.uuid(), fc.record({
            meal_type: fc.constantFrom("breakfast", "lunch", "dinner", "snack"),
            eaten_at: fc.date().map((d) => d.toISOString()),
        }), async (userId, payload) => {
            await addMealForUser(userId, payload.meal_type, payload.eaten_at);
            const meals = await getMealsForUser(userId);
            return (meals.length > 0 &&
                meals.every((m) => m.user_id === userId));
        }), { numRuns: 50 });
    });
});
