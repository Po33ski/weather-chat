import { useId } from "react";
import {
  Footprints,
  GlassWater,
  Glasses,
  Layers,
  Shirt,
  Snowflake,
  Sun,
  Umbrella,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { packingTips, type PackingInput, type PackingTip } from "@/app/utils/weather";

const TIP_ICONS: Record<PackingTip, LucideIcon> = {
  umbrella: Umbrella,
  boots: Footprints,
  warmCoat: Snowflake,
  jacket: Shirt,
  sunscreen: Sun,
  water: GlassWater,
  sunglasses: Glasses,
  windbreaker: Wind,
  layers: Layers,
};

export function PackingTips({ input }: { input: PackingInput }) {
  const { t } = useLanguage();
  const titleId = useId();
  const tips = packingTips(input);

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={titleId}>
      <h3 id={titleId} className="text-lg font-semibold">
        {t("packing.title")}
      </h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tips.map((tip) => {
          const Icon = TIP_ICONS[tip];
          return (
            <li
              key={tip}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink"
            >
              <Icon className="size-4 text-ink-secondary" aria-hidden="true" />
              {t(`packing.${tip}`)}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
