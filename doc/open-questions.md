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
| OQ-002 | Contracts and assignments | Who owns institutional contracts, contracted-game links, and immutable classroom Game Version assignments between the Admin app and Portal? | Product / Admin / Architecture | Open | Domain and source-of-truth baseline |
| OQ-004 | Catalog and capabilities | How should catalog availability and publisher/game-version capabilities be represented? | Product / Catalog / Game Integration | Open | Catalog and game-version baseline |
| OQ-005 | Game customization | Which data-driven customization content can be authored, validated, and consumed for each Game Version? | Product / Game Integration | Open | Game Forge design |

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

## OQ-004 - Catalog and Game Version Capabilities

**Question:** How should catalog availability and publisher/game-version capabilities be represented?

**Context:** Publishers may publish games with different levels of ScholArk integration. Some games may have no integration, while others may support events, state, progress, grading, or data-driven customization. Catalog availability and capability metadata should not be prematurely fixed in the domain model.

**Open details:**

- Whether availability is represented on `Game`, `GameVersion`, a publication relation, or an external catalog projection.
- Whether integration/customization capabilities are modeled as fields, structured metadata, or a separate contract.
- How the rule excluding versions intended for classroom use from general catalog discovery is represented and enforced.

## OQ-002 - Institutional Contracts and Classroom Game Version Assignments

**Question:** Which system owns institutional contracts and the publication of classroom Game Version assignments?

**Context:** An institution may contract with ScholArk for access to specified games during a contract period. An authorized employee or, in a later workflow, an Instructor can select a contracted game and publish an assignment of an immutable Game Version to a classroom. The assignment has its own active period and configures the duration of licenses acquired through it. Once published, the assignment cannot be changed; replacement requires a new assignment.

**Decision criteria:**

- Whether the existing Admin app can represent contracts, contracted games, exact Game Versions, assignment periods, and license duration.
- Whether the Portal may publish assignments or only consume Admin-owned assignments.
- How contract expiry affects existing assignments and already-issued licenses.
- Which changes require employee authorization and audit history.

**Resolution:** Pending.

## OQ-005 - Game Customization Content

**Question:** What content types and validation rules should Game Forge support for `GameCustomization.content`?

**Context:** Customization is data-driven only and does not create a separate executable or Game Version. The initial model does not include customization dates, status, locale lists, or classroom ownership. Assignment dates belong to `ClassroomGame`; publication is represented by `publishedAt`.

**Resolution:** Pending.

## Revision History

| Date | Change |
| --- | --- |
| 2026-08-28 | Created the discovery question log and added OQ-001. |