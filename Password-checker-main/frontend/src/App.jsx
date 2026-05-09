import { useState } from "react";
import PasswordChecker from "./components/PasswordChecker";
import { SunIcon, MoonIcon } from "./components/Icons";

export default function App() {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-gray-950 dark:to-indigo-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        {/* Dark / Light toggle */}
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark mode"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur border border-white/30 dark:border-white/10 text-gray-700 dark:text-yellow-300 hover:scale-110 transition-transform"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Branding */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2 tracking-tight">
          🔐 Password<span className="text-indigo-500"> Strength</span> Checker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Analyze and generate secure passwords instantly
        </p>

        <PasswordChecker />
      </div>
    </div>
  );
}
