# Opportunity Data and Deduplication

Capture issuer, issuer website, title, normalized title, solicitation number, canonical URL, publication date, deadline with timezone, location, geography key, stated value and currency, procurement type, scope, public business contact, access requirements, fit rationale, seven component scores, total score, confidence, freshness, risks, missing information, next action, route, handoff status, source kind, and observed-at timestamp.

## Normalize

- Lowercase and collapse punctuation/whitespace in titles; remove generic procurement prefixes only when the remaining subject stays unambiguous.
- Normalize canonical URLs by resolving redirects, removing tracking parameters and fragments, and retaining identifiers required to open the record.
- Normalize solicitation numbers for case, separators, and whitespace without discarding meaningful leading zeros.
- Use an explicit geography key such as `us-ga-atlanta` or `us-national`.

## Deduplicate

Compare issuer, normalized title, solicitation number, canonical URL, deadline, and geography. A matching solicitation number plus issuer is a strong match; otherwise require multiple aligned fields. Do not merge merely because keywords match.

Attach an amendment to the original opportunity when issuer/solicitation identity matches. Add new evidence with amendment number, observation time, content hash, and changed fields. Recalculate freshness, deadline lead time, risk, score, and route while preserving prior evidence. Escalate uncertain merges for review.

Every handoff message requires a non-empty shared goal ID and correlation ID. Use a stable idempotency key so retries cannot create duplicate handoffs.
