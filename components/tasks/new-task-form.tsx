"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { TASK_PRIORITIES, PRIORITY_LABELS, type TaskPriority } from "@/db/enums";
import { createTask } from "@/app/(app)/tasks/actions";

type EmployeeOption = { id: string; name: string };

interface Props {
  employees: EmployeeOption[];
  /** Called after a successful create. Default: navigate to /tasks/[id]. */
  onSuccess?: (taskId: string) => void;
  /** Optional defaults for the form (used by the canonical route). */
  defaults?: {
    doerId?: string;
    initiatorId?: string;
    priority?: TaskPriority;
  };
}

const DEFAULT_PRIORITY: TaskPriority = "not_imp_not_urgent";

export function NewTaskForm({ employees, onSuccess, defaults }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle]       = useState("");
  const [description, setDesc]  = useState("");
  const [subject, setSubject]   = useState("");
  const [notes, setNotes]       = useState("");
  const [doerId, setDoerId]     = useState(defaults?.doerId ?? "");
  const [initiatorId, setInit]  = useState(defaults?.initiatorId ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    defaults?.priority ?? DEFAULT_PRIORITY,
  );
  // Default due: 7 days out.
  const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [dueAt, setDueAt] = useState(sevenDays.toISOString().slice(0, 10));

  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!doerId || !initiatorId) {
      setError("Doer and Initiator are required.");
      return;
    }
    // The <input type="date"> gives YYYY-MM-DD; convert to ISO at noon UTC
    // so timezone wrap-arounds don't push the due into the wrong day.
    const dueIso = new Date(`${dueAt}T12:00:00.000Z`).toISOString();

    startTransition(async () => {
      const result = await createTask({
        title,
        doerId,
        initiatorId,
        priority,
        dueAt: dueIso,
        description: description || null,
        subject: subject || null,
        notes: notes || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (onSuccess) onSuccess(result.id);
      else router.push(`/tasks/${result.id}` as Route);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
      <div>
        <label htmlFor="nt-title" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
          Title <span className="text-rose">*</span>
        </label>
        <input
          id="nt-title"
          type="text"
          required
          maxLength={240}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          placeholder="e.g. Verify KYC for borrower 4471"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nt-doer" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
            Doer <span className="text-rose">*</span>
          </label>
          <select
            id="nt-doer"
            required
            value={doerId}
            onChange={(e) => setDoerId(e.target.value)}
            className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          >
            <option value="">Select an employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nt-initiator" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
            Initiator <span className="text-rose">*</span>
          </label>
          <select
            id="nt-initiator"
            required
            value={initiatorId}
            onChange={(e) => setInit(e.target.value)}
            className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          >
            <option value="">Select an employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nt-priority" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
            Priority
          </label>
          <select
            id="nt-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nt-due" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
            Due <span className="text-rose">*</span>
          </label>
          <input
            id="nt-due"
            type="date"
            required
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="nt-subject" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
          Subject
        </label>
        <input
          id="nt-subject"
          type="text"
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white"
          placeholder="Optional category (e.g. KYC, Disbursement…)"
        />
      </div>

      <div>
        <label htmlFor="nt-desc" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
          Description
        </label>
        <textarea
          id="nt-desc"
          rows={3}
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white resize-y"
        />
      </div>

      <div>
        <label htmlFor="nt-notes" className="block text-[14px] font-semibold text-ink-strong mb-1.5">
          Internal notes
        </label>
        <textarea
          id="nt-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-hairline px-3.5 py-3 text-[15px] bg-white resize-y"
        />
      </div>

      {error && (
        <p className="text-[14px]" style={{ color: "var(--color-red-deep)" }}>{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-md text-[15px] font-semibold text-white disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--color-altus-red), var(--color-altus-red-deep))",
          }}
        >
          {pending ? "Creating…" : "Create task"}
        </button>
      </div>
    </form>
  );
}
