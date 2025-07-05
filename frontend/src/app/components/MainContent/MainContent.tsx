import { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return <div className="flex flex-col flex-1">{children}</div>;
}
