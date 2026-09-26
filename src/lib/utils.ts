import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * formatPrice — Naira (NGN) display for all customer-facing prices.
 * Nuvia is a Naira-only platform.
 */
export function formatPrice(amount: number, _currency?: string): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NV-${timestamp}-${random}`;
}

export function generateTxRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `NVP-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractDomainName(input: string): string {
  const trimmed = input.trim().toLowerCase();
  // Remove common TLDs to get the base name
  const parts = trimmed.split(".");
  if (parts.length > 1) {
    return parts[0].replace(/[^a-z0-9-]/g, "");
  }
  return trimmed.replace(/[^a-z0-9-]/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "…";
}

/** Time remaining helper for rental subscriptions */
export function timeRemaining(endDate: string): { label: string; urgent: boolean } {
  const now = new Date();
  const end = new Date(endDate);
  const msLeft = end.getTime() - now.getTime();
  if (msLeft <= 0) return { label: "Expired", urgent: true };
  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: "Less than 1 day", urgent: true };
  if (days === 1) return { label: "1 day", urgent: true };
  if (days < 7) return { label: `${days} days`, urgent: true };
  if (days < 30) return { label: `${Math.floor(days / 7)} weeks`, urgent: false };
  const months = Math.floor(days / 30);
  return { label: `${months} month${months > 1 ? "s" : ""}`, urgent: false };
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-nuvia-champagne/20 text-[#7A5A2E] border-nuvia-champagne/50",
    processing: "bg-nuvia-sage/15 text-nuvia-moss border-nuvia-sage/40",
    completed: "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50",
    delivered: "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50",
    successful: "bg-[#AFC79B]/20 text-nuvia-forest border-[#AFC79B]/50",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-50 text-gray-600 border-gray-200",
    refunded: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return map[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
