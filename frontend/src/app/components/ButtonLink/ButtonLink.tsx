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
    <div className="flex justify-center items-center py-8">
      <Link
        href={path}
        className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span className="flex items-center space-x-2">
          <span>{children}</span>
          <svg 
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
