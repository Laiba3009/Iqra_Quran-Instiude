"use client";

import * as React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-300 ${
          checked ? "bg-green-600" : "bg-gray-300"
        }`}
      ></div>
      <div
        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
          checked ? "translate-x-5" : ""
        }`}
      ></div>
    </label>
  );
}
