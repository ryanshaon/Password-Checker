/**
 * PasswordChecker – Core component
 * Handles: input, show/hide, API calls, strength display, generate & copy.
 */

import { useState, useEffect, useRef } from "react";
import { EyeIcon, EyeOffIcon, CopyIcon, CheckIcon, SparkleIcon } from "./Icons";

const API_BASE = "https://password-checker-teal.vercel.app/api";

// Map score → color classes for the bar segments
const SEGMENT_COLORS = {
  Weak: "bg-red-500",
  Medium: "bg-yellow-400",
  Strong: "bg-emerald-500",
};

// Map score → label color
const LABEL_COLORS = {
  Weak: "text-red-500",
  Medium: "text-yellow-400",
  Strong: "text-emerald-500",
};

// Map score → bar width (out of 5)
function barWidth(score) {
  if (!score) return "0%";
  return `${(score / 5) * 100}%`;
}

export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);       // { score, strength, suggestions }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const debounceTimer = useRef(null);

  // ── Debounced API call on every password change ─────────────────────────────
  useEffect(() => {
    if (!password) {
      setResult(null);
      setError("");
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      checkPassword(password);
    }, 350);

    return () => clearTimeout(debounceTimer.current);
  }, [password]);

  async function checkPassword(pwd) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/check-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("⚠️ Could not reach the backend. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/generate-password?length=18`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setPassword(data.password);
    } catch {
      setError("⚠️ Could not reach the backend. Please check your connection.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const strengthLabel = result?.strength ?? "";
  const score = result?.score ?? 0;
  const suggestions = result?.suggestions ?? [];

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-900/30 border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-colors duration-300">

      {/* ── Input ─────────────────────────────────────────────────────────── */}
      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
        Enter Password
      </label>
      <div className="relative">
        <input
          id="password-input"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type your password…"
          className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 text-sm transition"
          autoComplete="new-password"
        />
        {/* Show / Hide toggle */}
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Strength bar ──────────────────────────────────────────────────── */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Strength
          </span>
          {strengthLabel && !loading && (
            <span className={`text-xs font-bold ${LABEL_COLORS[strengthLabel]}`}>
              {strengthLabel}
            </span>
          )}
          {loading && (
            <span className="text-xs text-indigo-400 animate-pulse">Checking…</span>
          )}
        </div>

        {/* Track */}
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full strength-bar-fill ${
              strengthLabel ? SEGMENT_COLORS[strengthLabel] : "bg-transparent"
            }`}
            style={{ width: barWidth(score) }}
          />
        </div>

        {/* Score dots */}
        <div className="flex gap-1.5 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                i <= score
                  ? strengthLabel === "Weak"
                    ? "bg-red-400"
                    : strengthLabel === "Medium"
                    ? "bg-yellow-400"
                    : "bg-emerald-400"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Score badge ───────────────────────────────────────────────────── */}
      {result && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Score:</span>
          <span className="score-badge inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-bold">
            {score}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">/ 5</span>
        </div>
      )}

      {/* ── Suggestions ───────────────────────────────────────────────────── */}
      {suggestions.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="suggestion-item flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-lg px-3 py-1.5"
              >
                <span className="text-amber-500">⚡</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All good message */}
      {result && suggestions.length === 0 && (
        <div className="mt-5 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl px-4 py-2.5">
          <CheckIcon />
          <span className="font-medium">Your password is excellent! 🎉</span>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* Generate */}
        <button
          id="generate-btn"
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow-md shadow-indigo-300 dark:shadow-indigo-900/50 transition-all active:scale-95"
        >
          <SparkleIcon />
          {generating ? "Generating…" : "Generate"}
        </button>

        {/* Copy */}
        <button
          id="copy-btn"
          onClick={handleCopy}
          disabled={!password}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 text-sm font-semibold transition-all active:scale-95"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
