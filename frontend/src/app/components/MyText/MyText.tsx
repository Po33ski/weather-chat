import { ReactNode } from "react";

export function MyText({ children }: { children: ReactNode }) {
  return <p className="text-xl font-semibold text-center mb-8">{children}</p>;
}
