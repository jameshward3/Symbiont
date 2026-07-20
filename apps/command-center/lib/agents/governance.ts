const goalTransitions: Record<string, string[]> = {
  Proposed: ["Approved", "Cancelled"], Approved: ["Active", "Cancelled"], Active: ["Blocked", "Review", "Cancelled"],
  Blocked: ["Active", "Review", "Cancelled"], Review: ["Active", "Complete", "Cancelled"], Complete: [], Cancelled: [],
};

export function mayTransitionGoal(from: string, to: string, hasRequiredApproval: boolean) {
  if (!goalTransitions[from]?.includes(to)) return false;
  if (from === "Proposed" && to === "Approved" && !hasRequiredApproval) return false;
  return true;
}

export function validateHandoff(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("INVALID_HANDOFF");
  const value = input as Record<string, unknown>;
  for (const key of ["fromAgentId", "toAgentId", "objective", "acceptanceCriteria", "correlationId"]) if (!value[key]) throw new Error("INVALID_HANDOFF");
  if (value.fromAgentId === value.toAgentId) throw new Error("INVALID_HANDOFF");
  if (!Array.isArray(value.acceptanceCriteria) || value.acceptanceCriteria.length === 0) throw new Error("INVALID_HANDOFF");
  return { ...value, status: "Review" };
}
