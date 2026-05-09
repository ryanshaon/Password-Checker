/**
 * Password Strength Checker – Backend API
 * Node.js + Express
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Evaluate the strength of a given password and return a score + suggestions.
 * Scoring rules (each rule adds 1 point, max 5):
 *   1. Length >= 8
 *   2. Contains lowercase letters
 *   3. Contains uppercase letters
 *   4. Contains numbers
 *   5. Contains special characters
 */
function evaluatePassword(password) {
  const suggestions = [];
  let score = 0;

  // Rule 1: Minimum length
  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push("Use at least 8 characters");
  }

  // Rule 2: Lowercase
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    suggestions.push("Add lowercase letters");
  }

  // Rule 3: Uppercase
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push("Add uppercase letters");
  }

  // Rule 4: Numbers
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push("Include numbers");
  }

  // Rule 5: Special characters
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push("Use special characters (e.g. @, #, !, $)");
  }

  // Determine strength label
  let strength;
  if (score <= 2) strength = "Weak";
  else if (score <= 4) strength = "Medium";
  else strength = "Strong";

  return { score, strength, suggestions };
}

/**
 * Generate a cryptographically random strong password of given length.
 */
function generateStrongPassword(length = 16) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const all = upper + lower + digits + special;

  // Guarantee at least one of each category
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** POST /api/check-password */
app.post("/api/check-password", (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input: password must be a string." });
  }

  const result = evaluatePassword(password);
  return res.json(result);
});

/** GET /api/generate-password */
app.get("/api/generate-password", (req, res) => {
  const length = parseInt(req.query.length, 10) || 16;
  const safeLength = Math.min(Math.max(length, 8), 64); // clamp 8–64
  const password = generateStrongPassword(safeLength);
  return res.json({ password });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Password Checker API running on http://localhost:${PORT}`);
});
