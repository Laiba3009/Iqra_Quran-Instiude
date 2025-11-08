"use client";

import * as React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-5 pb-2 border-b">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-800">{children}</h2>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-3 border-t bg-gray-50 text-right flex justify-end gap-2">
      {children}
    </div>
  );
}
