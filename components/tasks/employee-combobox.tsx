"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxMulti,
  type ComboboxOption,
} from "@/components/ui/combobox";
import { EmployeeAvatar } from "@/components/ui/employee-avatar";

export type EmployeeOption = {
  id: string;
  name: string;
  department?: string | null;
};

function buildOptions(employees: EmployeeOption[]): ComboboxOption<string>[] {
  return employees.map((e) => ({
    value: e.id,
    label: e.name,
    hint: e.department ?? undefined,
    renderItem: () => (
      <span className="flex items-center gap-2.5 flex-1">
        <EmployeeAvatar name={e.name} size="sm" />
        <span
          className="flex-1 text-ink-strong font-semibold"
          style={{ fontSize: 15 }}
        >
          {e.name}
        </span>
        {e.department && (
          <span className="text-[13px] text-ink-subtle">{e.department}</span>
        )}
      </span>
    ),
    renderChip: () => (
      <span className="inline-flex items-center gap-1.5">
        <EmployeeAvatar name={e.name} size="sm" />
        {e.name}
      </span>
    ),
  }));
}

export function EmployeeCombobox(props: {
  employees: EmployeeOption[];
  value: string | "";
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const options = React.useMemo(
    () => buildOptions(props.employees),
    [props.employees],
  );
  return (
    <Combobox
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      options={options}
      placeholder={props.placeholder ?? "Select an employee…"}
      searchPlaceholder="Search employees…"
      emptyText="No matching employee."
    />
  );
}

export function EmployeeComboboxMulti(props: {
  employees: EmployeeOption[];
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const options = React.useMemo(
    () => buildOptions(props.employees),
    [props.employees],
  );
  return (
    <ComboboxMulti
      id={props.id}
      values={props.values}
      onChange={props.onChange}
      options={options}
      placeholder={props.placeholder ?? "Pick one or more…"}
      searchPlaceholder="Search employees…"
      emptyText="No matching employee."
    />
  );
}
