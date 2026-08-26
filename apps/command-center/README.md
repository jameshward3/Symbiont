# Symbiont Executive Command Center

The Command Center exposes AGT-001, AGT-002, and the AGT-009 Opportunity Scout surface through one governed operating system. It supports the existing Vercel application and existing Sites project without replacing either configuration.

The Sites deployment uses one logical Cloudflare D1 binding named `DB`. Drizzle owns the shared relational schema for agents, goals, assignments, messages, opportunities, evidence, Scout runs, and monitoring queries. `/api/opportunities` is read-only and returns clearly labeled demonstration records when D1 is unavailable or has no verified Scout records. No unauthenticated mutation route is provided.

## Runtime

The browser never receives the Supabase service role, OpenAI key, Microsoft Entra client secret, or Auth.js session secret. Microsoft Entra ID provides the browser sign-in boundary; live data and agent runs additionally enforce a validated server-side session, a trusted ChatGPT workspace identity, or a server-to-server `x-symbiont-access-key`. When the data plane or model is absent, the interface reports an unavailable state and does not simulate a response. See [Microsoft Entra ID access setup](../../docs/AZURE_ENTRA_AUTH_SETUP.md) to register the application and configure deployment secrets.

The shared PostgreSQL migration and idempotent demonstration seed are under `supabase/`. Apply them to the identified existing Symbiont Supabase project only after preview review. See `supabase/ROLLBACK.md` before applying a production migration.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build:vercel`. The Vercel project root remains `apps/command-center` and its production domain remains unchanged.

## AGT-004 QA/QC

The Quality view adds a read-only shared-D1 adapter for version-locked reviews, findings, correction verification, and release gates. Demonstration records are explicitly labeled. The repository skill lives at `.agents/skills/symbiont-qaqc`; live reviews, validation tools, mutations, approvals, and handoffs remain inactive until their authenticated workflows, agent registration, and human authority are approved.

## AGT-005 Knowledge Steward

The Knowledge surface provides access-aware controlled-asset search, lifecycle and review visibility, quality exceptions, duplicate/conflict signals, source links, archive history, and material audit events. The repository skill is `.agents/skills/symbiont-knowledge-steward`, and the matching D1 migration adds the governed knowledge domain. Historical “Exchange” files and live indexing remain disconnected until authorized files are uploaded and the migration is applied.
