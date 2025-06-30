import { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return <div className="flex-1 ">{children}</div>;
}
