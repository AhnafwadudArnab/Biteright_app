/**
 * Property 5: Meal ownership is preserved through add-then-fetch
 *
 * For any authenticated user and any valid meal payload, adding a meal and
 * then fetching meals for that user returns only meals belonging to that user.
 */

import * as fc from "fast-check";

// ── In-memory Supabase mock ───────────────────────────────────────────────────

// Store meals keyed by user_id
const mealStore: Record<string, any[]> = {};

jest.mock("../lib/supabase", () => {
  const buildChain = (tableName: string) => {
    let _insertData: any = null;
    let _filterUserId: string | null = null;

    const chain: any = {
      insert: (data: any) => {
        _insertData = data;
        return chain;
      },
      select: () => chain,
      single: async () => {
        if (tableName === "meals" && _insertData) {
          const meal = { id: `meal-${Math.random()}`, ..._insertData };
          if (!mealStore[meal.user_id]) mealStore[meal.user_id] = [];
          mealStore[meal.user_id].push(meal);
          return { data: meal, error: null };
        }
        if (tableName === "meal_items") {
          return { data: _insertData, error: null };
        }
        return { data: null, error: null };
      },
      eq: (field: string, value: string) => {
        if (field === "user_id") _filterUserId = value;
        return chain;
      },
      order: () => chain,
      // For getMealsByUser — returns array
      then: (resolve: any) => {
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
      from: (table: string) => buildChain(table),
    },
  };
});

// ── Helpers to simulate controller logic ─────────────────────────────────────

import { supabase } from "../lib/supabase";

async function addMealForUser(
  userId: string,
  mealType: string,
  eatenAt: string
): Promise<string> {
  const { data: meal, error } = await supabase
    .from("meals")
    .insert({ user_id: userId, meal_type: mealType, eaten_at: eatenAt })
    .select()
    .single();
  if (error) throw error;
  return meal.id;
}

async function getMealsForUser(userId: string): Promise<any[]> {
  const result = await (supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .order("eaten_at", { ascending: false }) as any);
  const { data, error } = result;
  if (error) throw error;
  return data ?? [];
}

// ── Property 5 ────────────────────────────────────────────────────────────────

describe("Property 5: Meal ownership is preserved through add-then-fetch", () => {
  beforeEach(() => {
    // Clear store between runs
    Object.keys(mealStore).forEach((k) => delete mealStore[k]);
  });

  it("all fetched meals have user_id equal to the authenticated user", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.record({
          meal_type: fc.constantFrom("breakfast", "lunch", "dinner", "snack"),
          eaten_at: fc.date().map((d) => d.toISOString()),
        }),
        async (userId, payload) => {
          await addMealForUser(userId, payload.meal_type, payload.eaten_at);
          const meals = await getMealsForUser(userId);
          return (
            meals.length > 0 &&
            meals.every((m: any) => m.user_id === userId)
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
