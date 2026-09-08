# ScholArk Portal and Admin App Interdependencies

**Document Type:** Discovery and Integration Companion  
**Related Baseline:** ScholArk Platform Scope of Work  
**Audience:** ScholArk product owner, Portal developer, and Admin app developer  
**Working Technical Contacts:** Miroslav Braun (Portal) and Haris (Admin app; role and approval authority to be confirmed)  
**Status:** Draft for joint review  
**Date:** September 2026

This document is the shared working reference for dependencies between the proposed Student and Instructor portals and the existing Visual Basic Administration application backed by MSSQL. It supports discovery, interface design, sequencing, testing, and release coordination without replacing the Scope of Work or prescribing changes before the existing code, schema, and operations are assessed.

## 1. Boundary and Working Principles

- The existing Admin app remains the operational administration system during the MVP unless a later, explicitly approved decision changes that responsibility.
- The MVP adds Student and Instructor portals; it does not recreate the full Admin app.
- The client prefers one database as the source of truth. The working direction is therefore a single MSSQL database unless discovery demonstrates that synchronization provides material benefits that justify its additional complexity.
- A single database does not require the Portal to use existing tables directly. Platform-specific schemas, tables, views, stored procedures, or an API may expose a model suited to the Portal while preserving one database.
- Logical ownership and physical storage are separate decisions: a Portal-owned domain may be stored in MSSQL without becoming Admin-app-owned.
- Every domain must have one declared authority and writer. A synchronized copy is not a second authority.
- Portal writes to Admin-owned data are prohibited by default. Any write-back must be explicitly designed, authorized, audited, and tested.
- Historical licenses, assignments, game records, progress, and grades must remain explainable when Admin-owned records are renamed, disabled, unpublished, or deleted.
- Shared contracts, identifiers, schema changes, and rollout order require joint review. Scope or estimate changes follow the Scope of Work change process.

## 2. Expected Responsibility Boundary

This working hypothesis remains unconfirmed until discovery validates the code, schema, and workflows.

| Data or capability | Expected authority / owner | Admin app dependency | Portal responsibility | Status |
| --- | --- | --- | --- | --- |
| Institutions and Game Publishers | Admin app / MSSQL | Create, update, activate, and deactivate | Read approved records | Validate |
| Courses, classrooms, and sections | Admin app / MSSQL | Create and maintain hierarchy and status | Read for acquisition and Instructor views | Validate |
| Instructor business records and assignments | Admin app / MSSQL | Maintain Instructor record and classroom assignments | Link portal identity and enforce assigned access | Decide linkage |
| Student and Instructor authentication | Portal identity service | Supply stable legacy Instructor reference where applicable | Register/invite, authenticate, and authorize | Validate |
| Game catalog metadata | Admin app / MSSQL | Maintain game identity, publisher, availability, URL, and metadata | Present eligible catalog and licensed-game views | Validate fields |
| Institutional game contracts | Admin app / MSSQL, subject to ownership validation | Create contracts, define periods, payer, and contracted games | Read active eligibility for assignment/acquisition | Open |
| Game Versions and release availability | To decide jointly | Maintain available/approved immutable versions and catalog visibility | Enforce exact version entitlement and launch policy | Open |
| Classroom Game Version assignments | Admin app / MSSQL, subject to workflow validation | Select contracted Game Version, assignment period, license duration, and classroom-only visibility | Read assignment and create version-specific license context | Validate |
| Classroom payment, language, usage, and configuration settings | Admin app / MSSQL, subject to configuration design | Maintain approved settings for the assignment | Read and deliver applicable launch configuration | Validate/version |
| Institution acquisition codes | To decide jointly | May generate, store, fund, revoke, or expose codes | Validate/redact code and activate license exactly once | Open |
| Student acquisitions and Game Licenses | Portal expected; institution-funded authority is open | May supply institution-funded entitlement authority | Record acquisition, term, status, renewal, and version entitlement | Open |
| Game-play and game-state records | Game produces; Portal expected to persist | No MVP administration dependency expected | Validate, store, version, and associate with Student Game | Validate |
| Progress, grading, and LMS file export | Portal expected | Supply academic context and stable identifiers | Calculate, display, audit, and export | Validate |
| Support request destination | Existing support process | Supply routing destination and ownership | Validate and route Student submissions | Open |

The Milestone 2 source-of-truth matrix resolves this table. For each domain it must identify logical owner, physical store, permitted readers and writers, stable identifier, retention behavior, and any synchronization rule.

## 3. Portal Workflows That Depend on Admin Data

| Workflow | Required Admin context | Decision or invariant |
| --- | --- | --- |
| Instructor access | Stable Instructor ID, institution/classroom assignments, authorization state, and unambiguous matching data | Decide invitation origin and Portal identity linkage. Email is not an immutable cross-system ID. |
| For-credit acquisition | Eligible institution; active course/classroom; Instructor assignment where required; active contract; assigned immutable Game Version; payment, language, usage, and configuration; institution entitlement mechanism where applicable | Portal records a license for the exact Game Version and keeps classroom context separate for educational workflows. |
| Not-for-credit acquisition | Catalog metadata, direct-sale status, launch URL, pricing source, and publicly available base Game Versions | Exclude classroom-associated Game Versions from general catalog discovery; expose them only through their ClassroomGame assignment. |
| Launch and configuration | Stable Game ID, exact permitted Game Version, launch endpoint, and applicable configuration | Published assignments and versions are immutable; define behavior for replacement assignments and active sessions. |
| Instructor progress and grades | Stable classroom and assignment IDs | Renaming or disabling related Admin records must not sever historical progress or grade attribution. |

## 4. Database and Integration Decision

Discovery must first assess the Admin code, MSSQL schema, infrastructure, data volume, and operating constraints. The preferred starting hypothesis is one MSSQL database with a controlled Portal model boundary; synchronization remains available when evidence shows material advantages elsewhere.

| Option | Use when | Implementation boundary | Principal risks |
| --- | --- | --- | --- |
| **Single MSSQL database (preferred)** | Discovery confirms acceptable security, performance, availability, deployment, and operational fit | Use dedicated schemas/tables for Portal-owned data and stable views, stored procedures, or an API for shared/Admin-owned data; direct legacy-table coupling is not required | Shared operational dependency, coordinated schema governance, legacy database load |
| **Synchronized Portal database** | Measured benefits such as workload isolation, independent scaling/deployment, resilience, or a materially better security boundary outweigh sync costs | Copy only approved domains to PostgreSQL; keep one authority and writer per domain | Staleness, missed changes, reconciliation, recovery, and added operations |
| **Limited hybrid** | Distinct domain needs cannot be met responsibly by either primary option alone | Document the path and authority for each domain | Highest conceptual and operational complexity |

The decision record must cover:

- Authoritative source and write owner for each data domain.
- Logical ownership, physical storage, and read/write direction.
- Platform-specific schemas/tables and stable views, stored procedures, or API contracts needed to avoid coupling to legacy table design.
- Required freshness and behavior while the Admin system or integration is unavailable.
- Rename, deactivate, unpublish, delete, restore, and merge behavior.
- Query/load limits, indexes, maintenance windows, and production support expectations.
- Security boundary, service identity, credential rotation, encryption, and audit logging.
- Transition path if the Admin app or database is modernized later.

If synchronization is selected, the decision must additionally define backfill, change detection, freshness, ordering, idempotency, deletion propagation, drift detection, reconciliation, monitoring, retry, recovery, and operational ownership. Admin-to-Portal should be one-way by default; reverse flow must be justified per domain and must not create two writable authorities.

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

For each shared entity, document applicable lifecycle states and which permit discovery, acquisition, assignment, launch, renewal, and historical display. Also define:

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
| MSSQL schema definition and migration history | Model, persistence, and integration validation | Database decision |
| Non-production database and representative data | Integration development without production risk | Walking skeleton |
| Stable read interface | Institutions, courses, classrooms, Instructors, games, and assignments | Walking skeleton |
| Change tracking or modified timestamps | Incremental sync if selected | Sync implementation |
| Instructor invitation/linkage support | Portal Instructor onboarding and authorization | Identity milestone |
| Catalog lifecycle and direct-sale eligibility | For-credit and not-for-credit discovery | Acquisition milestone |
| Classroom payment-mode exposure | Select Stripe or institution-funded path | Acquisition milestone |
| Acquisition-code generation/validation/revocation | Institution-funded license activation and renewal | Acquisition milestone |
| Game Version and configuration revision support | Correct launch, state compatibility, and grading | Game integration milestone |
| Historical/deletion behavior | Preserve license, progress, and grade references | Before data contract approval |
| Auditability of material Admin changes | Diagnose access, assignment, and configuration changes | Pilot readiness |

An approved MSSQL schema/table, view, stored procedure, integration service, or Portal-owned function may satisfy a capability without changing existing Admin workflows.

### 6.1 Legacy Workflow Inventory

For Institutions, Instructors, Courses, classrooms, Games, assignments, payment modes, and configurations, record create/change/deactivate/restore/delete behavior, validation, manual steps, downstream effects, history, data-quality exceptions, and supporting MSSQL objects.

### 6.2 Assessment Outcome

Each relevant Admin component and workflow should receive an evidence-based recommendation:

| Classification | Meaning |
| --- | --- |
| Reuse | Suitable without material change |
| Refactor | Suitable with bounded changes |
| Partially rebuild | Reuse some behavior or data; replace the rest |
| Rebuild | Unsuitable for the required role; separate scope required |

Record evidence, required changes, dependencies, operational and estimate effects, and scope impact. Older technology alone is not evidence that modernization is required.

## 7. Pilot Games and Temporary Administration Tooling

Legally usable free web games can validate catalog, acquisition, license enforcement, launch, and basic configuration. An unmodified third-party game cannot validate authenticated launch, state exchange, events, mapping, progress, or grading without an adapter or instrumented test game.

The following options should be considered separately from the permanent Admin architecture:

| Option | Appropriate use | Tradeoff |
| --- | --- | --- |
| Versioned seed/import script | Repeatable pilot catalog, classroom, assignment, and configuration fixtures maintained by developers | Fastest and least duplicate UI; not suitable for routine nontechnical administration |
| Narrow internal Admin web surface | Repeated pilot maintenance by authorized nontechnical users | Reusable, but introduces authentication, authorization, validation, audit, testing, and deployment scope |
| Separate temporary desktop utility | Only when server/network constraints make the other options impractical | Duplicates desktop technology and creates a likely throwaway migration burden |
| Changes to the existing Admin app | Production-representative administration when its architecture is understood and Haris can implement safely | Best long-term continuity, but depends on discovery and coordinated delivery |

**Initial recommendation:** use version-controlled seed/import tooling for initial integration experiments. Add a narrow internal Admin web surface only if client users must repeatedly maintain pilot data before the existing Admin app supports it. Do not create a second desktop application by default.

Any temporary tool must use the same validated identifiers, rules, and integration contracts planned for the real Admin path. It must be clearly labeled as pilot tooling, restricted to authorized environments, and excluded from production scope unless explicitly accepted through change control.

## 8. Version Control and Repository Working Agreement

The existing Admin source currently resides on a server and must be placed under source control before coordinated changes begin. The Portal and Admin developers should agree on the following during discovery.

### 8.1 Admin Repository Bootstrap

1. Preserve a read-only snapshot of source, schema, configuration, build outputs, and deployment instructions; exclude secrets, production data, generated output, and machine-specific files from Git.
2. Initialize a private client-owned repository and commit the untouched baseline separately from cleanup.
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

- Named owners and least-privilege access for source, development/test MSSQL, hosting, domains, certificates, and deployment systems.
- A sanitized non-production dataset containing representative institutions, courses, classrooms, Instructors, games, assignments, payment modes, and lifecycle states.
- Network access from the Portal environment to only the approved Admin integration boundary.
- Separate service credentials per environment, with rotation and revocation procedures.
- Prohibition on using production personal data in local development unless explicitly authorized and protected.
- Audit requirements for Instructor linkage, acquisition-code use, assignment/configuration changes, licenses, grades, and exports.
- Backup, restore, rollback, retention, and incident-contact responsibilities for both systems.

## 10. Joint Testing and Acceptance

The shared integration is not accepted solely because each application works independently. The Portal and Admin developers must validate representative end-to-end scenarios.

1. An Admin-created institution, course, classroom, Instructor assignment, Game, and Game Assignment become available to the Portal through the selected integration path.
2. An unauthorized or inactive record is not exposed as eligible for acquisition or Instructor access.
3. An Admin change reaches the Portal within the approved freshness target.
4. Reprocessing the same extract, event, or synchronization interval does not create duplicates.
5. Rename, deactivate, unpublish, delete/tombstone, and restoration behavior preserve approved historical references.
6. A portal Instructor identity links to the correct Admin Instructor and cannot access another Instructor’s classrooms.
7. Student-funded and institution-funded acquisition paths use the Admin payment context correctly.
8. Acquisition-code reuse, expiry, revocation, wrong-scope use, and concurrent redemption follow the approved rules.
9. The permitted Game Version and compatible configuration are selected for launch.
10. Integration outage, stale data, partial failure, retry, recovery, and reconciliation produce observable, actionable results.
11. Deployment and rollback preserve compatibility between the deployed Admin schema/interface and Portal version.

If synchronization is selected, acceptance also requires a deliberate drift test that demonstrates detection, reporting, and repair without uncontrolled data loss.

## 11. Delivery Sequence and Coordination Gates

| Gate | Joint evidence required | Blocks |
| --- | --- | --- |
| Admin baseline available | Repository, build guide, schema, configuration inventory, test access | Existing-system assessment |
| Ownership approved | Source-of-truth matrix and permitted read/write paths | Data implementation |
| Integration selected | Decision record and proof of connectivity or synchronization feasibility | Portal foundation |
| Identity linked | Instructor matching/invitation contract and authorization fixtures | Instructor workflows |
| Acquisition contract approved | Payment mode, catalog eligibility, acquisition-code authority, license ownership | Acquisition implementation |
| Game/config contract approved | Game identity/version, assignment, launch URL, configuration revision, sample payloads | Game launch and mapping |
| Compatibility verified | Automated contract tests, end-to-end scenarios, reconciliation evidence | Pilot release |

Work that does not depend on an unresolved gate may continue, but the unresolved assumption, owner, due date, affected acceptance scenarios, and fallback must be recorded.

## 12. Responsibilities

| Area | Product owner | Portal developer | Admin app developer | Game/integration owner |
| --- | --- | --- | --- | --- |
| Business policy and pilot priority | Accountable | Consulted | Consulted | Consulted |
| Existing Admin behavior and schema evidence | Informed | Consulted | Responsible | Informed |
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
| AD-02 | Validate single-MSSQL preference; select controlled MSSQL, synchronized PostgreSQL, or justified hybrid from discovery evidence | Portal, Admin, operations | Portal foundation |
| AD-03 | Stable identifiers and lifecycle semantics, including deletion | Product, Portal, Admin | Integration contract |
| AD-04 | Instructor identity invitation and legacy-record linkage | Product, Portal, Admin | Instructor onboarding |
| AD-05 | Catalog eligibility and Game/assignment/configuration fields | Product, Portal, Admin | Acquisition and launch |
| AD-06 | Acquisition-code generation, authority, validation, redemption, and renewal | Product, Portal, Admin | Institution-funded acquisition |
| AD-07 | Game Version ownership, classroom selection, configuration versioning, and retirement | Product, Portal, Admin, game owner | Game launch |
| AD-08 | Historical behavior when Admin records change or disappear | Product, Portal, Admin | Data contract approval |
| AD-09 | Support-request routing and operational ownership | Product, Portal, support owner | Support workflow |
| AD-10 | Admin repository owner, baseline, branching, review, release, and database migration process | Product, Portal, Admin | First coordinated change |
| AD-11 | Free/instrumented pilot game and temporary administration approach | Product, Portal, Admin, game owner | Pilot fixture implementation |
| AD-12 | Environment ownership, access, security, monitoring, reconciliation, backup, and recovery | Product, Portal, Admin, operations | Pilot deployment |

Each resolution should record the decision, rationale, alternatives considered, owner, date, affected contracts, rollout order, and any Scope of Work impact.

## 14. Immediate Joint Working Session Checklist

The first working session with the Admin app developer should leave with:

- Access path and owner for the Admin source, MSSQL schema, test database, build environment, and current deployment.
- A plan and owner for creating the Admin Git repository and preserving the original baseline.
- A high-level walkthrough of Institution, Course, Classroom, Instructor, Game, Game Assignment, payment-mode, acquisition-code, and configuration behavior.
- Representative sanitized records and known edge cases.
- Initial source-of-truth hypotheses and a shortlist of feasible integration approaches.
- Identification of missing Admin capabilities or schema changes that require evidence or a proof of concept.
- An agreed location and review process for the shared contract, decision log, fixtures, and cross-repository issues.
- Owners and target dates for decisions AD-01 through AD-12.

### 14.1 Focused Questions for Haris

| Area | Questions to answer |
| --- | --- |
| Application | Which Visual Basic/.NET version, project type, third-party dependencies, configuration mechanism, authentication model, and build tools are required? Can a clean environment reproduce the current build? |
| Database | Which MSSQL version and databases are used? Which tables, views, stored procedures, functions, triggers, constraints, and history/audit structures are active? Are stable change timestamps or change-tracking facilities available? |
| Business workflows | How are Institutions, Instructors, Courses, classrooms, Games, assignments, payment modes, and configurations created and retired? Which rules exist only in UI code or manual operating procedures? |
| Identity and access | Can one Instructor belong to multiple institutions or classrooms? Which identifier is stable, can duplicate person records exist, and what currently happens when an Instructor is deactivated or reassigned? |
| Catalog and configuration | How are Game URLs, publishers, availability, assignment, Game Versions, and configuration stored? Can assignments or Games be removed after acquisition, and how is history preserved? |
| Institution funding | Are acquisition codes already generated or stored? What are their scope, validity, reuse, revocation, redemption, and renewal rules? |
| Existing integrations | Has another system accessed MSSQL? Are any APIs, integration views, exports, scheduled jobs, or synchronization mechanisms already in use? |
| Operations | How are releases deployed, backed up, monitored, and rolled back? Is there a representative development/test database, and what known data-quality or availability issues should the Portal accommodate? |

## Related Documents

- [ScholArk Platform Scope of Work](scope-of-work.md)
- [ScholArk Target MVP Architecture](architecture.md)
- [ScholArk Use Cases](requirements/use-cases.md)
- [ScholArk Platform User Story](requirements/user-story.md)
- [ScholArk Open Questions](open-questions.md)