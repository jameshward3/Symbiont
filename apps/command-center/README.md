# Symbiont Executive Command Center

The Command Center exposes AGT-001, AGT-002, and the AGT-009 Opportunity Scout surface through one governed operating system. It supports the existing Vercel application and existing Sites project without replacing either configuration.

The Sites deployment uses one logical Cloudflare D1 binding named `DB`. Drizzle owns the shared relational schema for agents, goals, assignments, messages, opportunities, evidence, Scout runs, and monitoring queries. `/api/opportunities` is read-only and returns clearly labeled demonstration records when D1 is unavailable or has no verified Scout records. No unauthenticated mutation route is provided.

## Runtime

The browser never receives the Supabase service role or OpenAI key. Live data and agent runs require the server-side variables listed in `.env.example` plus an in-memory secure-session key sent as `x-symbiont-access-key`. When the data plane or model is absent, the interface reports an unavailable state and does not simulate a response.

The shared PostgreSQL migration and idempotent demonstration seed are under `supabase/`. Apply them to the identified existing Symbiont Supabase project only after preview review. See `supabase/ROLLBACK.md` before applying a production migration.

## Verification

Run `npm test`, `npm run typecheck`, and `npm run build:vercel`. The Vercel project root remains `apps/command-center` and its production domain remains unchanged.
