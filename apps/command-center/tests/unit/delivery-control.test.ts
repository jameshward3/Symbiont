import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateProjectHealth, isActionOverdue } from "../../lib/delivery-control.ts";

test("project health enforces schedule and margin thresholds", () => {
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 5, marginVariancePoints: 3 }), "Green");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 6, marginVariancePoints: 3 }), "Amber");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 10, marginVariancePoints: -7 }), "Amber");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 10.1, marginVariancePoints: 0 }), "Red");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 0, marginVariancePoints: -7.1 }), "Red");
});

test("material delivery signals override otherwise healthy variance", () => {
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 0, marginVariancePoints: 0, missedCriticalMilestone: true }), "Red");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 0, marginVariancePoints: 0, unauthorizedCommitment: true }), "Red");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 0, marginVariancePoints: 0, failedQualityReview: true }), "Amber");
  assert.equal(calculateProjectHealth({ scheduleVariancePercent: 0, marginVariancePoints: 0, blockedDependency: true }), "Amber");
});

test("overdue actions exclude terminal statuses and respect the end of due day", () => {
  const at = "2026-07-20T12:00:00Z";
  assert.equal(isActionOverdue({ dueDate: "2026-07-19", status: "Open" }, at), true);
  assert.equal(isActionOverdue({ dueDate: "2026-07-20", status: "Open" }, at), false);
  assert.equal(isActionOverdue({ dueDate: "2026-07-19", status: "Complete" }, at), false);
});

test("D1 migration includes all delivery tables and control identifiers", async () => {
  const sql = await readFile(new URL("../../drizzle/0001_bitter_nebula.sql", import.meta.url), "utf8");
  for (const table of ["projects", "project_stakeholders", "deliverables", "milestones", "actions", "risks_and_issues", "decisions", "changes", "quality_reviews", "status_reports", "project_events", "evidence_links", "closeout_records"]) {
    assert.match(sql, new RegExp(`CREATE TABLE .${table}.`, "i"));
  }
  for (const table of ["actions", "changes", "deliverables", "milestones", "risks_and_issues", "status_reports", "closeout_records"]) {
    const statement = sql.match(new RegExp(`CREATE TABLE .${table}. \\(([\\s\\S]*?)\\n\\);`, "i"))?.[1] ?? "";
    for (const column of ["project_id", "shared_goal_id", "correlation_id", "owner_agent_id", "source_evidence", "created_at", "updated_at"]) assert.match(statement, new RegExp(`.${column}.`));
  }
  assert.match(sql, /projects_health_check/);
  assert.match(sql, /projects_goal_corr_idx/);
});

test("AGT-003 skill and UI preserve L1 boundaries and demonstration disclosure", async () => {
  const [skill, page, view, api, delivery] = await Promise.all([
    readFile(new URL("../../../../.agents/skills/symbiont-delivery-control/SKILL.md", import.meta.url), "utf8"),
    readFile(new URL("../../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/delivery-control.tsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/api/delivery-control/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../../lib/delivery-control.ts", import.meta.url), "utf8"),
  ]);
  assert.match(skill, /AGT-003/);
  assert.match(skill, /L1/);
  assert.match(skill, /Never change contractual scope/);
  assert.match(skill, /human approval/i);
  assert.match(page, /Delivery Control/);
  assert.match(view, /DEMONSTRATION DATA/);
  assert.match(delivery, /No live project record, database write, agent handoff, or automated monitoring event/i);
  assert.match(api, /isAuthorized/);
  assert.doesNotMatch(api, /export async function (POST|PATCH|PUT|DELETE)/);
});
