# ScholArk Portal and Admin App Interdependencies

**Document Type:** Discovery and Integration Companion  
**Related Baseline:** ScholArk Platform Scope of Work  
**Audience:** ScholArk product owner, Portal developer, and Admin app developer  
**Working Technical Contacts:** Miroslav Braun (Portal) and Haris (Admin app; role and approval authority to be confirmed)  
**Status:** Draft for joint review  
**Date:** September 2026

This document is the shared working reference for the new ScholArk Administration application and its dependencies with the Student and Instructor portals. The legacy Visual Basic application backed by MSSQL will not remain in operational use; it may be used to export selected data for a one-time migration. This document supports product discovery, interface design, sequencing, testing, and release coordination without prescribing the legacy export contents before they are assessed.

## 1. Boundary and Working Principles

- The new ScholArk Admin app is the planned operational administration system. The legacy Admin app is not a runtime dependency.
- The product includes the new Admin app and Student and Instructor portals. Milestone 2 will baseline detailed features, sequence, and initial-pilot acceptance for each.
- The new platform must have one declared authority and writer per domain. Persistence technology and service boundaries are decisions for the new platform, not inherited from legacy MSSQL.
- Logical ownership and physical storage are separate decisions: Admin-owned and Portal-owned domains may share infrastructure without sharing write authority.
- A legacy export/import may be used to seed approved data, but no ongoing synchronization with the legacy app is assumed.
- Every domain must have one declared authority and writer. A synchronized copy is not a second authority.
- Portal writes to Admin-owned data are prohibited by default. Any write-back must be explicitly designed, authorized, audited, and tested.
- Historical licenses, assignments, game records, progress, and grades must remain explainable when Admin-owned records are renamed, disabled, unpublished, or deleted.
- Shared contracts, identifiers, schema changes, and rollout order require joint review. Scope or estimate changes follow the Scope of Work change process.

## 2. Expected Responsibility Boundary

This working hypothesis remains unconfirmed until discovery validates the code, schema, and workflows.

| Data or capability | Expected authority / owner | Admin app dependency | Portal responsibility | Status |
| --- | --- | --- | --- | --- |
| Institutions and Game Publishers | New Admin app | Create, update, activate, and deactivate | Read approved records | Define roles and lifecycle |
| Courses, classrooms, and sections | New Admin app | Create and maintain hierarchy and status | Read for acquisition and Instructor views | Define hierarchy and lifecycle |
| Instructor business records and assignments | New Admin app | Maintain Instructor record and classroom assignments | Link portal identity and enforce assigned access | Decide identity linkage |
| Student and Instructor authentication | Portal identity service | Supply stable Admin Instructor ID for identity linkage | Register/invite, authenticate, and authorize | Validate |
| Game catalog metadata | New Admin app | Maintain game identity, publisher, availability, URL, and metadata | Present eligible catalog and licensed-game views | Validate fields |
| Publisher offers | New Admin app records publisher-defined terms | Maintain offers on behalf of authorized publishers/users; define designated payor, price, and license duration | Read available offers; authorized users select institution-use offers through classroom assignments | Define maintenance authority |
| Game Versions and release availability | New Admin app, with publisher-defined release data | Maintain immutable versions and `publisherVersion` labels | Enforce exact version entitlement and launch policy | Define lifecycle |
| Game Customizations | To decide jointly; future Game Forge responsibility | Maintain draft content and publish immutable customizations | Read published content selected by the classroom assignment | Open |
| Classroom Game Version assignments | New Admin app, subject to workflow validation | Select an InstitutionGameOffer, optional published customization, and assignment period | Read immutable assignment and create version/customization-specific license context | Define authorized publisher |
| Classroom payment, language, usage, and configuration settings | New Admin app, subject to configuration design | Maintain approved settings for the assignment | Read and deliver applicable launch configuration | Validate/version |
| Institution acquisition codes | New Admin app / Portal contract | Issue, store safely, audit, and revoke codes under approved policy | Validate/redact code and activate license exactly once | Define lifecycle contract |
| Student acquisitions and Game Licenses | Portal expected; institution-funded authority is open | May supply institution-funded entitlement authority | Record acquisition, term, status, and version entitlement; retain expired terms and create separate licenses for later purchases | Open |
| Game-play and game-state records | Game produces; Portal expected to persist | No MVP administration dependency expected | Validate, store, version, and associate with Student Game | Validate |
| Progress, grading, and LMS file export | Portal expected | Supply academic context and stable identifiers | Calculate, display, audit, and export | Validate |
| Support request destination | ScholArk support process | Supply routing destination and ownership | Validate and route Student submissions | Open |

The Milestone 2 source-of-truth matrix resolves this table. For each domain it must identify logical owner, physical store, permitted readers and writers, stable identifier, retention behavior, and any synchronization rule.

## 3. Portal Workflows That Depend on Admin Data

| Workflow | Required Admin context | Decision or invariant |
| --- | --- | --- |
| Instructor access | Stable Instructor ID, institution/classroom assignments, authorization state, and unambiguous matching data | Decide invitation origin and Portal identity linkage. Email is not an immutable cross-system ID. |
| For-credit acquisition | Eligible institution; active course/classroom; Instructor assignment where required; assigned InstitutionGameOffer and immutable Game Version; payment, language, usage, and configuration; institution code where applicable | Portal records a license for the exact Game Version and creates a ClassroomGameEnrollment linking the ClassroomGame and license for educational progress and grading; the enrolled User is derived from the license. |
| Not-for-credit acquisition | Catalog metadata, direct-sale status, launch URL, and available base Game Versions | Distinguish direct acquisition from classroom assignment; final catalog and version-availability rules remain open. |
| Launch and configuration | Stable Game ID, exact permitted Game Version, launch endpoint, and applicable configuration | Published assignments and versions are immutable; define behavior for replacement assignments and active sessions. |
| Instructor progress and grades | Stable classroom and assignment IDs | Renaming or disabling related Admin records must not sever historical progress or grade attribution. |

## 4. Database and Integration Decision

Discovery must define the new platform's persistence architecture, Admin-to-Portal boundary, and operational ownership. The legacy Visual Basic application and MSSQL database are not the production source of truth. A one-time export/import may be considered if legacy records are valuable and can be migrated safely; ongoing synchronization is not assumed.

| Option | Use when | Implementation boundary | Principal risks |
| --- | --- | --- | --- |
| **New platform data store** | Selected to meet the new Admin and Portal security, performance, deployment, and operational requirements | New Admin and Portal services use stable APIs/contracts and one writer per domain; the persistence technology is selected during architecture work | Requires a deliberate new-platform data model and operational plan |
| **One-time legacy import** | Selected legacy records have continuing business value and can be mapped reliably | Export an approved dataset, transform and validate it, then import into the new platform before cutover | Data quality, identity mapping, history preservation, and cutover risks |
| **No legacy import** | Existing records are unnecessary, obsolete, or cheaper and safer to recreate | Seed or recreate only the data required for the new platform | Historical continuity may be reduced; business approval required |

The decision record must cover:

- Authoritative source and write owner for each data domain.
- Logical ownership, physical storage, and read/write direction.
- Platform-specific schemas/tables and stable views, stored procedures, or API contracts needed to avoid coupling to legacy table design.
- Required freshness and behavior while the new Admin or Portal API is unavailable.
- Rename, deactivate, unpublish, delete, restore, and merge behavior.
- Query/load limits, indexes, maintenance windows, and production support expectations.
- Security boundary, service identity, credential rotation, encryption, and audit logging.
- Legacy export/import decision, dataset, mapping, validation, cutover, and rollback, if applicable.

The Admin-to-Portal contract must define ownership, access, errors, versioning, and availability behavior. Any future ongoing legacy synchronization would require a separately approved scope and decision record; it is not part of the current plan.

## 5. Shared Data and Interface Contract

After schema review, jointly document these identifiers, constraints, and representative examples.

### 5.1 Shared Identifiers

| Entity | Required contract |
| --- | --- |
| Institution | Stable immutable ID, name, status, and lifecycle timestamps or change token |
| Course | Stable ID, parent Institution ID, number/name, status |
| Classroom | Stable ID, parent Course ID, section, term if applicable, status |
| Instructor | Stable Admin ID, assignment relationship, active status, identity-linking attributes |
| Game | Stable ID, publisher ID, metadata, availability states, launch information |
| Game Assignment | Stable ID or stable composite, Classroom ID, Game ID, effective status/dates |
| Game Version | Stable version identity, Game ID, lifecycle status, compatibility information |
| Configuration | Stable revision ID, Classroom/Game/Game Version applicability, effective state |
| Acquisition code | Opaque value or digest, funding context, Game/assignment scope, term, validity, redemption state |

Identifiers must not be recycled. Display names, email addresses, course numbers, and URLs are mutable attributes rather than cross-system keys.

### 5.2 Lifecycle Semantics

For each shared entity, document applicable lifecycle states and which permit discovery, acquisition, assignment, launch, and historical display. Also define:

- Effective dates and time-zone rules.
- Whether deletion is prohibited while references exist, represented as soft deletion, or propagated as a tombstone.
- How corrections and merged duplicate records are communicated.

This work must resolve the existing open question concerning Game deletion and historical references.

### 5.3 Contract Versioning

- Version API payloads, extracts, views, stored procedures, and synchronization messages that are shared across applications.
- Treat additive, compatible changes differently from breaking changes.
- Agree on a deprecation period and supported-version window before removing fields or changing semantics.
- Include contract fixtures and representative records in automated tests without including production personal data.
- Record the source schema/contract version used by each deployment where needed for diagnosis.

## 6. Admin App Capability Assessment

Assess whether each capability exists, can be exposed safely, requires change, or belongs elsewhere.

| Capability to assess | Why the Portal needs it | Needed by |
| --- | --- | --- |
| Reproducible source build and deployment | Safe analysis and coordinated releases | Start of discovery |
| New platform schema definition and migration history | Model, persistence, and Admin/Portal contract validation | Database decision |
| Non-production environment and representative data | Admin and Portal development without production risk | Walking skeleton |
| Stable Admin-to-Portal API/data contract | Institutions, courses, classrooms, Instructors, games, and assignments | Walking skeleton |
| Legacy export schema and sanitized sample, if import is selected | One-time mapping and import validation | Migration implementation |
| Instructor invitation/linkage support | Portal Instructor onboarding and authorization | Identity milestone |
| Catalog lifecycle and direct-sale eligibility | For-credit and not-for-credit discovery | Acquisition milestone |
| Classroom payment-mode exposure | Select Stripe or institution-funded path | Acquisition milestone |
| Acquisition-code generation/validation/revocation | Institution-funded license activation | Acquisition milestone |
| Game Version and configuration revision support | Correct launch, state compatibility, and grading | Game integration milestone |
| Historical/deletion behavior | Preserve license, progress, and grade references | Before data contract approval |
| Auditability of material Admin changes | Diagnose access, assignment, and configuration changes | Pilot readiness |

The new Admin app and its API/data contract must satisfy the operational capabilities. Legacy MSSQL structures are relevant only to a migration that has been explicitly selected and approved.

### 6.1 Legacy Workflow Inventory

If migration is selected, inventory the legacy representations of Institutions, Instructors, Courses, classrooms, Games, assignments, payment modes, and configurations. Record available identifiers, relationships, history, data-quality exceptions, and exportable fields; do not treat legacy workflows as requirements for the new app without product confirmation.

### 6.2 Assessment Outcome

Each relevant Admin component and workflow should receive an evidence-based recommendation:

| Classification | Meaning |
| --- | --- |
| Reuse | Suitable without material change |
| Refactor | Suitable with bounded changes |
| Partially rebuild | Reuse some behavior or data; replace the rest |
| Rebuild | Unsuitable for the required role; separate scope required |

Record evidence, required changes, dependencies, operational and estimate effects, and scope impact. Older technology alone is not evidence that modernization is required.

## 7. New Admin App and Pilot Data

Legally usable free web games can validate catalog, acquisition, license enforcement, launch, and basic configuration. An unmodified third-party game cannot validate authenticated launch, state exchange, events, mapping, progress, or grading without an adapter or instrumented test game.

The new Admin app is a planned product surface, not temporary pilot tooling. Milestone 2 must baseline its workflows, user roles, release sequence, and acceptance criteria alongside the Student and Instructor portals. Pilot fixtures and any legacy import are separate data-provisioning concerns:

| Option | Appropriate use | Tradeoff |
| --- | --- | --- |
| Versioned seed script | Repeatable developer-managed fixtures for tests and local/pilot environments | Useful for controlled fixtures; not a replacement for routine Admin workflows |
| One-time legacy export/import | Migrate selected existing institutions, users, assignments, or history when discovery confirms they are needed | Requires an approved dataset, mapping, validation, and cutover plan |
| Recreate records in the new Admin app | Use when existing data is not required or is safer to re-enter | Requires business approval and may not preserve history |

**Initial recommendation:** build the new Admin app against the same approved domain rules and contracts used by the portals. Use version-controlled fixtures for development. Treat legacy data export/import as a bounded migration task; do not build ongoing legacy synchronization unless separately approved.

## 8. Version Control and Repository Working Agreement

The new Admin app must be maintained in source control before coordinated delivery. The legacy application source is not required for the new app; if a data export is approved, preserve only the schema notes, export logic, and sanitized sample needed to produce and validate it.

### 8.1 Admin Repository Bootstrap

1. Create a private client-owned repository for the new Admin app and record its initial baseline.
2. Document any approved legacy export procedure separately; exclude secrets, production data, generated output, and machine-specific files from Git.
3. Document a reproducible build, supported toolchain, dependencies, deployment, and rollback.
4. Store reviewed database changes as ordered migrations or another repeatable mechanism.
5. Define repository and deployment-artifact backup and recovery.

### 8.2 Recommended Repository Boundary

Use separate repositories for the Admin app and Portal unless discovery finds a compelling operational reason to combine them. They use different technology stacks, ownership, and release cycles. Keep the shared interface contract in one agreed canonical location and reference its released version from both repositories.

### 8.3 Minimum Collaboration Rules

- Protect the primary branch and use short-lived branches for changes.
- Require review from the other application owner for shared schema or contract changes.
- Use pull requests or an equivalent recorded review workflow.
- Tag releases and record the Admin, database, contract, and Portal versions deployed together.
- Do not commit secrets or production data; use approved secret storage and sanitized fixtures.
- Track cross-repository work with linked issue IDs and record breaking-change rollout order.
- Define urgent production-fix and rollback procedures before pilot operation.

The two repositories do not need identical day-to-day conventions, but shared changes must follow the same contract versioning, review, compatibility, and release-coordination rules.

## 9. Environment, Access, and Security Dependencies

The client and developers must establish:

- Named owners and least-privilege access for new Admin source, platform development/test environments, hosting, domains, certificates, and deployment systems.
- A sanitized non-production dataset containing representative institutions, courses, classrooms, Instructors, games, assignments, payment modes, and lifecycle states.
- Network access from the Portal environment to only the approved Admin integration boundary.
- Separate service credentials per environment, with rotation and revocation procedures.
- Prohibition on using production personal data in local development unless explicitly authorized and protected.
- Audit requirements for Instructor linkage, acquisition-code use, assignment/configuration changes, licenses, grades, and exports.
- Backup, restore, rollback, retention, and incident-contact responsibilities for both systems.

## 10. Joint Testing and Acceptance

The shared integration is not accepted solely because each application works independently. The Portal and Admin developers must validate representative end-to-end scenarios.

1. A new-Admin-created institution, course, classroom, Instructor assignment, Game, and Game Assignment become available to the portals through the approved API/data contract.
2. An unauthorized or inactive record is not exposed as eligible for acquisition or Instructor access.
3. A new Admin change reaches the Portal within the approved freshness target.
4. Replaying the same approved legacy import or game event does not create duplicates.
5. Rename, deactivate, unpublish, delete/tombstone, and restoration behavior preserve approved historical references.
6. A portal Instructor identity links to the correct Admin Instructor and cannot access another Instructor’s classrooms.
7. Student-funded and institution-funded acquisition paths use the Admin payment context correctly.
8. Acquisition-code reuse, expiry, revocation, wrong-scope use, and concurrent redemption follow the approved rules.
9. The permitted Game Version and compatible configuration are selected for launch.
10. Integration outage, stale data, partial failure, retry, recovery, and reconciliation produce observable, actionable results.
11. Deployment and rollback preserve compatibility between the new Admin contract/data model and the deployed Portal version.

If legacy import is selected, acceptance also requires source-to-target count checks, representative relationship validation, duplicate handling, and an agreed cutover/rollback rehearsal. Ongoing legacy synchronization and drift testing are not assumed.

## 11. Delivery Sequence and Coordination Gates

| Gate | Joint evidence required | Blocks |
| --- | --- | --- |
| New Admin baseline available | Approved workflow boundary, repository, build guide, data contract, configuration inventory, test access | Admin and Portal implementation |
| Ownership approved | Source-of-truth matrix and permitted read/write paths | Data implementation |
| Admin-to-Portal contract approved | Versioned data contract, ownership rules, and proof of connectivity | Portal foundation |
| Identity linked | Instructor matching/invitation contract and authorization fixtures | Instructor workflows |
| Acquisition contract approved | Payment mode, catalog eligibility, acquisition-code authority, license ownership | Acquisition implementation |
| Game/config contract approved | Game identity/version, assignment, launch URL, configuration revision, sample payloads | Game launch and mapping |
| Compatibility verified | Automated contract tests, end-to-end scenarios, reconciliation evidence | Pilot release |

Work that does not depend on an unresolved gate may continue, but the unresolved assumption, owner, due date, affected acceptance scenarios, and fallback must be recorded.

## 12. Responsibilities

| Area | Product owner | Portal developer | Admin app developer | Game/integration owner |
| --- | --- | --- | --- | --- |
| Business policy and pilot priority | Accountable | Consulted | Consulted | Consulted |
| Legacy export data and schema evidence, if migration is selected | Informed | Consulted | Responsible | Informed |
| Source-of-truth and integration architecture | Approves business effects | Responsible jointly | Responsible jointly | Consulted |
| Admin repository and reproducible build | Informed | Consulted | Responsible | Not applicable |
| Portal identity, acquisition, records, and grading | Informed | Responsible | Consulted | Consulted |
| Admin-side changes and database migrations | Informed | Reviews contract effect | Responsible | Not applicable |
| Game launch, state, events, and version contract | Approves policy | Responsible jointly | Consulted | Responsible jointly |
| Cross-system acceptance and release readiness | Accountable | Responsible jointly | Responsible jointly | Responsible where applicable |

Named ownership, availability, and approval authority must be confirmed rather than inferred from this initial role model.

## 13. Joint Discovery Decision Register

| ID | Decision | Required participants | Needed before |
| --- | --- | --- | --- |
| AD-01 | Authoritative source and permitted writer for every shared domain | Product, Portal, Admin | Data implementation |
| AD-02 | Select the new platform's persistence architecture and Admin-to-Portal boundary without assuming legacy MSSQL remains operational | Portal, Admin, operations | Platform foundation |
| AD-03 | Stable identifiers and lifecycle semantics, including deletion | Product, Portal, Admin | Integration contract |
| AD-04 | Instructor identity invitation and stable Admin-record linkage; include legacy mapping only if migration is approved | Product, Portal, Admin | Instructor onboarding |
| AD-05 | Catalog eligibility and Game/assignment/configuration fields | Product, Portal, Admin | Acquisition and launch |
| AD-06 | Acquisition-code generation, authority, validation, and redemption | Product, Portal, Admin | Institution-funded acquisition |
| AD-07 | Game Version ownership, classroom selection, configuration versioning, and retirement | Product, Portal, Admin, game owner | Game launch |
| AD-08 | Historical behavior when Admin records change or disappear | Product, Portal, Admin | Data contract approval |
| AD-09 | Support-request routing and operational ownership | Product, Portal, support owner | Support workflow |
| AD-10 | Admin repository owner, baseline, branching, review, release, and database migration process | Product, Portal, Admin | First coordinated change |
| AD-11 | Free/instrumented pilot game and temporary administration approach | Product, Portal, Admin, game owner | Pilot fixture implementation |
| AD-12 | Environment ownership, access, security, monitoring, reconciliation, backup, and recovery | Product, Portal, Admin, operations | Pilot deployment |

Each resolution should record the decision, rationale, alternatives considered, owner, date, affected contracts, rollout order, and any Scope of Work impact.

## 14. Immediate Joint Working Session Checklist

The first working session with the Admin app developer should leave with:

- Confirmed owner, user roles, workflow boundary, and release plan for the new Admin app.
- A plan for the new Admin repository, build, deployment, security, and operational support.
- A walkthrough of Institution, Course, Classroom, Instructor, Game, Game Assignment, payment-mode, acquisition-code, and configuration requirements for the new app.
- A decision on whether legacy data will be exported; if so, identify candidate records, export owner, sanitized samples, and validation approach.
- New-platform source-of-truth decisions and the Admin-to-Portal API/data contract.
- Identification of new Admin capabilities and contract decisions that require a prototype or acceptance test.
- An agreed location and review process for the shared contract, decision log, fixtures, and cross-repository issues.
- Owners and target dates for decisions AD-01 through AD-12.

### 14.1 Focused Questions for Haris

| Area | Questions to answer |
| --- | --- |
| New Admin product | Which workflows, roles, approval rules, audit events, and data operations are required for the first release? |
| Data ownership | Which domains are authored in Admin versus Portal, and what stable IDs and API contracts connect them? |
| Legacy export | If migration is needed, which MSSQL records and relationships can be exported, who can produce the export, and what quality/history limitations exist? |
| Identity and access | Can one Instructor belong to multiple institutions or classrooms? What stable identifier and invitation/linking workflow will the new platform use? |
| Catalog and configuration | How will the new Admin app maintain Games, publishers, offers, Game Versions, assignments, and configuration while preserving published immutability? |
| Institution funding | What are the code issuance, scope, validity, reuse, revocation, and redemption rules in the new platform? |
| Operations | How will the new Admin app and its data be deployed, backed up, monitored, and rolled back? What representative development/test environment is required? |

## Related Documents

- [ScholArk Platform Scope of Work](scope-of-work.md)
- [ScholArk Target MVP Architecture](architecture.md)
- [ScholArk Use Cases](requirements/use-cases.md)
- [ScholArk Platform User Story](requirements/user-story.md)
- [ScholArk Open Questions](open-questions.md)