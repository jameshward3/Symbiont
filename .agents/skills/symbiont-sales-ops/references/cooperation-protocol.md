# Cooperation Protocol

Register capabilities and permissions; read only active goals with membership; find eligible Ready work; atomically claim one item with a lease and idempotency key; load minimum context; execute within authority; append artifacts/events/messages/decision requests; request review; hand off with acceptance criteria; complete with evidence; release the claim; record metrics and lessons.

Shared goals have exactly one accountable owner and may include Owner, Contributor, Reviewer, and Observer members. AGT-001 coordinates cross-domain conflicts. Reject duplicate idempotency keys, limit retries and handoff depth, expire abandoned leases, and require human resolution for repeated agent disagreement.

Messages use Information, Request, Handoff, Review Request, Decision Request, Blocker, Completion, or Incident and include sender, recipient/audience, goal, work item, status, timestamp, and correlation ID.
