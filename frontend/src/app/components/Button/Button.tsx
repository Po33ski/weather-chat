import { ReactNode } from "react";

export function Button({
  onClick,
  children,
}: {
  onClick: React.MouseEventHandler;
  children: ReactNode | string;
}) {
  return (
    <button
      onClick={onClick}
      className=" bg-black text-white text-lg font-semibold border-black border-2 rounded-md cursor-pointer px-20 py-2 mt-10 mb-20 hover:bg-white hover:text-black"
    >
      {children}
    </button>
  );
}
