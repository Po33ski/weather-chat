import { ReactNode } from "react";

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3.5">
          {children}
        </div>
      </div>
    </header>
  );
}
