"use client";
import { useContext } from "react";
import { LanguageContext } from "@/app/contexts/LanguageContext";
import type { Lang } from "@/app/types/types";

export function LanguageSelector() {
  const langCtx = useContext(LanguageContext);
  const current = langCtx?.lang ?? "en";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    langCtx?.setLang(e.target.value as Lang);
  };

  return (
    <select
      aria-label="Language"
      value={current}
      onChange={handleChange}
      className="bg-white border border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
    >
      <option value="en">EN</option>
      <option value="pl">PL</option>
    </select>
  );
}


