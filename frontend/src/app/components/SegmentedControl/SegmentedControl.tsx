import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys / Home / End move the
 * selection, and only the selected tab is in the Tab order.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  idPrefix,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  idPrefix: string;
}) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const option = options[(index + options.length) % options.length];
    onChange(option.value);
    tabs.current[options.indexOf(option)]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key]);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-muted p-1"
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${option.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors sm:px-3.5 sm:text-sm ${
              selected
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            {/* Icons are decorative; drop them on phones so all tabs fit in one row. */}
            {option.icon && <span className="hidden sm:inline-flex">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
