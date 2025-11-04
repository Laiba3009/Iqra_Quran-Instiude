// src/types/shadcn-toast.d.ts
import type { Toast } from "@/components/ui/use-toast";

declare module "@/components/ui/use-toast" {
  interface ToastOptions extends Partial<Toast> {
    variant?: "default" | "destructive" | string;
  }
}
