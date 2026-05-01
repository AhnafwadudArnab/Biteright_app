"use strict";
/**
 * Property-based tests for auth-related correctness properties.
 *
 * Property 1: Password hashing is irreversible and verifiable
 * Property 2: Wrong password is always rejected
 * Property 3: JWT round-trip preserves user identity
 * Property 4: Expired or tampered JWT is always rejected
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const fc = __importStar(require("fast-check"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const TEST_SECRET = "test-jwt-secret-for-property-tests";
// ── Property 1: Password hashing is irreversible and verifiable ───────────────
describe("Property 1: Password hashing is irreversible and verifiable", () => {
    it("hash !== plaintext and bcrypt.compare returns true", async () => {
        await fc.assert(fc.asyncProperty(fc.string({ minLength: 1 }), async (pw) => {
            const hash = await bcrypt_1.default.hash(pw, 4); // cost 4 for test speed
            const matches = await bcrypt_1.default.compare(pw, hash);
            return hash !== pw && matches === true;
        }), { numRuns: 10 } // bcrypt is slow; 10 runs is sufficient
        );
    }, 30000); // 30s timeout for bcrypt
});
// ── Property 2: Wrong password is always rejected ─────────────────────────────
describe("Property 2: Wrong password is always rejected", () => {
    it("bcrypt.compare returns false for any string that differs from the registered password", async () => {
        await fc.assert(fc.asyncProperty(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }), async (pw, wrong) => {
            fc.pre(pw !== wrong);
            const hash = await bcrypt_1.default.hash(pw, 4); // cost 4 for test speed
            const result = await bcrypt_1.default.compare(wrong, hash);
            return result === false;
        }), { numRuns: 10 });
    }, 30000); // 30s timeout for bcrypt
});
// ── Property 3: JWT round-trip preserves user identity ───────────────────────
describe("Property 3: JWT round-trip preserves user identity", () => {
    it("sign then verify returns the same id and email", () => {
        fc.assert(fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
            const token = jsonwebtoken_1.default.sign({ id, email }, TEST_SECRET, {
                expiresIn: "1h",
            });
            const payload = jsonwebtoken_1.default.verify(token, TEST_SECRET);
            return payload.id === id && payload.email === email;
        }));
    });
});
// ── Property 4: Expired or tampered JWT is always rejected ───────────────────
describe("Property 4: Expired or tampered JWT is always rejected", () => {
    it("expired token throws on verify", () => {
        fc.assert(fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
            // Create a token that expired 1 second ago
            const expiredToken = jsonwebtoken_1.default.sign({ id, email, exp: Math.floor(Date.now() / 1000) - 1 }, TEST_SECRET);
            let threw = false;
            try {
                jsonwebtoken_1.default.verify(expiredToken, TEST_SECRET);
            }
            catch {
                threw = true;
            }
            return threw;
        }));
    });
    it("token signed with wrong secret throws on verify", () => {
        fc.assert(fc.property(fc.uuid(), fc.emailAddress(), (id, email) => {
            const token = jsonwebtoken_1.default.sign({ id, email }, "wrong-secret", {
                expiresIn: "1h",
            });
            let threw = false;
            try {
                jsonwebtoken_1.default.verify(token, TEST_SECRET);
            }
            catch {
                threw = true;
            }
            return threw;
        }));
    });
});
