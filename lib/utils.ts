import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the base URL with proper protocol
 * Ensures the URL has https:// in production and http:// in development
 * During build time, uses relative URLs if BASE_URL is not set
 */
export function getBaseUrl(): string {
  // Check NEXT_PUBLIC_BASE_URL first (user-defined)
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  
  // If not set, try VERCEL_URL (automatically provided by Vercel)
  if (!baseUrl && process.env.VERCEL_URL) {
    baseUrl = process.env.VERCEL_URL;
  }
  
  // If still empty, return empty string (for relative URLs)
  // This works during build time and runtime
  if (!baseUrl || baseUrl.trim() === '') {
    return '';
  }
  
  const trimmedUrl = baseUrl.trim();
  
  // If already has protocol, return as is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Add protocol based on environment
  // In production (Vercel), always use https
  // In development, use http
  // During build, NODE_ENV is 'production', so use https
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  return `${protocol}${trimmedUrl}`;
}
