import { ReactNode } from "react";

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
          {children}
        </div>
      </div>
    </header>
  );
}
