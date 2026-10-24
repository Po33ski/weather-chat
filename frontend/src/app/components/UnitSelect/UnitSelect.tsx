import { ChevronDown } from "lucide-react";
import { isUnitSystemId, UNIT_SYSTEM_IDS } from "@/app/constants/unitSystems";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useUnitSystem } from "@/app/hooks/useUnitSystem";

export function UnitSelect() {
  const { t } = useLanguage();
  const { id, setUnitSystem } = useUnitSystem();

  return (
    <div className="relative">
      <select
        aria-label={t("header.units")}
        value={id}
        onChange={(event) => {
          if (isUnitSystemId(event.target.value)) setUnitSystem(event.target.value);
        }}
        className="focus-ring h-8 cursor-pointer appearance-none rounded-full border border-line bg-surface py-0 pl-3 pr-8 text-xs font-semibold text-ink transition-colors hover:border-line-strong"
      >
        {UNIT_SYSTEM_IDS.map((system) => (
          <option key={system} value={system}>
            {t(`units.${system}`)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
    </div>
  );
}
