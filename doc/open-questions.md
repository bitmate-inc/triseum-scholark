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
| OQ-002 | Publisher offers and assignments | Which system owns publisher offer definition and classroom assignment publication? | Product / Admin / Architecture | Partially resolved | Domain and source-of-truth baseline |
| OQ-004 | Catalog and capabilities | How should catalog availability and publisher/game-version capabilities be represented? | Product / Catalog / Game Integration | Open | Catalog and game-version baseline |
| OQ-005 | Game customization | Which data-driven customization content can be authored, validated, and consumed for each Game Version? | Product / Game Integration | Open | Game Forge design |
| OQ-006 | Legacy data migration | Which, if any, records should be exported from the legacy Admin app and imported into the new platform? | Product / Admin / Data | Open | Migration and cutover plan |
| OQ-007 | Publisher game origins | How should admin-approved publisher `runUrl` destinations be verified and protected from internal-network access, DNS changes, and unsafe redirects? | Security / Admin / Game Integration | Open | Before publisher onboarding |

## OQ-001 - Game Soft Deletion

**Question:** Should `Game` support soft deletion through a nullable `deletedAt` timestamp?

**Context:** Games may be referenced by licenses, assignments, game versions, progress, grades, game-play records, and historical transactions. Permanently deleting a referenced game could damage auditability or historical views. A soft-deleted game would remain available for authorized historical use while being excluded from catalog discovery and new assignment or acquisition workflows.

**Decision criteria:**

- Whether games can be permanently removed under current business and retention rules.
- Whether historical licenses, assignments, progress, grades, and transactions must continue displaying game information.
- Whether removal from sale, unpublishing, and deletion are distinct lifecycle states.
- If legacy records are imported, how disabled or deleted source records are represented in the migrated history.
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

## OQ-002 - Publisher Offers and Classroom Game Version Assignments

**Question:** Which roles use the new Admin app to maintain publisher-defined offers and publish classroom Game Version assignments, and which assignment actions are available to authorized Instructors?

**Context:** Client decision: publishers define standalone and institution-use offers. An `InstitutionGameOffer` is independent of any institution and specifies a Game Variant, designated payor, price, and license duration. An institution selects an offer by assigning it to a `ClassroomGame`. Classroom assignment availability dates remain on the assignment. Offers are not institution-owned; institutional billing is out of scope. Once published, an assignment cannot be changed; replacement requires a new assignment.

**Decision criteria:**

- Which authorized roles maintain offer records in the new Admin app on behalf of publishers.
- Whether classroom assignment creation/publication is performed in the new Admin app, an Instructor workflow, or both under distinct permissions.
- Which changes require employee authorization and audit history.

**Resolution:** Offer ownership and selection semantics are decided as described above. The system and role responsible for maintaining offers and publishing assignments remain open.

## OQ-006 - Legacy Data Migration

**Question:** Which, if any, records should be exported from the legacy Visual Basic Admin app and imported into the new ScholArk platform?

**Context:** The legacy application will not remain in operational use. It may be used as a one-time source for data that is still required by the new Admin app or portals. No ongoing synchronization or runtime dependency is assumed.

**Decision criteria:**

- Which institutions, courses, classrooms, Instructor relationships, catalog records, assignments, acquisition codes, licenses, and historical records are required at launch.
- Whether records can be recreated safely or whether history and stable identifiers must be preserved.
- Availability and quality of an export, relationship integrity, duplicate handling, privacy constraints, and ownership of data validation.
- Required mapping, import rehearsal, cutover, rollback, and acceptance checks.

**Options:**

1. Import an approved subset of legacy data through a validated one-time export/import process.
2. Recreate required operational data in the new Admin app and migrate only selected history.
3. Start with new data and do not import legacy records, subject to business approval.

**Resolution:** Pending. The export dataset and whether migration is required remain undecided.

## OQ-007 - Publisher Game Origins and Proxy Safety

**Question:** How should ScholArk verify publisher-controlled Game Version `runUrl` destinations and prevent the content proxy from reaching internal or otherwise unsafe network destinations?

**Context:** Game Versions store an admin-managed `runUrl`, and the proxy resolves upstreams only from the exact version attached to the active license. A deployment-wide origin list does not scale as publishers and their CDN domains vary. Admin review is the current trust boundary, but URL syntax validation alone does not prove domain ownership or prevent an approved/stored URL from resolving to a private, loopback, link-local, or metadata address. DNS changes and upstream redirects may also change the destination after review.

**Decision criteria:**

- Whether an administrator's explicit review is sufficient or publisher domain ownership must be verified.
- How to support multiple publisher/CDN origins without a deployment-wide configuration list.
- How to reject private, loopback, link-local, and cloud metadata addresses, including after DNS resolution and redirects.
- How to handle DNS rebinding, redirect targets, ports, schemes, and HTTP-only legacy games.
- What audit trail and reapproval process applies when a published Game Version's destination changes.

**Resolution:** Pending. Until this is decided, the proxy accepts only the server-resolved URL stored on the licensed Game Version; HTTP upstream access remains a separate explicit opt-in. This is not a complete SSRF defense.

## OQ-005 - Game Customization Content

**Question:** What content types and validation rules should Game Forge support for `GameCustomization.content`?

**Context:** Customization is data-driven only and does not create a separate executable or Game Version. The initial model does not include customization dates, status, locale lists, or classroom ownership. Assignment dates belong to `ClassroomGame`; publication is represented by `publishedAt`.

**Resolution:** Pending.

## Revision History

| Date | Change |
| --- | --- |
| 2026-08-28 | Created the discovery question log and added OQ-001. |
| 2026-09-22 | Recorded the client decision to remove institution contracts and use publisher-defined offers selected through classroom assignments. |
| 2026-09-26 | Added OQ-006 for optional one-time legacy data export/import; updated OQ-002 for new Admin app assignment authority. |
| 2026-09-27 | Added OQ-007 for admin-approved publisher game origins and proxy SSRF protections. |