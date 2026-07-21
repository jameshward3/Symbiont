# Retry control

Retry only when the fault is transient, the operation is idempotent, a valid idempotency key exists, duplicate effects are prevented, the approved bounded limit remains, the original request and approval remain valid, and the action cannot duplicate a financial, contractual, client-facing, destructive, or external effect. Use bounded exponential backoff where appropriate.

Atomically claim the idempotency key before execution. A duplicate delivery returns the existing result reference and creates an audit event; it does not execute again. When any safety fact is unknown, pause and escalate.
