# Intake and metadata

Create an immutable source inventory before classification. Record source system, canonical location, original filename, media type, byte size, available timestamps, content hash, extraction method, extraction result, and source evidence. Preserve failures and unsupported formats as inventory records.

Every controlled asset records ID, title, description, business area, asset type, owner, author, reviewer, approver, lifecycle, classification, version, effective date, review date, source system, canonical location, client, project, opportunity, decision, shared goal, agent, supersession, retention rule, tags, synonyms, evidence, and timestamps. Unknown values remain `Unknown`; they are not inferred silently.

Check identifiers, hashes, titles, subject, source, links, and relationships for duplicates. Matching hashes indicate an exact duplicate. Similar subject and metadata indicate a probable duplicate. Different meaning, authority, scope, or effective periods may be legitimate distinct assets or versions. Preserve each record until reviewed.
