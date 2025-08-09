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
      className="border-2 border-black rounded-lg px-3 py-2 text-sm md:text-base bg-white hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="en">EN</option>
      <option value="pl">PL</option>
    </select>
  );
}


