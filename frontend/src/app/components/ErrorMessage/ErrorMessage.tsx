import { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <span className="fixed top-4 bg-red-500 text-white px-4 py-2 rounded-lg border border-red-500">
      {children}
    </span>
  );
}
