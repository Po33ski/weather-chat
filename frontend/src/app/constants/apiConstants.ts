// Base URL for the backend API used by the frontend.
// Note: with Vite, only variables prefixed with VITE_ are exposed to the client.
export const BACKEND_API_URL: string = import.meta.env.VITE_BACKEND_API_URL || "";
