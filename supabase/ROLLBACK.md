# Migration rollback

This migration is intentionally additive. Before production, snapshot the target project and validate in a preview branch. Roll back application code first. If schema removal is explicitly approved, drop `goal_events` through `organizations` in reverse dependency order, then drop `claim_work_item`, `release_work_item`, `prevent_material_agent_approval`, `preserve_audit_history`, and `current_org_id`. Never run destructive rollback against populated production without a verified backup, impact review, and authorized human approval.
