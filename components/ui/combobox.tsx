"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";

export interface ComboboxOption<T extends string = string> {
  value: T;
  label: string;
  renderItem?: () => React.ReactNode;
  hint?: string;
  renderChip?: () => React.ReactNode;
}

interface SingleProps<T extends string> {
  value: T | "";
  onChange: (v: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Combobox<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches.",
  disabled,
  className,
  id,
}: SingleProps<T>) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn("nt-input flex items-center justify-between gap-2 text-left", className)}
        >
          <span className={cn("flex-1 truncate", !selected && "text-ink-subtle")}>
            {selected ? selected.label : placeholder}
            {selected?.hint && (
              <span className="ml-2 text-ink-subtle font-medium">{selected.hint}</span>
            )}
          </span>
          <ChevronDown size={14} className="text-ink-subtle shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 overflow-auto">
            <CommandEmpty className="px-3 py-3 text-[15px] text-ink-subtle">
              {emptyText}
            </CommandEmpty>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={`${opt.label} ${opt.value}`}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="flex items-center gap-2.5 w-full">
                  {opt.renderItem ? (
                    opt.renderItem()
                  ) : (
                    <span className="flex-1 text-ink-strong">{opt.label}</span>
                  )}
                  {opt.value === value && (
                    <Check size={15} className="text-ink-strong shrink-0" />
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface MultiProps<T extends string> {
  values: T[];
  onChange: (next: T[]) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxChips?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function ComboboxMulti<T extends string = string>({
  values,
  onChange,
  options,
  placeholder = "Pick one or more…",
  searchPlaceholder = "Search…",
  emptyText = "No matches.",
  maxChips,
  disabled,
  className,
  id,
}: MultiProps<T>) {
  const [open, setOpen] = React.useState(false);
  const byValue = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options],
  );

  function toggle(v: T) {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  }

  const shown = maxChips ? values.slice(0, maxChips) : values;
  const overflow = maxChips ? values.length - shown.length : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn("nt-input flex items-center justify-between gap-2 text-left", className)}
        >
          <span className="flex flex-wrap items-center gap-1.5 min-h-[24px] max-h-[88px] overflow-y-auto">
            {values.length === 0 ? (
              <span className="text-ink-subtle">{placeholder}</span>
            ) : (
              <>
                {shown.map((v) => {
                  const opt = byValue.get(v);
                  return (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1"
                      style={{
                        background: "var(--vp-cyan-tint)",
                        color: "rgb(var(--vp-cyan-deep))",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {opt?.renderChip ? opt.renderChip() : (opt?.label ?? v)}
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Remove ${opt?.label ?? v}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(v);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            toggle(v);
                          }
                        }}
                        className="inline-flex items-center justify-center cursor-pointer"
                        style={{ width: 18, height: 18, borderRadius: 999 }}
                      >
                        <X size={12} strokeWidth={2.6} />
                      </span>
                    </span>
                  );
                })}
                {overflow > 0 && (
                  <span className="text-[13px] text-ink-subtle">+{overflow}</span>
                )}
              </>
            )}
          </span>
          <ChevronDown size={14} className="text-ink-subtle shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72 overflow-auto">
            <CommandEmpty className="px-3 py-3 text-[15px] text-ink-subtle">
              {emptyText}
            </CommandEmpty>
            {options.map((opt) => {
              const checked = values.includes(opt.value);
              return (
                <CommandItem
                  key={opt.value}
                  value={`${opt.label} ${opt.value}`}
                  onSelect={() => toggle(opt.value)}
                >
                  <span className="flex items-center gap-2.5 w-full">
                    <span
                      className={cn(
                        "size-4 rounded border border-hairline-strong flex items-center justify-center shrink-0",
                        checked && "bg-ink-strong border-ink-strong",
                      )}
                    >
                      {checked && <Check size={11} className="text-white" />}
                    </span>
                    {opt.renderItem ? (
                      opt.renderItem()
                    ) : (
                      <span className="flex-1 text-ink-strong">{opt.label}</span>
                    )}
                  </span>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
