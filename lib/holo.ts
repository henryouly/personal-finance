import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

// Fallback URL for server-side rendering or when window is not available
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin;
  }
  // Server-side: use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export const client = hc<AppType>(getBaseUrl());
