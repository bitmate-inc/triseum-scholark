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
| OQ-003 | Version lineage | Should customized Game Versions retain a source/base-version reference for compatibility and provenance? | Product / Game Integration | Open | Game Forge design |
| OQ-004 | Catalog visibility | Which Game Versions are publicly catalog-visible versus classroom-only? | Product / Catalog / Architecture | Resolved | Catalog and acquisition baseline |

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

## OQ-004 - Game Version Catalog Visibility

**Question:** Which Game Versions may appear in the general catalog?

**Decision:** Publicly available base Game Versions may appear in the general catalog for not-for-credit acquisition. A Game Version associated with a classroom, including an instructor-customized version, must not appear in general catalog discovery. It is exposed only on the relevant classroom page as part of its `ClassroomGame` assignment.

**Remaining implementation details:**

- Whether a base Game Version remains publicly visible after it is used by a classroom assignment.
- Whether a classroom-only version can be reused by more than one `ClassroomGame` assignment.
- Which authorized roles can view inactive or historical classroom-only versions.

## OQ-002 - Institutional Contracts and Classroom Game Version Assignments

**Question:** Which system owns institutional contracts and the publication of classroom Game Version assignments?

**Context:** An institution may contract with ScholArk for access to specified games during a contract period. An authorized employee or, in a later workflow, an Instructor can select a contracted game and publish an assignment of an immutable Game Version to a classroom. The assignment has its own active period and configures the duration of licenses acquired through it. Once published, the assignment cannot be changed; replacement requires a new assignment.

**Decision criteria:**

- Whether the existing Admin app can represent contracts, contracted games, exact Game Versions, assignment periods, and license duration.
- Whether the Portal may publish assignments or only consume Admin-owned assignments.
- How contract expiry affects existing assignments and already-issued licenses.
- Which changes require employee authorization and audit history.

**Resolution:** Pending.

## OQ-003 - Customized Game Version Lineage

**Question:** Should a customized Game Version store the base version from which it was created?

**Context:** Future Game Forge functionality may allow an Instructor to add text or media and select enabled languages/locales. The result is a standalone immutable Game Version that can be licensed independently. A source-version reference would support provenance, compatibility analysis, and migration decisions, but it is not required to identify or license the version.

**Options:**

1. Store a nullable `sourceVersionId`/`parentVersionId` for provenance and compatibility analysis.
2. Do not store lineage; retain only the customized version's own immutable content and configuration snapshot.

**Resolution:** Pending.

## Revision History

| Date | Change |
| --- | --- |
| 2026-08-28 | Created the discovery question log and added OQ-001. |