"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { TASK_PRIORITIES, PRIORITY_LABELS, type TaskPriority } from "@/db/enums";
import { editTaskFields } from "@/app/(app)/tasks/actions";
import { fireToast } from "@/lib/toast";

interface Props {
  taskId: string;
  initial: {
    title: string;
    description: string | null;
    subject: string | null;
    notes: string | null;
    priority: TaskPriority;
    dueAt: Date;
  };
  /** Used for the optimistic-lock — must be the row's current updated_at. */
  expectedUpdatedAt: string;
  onCancel: () => void;
}

/** Pretty field with on-focus underline + soft shadow (auth-style). */
function FieldShell({
  label,
  htmlFor,
  required,
  children,
  focused,
  setFocused,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  focused: boolean;
  setFocused: (b: boolean) => void;
  children: (focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  }) => React.ReactNode;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={htmlFor}
        className="block text-[12.5px] uppercase tracking-[0.08em] font-bold text-ink-subtle mb-1.5"
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--color-altus-red)" }}>
            *
          </span>
        )}
      </label>
      {children({
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
      })}
      <span
        aria-hidden
        className="block h-[1.5px] mt-px rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-altus-red), var(--color-rose), var(--color-purple))",
          transform: focused ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition: "transform 380ms cubic-bezier(0.2, 0.7, 0.3, 1)",
        }}
      />
    </div>
  );
}

export function TaskEditForm({
  taskId,
  initial,
  expectedUpdatedAt,
  onCancel,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial.title);
  const [description, setDesc] = useState(initial.description ?? "");
  const [subject, setSubject] = useState(initial.subject ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initial.priority);
  const [dueAt, setDueAt] = useState(
    initial.dueAt.toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);

  // Focus state per field — drives the underline animation.
  const [fTitle, setFTitle] = useState(false);
  const [fPrio, setFPrio] = useState(false);
  const [fDue, setFDue] = useState(false);
  const [fSubj, setFSubj] = useState(false);
  const [fDesc, setFDesc] = useState(false);
  const [fNotes, setFNotes] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const dueIso = new Date(`${dueAt}T12:00:00.000Z`).toISOString();

    startTransition(async () => {
      const result = await editTaskFields(
        taskId,
        {
          title,
          description: description === "" ? null : description,
          subject: subject === "" ? null : subject,
          notes: notes === "" ? null : notes,
          priority,
          dueAt: dueIso,
        },
        expectedUpdatedAt,
      );
      if (!result.ok) {
        if (result.error === "stale") {
          setError(
            "This task was changed by someone else. Reload to see the latest version.",
          );
        } else if (result.error === "forbidden") {
          setError("You don't have permission to edit this task.");
        } else if (result.error === "not-found") {
          setError("Task no longer exists.");
        } else {
          setError(result.message ?? "Validation failed.");
        }
        return;
      }
      fireToast({ message: "Task updated." });
      onCancel();
      router.refresh();
    });
  }

  const inputClass =
    "w-full rounded-lg border border-hairline px-3.5 py-3 text-[15px] bg-white outline-none transition-shadow focus:border-[rgba(225,29,42,0.45)] focus:shadow-[0_0_0_4px_rgba(225,29,42,0.06)]";

  return (
    <motion.form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24 }}
    >
      <FieldShell
        label="Title"
        htmlFor="te-title"
        required
        focused={fTitle}
        setFocused={setFTitle}
      >
        {(p) => (
          <input
            id="te-title"
            type="text"
            required
            maxLength={240}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            {...p}
          />
        )}
      </FieldShell>

      <div className="grid grid-cols-2 gap-3">
        <FieldShell
          label="Priority"
          htmlFor="te-priority"
          focused={fPrio}
          setFocused={setFPrio}
        >
          {(p) => (
            <select
              id="te-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className={inputClass}
              {...p}
            >
              {TASK_PRIORITIES.map((pr) => (
                <option key={pr} value={pr}>
                  {PRIORITY_LABELS[pr]}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
        <FieldShell
          label="Due"
          htmlFor="te-due"
          required
          focused={fDue}
          setFocused={setFDue}
        >
          {(p) => (
            <input
              id="te-due"
              type="date"
              required
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className={inputClass}
              {...p}
            />
          )}
        </FieldShell>
      </div>

      <FieldShell
        label="Subject"
        htmlFor="te-subject"
        focused={fSubj}
        setFocused={setFSubj}
      >
        {(p) => (
          <input
            id="te-subject"
            type="text"
            maxLength={120}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            {...p}
          />
        )}
      </FieldShell>

      <FieldShell
        label="Description"
        htmlFor="te-desc"
        focused={fDesc}
        setFocused={setFDesc}
      >
        {(p) => (
          <textarea
            id="te-desc"
            rows={3}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            className={`${inputClass} resize-y`}
            {...p}
          />
        )}
      </FieldShell>

      <FieldShell
        label="Internal notes"
        htmlFor="te-notes"
        focused={fNotes}
        setFocused={setFNotes}
      >
        {(p) => (
          <textarea
            id="te-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-y`}
            {...p}
          />
        )}
      </FieldShell>

      {error && (
        <p
          className="text-[14px] rounded-md px-3.5 py-2.5"
          style={{
            color: "var(--color-red-deep)",
            background: "var(--color-red-bg)",
            border:
              "1px solid color-mix(in srgb, var(--color-red) 25%, transparent)",
          }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="px-5 py-2.5 rounded-lg text-[14px] font-medium border border-hairline bg-white text-ink-strong hover:bg-surface-soft disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, #ff3845, var(--color-altus-red) 45%, var(--color-altus-red-deep))",
            boxShadow: "0 8px 20px -10px rgba(225, 29, 42, 0.6)",
          }}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </motion.form>
  );
}
