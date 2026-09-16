export const CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  API_SECRET: process.env.NEXT_PUBLIC_API_SECRET || "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
} as const;

// Ensure critical config exists
if (!CONFIG.API_URL && typeof window !== "undefined") {
}
