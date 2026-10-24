import { InfoDialog } from "@/app/components/InfoDialog/InfoDialog";
import { LanguageSwitch } from "@/app/components/LanguageSwitch/LanguageSwitch";
import { Logo } from "@/app/components/Logo/Logo";
import { UnitSelect } from "@/app/components/UnitSelect/UnitSelect";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Logo />
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitch />
          <UnitSelect />
          <InfoDialog />
        </div>
      </div>
    </header>
  );
}
