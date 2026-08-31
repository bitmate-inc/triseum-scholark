# ScholArk Open Questions

**Document Type:** Discovery Question Log  
**Related Baseline:** ScholArk Platform Scope of Work, v1.0 (client-delivered August 2026)  
**Status:** Active  
**Last Updated:** August 28, 2026

This living document tracks questions raised after the client-delivered scope baseline. Resolved questions remain in the log as a decision history. Material changes to scope, commitments, boundaries, or estimates must be incorporated into an explicitly versioned revision of the Scope of Work.

## Question Register

| ID | Area | Question | Owner | Status | Needed By |
| --- | --- | --- | --- | --- | --- |
| OQ-001 | Game catalog | Should `Game` support soft deletion through a nullable `deletedAt` timestamp? | Product / Architecture | Open | Catalog persistence baseline |

## OQ-001 - Game Soft Deletion

**Question:** Should `Game` support soft deletion through a nullable `deletedAt` timestamp?

**Context:** Games may be referenced by licenses, assignments, game versions, progress, grades, game-play records, and historical transactions. Permanently deleting a referenced game could damage auditability or historical views. A soft-deleted game would remain available for authorized historical use while being excluded from catalog discovery and new assignment or acquisition workflows.

**Decision criteria:**

- Whether games can be permanently removed under current business and retention rules.
- Whether historical licenses, assignments, progress, grades, and transactions must continue displaying game information.
- Whether removal from sale, unpublishing, and deletion are distinct lifecycle states.
- How records deleted or disabled in the legacy administration system are represented and synchronized.
- Whether administrators need restoration, retention, anonymization, or permanent-purge workflows.

**Options:**

1. Do not support soft deletion; use publication and availability state only, and prohibit deletion while references exist.
2. Add `deletedAt: Date | null`; exclude deleted games from normal queries while preserving historical references and allowing restoration.
3. Add an explicit game lifecycle status if the business requires more states than active, unpublished, and deleted.

**Resolution:** Pending.

## Revision History

| Date | Change |
| --- | --- |
| 2026-08-28 | Created the discovery question log and added OQ-001. |