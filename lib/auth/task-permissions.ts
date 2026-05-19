/**
 * Pure boolean predicates for task-level permission checks.
 * Used by both the Server Actions (defensive) and the UI (to hide
 * disallowed controls).  No DB / no I/O.
 */

import { PENDING_STATUSES, type TaskStatus } from "@/db/enums";
import { canTransitionTo, type ActorRole } from "@/lib/auth/status-transitions";

export type TaskPermissionInput = {
  employee: {
    id: string;
    isAdmin: boolean;
  };
  task: {
    createdById: string | null;
    initiatorId: string;
    doerId: string;
    status: TaskStatus;
  };
};

/**
 * canEditTaskFields — permissions matrix row "Edit fields on a task":
 *   creator OR initiator (only while pending) OR admin (always).
 * Spec line 223.
 */
export function canEditTaskFields(input: TaskPermissionInput): boolean {
  const { employee, task } = input;
  if (employee.isAdmin) return true;
  const isPending = (PENDING_STATUSES as readonly string[]).includes(
    task.status,
  );
  if (!isPending) return false;
  if (task.createdById === employee.id) return true;
  if (task.initiatorId === employee.id) return true;
  return false;
}

/**
 * Compute the actor's role relative to a single task.
 * Used by every workflow-predicate below.  Falls through in order:
 * admin → doer → initiator → creator → stranger.
 */
function actorRoleFor(input: TaskPermissionInput): ActorRole {
  const { employee, task } = input;
  if (employee.isAdmin) return "admin";
  if (task.doerId === employee.id) return "doer";
  if (task.initiatorId === employee.id) return "initiator";
  if (task.createdById === employee.id) return "creator";
  return "stranger";
}

/**
 * canApprove — initiator OR admin, only when status === "done".
 * Spec line 226 ("Move done → approved | not_approved").
 */
export function canApprove(input: TaskPermissionInput): boolean {
  const role = actorRoleFor(input);
  return canTransitionTo(input.task.status, "approved", role);
}

/**
 * canReassign — doer OR initiator OR admin, only in the pending lane.
 * Spec line 229.  Reassignment never affects status by itself; the
 * "reset to not_started" option is a separate flag on the Server
 * Action.  We approximate the "non-terminal + not done" rule via the
 * transition matrix: a task is reassignable iff at least one PENDING
 * status is reachable for the actor.
 */
export function canReassign(input: TaskPermissionInput): boolean {
  const role = actorRoleFor(input);
  if (role === "stranger" || role === "creator") return false;
  const isPending = (["not_started", "initiated", "follow_up", "need_help"] as const)
    .includes(input.task.status as never);
  if (role === "admin") return isPending || input.task.status === "not_approved";
  return isPending; // doer OR initiator in the pending lane
}

/**
 * canTransferExternal — initiator OR admin, only from a non-terminal status.
 * Spec line 228.
 */
export function canTransferExternal(input: TaskPermissionInput): boolean {
  const role = actorRoleFor(input);
  return canTransitionTo(input.task.status, "transferred", role);
}

/**
 * canCancel — initiator OR admin, only from a non-terminal status.
 * Spec line 227.
 */
export function canCancel(input: TaskPermissionInput): boolean {
  const role = actorRoleFor(input);
  return canTransitionTo(input.task.status, "cancelled", role);
}

/**
 * canComment — any task participant (creator/initiator/doer) or admin,
 * regardless of status.  Spec line 231 (audit read = task participants).
 * Strangers may not comment; that would leak the task's existence.
 */
export function canComment(input: TaskPermissionInput): boolean {
  const role = actorRoleFor(input);
  return role !== "stranger";
}
