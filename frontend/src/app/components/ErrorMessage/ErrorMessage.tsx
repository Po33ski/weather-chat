import { ReactNode } from "react";

export function ErrorMessage({ 
  children, 
  onClose 
}: { 
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-3 rounded-lg border border-red-600 shadow-lg flex items-center gap-3 max-w-md">
      <span className="flex-1">{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 rounded p-1"
          aria-label="Close error message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
