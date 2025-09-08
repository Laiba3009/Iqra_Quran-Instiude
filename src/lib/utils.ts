import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind classes ko merge karne ke liye helper
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
