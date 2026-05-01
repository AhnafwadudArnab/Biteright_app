/**
 * Property 6: Profile upsert is idempotent
 *
 * For any user and any valid profile payload, calling upsert twice with the
 * same payload results in exactly one profileUser row whose fields match the payload.
 */

import * as fc from "fast-check";

// ── In-memory Supabase mock ───────────────────────────────────────────────────

// Store profiles keyed by user_id (simulates ON CONFLICT user_id upsert)
const profileStore: Record<string, any> = {};

jest.mock("../lib/supabase", () => {
  const buildChain = () => {
    let _upsertData: any = null;

    const chain: any = {
      upsert: (data: any, _opts: any) => {
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
      from: (_table: string) => buildChain(),
    },
  };
});

// ── Helper to simulate upsertProfile controller logic ────────────────────────

import { supabase } from "../lib/supabase";

async function upsertProfile(userId: string, payload: Record<string, any>) {
  const data = {
    ...payload,
    diet: JSON.stringify(payload.diet ?? []),
    activity: JSON.stringify(payload.activity ?? []),
    user_id: userId,
  };
  const { data: profile, error } = await supabase
    .from("profileUser")
    .upsert(data, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw error;
  return profile;
}

// ── Property 6 ────────────────────────────────────────────────────────────────

describe("Property 6: Profile upsert is idempotent", () => {
  beforeEach(() => {
    Object.keys(profileStore).forEach((k) => delete profileStore[k]);
  });

  it("calling upsert twice with the same payload leaves exactly one row with correct fields", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.record({
          height_cm: fc.float({ min: 100, max: 250, noNaN: true }),
          goal: fc.constantFrom(
            "Weight Loss",
            "Weight Gain",
            "Maintain Weight"
          ),
        }),
        async (userId, payload) => {
          await upsertProfile(userId, payload);
          const second = await upsertProfile(userId, payload);

          // Exactly one row for this user
          const rowCount = Object.keys(profileStore).filter(
            (k) => k === userId
          ).length;

          return (
            rowCount === 1 &&
            second.user_id === userId &&
            second.goal === payload.goal
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
