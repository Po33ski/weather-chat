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
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-sky-400/50 focus:border-sky-400/50 transition-all duration-200 cursor-pointer"
    >
      <option value="en" className="bg-slate-900 text-white">EN</option>
      <option value="pl" className="bg-slate-900 text-white">PL</option>
    </select>
  );
}
