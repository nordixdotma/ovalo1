import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-MA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Add this function if it doesn't already exist
export function getLanguageFromHeaders(headers: Headers): "fr" | "en" | "ar" | null {
  const acceptLanguage = headers.get("accept-language")
  if (!acceptLanguage) return null

  if (acceptLanguage.includes("fr")) return "fr"
  if (acceptLanguage.includes("ar")) return "ar"
  if (acceptLanguage.includes("en")) return "en"

  return null
}
