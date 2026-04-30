/**
 * API Configuration
 * Centralized configuration for backend API connection
 */

export const API_CONFIG = {
  development: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://local.gikiactions.com:3110"
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://new-api.gikiactions.com"
  }
} as const;

export function getApiConfig() {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
}

export function getApiUrl(path: string): string {
  const config = getApiConfig();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseUrl}${cleanPath}`;
}

const FRONTEND_URL = {
  development: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://local.gikiactions.com:3111",
  production: process.env.NEXT_PUBLIC_FRONTEND_URL || "https://gikiactions.com"
} as const;

export function getFrontendUrl(path: string): string {
  const base = process.env.NODE_ENV === "development" ? FRONTEND_URL.development : FRONTEND_URL.production;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
