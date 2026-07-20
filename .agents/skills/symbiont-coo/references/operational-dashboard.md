# Operational Dashboard Specification

**Owner:** COO  
**Platform:** Power BI  
**Refresh:** Daily at 06:00 local; finance weekly after reconciliation

## Executive Page

Show: revenue booked YTD; gross margin; cash runway; weighted pipeline; backlog; on-time milestone rate; project health distribution; overdue critical tasks; client satisfaction; proposal cycle time; automation hours saved; and top five risks.

Use red only for action-required exceptions. Every metric must expose owner, source, last refresh, definition, target, and drill-through.

## Portfolio Page

Active projects with project ID, client, project lead, phase, contract value, earned/reported progress, next milestone, schedule variance, margin forecast, risk level, open changes, overdue actions, and QA/QC status.

Health logic:

- Green: schedule variance <=5%, margin variance <=3 points, no overdue critical items.
- Amber: schedule variance 6–10%, margin variance 4–7 points, or one critical issue.
- Red: schedule variance >10%, margin variance >7 points, missed contractual milestone, or unresolved safety/legal/data incident.

## Sales Page

Pipeline by stage, owner, service/product, sector, source, expected close, probability, value, next action, age, and days in stage. KPIs: total and weighted pipeline, coverage ratio, win rate, average deal size, stage conversion, sales cycle, stale opportunities, proposal turnaround, and recurring-revenue mix.

## Work Page

Open tasks by owner/status/priority, overdue rate, blocked tasks, aging, throughput, cycle time, unassigned tasks, and workload. Critical tasks missing owner or due date are data-quality failures.

## Financial Health Page

Revenue actual vs plan; gross profit and margin by project/product; operating expense; accounts receivable aging; DSO; cash balance; cash runway; utilization; backlog; revenue concentration; recurring revenue; and forecast confidence. QuickBooks remains authoritative.

## Data Sources

CRM -> opportunities; ClickUp -> tasks/projects; QuickBooks -> finance; Google Drive/SharePoint -> deliverable metadata; QA register -> reviews; survey tool -> CSAT/NPS; automation registry -> runs, failures, hours saved; decision log -> open validations.

## Core Definitions

- Weighted pipeline = sum(opportunity value × stage probability).
- Coverage ratio = weighted qualified pipeline / remaining revenue target.
- On-time milestone rate = milestones completed on/before baseline date / completed milestones.
- Proposal cycle time = approved intake timestamp to client issue timestamp.
- Utilization = billable hours / available delivery hours.
- DSO = accounts receivable / trailing 90-day credit sales × 90.
- Automation hours saved = successful runs × validated manual minutes avoided / 60.
- Client satisfaction = average post-milestone survey score; show response rate.

## Data Quality Controls

Daily tests: unique IDs; required fields; valid dates; values within thresholds; reconciled financial totals; stale refresh; orphan tasks; missing owners; duplicate opportunities; inconsistent stages. Publish a data-quality score and suppress misleading metrics when source quality fails.

## Alerts

Notify owner and COO for red project health, milestone due within three days without acceptance criteria, critical task overdue, proposal idle >48 hours, opportunity without next action, receivable >45 days, automation failure twice, or dashboard refresh failure.

