import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the base URL with proper protocol
 * Ensures the URL has https:// in production and http:// in development
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  
  // If empty, return empty string (for relative URLs)
  if (!baseUrl) return '';
  
  // If already has protocol, return as is
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl;
  }
  
  // Add protocol based on environment
  // In production (Vercel), always use https
  // In development, use http
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  return `${protocol}${baseUrl}`;
}
