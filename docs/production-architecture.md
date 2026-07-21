# Symbiont Command Center — 13-Layer Production Architecture

Status: Active baseline  
Owner: Symbiont COO / Application Owner  
Classification: Internal  
Review cadence: Quarterly and after material incidents

## Executive baseline

The Command Center is a server-rendered Next.js application deployed on edge/serverless compute. D1 supports operational modules and Supabase/PostgreSQL is the governed organization data plane. The application fails closed for site access and privileged writes, labels demonstration data, and keeps agent authority boundaries in server code and database constraints.

## Layer controls

| Layer | Implemented control | Verification / remaining decision |
|---|---|---|
| 1. Front-end foundations | Responsive React/Next.js views, semantic forms, loading/disconnected states, social metadata | Add automated accessibility and browser regression tests before public launch |
| 2. APIs and backend logic | Server-only routes, input contracts, safe failure messages, idempotency keys for agent handoffs | Convert remaining route-specific error handling to the shared correlation pattern |
| 3. Database and storage | D1 with Drizzle migrations; Supabase/Postgres shared data plane; append-only events | Decide one authoritative store per bounded context and document retention periods |
| 4. Auth and permissions | Site gate, workspace identity support, email allowlist, constant-time secret fallback, agent authority levels | Replace Basic Auth with workspace SSO when the hosting access policy is finalized |
| 5. Hosting and deployment | Sites/Cloudflare Worker build plus Vercel configuration | Keep one production target authoritative; use the other only as tested failover |
| 6. Cloud and compute | Stateless edge/serverless application; D1 binding; external model runtime | Define regional/data-residency requirements before client-confidential workloads |
| 7. CI/CD and version control | Protected CI checks for type, lint, unit tests, and production build; concurrency cancellation | Enable required checks and protected main branch in GitHub settings |
| 8. Security and RLS | Security headers, fail-closed gates, Supabase RLS, service-role-only writes, restricted data filtering | Add quarterly policy tests using multiple organizations before multi-tenant onboarding |
| 9. Rate limiting | Atomic Postgres limiter across compute instances; privacy-safe hashed keys; conservative local fallback | Add per-user and per-agent quotas when identity is universally available |
| 10. Caching and CDN | CDN-served immutable build assets; dynamic and sensitive API responses are non-cacheable | Add tagged revalidation only for explicitly public, non-sensitive reference data |
| 11. Load balancing and scaling | Platform load balancing and horizontally scalable stateless routes; distributed rate state | Establish load-test targets from measured usage before capacity claims |
| 12. Error tracking and logs | Structured JSON events and request correlation IDs on high-risk agent execution | Connect the log stream to an approved error-tracking destination and alert policy |
| 13. Availability and recovery | Liveness/readiness endpoints, migration rollback documentation, reproducible builds | Configure external uptime checks, database PITR/backups, quarterly restore tests, and named incident roles |

## Service objectives and recovery policy

Initial targets are proposals until validated by observed demand and platform capability:

- Availability target: 99.9% monthly for the authenticated Command Center.
- Recovery time objective: 4 hours for application service, 8 hours for the data plane.
- Recovery point objective: 24 hours until continuous/PITR backups are contractually verified.
- Alerting: two consecutive liveness failures within five minutes; readiness degradation for ten minutes; elevated 5xx or agent-run failures for five minutes.

## Deployment and recovery gates

1. CI type, lint, unit, and build checks pass from a clean install.
2. Database migration is reviewed, applied in a non-production environment, and rollback/forward-fix steps are recorded.
3. Secrets are present in the hosting control plane and absent from source/build artifacts.
4. Liveness returns 200; readiness returns 200 with required dependencies configured.
5. A smoke test confirms authentication, dashboard read, and one bounded non-destructive agent action.
6. For rollback, redeploy the last known-good immutable application version. Prefer forward database fixes; use documented rollback only where data preservation is proven.
7. Quarterly, restore a backup into an isolated environment and record achieved RPO/RTO as evidence.

## Accountable next actions

| Action | Owner | Due | Acceptance evidence |
|---|---|---|---|
| Make CI checks and review mandatory on `main` | Repository administrator | Before next production release | Branch protection screenshot/config export |
| Choose the authoritative production host and tested failover | Application owner | Before client-confidential data | Approved architecture decision record |
| Configure uptime/error alerts and escalation contacts | Operations owner | Before production SLA | Test alert with acknowledged incident ticket |
| Verify Supabase backup/PITR settings and perform restore drill | Data owner | Before production SLA, then quarterly | Timestamped restore report and measured RPO/RTO |
| Add multi-organization RLS integration suite | Security owner | Before second tenant | Tests prove cross-organization reads/writes are denied |
