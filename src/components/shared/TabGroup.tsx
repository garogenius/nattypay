"use client";

import React from "react";

interface TabItem<T extends string> { key: T; label: string }

interface TabGroupProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}

const TabGroup = <T extends string>({ items, value, onChange, className }: TabGroupProps<T>) => {
  return (
    <div className={`w-full grid grid-cols-3 gap-2 sm:gap-3 ${className || ""}`}>
      {items.map((t) => (
        <button
          key={t.key}
          className={`w-full rounded-full px-2 py-2 text-[11px] sm:px-4 sm:py-3 sm:text-sm font-medium border transition-colors ${
            value === t.key
              ? "bg-white/5 border-[#D4B139] text-white"
              : "bg-transparent border-border-800 dark:border-border-700 text-white/70 hover:bg-white/5"
          }`}
          onClick={() => onChange(t.key)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default TabGroup;
