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
    <div className="flex items-center gap-2">
      <label htmlFor="lang" className="text-sm text-gray-600">Lang</label>
      <select
        id="lang"
        value={current}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="en">EN</option>
        <option value="pl">PL</option>
      </select>
    </div>
  );
}


