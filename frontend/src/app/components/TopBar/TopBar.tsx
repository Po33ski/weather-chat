import { ReactNode } from "react";

export function TopBar({ children }: { children: ReactNode }) {
  return (
    <header className=" grid-cols-3 pt-2 pb-8 flex gap justify-between items-center">
      {children}
    </header>
  );
}
