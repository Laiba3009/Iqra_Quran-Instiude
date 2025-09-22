"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={`fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 p-4 md:bottom-6 md:right-6 ${className ?? ""}`}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
  }
>(({ className, title, description, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={`group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border bg-white p-3 shadow-md ${className ?? ""}`}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && <ToastPrimitive.Title className="font-medium text-sm">{title}</ToastPrimitive.Title>}
        {description && (
          <ToastPrimitive.Description className="mt-1 text-xs opacity-90">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100">
        ×
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = "Toast";

export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;
export const ToastClose = ToastPrimitive.Close;
