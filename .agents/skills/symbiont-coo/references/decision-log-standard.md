# Centralized Decision Log

**Owner:** COO  
**SLA:** Log material decisions within one business day.

## Decisions Requiring a Record

Strategy, pricing, client commitments, scope, schedule baseline, architecture, software selection, data governance, security, hiring, vendors, material spending, exceptions to standards, risk acceptance, automation permissions, and reversals of prior decisions.

## Required Fields

Decision ID; title; date; status; decision owner; approver; business area; related client/project; decision statement; context; options considered; criteria; evidence; assumptions; risks; selected option; rationale; financial/schedule impact; actions and owners; review/validation date; outcome; related/superseded decisions; links.

## Status

`Proposed -> Approved -> Implementing -> Validated` or `Reversed/Superseded`.

## Decision Quality Gate

The decision must be specific enough to implement, identify authority, separate evidence from assumptions, record alternatives, state risks and reversibility, assign actions, and define when success will be evaluated.

## Review Cadence

- Weekly: open proposed and implementing decisions.
- Monthly: overdue validations and recurring exception patterns.
- Quarterly: strategic decisions, reversals, and decision quality.

## Starter Decisions

1. Adopt one system of record per information class.
2. Adopt controlled IDs and document naming.
3. Require independent QA/QC for client-issued technical deliverables.
4. Require human approval for legal, financial, employment, contractual, and high-impact external actions.
5. Use API-first integration and prohibit secret storage in documents/prompts.

