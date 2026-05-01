/**
 * Property-based tests for auth-related correctness properties.
 *
 * Property 1: Password hashing is irreversible and verifiable
 * Property 2: Wrong password is always rejected
 * Property 3: JWT round-trip preserves user identity
 * Property 4: Expired or tampered JWT is always rejected
 */

import bcrypt from "bcrypt";
import * as fc from "fast-check";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-jwt-secret-for-property-tests";

// ── Property 1: Password hashing is irreversible and verifiable ───────────────

describe("Property 1: Password hashing is irreversible and verifiable", () => {
  it("hash !== plaintext and bcrypt.compare returns true", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (pw) => {
        const hash = await bcrypt.hash(pw, 4); // cost 4 for test speed
        const matches = await bcrypt.compare(pw, hash);
        return hash !== pw && matches === true;
      }),
      { numRuns: 10 } // bcrypt is slow; 10 runs is sufficient
    );
  }, 30000); // 30s timeout for bcrypt
});

// ── Property 2: Wrong password is always rejected ─────────────────────────────

describe("Property 2: Wrong password is always rejected", () => {
  it("bcrypt.compare returns false for any string that differs from the registered password", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (pw, wrong) => {
          fc.pre(pw !== wrong);
          const hash = await bcrypt.hash(pw, 4); // cost 4 for test speed
          const result = await bcrypt.compare(wrong, hash);
          return result === false;
        }
      ),
      { numRuns: 10 }
    );
  }, 30000); // 30s timeout for bcrypt
});

// ── Property 3: JWT round-trip preserves user identity ───────────────────────

describe("Property 3: JWT round-trip preserves user identity", () => {
  it("sign then verify returns the same id and email", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
        const token = jwt.sign({ id, email }, TEST_SECRET, {
          expiresIn: "1h",
        });
        const payload = jwt.verify(token, TEST_SECRET) as {
          id: string;
          email: string;
        };
        return payload.id === id && payload.email === email;
      })
    );
  });
});

// ── Property 4: Expired or tampered JWT is always rejected ───────────────────

describe("Property 4: Expired or tampered JWT is always rejected", () => {
  it("expired token throws on verify", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
        // Create a token that expired 1 second ago
        const expiredToken = jwt.sign(
          { id, email, exp: Math.floor(Date.now() / 1000) - 1 },
          TEST_SECRET
        );
        let threw = false;
        try {
          jwt.verify(expiredToken, TEST_SECRET);
        } catch {
          threw = true;
        }
        return threw;
      })
    );
  });

  it("token signed with wrong secret throws on verify", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
        const token = jwt.sign({ id, email }, "wrong-secret", {
          expiresIn: "1h",
        });
        let threw = false;
        try {
          jwt.verify(token, TEST_SECRET);
        } catch {
          threw = true;
        }
        return threw;
      })
    );
  });
});
