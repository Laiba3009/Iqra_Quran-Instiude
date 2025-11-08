"use client";

import * as React from "react";
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast";

export type ToastPayload = {
  title?: string;
  description?: string;
  // optional variant in future if you want different styles
};

type InternalToast = ToastPayload & { id: number };

const ToastContext = React.createContext<{
  toast: (opts: ToastPayload) => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within <Toaster />");
  }
  return context;
}

/**
 * Toaster - wrap app in this provider (usually in app/layout.tsx)
 * Usage:
 *  const { toast } = useToast();
 *  toast({ title: "Saved", description: "Your data was saved." });
 */
export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<InternalToast[]>([]);

  const addToast = (opts: ToastPayload) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { ...opts, id }]);

    // auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <ToastProvider>
        {children}

        {/* Render toasts */}
        {toasts.map((t) => (
          <Toast key={t.id} open onOpenChange={() => {}} title={t.title} description={t.description} />
        ))}

        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
