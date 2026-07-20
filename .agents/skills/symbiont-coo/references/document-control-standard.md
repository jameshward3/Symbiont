# Document Taxonomy, Naming, and Version Control Standard

**Owner:** COO  
**Effective version:** 1.0

## Taxonomy

Asset types: `POL` Policy, `SOP` Procedure, `STD` Standard, `TPL` Template, `CHK` Checklist, `FRM` Form, `RPT` Report, `DEC` Decision, `MTG` Meeting, `DEL` Deliverable, `DAT` Dataset, `AUT` Automation, `AGT` Agent Charter, `RES` Research.

Business areas: `EXE`, `SAL`, `MKT`, `DEL`, `TEC`, `OPS`, `RES`, `AI`.

## Asset IDs

Controlled company asset: `SYM-[AREA]-[TYPE]-[NNN]`  
Example: `SYM-OPS-SOP-003`.

Project ID: `PRJ-[YYYY]-[NNN]`  
Opportunity ID: `OPP-[YYYY]-[NNN]`  
Client ID: `CLI-[NNN]`  
Decision ID: `DEC-[YYYY]-[NNN]`  
Agent ID: `AGT-[NNN]`  
Automation ID: `AUT-[NNN]`.

## File Naming

`[Project-or-Asset-ID]_[Document-Type]_[Short-Title]_[YYYY-MM-DD]_v[Major.Minor].[ext]`

Example: `PRJ-2026-014_DEL_Digital-Twin-Basis_2026-07-18_v1.0.pdf`

Rules: ISO dates; hyphens inside title words; underscores between fields; no spaces; no `final`, `latest`, `new`, initials, or unexplained abbreviations; 100-character target maximum.

## Versions

- `0.x`: draft. Increment minor for meaningful review issue.
- `1.0`: first approved release.
- `x.1`: compatible clarification or correction.
- `2.0`: material change to scope, method, obligations, data structure, or client outcome.
- Published PDFs are immutable. Corrections create a new version.

## Status Markers

Use metadata—not filenames—for `Draft`, `In Review`, `Approved`, `Issued`, `Superseded`, `Archived`.

## Folder Pattern for Projects

`00_Admin / 01_Contract / 02_Input / 03_Working / 04_Coordination / 05_QAQC / 06_Issued / 07_Closeout`

Only `06_Issued` contains client-issued deliverables. Working files never overwrite issued files.

## Review and Approval

Author prepares; independent reviewer checks; accountable project lead approves. Client-facing technical deliverables require recorded reviewer, date, checklist, and disposition of comments. Contractual documents require authorized human approval.

## Access and Retention

Apply least privilege. Classifications: Public, Internal, Confidential, Restricted. Credentials, personal data, contract-sensitive data, and client-controlled information are Restricted. Retention requirements must follow contracts, law, insurance, and client requirements; absent a defined rule, do not destroy records.

## Git Rules

Code, schemas, automations, and Markdown-controlled knowledge use branches and pull requests. Protected main branch; linked issue/decision; meaningful commits; automated checks; one reviewer for normal changes and two for high-risk production changes. Secrets are never committed.

## Quality Gate

Before release verify: correct ID and title; owner; current template; version; classification; dates; source citations; resolved review comments; accessible links; correct output format; approval evidence; and archive/supersession completed.

