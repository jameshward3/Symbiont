# Top 25 Business Processes to Automate

**Scoring:** Impact (I) and effort (E), 1–5. Priority score = `2I + (6-E)`; risk-adjust ordering within ties.  
**Rule:** Stabilize and measure the workflow before automating it. Require human approval where noted.

| Rank | ID | Process | I | E | Score | First release / control |
|---:|---|---|---:|---:|---:|---|
| 1 | AUT-001 | Inquiry form to CRM intake | 5 | 2 | 14 | Create/dedupe record; human qualification |
| 2 | AUT-002 | Project workspace provisioning | 5 | 2 | 14 | Create IDs, folders, templates, permissions |
| 3 | AUT-003 | Meeting transcript to actions/decisions | 5 | 2 | 14 | Draft only; owner confirms before posting |
| 4 | AUT-004 | Proposal assembly from approved modules | 5 | 3 | 13 | Draft; commercial/legal approval required |
| 5 | AUT-005 | Weekly project status aggregation | 5 | 3 | 13 | Source refresh, exceptions, narrative draft |
| 6 | AUT-006 | QA/QC naming and completeness checks | 5 | 3 | 13 | Block issue on failed checks; human technical review |
| 7 | AUT-007 | Contract obligation extraction | 5 | 3 | 13 | Draft register; authorized human validates |
| 8 | AUT-008 | Overdue task and milestone escalation | 4 | 1 | 13 | Notify owner, then threshold escalation |
| 9 | AUT-009 | CRM next-action and stale-stage alerts | 4 | 1 | 13 | Daily exceptions, no automatic stage changes |
| 10 | AUT-010 | File naming/version validation | 4 | 1 | 13 | Quarantine or warn before issue |
| 11 | AUT-011 | Executive Daily Brief | 5 | 3 | 13 | Read source systems; cite refresh times |
| 12 | AUT-012 | Invoice schedule and receivable reminders | 5 | 3 | 13 | Draft/remind; no autonomous payment actions |
| 13 | AUT-013 | Sales-to-delivery handoff pack | 4 | 2 | 12 | Assemble contract, promises, risks, contacts |
| 14 | AUT-014 | Client kickoff pack | 4 | 2 | 12 | Agenda, RACI, milestones, access checklist |
| 15 | AUT-015 | Dashboard data-quality tests | 4 | 2 | 12 | Flag/suppress unreliable measures |
| 16 | AUT-016 | Change request intake and impact draft | 5 | 4 | 12 | Human approves scope/fee/schedule |
| 17 | AUT-017 | Deliverable transmittal generation | 4 | 2 | 12 | Verify approved file/version/recipients |
| 18 | AUT-018 | Client feedback and benefits follow-up | 4 | 2 | 12 | Milestone-triggered surveys and reminders |
| 19 | AUT-019 | Knowledge classification and link checks | 4 | 2 | 12 | Suggest tags; flag broken/duplicate content |
| 20 | AUT-020 | Project closeout/archive workflow | 4 | 2 | 12 | Require acceptance/retention/access confirmation |
| 21 | AUT-021 | Proposal pricing consistency checks | 5 | 4 | 12 | Validate totals/margin; no price authorization |
| 22 | AUT-022 | Technical source-data lineage capture | 4 | 3 | 11 | Extract metadata/checksum and usage rights |
| 23 | AUT-023 | Win/loss analysis and pattern report | 3 | 2 | 10 | Monthly evidence-linked analysis |
| 24 | AUT-024 | Software/vendor renewal monitor | 3 | 2 | 10 | 90/60/30-day notices and usage summary |
| 25 | AUT-025 | Case-study draft from closed project | 3 | 3 | 9 | Draft only; client permission and claims review |

## Deployment Waves

### Wave 1 — Weeks 1–30 days

AUT-001, 002, 003, 008, 009, 010, 011, 015. These establish identifiers, clean source data, reliable action capture, and exception visibility.

### Wave 2 — Days 31–60

AUT-004, 005, 006, 007, 012, 013, 014, 017. These reduce proposal and delivery administration after standards are piloted.

### Wave 3 — Days 61–90

AUT-016, 018, 019, 020, 021, 022, 023, 024, 025. These improve lifecycle control, learning, and productization.

## Automation Release Gate

Named owner; documented process; baseline volume/time/error; approved data classification; least privilege; test set; human approval boundary; audit log; failure alert; retry/idempotency; budget/rate limit; rollback/kill switch; success target; 30-day review.

## ROI Formula

Annual net benefit = `(runs × minutes saved ÷ 60 × loaded hourly cost) + avoided defects + accelerated cash/revenue - software - build - maintenance - review cost`.

Do not claim savings until validated against observed before/after samples. Count only successful runs that avoid real work.

