import { ReactNode } from "react";
import Link from "next/link";

export function ButtonLink({
  path,
  children,
}: {
  path: string;
  children: ReactNode | string;
}) {
  return (
    <div className="flex justify-center items-center pt-5 text-lg font-semibold">
      <Link
        href={path}
        className="bg-black text-white border-black border-2 rounded-md cursor-pointer px-20 py-2 mt-20 mb-20 hover:bg-white hover:text-black"
      >
        {children}
      </Link>
    </div>
  );
}
