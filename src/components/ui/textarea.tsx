"use client";
import * as React from "react";
import { cn } from "@/lib/utils"; // optional helper (if you don’t have this, see below note)

/**
 * A reusable Textarea component for forms.
 * 
 * Example:
 * <Textarea placeholder="Write your message..." rows={4} />
 */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
